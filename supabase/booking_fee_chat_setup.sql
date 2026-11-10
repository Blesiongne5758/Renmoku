-- Booking fee, QRIS review, availability fallback and booking chat.
-- Apply after schema.sql and owner_features.sql (public.is_admin()).
BEGIN;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('PENDING_PAYMENT_REVIEW', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'UNAVAILABLE'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_fee_transaction_id uuid;

CREATE TABLE IF NOT EXISTS public.booking_fee_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  amount integer NOT NULL DEFAULT 25000 CHECK (amount = 25000),
  qris_image_path text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
INSERT INTO public.booking_fee_settings (id, amount) VALUES (true, 25000) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.booking_fee_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 25000 CHECK (amount = 25000),
  status text NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','PAID_AVAILABLE','CONSUMED','REJECTED')),
  payment_proof_path text,
  current_booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS booking_fee_transactions_renter_idx ON public.booking_fee_transactions(renter_id, status, created_at DESC);
ALTER TABLE public.booking_fee_transactions DROP CONSTRAINT IF EXISTS booking_fee_transactions_current_booking_id_fkey;
ALTER TABLE public.booking_fee_transactions ADD CONSTRAINT booking_fee_transactions_current_booking_id_fkey
  FOREIGN KEY (current_booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_fee_transaction_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_fee_transaction_id_fkey
  FOREIGN KEY (booking_fee_transaction_id) REFERENCES public.booking_fee_transactions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.booking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS booking_messages_booking_created_idx ON public.booking_messages(booking_id, created_at);

ALTER TABLE public.booking_fee_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_fee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS booking_fee_settings_read ON public.booking_fee_settings;
CREATE POLICY booking_fee_settings_read ON public.booking_fee_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS booking_fee_settings_admin_update ON public.booking_fee_settings;
CREATE POLICY booking_fee_settings_admin_update ON public.booking_fee_settings FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
DROP POLICY IF EXISTS booking_fee_transactions_read_participant ON public.booking_fee_transactions;
CREATE POLICY booking_fee_transactions_read_participant ON public.booking_fee_transactions FOR SELECT TO authenticated
  USING (renter_id = (select auth.uid()) OR (select public.is_admin()));
DROP POLICY IF EXISTS booking_messages_read_eligible ON public.booking_messages;
CREATE POLICY booking_messages_read_eligible ON public.booking_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b JOIN public.vehicles v ON v.id = b.vehicle_id
    LEFT JOIN public.owners o ON o.id = v.owner_id
    WHERE b.id = booking_id AND b.status IN ('PENDING','CONFIRMED','ACTIVE')
      AND ((b.renter_id = (select auth.uid())) OR o.user_id = (select auth.uid())))
);
DROP POLICY IF EXISTS booking_messages_insert_eligible ON public.booking_messages;
CREATE POLICY booking_messages_insert_eligible ON public.booking_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = (select auth.uid()) AND EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vehicles v ON v.id = b.vehicle_id
    LEFT JOIN public.owners o ON o.id = v.owner_id
    WHERE b.id = booking_id AND b.status IN ('PENDING','CONFIRMED','ACTIVE')
      AND ((b.renter_id = (select auth.uid())) OR o.user_id = (select auth.uid())))
);
GRANT SELECT ON public.booking_fee_settings, public.booking_fee_transactions TO authenticated;
GRANT UPDATE (qris_image_path, updated_at, updated_by) ON public.booking_fee_settings TO authenticated;
GRANT SELECT, INSERT ON public.booking_messages TO authenticated;

-- The admin alone accepts or rejects uploaded proof. Approval makes one fee reusable
-- until an owner confirms a vehicle; rejection does not silently create a charge.
CREATE OR REPLACE FUNCTION public.review_booking_fee(p_transaction_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE tx public.booking_fee_transactions%ROWTYPE;
BEGIN
  IF NOT (select public.is_admin()) THEN RAISE EXCEPTION 'admin_required'; END IF;
  SELECT * INTO tx FROM public.booking_fee_transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND OR tx.status <> 'PENDING_REVIEW' THEN RAISE EXCEPTION 'transaction_not_reviewable'; END IF;
  UPDATE public.booking_fee_transactions SET status = CASE WHEN p_approve THEN 'PAID_AVAILABLE' ELSE 'REJECTED' END,
    admin_note = left(p_note, 1000), verified_at = now(), verified_by = (select auth.uid()) WHERE id = tx.id;
  IF tx.current_booking_id IS NOT NULL THEN
    UPDATE public.bookings SET status = CASE WHEN p_approve THEN 'PENDING' ELSE 'CANCELLED' END, updated_at = now()
      WHERE id = tx.current_booking_id AND status = 'PENDING_PAYMENT_REVIEW';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.review_booking_fee(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_booking_fee(uuid, boolean, text) TO authenticated;

-- Owner decision consumes the fee only after confirming availability. Unavailable
-- vehicles leave the reviewed fee reusable for another vehicle until an owner confirms one.
CREATE OR REPLACE FUNCTION public.resolve_booking_availability(p_booking_id uuid, p_available boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE b public.bookings%ROWTYPE; tx public.booking_fee_transactions%ROWTYPE;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND OR b.status <> 'PENDING' OR NOT EXISTS (
    SELECT 1 FROM public.vehicles v JOIN public.owners o ON o.id = v.owner_id
    WHERE v.id = b.vehicle_id AND o.user_id = (select auth.uid())) THEN RAISE EXCEPTION 'booking_not_owned_or_pending'; END IF;
  SELECT * INTO tx FROM public.booking_fee_transactions WHERE id = b.booking_fee_transaction_id FOR UPDATE;
  IF NOT FOUND OR tx.status <> 'PAID_AVAILABLE' OR tx.current_booking_id IS DISTINCT FROM b.id THEN RAISE EXCEPTION 'booking_fee_not_available'; END IF;
  IF p_available THEN
    UPDATE public.bookings SET status = 'CONFIRMED', updated_at = now() WHERE id = b.id;
    UPDATE public.booking_fee_transactions SET status = 'CONSUMED' WHERE id = tx.id;
  ELSE
    UPDATE public.bookings SET status = 'UNAVAILABLE', updated_at = now() WHERE id = b.id;
    UPDATE public.booking_fee_transactions SET current_booking_id = NULL WHERE id = tx.id;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.resolve_booking_availability(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_booking_availability(uuid, boolean) TO authenticated;

-- Submit a booking with a newly paid fee or reuse the same validated fee after an unavailable
-- vehicle. Data is inserted atomically; the fee amount is fixed server-side at Rp25,000.
CREATE OR REPLACE FUNCTION public.submit_booking_with_fee(
  p_booking jsonb, p_proof_path text DEFAULT NULL, p_reuse_transaction_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := (select auth.uid()); bid uuid := gen_random_uuid(); txid uuid;
  fee public.booking_fee_transactions%ROWTYPE; vehicle_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  vehicle_id := (p_booking->>'vehicle_id')::uuid;
  IF NOT EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.status = 'AVAILABLE') THEN RAISE EXCEPTION 'vehicle_unavailable'; END IF;
  IF p_reuse_transaction_id IS NULL THEN
    IF p_proof_path IS NULL OR p_proof_path !~ ('^' || uid::text || '/[A-Za-z0-9._-]+$') THEN RAISE EXCEPTION 'valid_payment_proof_required'; END IF;
    INSERT INTO public.booking_fee_transactions (renter_id, amount, status, payment_proof_path, current_booking_id)
      VALUES (uid, 25000, 'PENDING_REVIEW', p_proof_path, bid) RETURNING id INTO txid;
  ELSE
    SELECT * INTO fee FROM public.booking_fee_transactions WHERE id = p_reuse_transaction_id AND renter_id = uid FOR UPDATE;
    IF NOT FOUND OR fee.status <> 'PAID_AVAILABLE' OR fee.current_booking_id IS NOT NULL THEN RAISE EXCEPTION 'booking_fee_not_reusable'; END IF;
    txid := fee.id;
    UPDATE public.booking_fee_transactions SET current_booking_id = bid WHERE id = txid;
  END IF;
  INSERT INTO public.bookings (id, renter_id, vehicle_id, start_date, end_date, duration_type, with_driver,
    total_price, dp_amount, trip_origin, trip_destination, trip_purpose, guarantee_type, guarantee_doc_url,
    status, booking_fee_transaction_id)
  VALUES (bid, uid, vehicle_id, (p_booking->>'start_date')::date, (p_booking->>'end_date')::date,
    p_booking->>'duration_type', coalesce((p_booking->>'with_driver')::boolean,false),
    (p_booking->>'total_price')::numeric, (p_booking->>'dp_amount')::numeric,
    left(coalesce(p_booking->>'trip_origin',''),255), left(coalesce(p_booking->>'trip_destination',''),255),
    left(coalesce(p_booking->>'trip_purpose',''),2000), p_booking->>'guarantee_type', p_booking->>'guarantee_doc_url',
    CASE WHEN p_reuse_transaction_id IS NULL THEN 'PENDING_PAYMENT_REVIEW' ELSE 'PENDING' END, txid);
  RETURN bid;
END $$;
REVOKE ALL ON FUNCTION public.submit_booking_with_fee(jsonb, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_booking_with_fee(jsonb, text, uuid) TO authenticated;

-- Static booking QRIS is managed by admin; proof files remain private to renter/admin.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('booking-fee-qris','booking-fee-qris',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('booking-fee-proofs','booking-fee-proofs',false,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];
DROP POLICY IF EXISTS booking_qris_admin_write ON storage.objects;
CREATE POLICY booking_qris_admin_write ON storage.objects FOR ALL TO authenticated USING (bucket_id='booking-fee-qris' AND (select public.is_admin())) WITH CHECK (bucket_id='booking-fee-qris' AND (select public.is_admin()));
DROP POLICY IF EXISTS booking_proof_owner_upload ON storage.objects;
CREATE POLICY booking_proof_owner_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='booking-fee-proofs' AND (storage.foldername(name))[1]=(select auth.uid())::text);
DROP POLICY IF EXISTS booking_proof_renter_admin_read ON storage.objects;
CREATE POLICY booking_proof_renter_admin_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='booking-fee-proofs' AND ((storage.foldername(name))[1]=(select auth.uid())::text OR (select public.is_admin()))
);
DROP POLICY IF EXISTS booking_proof_renter_delete ON storage.objects;
CREATE POLICY booking_proof_renter_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='booking-fee-proofs' AND (storage.foldername(name))[1]=(select auth.uid())::text);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_messages;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;
COMMIT;
