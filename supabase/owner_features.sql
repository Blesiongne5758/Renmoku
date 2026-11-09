-- Owner dashboard settings, runtime GPS/map configuration, and vehicle submissions.
-- Run once in Supabase SQL Editor before using these features.

CREATE TABLE IF NOT EXISTS public.owner_private_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  insurance_provider text NOT NULL DEFAULT '',
  policy_number text NOT NULL DEFAULT '',
  insurance_expiry date,
  vehicle_plate text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_private_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can read their private settings" ON public.owner_private_settings;
CREATE POLICY "Owners can read their private settings" ON public.owner_private_settings FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Owners can insert their private settings" ON public.owner_private_settings;
CREATE POLICY "Owners can insert their private settings" ON public.owner_private_settings FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Owners can update their private settings" ON public.owner_private_settings;
CREATE POLICY "Owners can update their private settings" ON public.owner_private_settings FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE ON public.owner_private_settings TO authenticated;

CREATE TABLE IF NOT EXISTS public.app_runtime_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  map_provider text NOT NULL DEFAULT 'openstreetmap' CHECK (map_provider IN ('openstreetmap', 'custom')),
  map_tile_url text NOT NULL DEFAULT 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  map_attribution text NOT NULL DEFAULT '&copy; OpenStreetMap contributors',
  map_api_key text NOT NULL DEFAULT '',
  realtime_enabled boolean NOT NULL DEFAULT false,
  realtime_url text NOT NULL DEFAULT '',
  realtime_path text NOT NULL DEFAULT '/socket.io',
  gps_tracking_enabled boolean NOT NULL DEFAULT true,
  gps_update_interval integer NOT NULL DEFAULT 10,
  gps_history_retention integer NOT NULL DEFAULT 90,
  gps_notifications boolean NOT NULL DEFAULT true,
  gps_geofencing boolean NOT NULL DEFAULT true,
  gps_behavior_monitoring boolean NOT NULL DEFAULT true,
  gps_engine_control boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_tracking_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_update_interval integer NOT NULL DEFAULT 10;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_history_retention integer NOT NULL DEFAULT 90;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_notifications boolean NOT NULL DEFAULT true;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_geofencing boolean NOT NULL DEFAULT true;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_behavior_monitoring boolean NOT NULL DEFAULT true;
ALTER TABLE public.app_runtime_settings ADD COLUMN IF NOT EXISTS gps_engine_control boolean NOT NULL DEFAULT true;
INSERT INTO public.app_runtime_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.app_runtime_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Runtime settings are readable" ON public.app_runtime_settings;
CREATE POLICY "Runtime settings are readable" ON public.app_runtime_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins can update runtime settings" ON public.app_runtime_settings;
CREATE POLICY "Admins can update runtime settings" ON public.app_runtime_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'));
GRANT SELECT ON public.app_runtime_settings TO anon, authenticated;
GRANT UPDATE ON public.app_runtime_settings TO authenticated;

CREATE TABLE IF NOT EXISTS public.owner_vehicle_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text NOT NULL,
  transmission text NOT NULL CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
  capacity integer NOT NULL,
  fuel_type text NOT NULL,
  price_daily numeric(12,2) NOT NULL,
  location text NOT NULL,
  odometer_km integer NOT NULL,
  ownership_document_path text NOT NULL,
  vehicle_photos jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_vehicle_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can read their vehicle submissions" ON public.owner_vehicle_submissions;
CREATE POLICY "Owners can read their vehicle submissions" ON public.owner_vehicle_submissions FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Owners can submit vehicles" ON public.owner_vehicle_submissions;
CREATE POLICY "Owners can submit vehicles" ON public.owner_vehicle_submissions FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Admins can review vehicle submissions" ON public.owner_vehicle_submissions;
CREATE POLICY "Admins can review vehicle submissions" ON public.owner_vehicle_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'));
DROP POLICY IF EXISTS "Admins can update vehicle submissions" ON public.owner_vehicle_submissions;
CREATE POLICY "Admins can update vehicle submissions" ON public.owner_vehicle_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'));
GRANT SELECT, INSERT ON public.owner_vehicle_submissions TO authenticated;
GRANT UPDATE ON public.owner_vehicle_submissions TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('owner-private', 'owner-private', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Owners upload their files" ON storage.objects;
CREATE POLICY "Owners upload their files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'owner-private' AND (storage.foldername(name))[1] = (select auth.uid())::text);
DROP POLICY IF EXISTS "Owners read their files" ON storage.objects;
CREATE POLICY "Owners read their files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'owner-private' AND (storage.foldername(name))[1] = (select auth.uid())::text);
DROP POLICY IF EXISTS "Admins review owner files" ON storage.objects;
CREATE POLICY "Admins review owner files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'owner-private' AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'));
