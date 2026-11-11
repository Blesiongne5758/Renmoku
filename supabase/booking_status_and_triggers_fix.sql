-- Migration: Fix booking status length and search_path in trigger functions
-- 1. Drop dependent view and policies
DROP VIEW IF EXISTS public.booking_details;
DROP POLICY IF EXISTS booking_messages_read_eligible ON public.booking_messages;
DROP POLICY IF EXISTS booking_messages_insert_eligible ON public.booking_messages;

-- 2. Alter column status on bookings to VARCHAR(50) (accommodates 'PENDING_PAYMENT_REVIEW')
ALTER TABLE public.bookings ALTER COLUMN status TYPE VARCHAR(50);

-- 3. Recreate policies on booking_messages
CREATE POLICY booking_messages_read_eligible ON public.booking_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.vehicles v ON v.id = b.vehicle_id
      LEFT JOIN public.owners o ON o.id = v.owner_id
      WHERE b.id = booking_messages.booking_id
        AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
        AND (b.renter_id = (SELECT auth.uid()) OR o.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY booking_messages_insert_eligible ON public.booking_messages
  FOR INSERT WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.vehicles v ON v.id = b.vehicle_id
      LEFT JOIN public.owners o ON o.id = v.owner_id
      WHERE b.id = booking_messages.booking_id
        AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
        AND (b.renter_id = (SELECT auth.uid()) OR o.user_id = (SELECT auth.uid()))
    )
  );

-- 4. Recreate view booking_details
CREATE OR REPLACE VIEW public.booking_details AS
SELECT b.id,
  b.renter_id,
  b.vehicle_id,
  b.start_date,
  b.end_date,
  b.duration_type,
  b.with_driver,
  b.total_price,
  b.dp_amount,
  b.trip_origin,
  b.trip_destination,
  b.trip_purpose,
  b.guarantee_type,
  b.guarantee_doc_url,
  b.status,
  b.contract_signed,
  b.created_at,
  b.updated_at,
  r.full_name AS renter_name,
  r.email AS renter_email,
  r.phone AS renter_phone,
  (((((v.brand)::text || ' '::text) || (v.model)::text) || ' '::text) || v.year) AS vehicle_name,
  o.business_name AS owner_name
FROM (((public.bookings b
  JOIN public.users r ON ((b.renter_id = r.id)))
  JOIN public.vehicles v ON ((b.vehicle_id = v.id)))
  JOIN public.owners o ON ((v.owner_id = o.id)));

-- 5. Fix update_vehicle_statistics trigger function to schema-qualify tables and set search_path
CREATE OR REPLACE FUNCTION public.update_vehicle_statistics()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.vehicles
  SET total_bookings = (
    SELECT COUNT(*) FROM public.bookings WHERE vehicle_id = NEW.vehicle_id
  )
  WHERE id = NEW.vehicle_id;
  
  RETURN NEW;
END;
$$;
