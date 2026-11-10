-- Admin controlled availability for paid AI Spin and the 360 studio.
-- Both features remain off until an admin explicitly enables them.
ALTER TABLE public.app_runtime_settings
  ADD COLUMN IF NOT EXISTS ai_spin_credits_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spin360_studio_enabled boolean NOT NULL DEFAULT false;

INSERT INTO public.app_runtime_settings (id, ai_spin_credits_enabled, spin360_studio_enabled)
VALUES (1, false, false)
ON CONFLICT (id) DO NOTHING;

-- Supabase Realtime delivers booking changes only for tables in its publication.
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;

-- Atomic deletion guard: preserve booking history and prevent a booking from
-- racing between the UI's confirmation check and vehicle deletion.
CREATE OR REPLACE FUNCTION public.owner_delete_vehicle_if_unbooked(p_vehicle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_deleted integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  DELETE FROM public.vehicles v
  USING public.owners o
  WHERE v.id = p_vehicle_id
    AND v.owner_id = o.id
    AND o.user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.vehicle_id = v.id)
    AND NOT EXISTS (SELECT 1 FROM public.owner_vehicle_inspections i WHERE i.vehicle_id = v.id);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted = 0 THEN RAISE EXCEPTION 'vehicle not found, not owned, or has booking history'; END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.owner_delete_vehicle_if_unbooked(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owner_delete_vehicle_if_unbooked(uuid) TO authenticated;

-- Persist check-in/check-out evidence and preserve it when a vehicle is no
-- longer listed. A booking can have one check-in and one check-out record.
CREATE TABLE IF NOT EXISTS public.owner_vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE RESTRICT,
  inspection_type text NOT NULL CHECK (inspection_type IN ('checkin', 'checkout')),
  odometer_km integer NOT NULL CHECK (odometer_km >= 0),
  fuel_level integer NOT NULL CHECK (fuel_level IN (0, 25, 50, 75, 100)),
  photos jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, inspection_type)
);
ALTER TABLE public.owner_vehicle_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners read own vehicle inspections" ON public.owner_vehicle_inspections;
CREATE POLICY "Owners read own vehicle inspections" ON public.owner_vehicle_inspections
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "Owners create inspections for own vehicles" ON public.owner_vehicle_inspections;
CREATE POLICY "Owners create inspections for own vehicles" ON public.owner_vehicle_inspections
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (select auth.uid()) AND EXISTS (
      SELECT 1 FROM public.vehicles v JOIN public.owners o ON o.id = v.owner_id
      WHERE v.id = vehicle_id AND o.user_id = (select auth.uid())
    )
  );
GRANT SELECT, INSERT ON public.owner_vehicle_inspections TO authenticated;
