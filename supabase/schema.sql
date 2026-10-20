-- ============================================================================
-- RENMOKU - Supabase Database Schema
-- ============================================================================
-- Database: PostgreSQL (Supabase)
-- Version: 2.0.0
-- Last Updated: 2026-10-15
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'RENTER' CHECK (role IN ('RENTER', 'OWNER', 'ADMIN')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- OWNERS TABLE (Fleet Owners)
-- ============================================================================
CREATE TABLE owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  bank_account VARCHAR(50),
  bank_name VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_vehicles INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for owners
CREATE INDEX idx_owners_user_id ON owners(user_id);

-- ============================================================================
-- VEHICLES TABLE
-- ============================================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  transmission VARCHAR(20) NOT NULL CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
  capacity INT NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  features TEXT[] DEFAULT '{}',
  price_daily DECIMAL(12,2) NOT NULL,
  price_weekly DECIMAL(12,2) NOT NULL,
  price_monthly DECIMAL(12,2) NOT NULL,
  has_driver_option BOOLEAN DEFAULT FALSE,
  driver_price_daily DECIMAL(12,2),
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE')),
  location VARCHAR(255) NOT NULL,
  images TEXT[] DEFAULT '{}',
  model_3d_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vehicles
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_location ON vehicles(location);
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
CREATE INDEX idx_vehicles_price_daily ON vehicles(price_daily);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  with_driver BOOLEAN DEFAULT FALSE,
  total_price DECIMAL(12,2) NOT NULL,
  dp_amount DECIMAL(12,2) NOT NULL,
  trip_origin VARCHAR(255) NOT NULL,
  trip_destination VARCHAR(255) NOT NULL,
  trip_purpose TEXT,
  guarantee_type VARCHAR(30) NOT NULL CHECK (guarantee_type IN ('KTP', 'BPKB', 'CASH', 'GUARANTEE_LETTER')),
  guarantee_doc_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  contract_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('DP', 'FULL_PAYMENT')),
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================================================
-- KYC DOCUMENTS TABLE (Individual Renters)
-- ============================================================================
CREATE TABLE kyc_documents_individual (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ktp_number VARCHAR(16) UNIQUE NOT NULL,
  ktp_scan_url TEXT NOT NULL,
  sim_number VARCHAR(20) NOT NULL,
  sim_scan_url TEXT NOT NULL,
  kk_scan_url TEXT NOT NULL,
  address TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for KYC individual
CREATE INDEX idx_kyc_individual_user_id ON kyc_documents_individual(user_id);
CREATE INDEX idx_kyc_individual_ktp_number ON kyc_documents_individual(ktp_number);

-- ============================================================================
-- KYC DOCUMENTS TABLE (Corporate Renters)
-- ============================================================================
CREATE TABLE kyc_documents_corporate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  nib VARCHAR(20) UNIQUE NOT NULL,
  nib_document_url TEXT NOT NULL,
  akta_document_url TEXT NOT NULL,
  npwp VARCHAR(20) UNIQUE NOT NULL,
  npwp_document_url TEXT NOT NULL,
  pic_name VARCHAR(255) NOT NULL,
  pic_ktp_number VARCHAR(16) NOT NULL,
  pic_ktp_scan_url TEXT NOT NULL,
  pic_sim_number VARCHAR(20) NOT NULL,
  pic_sim_scan_url TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for KYC corporate
CREATE INDEX idx_kyc_corporate_user_id ON kyc_documents_corporate(user_id);
CREATE INDEX idx_kyc_corporate_nib ON kyc_documents_corporate(nib);
CREATE INDEX idx_kyc_corporate_npwp ON kyc_documents_corporate(npwp);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_renter_id ON reviews(renter_id);
CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX idx_reviews_owner_id ON reviews(owner_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_individual_updated_at BEFORE UPDATE ON kyc_documents_individual
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_corporate_updated_at BEFORE UPDATE ON kyc_documents_corporate
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update owner statistics
CREATE OR REPLACE FUNCTION update_owner_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total vehicles
  UPDATE owners
  SET total_vehicles = (
    SELECT COUNT(*) FROM vehicles WHERE owner_id = NEW.owner_id
  )
  WHERE id = NEW.owner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for owner statistics
CREATE TRIGGER update_owner_stats_after_vehicle_insert
  AFTER INSERT ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_owner_statistics();

-- Function to update vehicle statistics
CREATE OR REPLACE FUNCTION update_vehicle_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total bookings
  UPDATE vehicles
  SET total_bookings = (
    SELECT COUNT(*) FROM bookings WHERE vehicle_id = NEW.vehicle_id
  )
  WHERE id = NEW.vehicle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vehicle statistics
CREATE TRIGGER update_vehicle_stats_after_booking_insert
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_vehicle_statistics();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents_individual ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents_corporate ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Vehicles policies
CREATE POLICY "Anyone can view available vehicles"
  ON vehicles FOR SELECT
  USING (status = 'AVAILABLE');

CREATE POLICY "Owners can view their own vehicles"
  ON vehicles FOR SELECT
  USING (owner_id IN (
    SELECT id FROM owners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can insert their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (owner_id IN (
    SELECT id FROM owners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (owner_id IN (
    SELECT id FROM owners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (owner_id IN (
    SELECT id FROM owners WHERE user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Renters can view their own bookings"
  ON bookings FOR SELECT
  USING (renter_id = auth.uid());

CREATE POLICY "Renters can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Owners can view bookings for their vehicles"
  ON bookings FOR SELECT
  USING (vehicle_id IN (
    SELECT id FROM vehicles WHERE owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Owners can update bookings for their vehicles"
  ON bookings FOR UPDATE
  USING (vehicle_id IN (
    SELECT id FROM vehicles WHERE owner_id IN (
      SELECT id FROM owners WHERE user_id = auth.uid()
    )
  ));

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- KYC documents policies
CREATE POLICY "Users can view their own KYC documents"
  ON kyc_documents_individual FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own KYC documents"
  ON kyc_documents_individual FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own KYC documents"
  ON kyc_documents_individual FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own corporate KYC documents"
  ON kyc_documents_corporate FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own corporate KYC documents"
  ON kyc_documents_corporate FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own corporate KYC documents"
  ON kyc_documents_corporate FOR UPDATE
  USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Renters can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (renter_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- SEED DATA (Optional)
-- ============================================================================

-- Insert admin user (password: Admin123!)
-- Note: In production, use Supabase Auth to create users
INSERT INTO users (id, email, full_name, role, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@renmoku.id', 'Super Admin', 'ADMIN', 'VERIFIED');

-- Insert sample owner
INSERT INTO users (id, email, full_name, phone, role, status) VALUES
  ('00000000-0000-0000-0000-000000000002', 'owner@renmoku.id', 'John Rental', '+6281234567890', 'OWNER', 'VERIFIED');

INSERT INTO owners (id, user_id, business_name, bank_account, bank_name) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'John''s Rental', '1234567890', 'BCA');

-- Insert sample renter
INSERT INTO users (id, email, full_name, phone, role, status) VALUES
  ('00000000-0000-0000-0000-000000000003', 'renter@renmoku.id', 'Ahmad Sudirman', '+6281234567891', 'RENTER', 'VERIFIED');

-- Insert sample vehicles
INSERT INTO vehicles (id, owner_id, brand, model, year, transmission, capacity, fuel_type, features, price_daily, price_weekly, price_monthly, has_driver_option, driver_price_daily, location, images) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Toyota', 'Alphard', 2023, 'AUTOMATIC', 7, 'bensin', ARRAY['Captain Seat', 'Panoramic Roof', 'JBL Sound'], 2500000, 15000000, 50000000, true, 300000, 'Jakarta', ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800']),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Honda', 'HR-V', 2023, 'AUTOMATIC', 5, 'bensin', ARRAY['Honda Sensing', 'Sunroof', 'Leather Seat'], 450000, 2700000, 9000000, true, 200000, 'Jakarta', ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800']);

-- ============================================================================
-- VIEWS (Optional)
-- ============================================================================

-- View for vehicle listings with owner info
CREATE VIEW vehicle_listings AS
SELECT 
  v.*,
  o.business_name as owner_name,
  o.rating as owner_rating,
  u.email as owner_email
FROM vehicles v
JOIN owners o ON v.owner_id = o.id
JOIN users u ON o.user_id = u.id
WHERE v.status = 'AVAILABLE';

-- View for booking details
CREATE VIEW booking_details AS
SELECT 
  b.*,
  r.full_name as renter_name,
  r.email as renter_email,
  r.phone as renter_phone,
  v.brand || ' ' || v.model || ' ' || v.year as vehicle_name,
  o.business_name as owner_name
FROM bookings b
JOIN users r ON b.renter_id = r.id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN owners o ON v.owner_id = o.id;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
