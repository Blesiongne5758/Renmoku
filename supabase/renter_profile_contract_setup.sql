-- Renter identity/KYC capture, private document storage, and auditable e-contract.
-- Apply schema.sql + owner_features.sql + booking_fee_chat_setup.sql first.
BEGIN;

ALTER TABLE public.kyc_documents_individual
  ADD COLUMN IF NOT EXISTS selfie_ktp_url text,
  ADD COLUMN IF NOT EXISTS sim_class text NOT NULL DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS residential_latitude double precision,
  ADD COLUMN IF NOT EXISTS residential_longitude double precision;
ALTER TABLE public.kyc_documents_individual DROP CONSTRAINT IF EXISTS kyc_residential_coordinates_pair;
ALTER TABLE public.kyc_documents_individual ADD CONSTRAINT kyc_residential_coordinates_pair CHECK (
  (residential_latitude IS NULL AND residential_longitude IS NULL) OR
  (residential_latitude BETWEEN -90 AND 90 AND residential_longitude BETWEEN -180 AND 180)
);
ALTER TABLE public.kyc_documents_individual DROP CONSTRAINT IF EXISTS kyc_documents_individual_sim_class_check;
ALTER TABLE public.kyc_documents_individual ADD CONSTRAINT kyc_documents_individual_sim_class_check CHECK (sim_class='A');
GRANT SELECT, INSERT, UPDATE ON public.kyc_documents_individual TO authenticated;
DROP POLICY IF EXISTS renter_kyc_admin_read ON public.kyc_documents_individual;
CREATE POLICY renter_kyc_admin_read ON public.kyc_documents_individual FOR SELECT TO authenticated USING ((select public.is_admin()));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS contract_signer_name text,
  ADD COLUMN IF NOT EXISTS contract_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS contract_version text,
  ADD COLUMN IF NOT EXISTS contract_content_snapshot text,
  ADD COLUMN IF NOT EXISTS contract_sha256 text,
  ADD COLUMN IF NOT EXISTS contract_signature_path text;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_contract_sha256_format;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_contract_sha256_format
  CHECK (contract_sha256 IS NULL OR contract_sha256 ~ '^[0-9a-f]{64}$');

CREATE OR REPLACE FUNCTION public.prevent_signed_contract_changes()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF OLD.contract_signed AND (NOT NEW.contract_signed OR
    NEW.contract_signer_name IS DISTINCT FROM OLD.contract_signer_name OR
    NEW.contract_signed_at IS DISTINCT FROM OLD.contract_signed_at OR
    NEW.contract_version IS DISTINCT FROM OLD.contract_version OR
    NEW.contract_content_snapshot IS DISTINCT FROM OLD.contract_content_snapshot OR
    NEW.contract_sha256 IS DISTINCT FROM OLD.contract_sha256 OR
    NEW.contract_signature_path IS DISTINCT FROM OLD.contract_signature_path
  ) THEN RAISE EXCEPTION 'signed_contract_is_immutable'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bookings_prevent_signed_contract_changes ON public.bookings;
CREATE TRIGGER bookings_prevent_signed_contract_changes BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_signed_contract_changes();

-- Private KYC attachments and signatures. Only the renter and admins can read files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('renter-kyc-private','renter-kyc-private',false,8388608,ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public=false, file_size_limit=8388608, allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','application/pdf'];
DROP POLICY IF EXISTS renter_kyc_private_upload_own ON storage.objects;
CREATE POLICY renter_kyc_private_upload_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='renter-kyc-private' AND (storage.foldername(name))[1]=(select auth.uid())::text);
DROP POLICY IF EXISTS renter_kyc_private_read_own_admin ON storage.objects;
CREATE POLICY renter_kyc_private_read_own_admin ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='renter-kyc-private' AND ((storage.foldername(name))[1]=(select auth.uid())::text OR (select public.is_admin())));
DROP POLICY IF EXISTS renter_contract_signature_read_booking_owner ON storage.objects;
CREATE POLICY renter_contract_signature_read_booking_owner ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='renter-kyc-private' AND name LIKE '%/contracts/%' AND EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.vehicles v ON v.id=b.vehicle_id
      JOIN public.owners o ON o.id=v.owner_id
    WHERE b.contract_signature_path=name AND o.user_id=(select auth.uid())
  )
);
DROP POLICY IF EXISTS renter_kyc_private_delete_own ON storage.objects;
CREATE POLICY renter_kyc_private_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='renter-kyc-private' AND (storage.foldername(name))[1]=(select auth.uid())::text);

-- Recreate the booking RPC with mandatory signed contract data. A booking without
-- a private signature image and immutable contract snapshot cannot be submitted.
CREATE OR REPLACE FUNCTION public.submit_booking_with_fee(
  p_booking jsonb, p_proof_path text DEFAULT NULL, p_reuse_transaction_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  uid uuid := (select auth.uid());
  bid uuid := gen_random_uuid();
  txid uuid;
  fee public.booking_fee_transactions%ROWTYPE;
  target_vehicle uuid;
  signer text;
  signature_path text;
  contract_text text;
  contract_hash text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  target_vehicle := (p_booking->>'vehicle_id')::uuid;
  IF NOT EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id=target_vehicle AND v.status='AVAILABLE') THEN RAISE EXCEPTION 'vehicle_unavailable'; END IF;
  signer := left(btrim(p_booking->>'contract_signer_name'),150);
  signature_path := p_booking->>'contract_signature_path';
  contract_text := p_booking->>'contract_content_snapshot';
  contract_hash := p_booking->>'contract_sha256';
  IF coalesce((p_booking->>'contract_signed')::boolean,false) IS NOT TRUE OR signer IS NULL OR length(signer)<3
    OR contract_text IS NULL OR length(contract_text)<100 OR length(contract_text)>200000
    OR contract_hash IS NULL OR contract_hash !~ '^[0-9a-f]{64}$'
    OR signature_path IS NULL OR signature_path !~ ('^'||uid::text||'/contracts/[A-Za-z0-9._-]+$')
    OR NOT EXISTS (SELECT 1 FROM storage.objects so WHERE so.bucket_id='renter-kyc-private' AND so.name=signature_path)
  THEN RAISE EXCEPTION 'signed_contract_required'; END IF;
  IF (p_booking->>'start_date')::date < current_date OR (p_booking->>'end_date')::date <= (p_booking->>'start_date')::date THEN
    RAISE EXCEPTION 'invalid_rental_dates';
  END IF;
  IF p_reuse_transaction_id IS NULL THEN
    IF p_proof_path IS NULL OR p_proof_path !~ ('^'||uid::text||'/[A-Za-z0-9._-]+$') THEN RAISE EXCEPTION 'valid_payment_proof_required'; END IF;
    INSERT INTO public.booking_fee_transactions (renter_id, amount, status, payment_proof_path, current_booking_id)
      VALUES (uid,25000,'PENDING_REVIEW',p_proof_path,bid) RETURNING id INTO txid;
  ELSE
    SELECT * INTO fee FROM public.booking_fee_transactions WHERE id=p_reuse_transaction_id AND renter_id=uid FOR UPDATE;
    IF NOT FOUND OR fee.status<>'PAID_AVAILABLE' OR fee.current_booking_id IS NOT NULL THEN RAISE EXCEPTION 'booking_fee_not_reusable'; END IF;
    txid := fee.id;
    UPDATE public.booking_fee_transactions SET current_booking_id=bid WHERE id=txid;
  END IF;
  INSERT INTO public.bookings (
    id,renter_id,vehicle_id,start_date,end_date,duration_type,with_driver,total_price,dp_amount,
    trip_origin,trip_destination,trip_purpose,guarantee_type,guarantee_doc_url,status,booking_fee_transaction_id,
    contract_signed,contract_signer_name,contract_signed_at,contract_version,contract_content_snapshot,contract_sha256,contract_signature_path
  ) VALUES (
    bid,uid,target_vehicle,(p_booking->>'start_date')::date,(p_booking->>'end_date')::date,p_booking->>'duration_type',
    coalesce((p_booking->>'with_driver')::boolean,false),(p_booking->>'total_price')::numeric,(p_booking->>'dp_amount')::numeric,
    left(coalesce(p_booking->>'trip_origin',''),255),left(coalesce(p_booking->>'trip_destination',''),255),
    left(coalesce(p_booking->>'trip_purpose',''),2000),p_booking->>'guarantee_type',p_booking->>'guarantee_doc_url',
    CASE WHEN p_reuse_transaction_id IS NULL THEN 'PENDING_PAYMENT_REVIEW' ELSE 'PENDING' END,txid,
    true,signer,now(),left(p_booking->>'contract_version',30),contract_text,contract_hash,signature_path
  );
  RETURN bid;
END $$;
REVOKE ALL ON FUNCTION public.submit_booking_with_fee(jsonb,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_booking_with_fee(jsonb,text,uuid) TO authenticated;

COMMIT;
