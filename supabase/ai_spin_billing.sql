-- AI spin subscriptions, top-ups, model jobs and payment audit trail.
-- Configure the provider credit cost from Renmoku's Meshy invoice before enabling checkout.

CREATE TABLE IF NOT EXISTS public.ai_spin_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  meshy_credit_cost_idr numeric(12,2),
  meshy_credits_per_model integer NOT NULL DEFAULT 30 CHECK (meshy_credits_per_model > 0),
  renmoku_markup_percent numeric(5,2) NOT NULL DEFAULT 50 CHECK (renmoku_markup_percent >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.ai_spin_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ai_spin_packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  package_type text NOT NULL CHECK (package_type IN ('monthly', 'top_up')),
  generations integer NOT NULL CHECK (generations > 0),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.ai_spin_packages (id,name,package_type,generations,sort_order) VALUES
 ('monthly-starter','Starter','monthly',3,10),
 ('monthly-studio','Studio','monthly',10,20),
 ('monthly-pro','Pro','monthly',25,30),
 ('topup-1','Refill 1 model','top_up',1,40),
 ('topup-5','Refill 5 models','top_up',5,50),
 ('topup-10','Refill 10 models','top_up',10,60)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.owner_ai_spin_wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_credits integer NOT NULL DEFAULT 0 CHECK (monthly_credits >= 0),
  topup_credits integer NOT NULL DEFAULT 0 CHECK (topup_credits >= 0),
  package_id text REFERENCES public.ai_spin_packages(id),
  subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive','pending','active','past_due','cancelled')),
  period_end timestamptz,
  midtrans_subscription_id text,
  payment_type text CHECK (payment_type IN ('credit_card','gopay')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_spin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id text NOT NULL REFERENCES public.ai_spin_packages(id),
  is_monthly boolean NOT NULL DEFAULT false,
  amount_idr numeric(12,2) NOT NULL CHECK (amount_idr > 0),
  provider_cost_idr numeric(12,2) NOT NULL CHECK (provider_cost_idr >= 0),
  renmoku_share_idr numeric(12,2) NOT NULL CHECK (renmoku_share_idr >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','expired')),
  processing_started_at timestamptz,
  midtrans_order_id text UNIQUE NOT NULL,
  midtrans_subscription_id text,
  subscription_period_end timestamptz,
  subscription_creation_started_at timestamptz,
  subscription_creation_uncertain boolean NOT NULL DEFAULT false,
  payment_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
ALTER TABLE public.ai_spin_orders ADD COLUMN IF NOT EXISTS processing_started_at timestamptz;
ALTER TABLE public.ai_spin_orders ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz;
ALTER TABLE public.ai_spin_orders ADD COLUMN IF NOT EXISTS subscription_creation_started_at timestamptz;
ALTER TABLE public.ai_spin_orders ADD COLUMN IF NOT EXISTS subscription_creation_uncertain boolean NOT NULL DEFAULT false;
ALTER TABLE public.ai_spin_orders ADD COLUMN IF NOT EXISTS is_monthly boolean NOT NULL DEFAULT false;
ALTER TABLE public.ai_spin_orders DROP CONSTRAINT IF EXISTS ai_spin_orders_status_check;
ALTER TABLE public.ai_spin_orders ADD CONSTRAINT ai_spin_orders_status_check CHECK (status IN ('pending','processing','paid','failed','expired'));
CREATE UNIQUE INDEX IF NOT EXISTS ai_spin_order_subscription_unique ON public.ai_spin_orders(midtrans_subscription_id)
  WHERE midtrans_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.ai_spin_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.owner_vehicle_submissions(id) ON DELETE CASCADE,
  provider_task_id text UNIQUE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','review','published','failed')),
  model_path text,
  provider_credits integer NOT NULL DEFAULT 30,
  debit_source text CHECK (debit_source IN ('monthly','top_up')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_spin_jobs_user_created_idx ON public.ai_spin_jobs(user_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ai_spin_one_open_monthly_order_per_user
  ON public.ai_spin_orders(user_id)
  WHERE status IN ('pending','processing') AND is_monthly=true;

CREATE TABLE IF NOT EXISTS public.ai_spin_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.ai_spin_jobs(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.ai_spin_orders(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('monthly_grant','topup_grant','generation_debit','generation_refund')),
  generations integer NOT NULL CHECK (generations > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.ai_spin_renewal_events (
  transaction_id text PRIMARY KEY,
  subscription_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_spin_renewal_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_spin_renewal_events FROM anon,authenticated;
CREATE UNIQUE INDEX IF NOT EXISTS ai_spin_grant_order_unique ON public.ai_spin_ledger(order_id)
  WHERE order_id IS NOT NULL AND entry_type IN ('monthly_grant','topup_grant');

ALTER TABLE public.owner_vehicle_submissions ADD COLUMN IF NOT EXISTS spin_model_url text;
ALTER TABLE public.owner_vehicle_submissions ADD COLUMN IF NOT EXISTS spin_model_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS spin_model_url text;

CREATE OR REPLACE FUNCTION public.protect_submission_review_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT (select public.is_admin()) AND
     (to_jsonb(NEW) - 'spin_frames' - 'spin_video_url') IS DISTINCT FROM
     (to_jsonb(OLD) - 'spin_frames' - 'spin_video_url') THEN
    RAISE EXCEPTION 'Owners may only update spin preview assets on their submissions';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE VIEW public.published_spin_vehicles WITH (security_invoker=true) AS
SELECT id,brand,model,year,transmission,capacity,fuel_type,price_daily,location,spin_model_url,created_at
FROM public.owner_vehicle_submissions
WHERE status='APPROVED' AND spin_model_public=true AND spin_model_url IS NOT NULL;
GRANT SELECT ON public.published_spin_vehicles TO anon,authenticated;
REVOKE ALL ON public.owner_vehicle_submissions FROM PUBLIC,anon;
GRANT SELECT (id,brand,model,year,transmission,capacity,fuel_type,price_daily,location,spin_model_url,created_at,status,spin_model_public) ON public.owner_vehicle_submissions TO anon;
DROP POLICY IF EXISTS "Public can read published vehicle models" ON public.owner_vehicle_submissions;
CREATE POLICY "Public can read published vehicle models" ON public.owner_vehicle_submissions FOR SELECT TO anon
  USING (status='APPROVED' AND spin_model_public=true AND spin_model_url IS NOT NULL);

ALTER TABLE public.ai_spin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_spin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_ai_spin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_spin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_spin_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_spin_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI spin packages are readable" ON public.ai_spin_packages;
CREATE POLICY "AI spin packages are readable" ON public.ai_spin_packages FOR SELECT TO anon,authenticated USING (active);
DROP POLICY IF EXISTS "AI spin wallet owner read" ON public.owner_ai_spin_wallets;
CREATE POLICY "AI spin wallet owner read" ON public.owner_ai_spin_wallets FOR SELECT TO authenticated USING (user_id=(select auth.uid()) OR (select public.is_admin()));
DROP POLICY IF EXISTS "AI spin orders owner read" ON public.ai_spin_orders;
CREATE POLICY "AI spin orders owner read" ON public.ai_spin_orders FOR SELECT TO authenticated USING (user_id=(select auth.uid()) OR (select public.is_admin()));
DROP POLICY IF EXISTS "AI spin jobs owner read" ON public.ai_spin_jobs;
CREATE POLICY "AI spin jobs owner read" ON public.ai_spin_jobs FOR SELECT TO authenticated USING (user_id=(select auth.uid()) OR (select public.is_admin()));
DROP POLICY IF EXISTS "AI spin ledger owner read" ON public.ai_spin_ledger;
CREATE POLICY "AI spin ledger owner read" ON public.ai_spin_ledger FOR SELECT TO authenticated USING (user_id=(select auth.uid()) OR (select public.is_admin()));

GRANT SELECT ON public.ai_spin_packages TO anon,authenticated;
GRANT SELECT ON public.owner_ai_spin_wallets,public.ai_spin_orders,public.ai_spin_jobs,public.ai_spin_ledger TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_spin_settings,public.ai_spin_packages,public.owner_ai_spin_wallets,public.ai_spin_orders,public.ai_spin_jobs,public.ai_spin_ledger,public.ai_spin_renewal_events TO service_role;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
REVOKE ALL ON public.ai_spin_settings FROM anon,authenticated;
REVOKE INSERT,UPDATE,DELETE ON public.ai_spin_packages,public.owner_ai_spin_wallets,public.ai_spin_orders,public.ai_spin_jobs,public.ai_spin_ledger FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.reserve_ai_spin_generation(p_user_id uuid,p_submission_id uuid)
RETURNS TABLE(job_id uuid, debit_source text, provider_credits integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_wallet public.owner_ai_spin_wallets%ROWTYPE;
  v_job uuid;
  v_source text;
  v_provider_credits integer;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'service role required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.owner_vehicle_submissions s WHERE s.id=p_submission_id AND s.user_id=p_user_id) THEN
    RAISE EXCEPTION 'submission not owned by user';
  END IF;
  SELECT * INTO v_wallet FROM public.owner_ai_spin_wallets WHERE user_id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'AI Spin package required'; END IF;
  IF v_wallet.period_end IS NOT NULL AND v_wallet.period_end <= now() THEN
    UPDATE public.owner_ai_spin_wallets SET monthly_credits=0,subscription_status='past_due',updated_at=now() WHERE user_id=p_user_id;
    v_wallet.monthly_credits := 0;
  END IF;
  IF v_wallet.subscription_status='active' AND v_wallet.monthly_credits>0 THEN
    UPDATE public.owner_ai_spin_wallets SET monthly_credits=monthly_credits-1,updated_at=now() WHERE user_id=p_user_id;
    v_source := 'monthly';
  ELSIF v_wallet.topup_credits>0 THEN
    UPDATE public.owner_ai_spin_wallets SET topup_credits=topup_credits-1,updated_at=now() WHERE user_id=p_user_id;
    v_source := 'top_up';
  ELSE RAISE EXCEPTION 'AI Spin credits exhausted'; END IF;
  SELECT meshy_credits_per_model INTO v_provider_credits FROM public.ai_spin_settings WHERE id=true;
  INSERT INTO public.ai_spin_jobs(user_id,submission_id,status,provider_credits,debit_source)
    VALUES(p_user_id,p_submission_id,'queued',coalesce(v_provider_credits,30),v_source) RETURNING id INTO v_job;
  INSERT INTO public.ai_spin_ledger(user_id,job_id,entry_type,generations)
    VALUES(p_user_id,v_job,'generation_debit',1);
  RETURN QUERY SELECT v_job,v_source,coalesce(v_provider_credits,30);
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_ai_spin_generation(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_spin_generation(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.refund_ai_spin_generation(p_job_id uuid,p_error text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_job public.ai_spin_jobs%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'service role required'; END IF;
  SELECT * INTO v_job FROM public.ai_spin_jobs WHERE id=p_job_id FOR UPDATE;
  IF NOT FOUND OR v_job.status='failed' THEN RETURN; END IF;
  UPDATE public.ai_spin_jobs SET status='failed',error_message=left(p_error,500),updated_at=now() WHERE id=p_job_id;
  IF v_job.debit_source='monthly' THEN
    UPDATE public.owner_ai_spin_wallets SET monthly_credits=monthly_credits+1,updated_at=now() WHERE user_id=v_job.user_id;
  ELSE
    UPDATE public.owner_ai_spin_wallets SET topup_credits=topup_credits+1,updated_at=now() WHERE user_id=v_job.user_id;
  END IF;
  INSERT INTO public.ai_spin_ledger(user_id,job_id,entry_type,generations) VALUES(v_job.user_id,v_job.id,'generation_refund',1);
END;
$$;
REVOKE ALL ON FUNCTION public.refund_ai_spin_generation(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_spin_generation(uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_ai_spin_payment(p_order_id uuid,p_subscription_id text DEFAULT NULL,p_period_end timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_order public.ai_spin_orders%ROWTYPE; v_package public.ai_spin_packages%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'service role required'; END IF;
  SELECT * INTO v_order FROM public.ai_spin_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status='paid' THEN RETURN; END IF;
  SELECT * INTO v_package FROM public.ai_spin_packages WHERE id=v_order.package_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'package unavailable'; END IF;
  UPDATE public.ai_spin_orders SET status='paid',paid_at=now(),midtrans_subscription_id=p_subscription_id WHERE id=v_order.id;
  INSERT INTO public.owner_ai_spin_wallets AS current_wallet(user_id,monthly_credits,topup_credits,package_id,subscription_status,period_end,midtrans_subscription_id,payment_type,updated_at)
    VALUES(v_order.user_id,
      CASE WHEN v_package.package_type='monthly' THEN v_package.generations ELSE 0 END,
      CASE WHEN v_package.package_type='top_up' THEN v_package.generations ELSE 0 END,
      CASE WHEN v_package.package_type='monthly' THEN v_package.id ELSE NULL END,
      CASE WHEN v_package.package_type='monthly' THEN 'active' ELSE 'inactive' END,
      p_period_end,p_subscription_id,v_order.payment_type,now())
  ON CONFLICT(user_id) DO UPDATE SET
    monthly_credits=CASE WHEN v_package.package_type='monthly' THEN v_package.generations ELSE current_wallet.monthly_credits END,
    topup_credits=current_wallet.topup_credits + CASE WHEN v_package.package_type='top_up' THEN v_package.generations ELSE 0 END,
    package_id=CASE WHEN v_package.package_type='monthly' THEN v_package.id ELSE current_wallet.package_id END,
    subscription_status=CASE WHEN v_package.package_type='monthly' THEN 'active' ELSE current_wallet.subscription_status END,
    period_end=CASE WHEN v_package.package_type='monthly' THEN p_period_end ELSE current_wallet.period_end END,
    midtrans_subscription_id=coalesce(p_subscription_id,current_wallet.midtrans_subscription_id),
    payment_type=coalesce(v_order.payment_type,current_wallet.payment_type),updated_at=now();
  INSERT INTO public.ai_spin_ledger(user_id,order_id,entry_type,generations)
    VALUES(v_order.user_id,v_order.id,CASE WHEN v_package.package_type='monthly' THEN 'monthly_grant' ELSE 'topup_grant' END,v_package.generations)
  ON CONFLICT DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_ai_spin_payment(uuid,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_ai_spin_payment(uuid,text,timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_ai_spin_order(p_order_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_claimed integer;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'service role required'; END IF;
  UPDATE public.ai_spin_orders SET status='processing',processing_started_at=now()
    WHERE id=p_order_id AND NOT (subscription_creation_uncertain AND midtrans_subscription_id IS NULL)
      AND (status='pending' OR (status='processing' AND processing_started_at < now()-interval '5 minutes'));
  GET DIAGNOSTICS v_claimed = ROW_COUNT;
  RETURN v_claimed=1;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_ai_spin_order(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ai_spin_order(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_ai_spin_renewal(p_subscription_id text,p_transaction_id text,p_succeeded boolean,p_subscription_active boolean,p_period_end timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_wallet public.owner_ai_spin_wallets%ROWTYPE; v_package public.ai_spin_packages%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'service role required'; END IF;
  SELECT * INTO v_wallet FROM public.owner_ai_spin_wallets WHERE midtrans_subscription_id=p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription not found'; END IF;
  IF NOT p_succeeded THEN
    UPDATE public.owner_ai_spin_wallets SET subscription_status=CASE WHEN p_subscription_active THEN 'past_due' ELSE 'cancelled' END,updated_at=now() WHERE user_id=v_wallet.user_id;
    RETURN;
  END IF;
  INSERT INTO public.ai_spin_renewal_events(transaction_id,subscription_id) VALUES(p_transaction_id,p_subscription_id) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO v_package FROM public.ai_spin_packages WHERE id=v_wallet.package_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription package not found'; END IF;
  UPDATE public.owner_ai_spin_wallets SET monthly_credits=v_package.generations,subscription_status=CASE WHEN p_subscription_active THEN 'active' ELSE 'past_due' END,
    period_end=coalesce(p_period_end,now()+interval '1 month'),updated_at=now() WHERE user_id=v_wallet.user_id;
  INSERT INTO public.ai_spin_ledger(user_id,entry_type,generations) VALUES(v_wallet.user_id,'monthly_grant',v_package.generations);
END;
$$;
REVOKE ALL ON FUNCTION public.apply_ai_spin_renewal(text,text,boolean,boolean,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_ai_spin_renewal(text,text,boolean,boolean,timestamptz) TO service_role;

-- Generated GLBs remain private during review and are copied to the public bucket only after owner approval.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('vehicle-models-private','vehicle-models-private',false,52428800,ARRAY['model/gltf-binary','application/octet-stream'])
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('vehicle-models','vehicle-models',true,52428800,ARRAY['model/gltf-binary','application/octet-stream'])
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public can read published 3D models" ON storage.objects;
CREATE POLICY "Public can read published 3D models" ON storage.objects FOR SELECT TO anon,authenticated
  USING (bucket_id='vehicle-models');
