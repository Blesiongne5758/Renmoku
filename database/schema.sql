-- ============================================================================
-- RENMOKU — Premium Car Rental Platform
-- Database Schema (PostgreSQL 15+)
-- ============================================================================
-- File: schema.sql
-- Description: Complete database schema untuk platform rental mobil Renmoku
-- Author: Renmoku Tech Team
-- Version: 1.0.0
-- ============================================================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS vehicle_inspections CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_extras CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicle_calendars CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS owner_profiles CASCADE;
DROP TABLE IF EXISTS corporate_profiles CASCADE;
DROP TABLE IF EXISTS individual_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS vehicle_type CASCADE;
DROP TYPE IF EXISTS transmission CASCADE;
DROP TYPE IF EXISTS fuel_type CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS rental_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS inspection_type CASCADE;
DROP TYPE IF EXISTS damage_level CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('INDIVIDUAL', 'CORPORATE', 'OWNER', 'ADMIN', 'DRIVER');
CREATE TYPE vehicle_type AS ENUM ('SEDAN', 'SUV', 'MPV', 'LUXURY', 'SPORT', 'VAN', 'PICKUP');
CREATE TYPE transmission AS ENUM ('AUTOMATIC', 'MANUAL', 'CVT');
CREATE TYPE fuel_type AS ENUM ('BENSIN', 'DIESEL', 'HYBRID', 'ELECTRIC');
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INSPECTION', 'INACTIVE');
CREATE TYPE rental_type AS ENUM ('WITH_DRIVER', 'SELF_DRIVE');
CREATE TYPE booking_status AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'DP_PAID', 'FULLY_PAID', 'REFUNDED', 'OVERDUE');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'QRIS', 'CORPORATE_BILLING');
CREATE TYPE contract_status AS ENUM ('DRAFT', 'SENT', 'SIGNED_BY_RENTER', 'SIGNED_BY_OWNER', 'FULLY_SIGNED', 'EXPIRED');
CREATE TYPE inspection_type AS ENUM ('CHECK_IN', 'CHECK_OUT');
CREATE TYPE damage_level AS ENUM ('NONE', 'MINOR', 'MODERATE', 'MAJOR', 'TOTAL_LOSS');
CREATE TYPE notification_type AS ENUM (
    'BOOKING_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_REMINDER',
    'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'VEHICLE_AVAILABLE',
    'CHECK_IN_REMINDER', 'CHECK_OUT_REMINDER', 'REVIEW_REQUEST',
    'OVERDUE_WARNING', 'SYSTEM_ALERT'
);

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

-- Tabel utama pengguna platform
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar TEXT,
    role user_role NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profil penyewa pribadi — syarat: KTP, SIM A, KK, jaminan pribadi
CREATE TABLE individual_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL, -- No. KTP (16 digit)
    birth_date DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    sim_number VARCHAR(20), -- No. SIM A
    sim_expiry DATE,
    emergency_name VARCHAR(100),
    emergency_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profil penyewa corporate — syarat: NIB, Akta, NPWP, PIC, Guarantee Letter
CREATE TABLE corporate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    nib VARCHAR(20) UNIQUE NOT NULL, -- Nomor Induk Berusaha
    npwp VARCHAR(20) UNIQUE NOT NULL,
    akta_number VARCHAR(50),
    akta_date DATE,
    notary_name VARCHAR(100),
    company_address TEXT,
    company_city VARCHAR(100),
    company_province VARCHAR(100),
    pic_name VARCHAR(100) NOT NULL, -- Person In Charge
    pic_position VARCHAR(50),
    pic_phone VARCHAR(20),
    pic_email VARCHAR(255),
    credit_limit DECIMAL(15, 2), -- Limit kredit corporate
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profil pemilik armada (Fleet Owner)
CREATE TABLE owner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(50), -- PT, CV, Perorangan
    npwp VARCHAR(20),
    business_address TEXT,
    bank_name VARCHAR(100), -- Untuk pencairan pendapatan
    bank_account VARCHAR(50),
    bank_account_name VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_vehicles INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profil driver
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    sim_number VARCHAR(20) NOT NULL,
    sim_expiry DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    photo TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_trips INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VEHICLES & FLEET
-- ============================================================================

-- Data kendaraan dalam armada
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Toyota Alphard"
    brand VARCHAR(50) NOT NULL, -- e.g. "Toyota"
    model VARCHAR(50), -- e.g. "2.5 X"
    year INT NOT NULL,
    type vehicle_type NOT NULL,
    transmission transmission NOT NULL,
    fuel fuel_type NOT NULL,
    seats INT NOT NULL,
    color VARCHAR(30),
    plate_number VARCHAR(15) UNIQUE NOT NULL, -- Nomor polisi
    chassis_number VARCHAR(30) UNIQUE NOT NULL, -- No. Rangka
    engine_number VARCHAR(30), -- No. Mesin

    -- Pricing
    price_per_day DECIMAL(12, 2) NOT NULL,
    price_per_week DECIMAL(12, 2) NOT NULL,
    price_per_month DECIMAL(12, 2) NOT NULL,
    driver_fee_per_day DECIMAL(12, 2), -- Biaya tambahan jika dengan driver

    -- Location & Availability
    location VARCHAR(100) NOT NULL, -- Kota
    address TEXT, -- Alamat lengkap
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status vehicle_status DEFAULT 'AVAILABLE',

    -- Media
    images TEXT[], -- Array URL gambar
    interior_images TEXT[], -- Gambar interior untuk explorer
    video_url TEXT, -- Video showcase

    -- Features & Specs
    features TEXT[], -- ["Captain Seat", "Panoramic Roof", ...]
    description TEXT, -- Deskripsi detail

    -- Stats
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    total_distance DECIMAL(10, 2) DEFAULT 0, -- Total km

    -- Insurance
    insurance_type VARCHAR(50), -- All-risk, TLO, etc.
    insurance_expiry DATE,
    stnk_expiry DATE, -- Masa berlaku STNK
    kir_expiry DATE, -- Masa berlaku KIR (untuk commercial)

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalender ketersediaan kendaraan
CREATE TABLE vehicle_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id UUID, -- Jika sudah di-book
    price_override DECIMAL(12, 2), -- Harga khusus (holiday, etc.)
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehicle_id, date)
);

-- ============================================================================
-- BOOKINGS
-- ============================================================================

-- Data pemesanan/booking kendaraan
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(20) UNIQUE NOT NULL, -- Format: BK-YYYYMMDD-XXXX

    -- Parties
    renter_id UUID NOT NULL REFERENCES users(id), -- ID penyewa
    owner_id UUID NOT NULL REFERENCES users(id), -- ID pemilik armada
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID REFERENCES driver_profiles(id), -- Null jika lepas kunci

    -- Rental Details
    rental_type rental_type NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    duration INT NOT NULL, -- Dalam hari
    actual_end_date TIMESTAMP, -- Tanggal aktual pengembalian

    -- Locations
    pickup_location VARCHAR(255) NOT NULL,
    pickup_address TEXT,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    dropoff_location VARCHAR(255) NOT NULL,
    dropoff_address TEXT,
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),

    -- Pricing
    base_price DECIMAL(12, 2) NOT NULL, -- Harga dasar
    duration_discount DECIMAL(5, 2) DEFAULT 0, -- Persentase diskon
    driver_total_fee DECIMAL(12, 2) DEFAULT 0,
    insurance_fee DECIMAL(12, 2) DEFAULT 0,
    delivery_fee DECIMAL(12, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0, -- PPN 11%
    total_price DECIMAL(12, 2) NOT NULL,

    -- Payment
    dp_percentage INT DEFAULT 30, -- 30-50%
    dp_amount DECIMAL(12, 2) NOT NULL,
    remaining_amount DECIMAL(12, 2) NOT NULL,
    payment_status payment_status DEFAULT 'UNPAID',

    -- Status
    status booking_status DEFAULT 'DRAFT',

    -- Notes
    renter_note TEXT, -- Catatan dari penyewa
    owner_note TEXT, -- Catatan dari pemilik
    cancel_reason TEXT,

    -- Timestamps
    confirmed_at TIMESTAMP,
    started_at TIMESTAMP, -- Saat check-in
    completed_at TIMESTAMP, -- Saat check-out
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Layanan tambahan dalam booking
CREATE TABLE booking_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Baby Seat", "GPS", "Toll Card"
    quantity INT DEFAULT 1,
    price_per_unit DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- Data pembayaran (DP & pelunasan)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(20) UNIQUE NOT NULL, -- Format: PAY-YYYYMMDD-XXXX
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Payment Details
    type VARCHAR(20) NOT NULL, -- "dp" atau "full" atau "remaining"
    amount DECIMAL(12, 2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'UNPAID',

    -- Transaction Info
    transaction_id VARCHAR(100), -- ID dari payment gateway
    reference_number VARCHAR(100), -- No. referensi bank
    va_number VARCHAR(50), -- Virtual account number
    qr_code_url TEXT, -- URL QR code (QRIS)
    payment_url TEXT, -- URL pembayaran (payment gateway)

    -- Timestamps
    paid_at TIMESTAMP,
    due_at TIMESTAMP NOT NULL, -- Batas waktu pembayaran
    expired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONTRACTS (E-Contract Digital)
-- ============================================================================

-- Kontrak digital antara penyewa dan pemilik
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(20) UNIQUE NOT NULL, -- Format: CTR-YYYYMMDD-XXXX
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    renter_id UUID NOT NULL REFERENCES users(id),
    owner_id UUID NOT NULL REFERENCES users(id),

    -- Contract Content
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL, -- Isi kontrak (HTML/Markdown)
    terms_and_conditions TEXT NOT NULL, -- S&K spesifik per tipe user

    -- Signatures
    renter_signed_at TIMESTAMP,
    renter_signature TEXT, -- Base64 signature image
    renter_ip VARCHAR(45),
    owner_signed_at TIMESTAMP,
    owner_signature TEXT, -- Base64 signature image
    owner_ip VARCHAR(45),

    -- Status
    status contract_status DEFAULT 'DRAFT',
    pdf_url TEXT, -- URL PDF kontrak yang sudah ditandatangani

    -- Timestamps
    sent_at TIMESTAMP,
    expires_at TIMESTAMP, -- Batas waktu tanda tangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

-- Upload dokumen persyaratan
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- "ktp", "sim", "kk", "npwp", "nib", "akta", "guarantee_letter", "jaminan"
    title VARCHAR(100) NOT NULL, -- Nama dokumen
    file_url TEXT NOT NULL, -- URL file di storage
    file_type VARCHAR(50), -- "image/jpeg", "application/pdf", etc.
    file_size INT, -- Dalam bytes
    status VARCHAR(20) DEFAULT 'pending', -- "pending", "verified", "rejected"
    verified_by UUID, -- Admin yang verifikasi
    verified_at TIMESTAMP,
    reject_reason TEXT,
    expiry_date DATE, -- Tanggal kadaluarsa dokumen
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VEHICLE INSPECTIONS (Check-in / Check-out)
-- ============================================================================

-- Inspeksi kondisi kendaraan saat check-in dan check-out
CREATE TABLE vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    type inspection_type NOT NULL, -- CHECK_IN atau CHECK_OUT

    -- Fuel & Odometer
    fuel_level INT CHECK (fuel_level >= 0 AND fuel_level <= 100), -- 0-100%
    odometer_reading DECIMAL(10, 2) NOT NULL, -- KM saat inspeksi

    -- Exterior Condition
    exterior_notes TEXT,
    exterior_photos TEXT[], -- Array URL foto kondisi luar

    -- Interior Condition
    interior_notes TEXT,
    interior_photos TEXT[], -- Array URL foto kondisi dalam

    -- Damage
    has_damage BOOLEAN DEFAULT FALSE,
    damage_notes TEXT,
    damage_photos TEXT[], -- Array URL foto kerusakan
    damage_level damage_level DEFAULT 'NONE',
    estimated_damage_cost DECIMAL(12, 2),

    -- Equipment Check
    equipment_check JSONB, -- { "spare_tire": true, "jack": true, "first_aid": false, ... }

    -- Inspector
    inspected_by UUID NOT NULL, -- ID user (renter/owner/driver/admin)
    inspected_by_name VARCHAR(100) NOT NULL,

    -- Signatures
    renter_signature TEXT, -- Base64 signature
    owner_signature TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REVIEWS
-- ============================================================================

-- Rating dan review dari penyewa
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id), -- 1 booking = 1 review
    renter_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    owner_id UUID NOT NULL REFERENCES users(id), -- Owner yang di-review

    -- Ratings (1-5)
    overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    vehicle_rating INT CHECK (vehicle_rating >= 1 AND vehicle_rating <= 5),
    service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),

    -- Content
    title VARCHAR(200),
    comment TEXT,
    photos TEXT[], -- Foto review

    -- Response
    owner_reply TEXT,
    owner_reply_at TIMESTAMP,

    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Log perawatan kendaraan
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- "oil_change", "tire_rotation", "brake_service", "general", "accident_repair"
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cost DECIMAL(12, 2) NOT NULL,
    mileage_at_service DECIMAL(10, 2), -- KM saat servis
    service_date DATE NOT NULL,
    next_service_date DATE,
    workshop VARCHAR(200), -- Nama bengkel
    invoice_url TEXT, -- Foto/faktur servis
    photos TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifikasi untuk pengguna
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Data tambahan (bookingId, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url TEXT, -- URL untuk aksi (deep link)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACTIVITY LOGS (Audit Trail)
-- ============================================================================

-- Log aktivitas untuk audit & debugging
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- "booking.created", "payment.received", "document.uploaded", etc.
    entity_type VARCHAR(50), -- "booking", "payment", "vehicle", "document", etc.
    entity_id UUID,
    old_values JSONB, -- Nilai sebelumnya (untuk tracking perubahan)
    new_values JSONB, -- Nilai baru
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB, -- Data tambahan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PLATFORM SETTINGS
-- ============================================================================

-- Pengaturan platform (admin)
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(50), -- "pricing", "notification", "system", etc.
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lokasi yang didukung platform
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "Jakarta", "Surabaya", etc.
    display_name VARCHAR(100), -- "DKI Jakarta"
    province VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo & diskon
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- "HEMAT20", "NEWUSER", etc.
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- "percentage" atau "fixed"
    discount_value DECIMAL(10, 2) NOT NULL,
    min_booking DECIMAL(12, 2), -- Minimum total booking
    max_discount DECIMAL(12, 2), -- Maksimum potongan
    usage_limit INT, -- Total penggunaan
    used_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1, -- Maks per user
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    applicable_roles user_role[], -- Role yang bisa pakai
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES (Performance Optimization)
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Individual Profiles
CREATE INDEX idx_individual_profiles_nik ON individual_profiles(nik);

-- Corporate Profiles
CREATE INDEX idx_corporate_profiles_nib ON corporate_profiles(nib);
CREATE INDEX idx_corporate_profiles_npwp ON corporate_profiles(npwp);

-- Driver Profiles
CREATE INDEX idx_driver_profiles_available ON driver_profiles(is_available);

-- Vehicles
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_location ON vehicles(location);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_price ON vehicles(price_per_day);

-- Vehicle Calendar
CREATE INDEX idx_vehicle_calendar_date ON vehicle_calendars(date);

-- Bookings
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_driver ON bookings(driver_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Booking Extras
CREATE INDEX idx_booking_extras_booking ON booking_extras(booking_id);

-- Payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Contracts
CREATE INDEX idx_contracts_booking ON contracts(booking_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Documents
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);

-- Vehicle Inspections
CREATE INDEX idx_inspections_booking ON vehicle_inspections(booking_id);
CREATE INDEX idx_inspections_vehicle ON vehicle_inspections(vehicle_id);
CREATE INDEX idx_inspections_type ON vehicle_inspections(type);

-- Reviews
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_reviews_owner ON reviews(owner_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);

-- Maintenance Logs
CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_logs(service_date);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Activity Logs
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- Platform Settings
CREATE INDEX idx_settings_category ON platform_settings(category);

-- Locations
CREATE INDEX idx_locations_name ON locations(name);

-- Promotions
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger ke semua tabel yang memiliki updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_profiles_updated_at BEFORE UPDATE ON individual_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corporate_profiles_updated_at BEFORE UPDATE ON corporate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE ON owner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_calendars_updated_at BEFORE UPDATE ON vehicle_calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_inspections_updated_at BEFORE UPDATE ON vehicle_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_logs_updated_at BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Initial Data)
-- ============================================================================

-- Insert default locations
INSERT INTO locations (name, display_name, province, latitude, longitude) VALUES
('Jakarta', 'DKI Jakarta', 'DKI Jakarta', -6.2088, 106.8456),
('Surabaya', 'Surabaya', 'Jawa Timur', -7.2575, 112.7521),
('Bandung', 'Bandung', 'Jawa Barat', -6.9175, 107.6191),
('Bali', 'Bali', 'Bali', -8.3405, 115.0920),
('Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', -7.7956, 110.3695),
('Medan', 'Medan', 'Sumatera Utara', 3.5952, 98.6722),
('Makassar', 'Makassar', 'Sulawesi Selatan', -5.1477, 119.4327),
('Semarang', 'Semarang', 'Jawa Tengah', -6.9667, 110.4167);

-- Insert default platform settings
INSERT INTO platform_settings (key, value, category, description) VALUES
('dp_percentage_default', '30', 'pricing', 'Default DP percentage'),
('dp_percentage_min', '30', 'pricing', 'Minimum DP percentage'),
('dp_percentage_max', '50', 'pricing', 'Maximum DP percentage'),
('tax_rate', '11', 'pricing', 'PPN rate in percentage'),
('weekly_discount', '10', 'pricing', 'Discount for weekly rental'),
('monthly_discount', '20', 'pricing', 'Discount for monthly rental'),
('min_renter_age', '21', 'validation', 'Minimum age for renter'),
('max_booking_days', '365', 'validation', 'Maximum booking days in advance'),
('cancel_penalty_h3', '100', 'pricing', 'Refund percentage if cancel H-3'),
('cancel_penalty_h1', '50', 'pricing', 'Refund percentage if cancel H-1'),
('platform_fee_percentage', '10', 'pricing', 'Platform fee from owner revenue'),
('support_email', 'support@renmoku.id', 'system', 'Customer support email'),
('support_phone', '+62-21-1234-5678', 'system', 'Customer support phone');

-- ============================================================================
-- VIEWS (Convenience Queries)
-- ============================================================================

-- View: Available vehicles with owner info
CREATE VIEW available_vehicles AS
SELECT 
    v.*,
    o.business_name as owner_name,
    o.rating as owner_rating,
    u.email as owner_email,
    u.phone as owner_phone
FROM vehicles v
JOIN owner_profiles o ON v.owner_id = o.id
JOIN users u ON o.user_id = u.id
WHERE v.status = 'AVAILABLE' AND v.is_active = TRUE;

-- View: Active bookings with all details
CREATE VIEW active_bookings AS
SELECT 
    b.*,
    v.name as vehicle_name,
    v.brand as vehicle_brand,
    v.plate_number,
    r.full_name as renter_name,
    r.phone as renter_phone,
    r.email as renter_email,
    d.full_name as driver_name,
    d.phone as driver_phone
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
JOIN users u ON b.renter_id = u.id
LEFT JOIN individual_profiles r ON u.id = r.user_id
LEFT JOIN driver_profiles d ON b.driver_id = d.id
WHERE b.status IN ('CONFIRMED', 'ACTIVE');

-- View: Monthly revenue per owner
CREATE VIEW monthly_revenue AS
SELECT 
    o.id as owner_id,
    o.business_name,
    DATE_TRUNC('month', b.confirmed_at) as month,
    COUNT(b.id) as total_bookings,
    SUM(b.total_price) as total_revenue,
    SUM(b.dp_amount) as total_dp,
    AVG(b.total_price) as avg_booking_value
FROM bookings b
JOIN owner_profiles o ON b.owner_id = o.user_id
WHERE b.status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED')
GROUP BY o.id, o.business_name, DATE_TRUNC('month', b.confirmed_at);

-- ============================================================================
-- FUNCTIONS (Business Logic)
-- ============================================================================

-- Function: Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
    date_part VARCHAR;
    seq_part INT;
BEGIN
    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO seq_part
    FROM bookings
    WHERE booking_number LIKE 'BK-' || date_part || '%';
    
    new_number := 'BK-' || date_part || '-' || LPAD(seq_part::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS VARCHAR AS $$
DECLARE
    new_number VARCHAR;
    date_part VARCHAR;
    seq_part INT;
BEGIN
    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO seq_part
    FROM payments
    WHERE payment_number LIKE 'PAY-' || date_part || '%';
    
    new_number := 'PAY-' || date_part || '-' || LPAD(seq_part::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate vehicle rating
CREATE OR REPLACE FUNCTION calculate_vehicle_rating(vehicle_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT AVG(overall_rating)::DECIMAL(3,2) INTO avg_rating
    FROM reviews
    WHERE vehicle_id = vehicle_uuid;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'Tabel utama pengguna platform (penyewa, pemilik, admin, driver)';
COMMENT ON TABLE vehicles IS 'Data kendaraan dalam armada';
COMMENT ON TABLE bookings IS 'Data pemesanan/booking kendaraan';
COMMENT ON TABLE payments IS 'Transaksi pembayaran DP dan pelunasan';
COMMENT ON TABLE contracts IS 'E-Contract digital antara penyewa dan pemilik';
COMMENT ON TABLE vehicle_inspections IS 'Check-in/Check-out digital dengan foto kondisi';
COMMENT ON TABLE reviews IS 'Rating dan review dari penyewa';
COMMENT ON TABLE documents IS 'Upload dokumen persyaratan penyewa';
COMMENT ON TABLE notifications IS 'Notifikasi real-time untuk pengguna';
COMMENT ON TABLE maintenance_logs IS 'Log perawatan & servis kendaraan';
COMMENT ON TABLE promotions IS 'Kode promo & diskon';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
