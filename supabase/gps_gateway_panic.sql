-- ============================================================================
-- GPS GATEWAY CONFIGURATION & PANIC SOS ALERT SYSTEM FOR RENMOKU
-- ============================================================================
-- Run this in Supabase SQL Editor to enable GPS Device Gateway Configuration,
-- Remote Engine Cut-off, and Nearby Rental Owner Panic Alerts.

-- 1. Table: vehicle_gps_devices (Stores hardware GPS configuration & relay status)
CREATE TABLE IF NOT EXISTS public.vehicle_gps_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid UNIQUE NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  device_name text NOT NULL DEFAULT 'GPS Tracker',
  imei text NOT NULL DEFAULT '',
  device_model text NOT NULL DEFAULT 'GT06',
  protocol text NOT NULL DEFAULT 'GT06', -- GT06, Concox, TK103, Coban, Sinotrack, Teltonika, Traccar, Generic Webhook
  sim_number text NOT NULL DEFAULT '',
  server_host text NOT NULL DEFAULT 'gps.renmoku.biz.id',
  server_port integer NOT NULL DEFAULT 5023,
  secret_token text NOT NULL DEFAULT '',
  relay_supported boolean NOT NULL DEFAULT true, -- apakah perangkat memiliki relay pemutus mesin
  panic_supported boolean NOT NULL DEFAULT true, -- apakah perangkat memiliki tombol SOS / panic button
  engine_cut_status boolean NOT NULL DEFAULT false, -- TRUE jika mesin sedang dimatikan secara remote (cut-off aktif)
  speed_limit integer NOT NULL DEFAULT 100, -- Batas kecepatan maksimal (km/jam)
  ping_interval integer NOT NULL DEFAULT 10, -- Interval kirim koordinat (detik)
  battery_level integer NOT NULL DEFAULT 100,
  signal_strength integer NOT NULL DEFAULT 95,
  status text NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'STANDBY', 'OFFLINE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_gps_devices ENABLE ROW LEVEL SECURITY;

-- Policies for vehicle_gps_devices
DROP POLICY IF EXISTS "Owners can view their vehicle GPS devices" ON public.vehicle_gps_devices;
CREATE POLICY "Owners can view their vehicle GPS devices" ON public.vehicle_gps_devices FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.owners o ON o.id = v.owner_id
    WHERE v.id = vehicle_gps_devices.vehicle_id AND o.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Owners can update their vehicle GPS devices" ON public.vehicle_gps_devices;
CREATE POLICY "Owners can update their vehicle GPS devices" ON public.vehicle_gps_devices FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.owners o ON o.id = v.owner_id
    WHERE v.id = vehicle_gps_devices.vehicle_id AND o.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.owners o ON o.id = v.owner_id
    WHERE v.id = vehicle_gps_devices.vehicle_id AND o.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Owners can insert their vehicle GPS devices" ON public.vehicle_gps_devices;
CREATE POLICY "Owners can insert their vehicle GPS devices" ON public.vehicle_gps_devices FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.owners o ON o.id = v.owner_id
    WHERE v.id = vehicle_gps_devices.vehicle_id AND o.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Admins can view all vehicle GPS devices" ON public.vehicle_gps_devices;
CREATE POLICY "Admins can view all vehicle GPS devices" ON public.vehicle_gps_devices FOR SELECT TO authenticated
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can manage all vehicle GPS devices" ON public.vehicle_gps_devices;
CREATE POLICY "Admins can manage all vehicle GPS devices" ON public.vehicle_gps_devices FOR ALL TO authenticated
  USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

GRANT SELECT, INSERT, UPDATE ON public.vehicle_gps_devices TO authenticated;
GRANT ALL ON public.vehicle_gps_devices TO service_role;


-- 2. Table: gps_panic_alerts (Stores emergency SOS panic activations)
CREATE TABLE IF NOT EXISTS public.gps_panic_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  vehicle_name text NOT NULL DEFAULT '',
  license_plate text NOT NULL DEFAULT '',
  triggered_by text NOT NULL DEFAULT 'OWNER' CHECK (triggered_by IN ('OWNER', 'RENTER', 'DEVICE')),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  city text NOT NULL DEFAULT 'Jakarta',
  speed double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
  notes text DEFAULT '',
  notified_owners_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.gps_panic_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view panic alerts" ON public.gps_panic_alerts;
CREATE POLICY "Authenticated users can view panic alerts" ON public.gps_panic_alerts FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert panic alerts" ON public.gps_panic_alerts;
CREATE POLICY "Authenticated users can insert panic alerts" ON public.gps_panic_alerts FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners or admins can update panic alerts" ON public.gps_panic_alerts;
CREATE POLICY "Owners or admins can update panic alerts" ON public.gps_panic_alerts FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.gps_panic_alerts TO authenticated;
GRANT ALL ON public.gps_panic_alerts TO service_role;


-- 3. Stored Procedure: Trigger Panic Alert & Notify Nearby Rental Owners
CREATE OR REPLACE FUNCTION public.trigger_gps_panic_alert(
  p_vehicle_id uuid,
  p_vehicle_name text,
  p_license_plate text,
  p_latitude double precision,
  p_longitude double precision,
  p_city text,
  p_speed double precision,
  p_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_alert_id uuid;
  v_owner_record RECORD;
  v_notified_count integer := 0;
  v_sender_name text;
BEGIN
  -- Insert into panic alerts table
  INSERT INTO public.gps_panic_alerts (
    vehicle_id,
    vehicle_name,
    license_plate,
    triggered_by,
    latitude,
    longitude,
    city,
    speed,
    notes,
    status
  ) VALUES (
    p_vehicle_id,
    p_vehicle_name,
    p_license_plate,
    'OWNER',
    p_latitude,
    p_longitude,
    p_city,
    p_speed,
    p_notes,
    'ACTIVE'
  ) RETURNING id INTO v_alert_id;

  -- Create emergency notification for all active rental owners
  FOR v_owner_record IN (
    SELECT DISTINCT u.id as user_id, u.full_name, o.business_name
    FROM public.users u
    JOIN public.owners o ON o.user_id = u.id
    WHERE u.role = 'OWNER'
  ) LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data,
      is_read
    ) VALUES (
      v_owner_record.user_id,
      'warning',
      '🚨 DARURAT: Panic Button Aktif! ' || p_vehicle_name,
      'Kendaraan ' || p_vehicle_name || ' (' || p_license_plate || ') mengaktifkan Panic Button di area ' || p_city || '. Kecepatan: ' || ROUND(p_speed::numeric, 0) || ' km/jam. Pemilik rental terdekat dimohon waspada.',
      jsonb_build_object(
        'alert_id', v_alert_id,
        'vehicle_id', p_vehicle_id,
        'vehicle_name', p_vehicle_name,
        'latitude', p_latitude,
        'longitude', p_longitude,
        'city', p_city,
        'speed', p_speed,
        'notes', p_notes,
        'action_url', '/?page=vehicle-live-map&id=' || p_vehicle_id
      ),
      false
    );
    v_notified_count := v_notified_count + 1;
  END LOOP;

  -- Update count of notified owners
  UPDATE public.gps_panic_alerts
  SET notified_owners_count = v_notified_count
  WHERE id = v_alert_id;

  RETURN v_alert_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.trigger_gps_panic_alert TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_gps_panic_alert TO service_role;


-- 4. Enable Supabase Realtime for Devices & Alerts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'vehicle_gps_devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_gps_devices;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gps_panic_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_panic_alerts;
  END IF;
END $$;
