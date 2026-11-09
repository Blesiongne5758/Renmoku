-- Owner dashboard settings, runtime GPS/map configuration, and vehicle submissions.
-- Run once in Supabase SQL Editor before using these features.

-- Keep the existing public profile/owner tables in sync with new Supabase Auth sign-ups.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_role text := CASE WHEN new.raw_user_meta_data ->> 'role' = 'OWNER' THEN 'OWNER' ELSE 'RENTER' END;
  display_name text := COALESCE(NULLIF(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1));
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role, status)
  VALUES (new.id, new.email, display_name, new.phone, new_role, 'PENDING')
  ON CONFLICT (id) DO NOTHING;

  IF new_role = 'OWNER' THEN
    INSERT INTO public.owners (user_id, business_name)
    VALUES (new.id, display_name)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.owners (user_id, business_name)
SELECT u.id, COALESCE(NULLIF(u.full_name, ''), 'Pemilik Rental')
FROM public.users u
WHERE u.role = 'OWNER'
ON CONFLICT (user_id) DO NOTHING;

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

-- Admin workspaces use a SECURITY DEFINER helper to avoid recursive users-table RLS checks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'ADMIN');
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.protect_user_role_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status)
     AND NOT (select public.is_admin()) THEN
    RAISE EXCEPTION 'Only an administrator can change account role or status';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_user_role_status() FROM PUBLIC;
DROP TRIGGER IF EXISTS protect_user_role_status ON public.users;
CREATE TRIGGER protect_user_role_status
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_role_status();

CREATE OR REPLACE FUNCTION public.can_view_booked_vehicle(target_vehicle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE vehicle_id = target_vehicle_id AND renter_id = (select auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.can_view_booked_vehicle(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_booked_vehicle(uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can review vehicle submissions" ON public.owner_vehicle_submissions;
CREATE POLICY "Admins can review vehicle submissions" ON public.owner_vehicle_submissions FOR SELECT TO authenticated
  USING ((select public.is_admin()));
DROP POLICY IF EXISTS "Admins can update vehicle submissions" ON public.owner_vehicle_submissions;
CREATE POLICY "Admins can update vehicle submissions" ON public.owner_vehicle_submissions FOR UPDATE TO authenticated
  USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
DROP POLICY IF EXISTS "Admins review owner files" ON storage.objects;
CREATE POLICY "Admins review owner files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'owner-private' AND (select public.is_admin()));

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO authenticated
  USING ((select public.is_admin()));
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE TO authenticated
  USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));
DROP POLICY IF EXISTS "Admins can update user status" ON public.users;
CREATE POLICY "Admins can update user status" ON public.users FOR UPDATE TO authenticated
  USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
GRANT SELECT, UPDATE ON public.users TO authenticated;

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT TO authenticated
  USING ((select public.is_admin()));
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
GRANT SELECT, UPDATE ON public.bookings TO authenticated;

DROP POLICY IF EXISTS "Renters can view vehicles in their bookings" ON public.vehicles;
CREATE POLICY "Renters can view vehicles in their bookings" ON public.vehicles FOR SELECT TO authenticated
  USING ((select public.can_view_booked_vehicle(id)));
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
CREATE POLICY "Admins can view all vehicles" ON public.vehicles FOR SELECT TO authenticated
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT TO authenticated
  USING ((select public.is_admin()));
GRANT SELECT ON public.payments TO authenticated;

CREATE TABLE IF NOT EXISTS public.admin_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  details text NOT NULL CHECK (char_length(details) BETWEEN 1 AND 3000),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED')),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.admin_disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read disputes" ON public.admin_disputes;
CREATE POLICY "Admins can read disputes" ON public.admin_disputes FOR SELECT TO authenticated
  USING ((select public.is_admin()));
DROP POLICY IF EXISTS "Admins can create disputes" ON public.admin_disputes;
CREATE POLICY "Admins can create disputes" ON public.admin_disputes FOR INSERT TO authenticated
  WITH CHECK ((select public.is_admin()) AND created_by = (select auth.uid()));
DROP POLICY IF EXISTS "Admins can update disputes" ON public.admin_disputes;
CREATE POLICY "Admins can update disputes" ON public.admin_disputes FOR UPDATE TO authenticated
  USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
GRANT SELECT, INSERT, UPDATE ON public.admin_disputes TO authenticated;
