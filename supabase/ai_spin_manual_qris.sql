-- Manual static-QRIS payments for AI Spin. Apply after ai_spin_billing.sql.
ALTER TABLE public.ai_spin_settings
  ADD COLUMN IF NOT EXISTS qris_image_path text,
  ADD COLUMN IF NOT EXISTS qris_instructions text NOT NULL DEFAULT 'Transfer melalui QRIS ini, lalu unggah bukti pembayaran yang jelas.';

ALTER TABLE public.ai_spin_orders
  ADD COLUMN IF NOT EXISTS payment_proof_path text,
  ADD COLUMN IF NOT EXISTS payment_review_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.ai_spin_orders DROP CONSTRAINT IF EXISTS ai_spin_orders_status_check;
ALTER TABLE public.ai_spin_orders ADD CONSTRAINT ai_spin_orders_status_check
  CHECK (status IN ('pending','processing','paid','failed','expired','rejected'));

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('ai-spin-qris','ai-spin-qris',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('ai-spin-payment-proofs','ai-spin-payment-proofs',false,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "AI Spin admin can manage QRIS settings" ON public.ai_spin_settings;
CREATE POLICY "AI Spin admin can manage QRIS settings" ON public.ai_spin_settings
  FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
GRANT SELECT, UPDATE ON public.ai_spin_settings TO authenticated;

DROP POLICY IF EXISTS "AI Spin admins upload QRIS" ON storage.objects;
CREATE POLICY "AI Spin admins upload QRIS" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='ai-spin-qris' AND (select public.is_admin()));
DROP POLICY IF EXISTS "AI Spin admins update QRIS" ON storage.objects;
CREATE POLICY "AI Spin admins update QRIS" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='ai-spin-qris' AND (select public.is_admin())) WITH CHECK (bucket_id='ai-spin-qris' AND (select public.is_admin()));
DROP POLICY IF EXISTS "AI Spin admins delete QRIS" ON storage.objects;
CREATE POLICY "AI Spin admins delete QRIS" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='ai-spin-qris' AND (select public.is_admin()));

DROP POLICY IF EXISTS "Owners upload own AI Spin payment proofs" ON storage.objects;
CREATE POLICY "Owners upload own AI Spin payment proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='ai-spin-payment-proofs' AND (storage.foldername(name))[1]=(select auth.uid())::text);
DROP POLICY IF EXISTS "Owners and admins read AI Spin payment proofs" ON storage.objects;
CREATE POLICY "Owners and admins read AI Spin payment proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='ai-spin-payment-proofs' AND ((storage.foldername(name))[1]=(select auth.uid())::text OR (select public.is_admin())));
DROP POLICY IF EXISTS "Owners delete own AI Spin payment proofs" ON storage.objects;
CREATE POLICY "Owners delete own AI Spin payment proofs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='ai-spin-payment-proofs' AND ((storage.foldername(name))[1]=(select auth.uid())::text OR (select public.is_admin())));

CREATE OR REPLACE FUNCTION public.review_ai_spin_manual_payment(p_order_id uuid,p_approve boolean,p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_order public.ai_spin_orders%ROWTYPE;
  v_package public.ai_spin_packages%ROWTYPE;
  v_wallet public.owner_ai_spin_wallets%ROWTYPE;
  v_period_end timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT (select public.is_admin()) THEN RAISE EXCEPTION 'admin role required'; END IF;
  SELECT * INTO v_order FROM public.ai_spin_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_type <> 'manual_qris' OR v_order.payment_proof_path IS NULL THEN
    RAISE EXCEPTION 'manual payment or proof not found';
  END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'payment has already been reviewed'; END IF;
  IF NOT p_approve THEN
    UPDATE public.ai_spin_orders SET status='rejected',payment_review_note=left(coalesce(p_note,''),500),reviewed_at=now(),reviewed_by=auth.uid() WHERE id=v_order.id;
    RETURN;
  END IF;
  SELECT * INTO v_package FROM public.ai_spin_packages WHERE id=v_order.package_id AND active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'package is no longer available'; END IF;
  IF v_package.package_type='monthly' THEN
    SELECT * INTO v_wallet FROM public.owner_ai_spin_wallets WHERE user_id=v_order.user_id FOR UPDATE;
    v_period_end := greatest(now(),coalesce(v_wallet.period_end,now())) + interval '1 month';
  END IF;
  UPDATE public.ai_spin_orders SET status='paid',paid_at=now(),payment_review_note=left(coalesce(p_note,''),500),reviewed_at=now(),reviewed_by=auth.uid() WHERE id=v_order.id;
  INSERT INTO public.owner_ai_spin_wallets AS current_wallet(user_id,monthly_credits,topup_credits,package_id,subscription_status,period_end,payment_type,updated_at)
    VALUES(v_order.user_id,
      CASE WHEN v_package.package_type='monthly' THEN v_package.generations ELSE 0 END,
      CASE WHEN v_package.package_type='top_up' THEN v_package.generations ELSE 0 END,
      CASE WHEN v_package.package_type='monthly' THEN v_package.id ELSE NULL END,
      CASE WHEN v_package.package_type='monthly' THEN 'active' ELSE 'inactive' END,
      v_period_end,'manual_qris',now())
  ON CONFLICT(user_id) DO UPDATE SET
    monthly_credits=CASE WHEN v_package.package_type='monthly' THEN v_package.generations ELSE current_wallet.monthly_credits END,
    topup_credits=current_wallet.topup_credits + CASE WHEN v_package.package_type='top_up' THEN v_package.generations ELSE 0 END,
    package_id=CASE WHEN v_package.package_type='monthly' THEN v_package.id ELSE current_wallet.package_id END,
    subscription_status=CASE WHEN v_package.package_type='monthly' THEN 'active' ELSE current_wallet.subscription_status END,
    period_end=CASE WHEN v_package.package_type='monthly' THEN v_period_end ELSE current_wallet.period_end END,
    payment_type='manual_qris',updated_at=now();
  INSERT INTO public.ai_spin_ledger(user_id,order_id,entry_type,generations)
    VALUES(v_order.user_id,v_order.id,CASE WHEN v_package.package_type='monthly' THEN 'monthly_grant' ELSE 'topup_grant' END,v_package.generations)
    ON CONFLICT DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.review_ai_spin_manual_payment(uuid,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_ai_spin_manual_payment(uuid,boolean,text) TO authenticated;
