-- ============================================================================
-- RENMOKU — Seed Data
-- ============================================================================
-- File: seed.sql
-- Description: Data contoh untuk testing dan demo
-- Usage: psql -U postgres -d renmoku -f seed.sql
-- ============================================================================

-- ============================================================================
-- USERS
-- ============================================================================

-- Admin
INSERT INTO users (id, email, password_hash, phone, role, email_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@renmoku.id', '$2b$10$example_hash_admin', '+62-812-0000-0001', 'ADMIN', TRUE, TRUE);

-- Individual Renters
INSERT INTO users (id, email, password_hash, phone, role, email_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000002', 'ahmad.wijaya@gmail.com', '$2b$10$example_hash_1', '+62-812-1234-5678', 'INDIVIDUAL', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000003', 'siti.rahayu@gmail.com', '$2b$10$example_hash_2', '+62-813-2345-6789', 'INDIVIDUAL', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000004', 'budi.santoso@gmail.com', '$2b$10$example_hash_3', '+62-814-3456-7890', 'INDIVIDUAL', TRUE, TRUE);

-- Corporate Renter
INSERT INTO users (id, email, password_hash, phone, role, email_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000005', 'finance@majubersama.co.id', '$2b$10$example_hash_4', '+62-21-5555-6666', 'CORPORATE', TRUE, TRUE);

-- Fleet Owners
INSERT INTO users (id, email, password_hash, phone, role, email_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000006', 'budi.santoso.fleet@gmail.com', '$2b$10$example_hash_5', '+62-815-4567-8901', 'OWNER', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000007', 'info@premiumrent.id', '$2b$10$example_hash_6', '+62-816-5678-9012', 'OWNER', TRUE, TRUE);

-- Drivers
INSERT INTO users (id, email, password_hash, phone, role, email_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000008', 'pak.budi.driver@gmail.com', '$2b$10$example_hash_7', '+62-817-6789-0123', 'DRIVER', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000009', 'pak.hendra.driver@gmail.com', '$2b$10$example_hash_8', '+62-818-7890-1234', 'DRIVER', TRUE, TRUE);

-- ============================================================================
-- INDIVIDUAL PROFILES
-- ============================================================================

INSERT INTO individual_profiles (user_id, full_name, nik, birth_date, gender, address, city, province, postal_code, sim_number, sim_expiry, emergency_name, emergency_phone, is_verified, verified_at) VALUES
('a0000000-0000-0000-0000-000000000002', 'Ahmad Wijaya', '3174012345678901', '1990-05-15', 'male', 'Jl. Sudirman No. 123', 'Jakarta', 'DKI Jakarta', '10220', '123456789', '2028-05-15', 'Siti Wijaya', '+62-812-9999-0000', TRUE, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000003', 'Siti Rahayu', '3273023456789012', '1992-08-20', 'female', 'Jl. Asia Afrika No. 45', 'Bandung', 'Jawa Barat', '40111', '234567890', '2027-08-20', 'Budi Rahayu', '+62-813-9999-0001', TRUE, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000004', 'Budi Santoso', '3374034567890123', '1988-12-10', 'male', 'Jl. Diponegoro No. 78', 'Surabaya', 'Jawa Timur', '60241', '345678901', '2026-12-10', 'Ani Santoso', '+62-814-9999-0002', TRUE, CURRENT_TIMESTAMP);

-- ============================================================================
-- CORPORATE PROFILES
-- ============================================================================

INSERT INTO corporate_profiles (user_id, company_name, nib, npwp, akta_number, akta_date, notary_name, company_address, company_city, company_province, pic_name, pic_position, pic_phone, pic_email, credit_limit, is_verified, verified_at) VALUES
('a0000000-0000-0000-0000-000000000005', 'PT Maju Bersama', '1234567890123', '01.234.567.8-901.000', '123', '2015-03-20', 'Notaris Suharto', 'Jl. Gatot Subroto Kav. 21', 'Jakarta', 'DKI Jakarta', 'Diana Putri', 'Finance Manager', '+62-21-5555-7777', 'diana@majubersama.co.id', 100000000, TRUE, CURRENT_TIMESTAMP);

-- ============================================================================
-- OWNER PROFILES
-- ============================================================================

INSERT INTO owner_profiles (user_id, business_name, business_type, npwp, business_address, bank_name, bank_account, bank_account_name, rating, total_vehicles, total_bookings, is_verified, verified_at) VALUES
('a0000000-0000-0000-0000-000000000006', 'Budi Santoso Fleet', 'Perorangan', '02.345.678.9-012.000', 'Jl. Kuningan No. 10, Jakarta', 'Bank BCA', '1234567890', 'Budi Santoso', 4.8, 5, 45, TRUE, CURRENT_TIMESTAMP),
('a0000000-0000-0000-0000-000000000007', 'Premium Rent Indonesia', 'PT', '03.456.789.0-123.000', 'Jl. Thamrin No. 50, Jakarta', 'Bank Mandiri', '0987654321', 'Premium Rent Indonesia', 4.9, 8, 120, TRUE, CURRENT_TIMESTAMP);

-- ============================================================================
-- DRIVER PROFILES
-- ============================================================================

INSERT INTO driver_profiles (user_id, full_name, nik, sim_number, sim_expiry, phone, address, city, rating, total_trips, is_available, is_active) VALUES
('a0000000-0000-0000-0000-000000000008', 'Budi (Driver)', '3174045678901234', '456789012', '2029-03-15', '+62-817-6789-0123', 'Jl. Menteng No. 5', 'Jakarta', 4.9, 156, TRUE, TRUE),
('a00000000-0000-0000-0000-000000000009', 'Hendra (Driver)', '3273056789012345', '567890123', '2028-07-20', '+62-818-7890-1234', 'Jl. Dago No. 12', 'Bandung', 4.8, 98, TRUE, TRUE);

-- ============================================================================
-- VEHICLES
-- ============================================================================

INSERT INTO vehicles (
    id, owner_id, name, brand, model, year, type, transmission, fuel, seats, color,
    plate_number, chassis_number, engine_number,
    price_per_day, price_per_week, price_per_month, driver_fee_per_day,
    location, address, latitude, longitude, status,
    images, interior_images, features, description,
    rating, total_reviews, total_bookings, insurance_type, insurance_expiry, stnk_expiry, is_active
) VALUES
-- Toyota Alphard
(
    'v0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000006',
    'Toyota Alphard', 'Toyota', '2.5 X', 2024, 'LUXURY', 'AUTOMATIC', 'HYBRID', 7, 'Hitam',
    'B 1234 XYZ', 'MHKA1CG1P0J000001', '2ARFXE000001',
    2500000, 15000000, 50000000, 300000,
    'Jakarta', 'Jl. Sudirman No. 100', -6.2088, 106.8456, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
    ARRAY['Captain Seat', 'Power Door', 'Panoramic Roof', 'JBL Sound', '360 Camera', 'Wireless Charging'],
    'Toyota Alphard terbaru dengan fitur lengkap untuk kenyamanan maksimal',
    4.9, 128, 45, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
),
-- Mercedes-Benz S-Class
(
    'v0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000007',
    'Mercedes-Benz S-Class', 'Mercedes-Benz', 'S 450 L', 2024, 'LUXURY', 'AUTOMATIC', 'HYBRID', 5, 'Hitam',
    'B 5678 ABC', 'WDDUG8CB5PA000002', 'M25693000002',
    5000000, 30000000, 100000000, 500000,
    'Jakarta', 'Jl. Thamrin No. 50', -6.1751, 106.8272, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'],
    ARRAY['Massage Seat', 'Burmester Sound', 'Night Vision', 'Air Balance', 'Executive Rear', 'Ambient Lighting'],
    'Mercedes-Benz S-Class flagship dengan kemewahan tertinggi',
    5.0, 56, 28, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
),
-- BMW X7
(
    'v0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000007',
    'BMW X7', 'BMW', 'xDrive40i', 2024, 'SUV', 'AUTOMATIC', 'BENSIN', 7, 'Putih',
    'D 9012 DEF', 'WBSTX0C05NBL00003', 'B58B30M100003',
    4000000, 24000000, 80000000, 400000,
    'Surabaya', 'Jl. Tunjungan No. 30', -7.2575, 112.7521, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    ARRAY['Sky Lounge', 'Harman Kardon', 'Air Suspension', 'Head-Up Display', 'Parking Assist', 'Panoramic Roof'],
    'BMW X7 SUV mewah dengan performa tinggi',
    4.8, 89, 35, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
),
-- Toyota Fortuner
(
    'v0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000006',
    'Toyota Fortuner', 'Toyota', '2.4 VRZ', 2023, 'SUV', 'AUTOMATIC', 'DIESEL', 7, 'Silver',
    'D 3456 GHI', 'MHFGN58GX000004', '2GD000004',
    1200000, 7200000, 25000000, 200000,
    'Bandung', 'Jl. Asia Afrika No. 100', -6.9175, 107.6191, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'],
    ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    ARRAY['4WD', 'Cruise Control', 'Toyota Safety Sense', 'Wireless Charging', 'Power Back Door'],
    'Toyota Fortuner diesel tangguh untuk segala medan',
    4.7, 234, 89, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
),
-- Honda Civic Type R
(
    'v0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000007',
    'Honda Civic Type R', 'Honda', 'FL5', 2024, 'SPORT', 'MANUAL', 'BENSIN', 5, 'Championship White',
    'B 7890 JKL', 'SHHFK8G55PS000005', 'K20C100005',
    2000000, 12000000, 40000000, 250000,
    'Jakarta', 'Jl. Gatot Subroto No. 75', -6.2367, 106.8267, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1679239872580-81a3be572cbe?w=800'],
    ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    ARRAY['Turbo Engine', 'Brembo Brake', 'Limited Slip Diff', 'Sport Exhaust', 'Rev Match', 'Recaro Seat'],
    'Honda Civic Type R sport car dengan performa tinggi',
    4.9, 67, 22, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
),
-- Mitsubishi Pajero Sport
(
    'v0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000006',
    'Mitsubishi Pajero Sport', 'Mitsubishi', 'Dakar 4x2', 2023, 'SUV', 'AUTOMATIC', 'DIESEL', 7, 'Hitam',
    'B 2345 MNO', 'MMBPP4HA5PJ000006', '4N1500006',
    1100000, 6600000, 22000000, 200000,
    'Surabaya', 'Jl. Raya Darmo No. 50', -7.2756, 112.7389, 'AVAILABLE',
    ARRAY['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
    ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    ARRAY['Super Select 4WD', 'Adaptive Cruise', 'Rockford Fosgate', 'Power Tailgate', '360 Camera'],
    'Mitsubishi Pajero Sport diesel premium',
    4.6, 189, 78, 'All-Risk', '2025-12-31', '2026-06-30', TRUE
);

-- ============================================================================
-- BOOKINGS
-- ============================================================================

INSERT INTO bookings (
    id, booking_number, renter_id, owner_id, vehicle_id, driver_id,
    rental_type, start_date, end_date, duration,
    pickup_location, pickup_address, dropoff_location, dropoff_address,
    base_price, duration_discount, driver_total_fee, insurance_fee, delivery_fee,
    subtotal, tax_amount, total_price, dp_percentage, dp_amount, remaining_amount,
    payment_status, status, renter_note, confirmed_at, started_at, completed_at, created_at
) VALUES
-- Booking 1: Ahmad sewa Alphard dengan driver (CONFIRMED)
(
    'b0000000-0000-0000-0000-000000000001',
    'BK-20250201-0001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000006',
    'v0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000008',
    'WITH_DRIVER',
    '2025-02-01 08:00:00', '2025-02-03 20:00:00', 3,
    'Soekarno-Hatta Airport', 'Terminal 3, Gate 5',
    'Hotel Indonesia Kempinski', 'Jl. M.H. Thamrin No.1',
    7500000, 0, 900000, 0, 0,
    8400000, 924000, 9324000, 30, 2797200, 6526800,
    'DP_PAID', 'CONFIRMED', 'Tolong jemput di airport jam 8 pagi', '2025-01-28 10:00:00', NULL, NULL, '2025-01-28 09:00:00'
),
-- Booking 2: Corporate sewa Mercedes (ACTIVE)
(
    'b0000000-0000-0000-0000-000000000002',
    'BK-20250205-0001',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000007',
    'v0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000009',
    'WITH_DRIVER',
    '2025-02-05 09:00:00', '2025-02-05 22:00:00', 1,
    'SCBD Office Tower', 'Jl. Jend. Sudirman Kav. 22-23',
    'Bandung', 'Jl. Asia Afrika No. 65',
    5000000, 0, 500000, 0, 0,
    5500000, 605000, 6105000, 30, 1831500, 4273500,
    'FULLY_PAID', 'ACTIVE', 'Meeting penting, tolong tepat waktu', '2025-01-30 14:00:00', '2025-02-05 09:00:00', NULL, '2025-01-30 13:00:00'
),
-- Booking 3: Siti sewa Fortuner lepas kunci (COMPLETED)
(
    'b0000000-0000-0000-0000-000000000003',
    'BK-20250120-0001',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000006',
    'v0000000-0000-0000-0000-000000000004',
    NULL,
    'SELF_DRIVE',
    '2025-01-20 08:00:00', '2025-01-22 20:00:00', 3,
    'Bandung City', 'Jl. Asia Afrika No. 45',
    'Bandung City', 'Jl. Asia Afrika No. 45',
    3600000, 0, 0, 0, 0,
    3600000, 396000, 3996000, 30, 1198800, 2797200,
    'FULLY_PAID', 'COMPLETED', 'Untuk liburan keluarga', '2025-01-15 10:00:00', '2025-01-20 08:00:00', '2025-01-22 19:30:00', '2025-01-15 09:00:00'
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

INSERT INTO payments (
    id, payment_number, booking_id, user_id, type, amount, method, status,
    transaction_id, va_number, paid_at, due_at, created_at
) VALUES
-- Payment 1: DP Booking 1
(
    'p0000000-0000-0000-0000-000000000001',
    'PAY-20250128-0001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'dp', 2797200, 'VIRTUAL_ACCOUNT', 'DP_PAID',
    'TRX-001', '12345678901', '2025-01-28 10:00:00', '2025-01-29 10:00:00', '2025-01-28 09:00:00'
),
-- Payment 2: DP Booking 2
(
    'p0000000-0000-0000-0000-000000000002',
    'PAY-20250130-0001',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'dp', 1831500, 'BANK_TRANSFER', 'FULLY_PAID',
    'TRX-002', NULL, '2025-01-30 14:00:00', '2025-01-31 14:00:00', '2025-01-30 13:00:00'
),
-- Payment 3: DP Booking 3
(
    'p0000000-0000-0000-0000-000000000003',
    'PAY-20250115-0001',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'dp', 1198800, 'E_WALLET', 'FULLY_PAID',
    'TRX-003', NULL, '2025-01-15 10:00:00', '2025-01-16 10:00:00', '2025-01-15 09:00:00'
);

-- ============================================================================
-- CONTRACTS
-- ============================================================================

INSERT INTO contracts (
    id, contract_number, booking_id, renter_id, owner_id,
    title, content, terms_and_conditions,
    renter_signed_at, renter_signature, owner_signed_at, owner_signature,
    status, sent_at, created_at
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'CTR-20250201-0001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000006',
    'Perjanjian Sewa Kendaraan Toyota Alphard',
    'Perjanjian sewa kendaraan antara Ahmad Wijaya dengan Budi Santoso Fleet untuk penggunaan Toyota Alphard selama 3 hari...',
    '1. Penyewa wajib mengembalikan kendaraan dalam kondisi baik\n2. Keterlambatan dikenakan denda 10% per hari\n3. Kerusakan menjadi tanggung jawab penyewa\n4. BBM wajib sama saat pengembalian',
    '2025-01-28 09:30:00', 'base64_signature_renter_1', '2025-01-28 10:00:00', 'base64_signature_owner_1',
    'FULLY_SIGNED', '2025-01-28 09:00:00', '2025-01-28 09:00:00'
);

-- ============================================================================
-- VEHICLE INSPECTIONS
-- ============================================================================

INSERT INTO vehicle_inspections (
    id, booking_id, vehicle_id, type,
    fuel_level, odometer_reading,
    exterior_notes, exterior_photos,
    interior_notes, interior_photos,
    has_damage, damage_notes, damage_photos, damage_level,
    equipment_check, inspected_by, inspected_by_name,
    renter_signature, owner_signature, created_at
) VALUES
-- Check-in Booking 3
(
    'i0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'v0000000-0000-0000-0000-000000000004',
    'CHECK_IN',
    100, 45230.50,
    'Kondisi baik, tidak ada kerusakan',
    ARRAY['https://example.com/exterior1.jpg', 'https://example.com/exterior2.jpg', 'https://example.com/exterior3.jpg', 'https://example.com/exterior4.jpg'],
    'Bersih dan rapi',
    ARRAY['https://example.com/interior1.jpg', 'https://example.com/interior2.jpg'],
    FALSE, NULL, NULL, 'NONE',
    '{"spare_tire": true, "jack": true, "first_aid": true, "fire_extinguisher": true}',
    'a0000000-0000-0000-0000-000000000003', 'Siti Rahayu',
    'base64_renter_sig', 'base64_owner_sig', '2025-01-20 08:00:00'
),
-- Check-out Booking 3
(
    'i0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'v0000000-0000-0000-0000-000000000004',
    'CHECK_OUT',
    95, 45450.80,
    'Kondisi baik, ada lecet kecil di bumper belakang',
    ARRAY['https://example.com/exterior1.jpg', 'https://example.com/exterior2.jpg', 'https://example.com/exterior3.jpg', 'https://example.com/exterior4.jpg'],
    'Bersih',
    ARRAY['https://example.com/interior1.jpg', 'https://example.com/interior2.jpg'],
    TRUE, 'Lecet kecil di bumper belakang', ARRAY['https://example.com/damage1.jpg'], 'MINOR',
    '{"spare_tire": true, "jack": true, "first_aid": true, "fire_extinguisher": true}',
    'a0000000-0000-0000-0000-000000000006', 'Budi Santoso',
    'base64_renter_sig', 'base64_owner_sig', '2025-01-22 19:30:00'
);

-- ============================================================================
-- REVIEWS
-- ============================================================================

INSERT INTO reviews (
    id, booking_id, renter_id, vehicle_id, owner_id,
    overall_rating, vehicle_rating, service_rating, value_rating,
    title, comment, owner_reply, owner_reply_at, created_at
) VALUES
(
    'r0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'v0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000006',
    5, 5, 5, 5,
    'Pengalaman luar biasa!',
    'Kendaraan dalam kondisi sangat baik, bersih, dan nyaman. Proses sewa sangat mudah dan cepat. Sangat recommended!',
    'Terima kasih atas reviewnya, Mbak Siti! Senang bisa melayani Anda.', '2025-01-23 10:00:00', '2025-01-22 20:00:00'
);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

INSERT INTO documents (
    id, user_id, type, title, file_url, file_type, file_size,
    status, verified_by, verified_at, created_at
) VALUES
-- Dokumen Ahmad (Individual)
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'ktp', 'KTP Ahmad Wijaya',
    'https://storage.renmoku.id/docs/ktp_ahmad.jpg',
    'image/jpeg', 1024000,
    'verified', 'a0000000-0000-0000-0000-000000000001', '2025-01-10 10:00:00', '2025-01-10 09:00:00'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'sim', 'SIM A Ahmad Wijaya',
    'https://storage.renmoku.id/docs/sim_ahmad.jpg',
    'image/jpeg', 896000,
    'verified', 'a0000000-0000-0000-0000-000000000001', '2025-01-10 10:00:00', '2025-01-10 09:00:00'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'kk', 'KK Ahmad Wijaya',
    'https://storage.renmoku.id/docs/kk_ahmad.jpg',
    'image/jpeg', 1228800,
    'verified', 'a0000000-0000-0000-0000-000000000001', '2025-01-10 10:00:00', '2025-01-10 09:00:00'
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (
    id, user_id, type, title, message, data, is_read, created_at
) VALUES
(
    'n0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'BOOKING_CONFIRMED',
    'Booking Dikonfirmasi',
    'Booking Toyota Alphard Anda telah dikonfirmasi. Silakan lakukan pembayaran DP.',
    '{"booking_id": "b0000000-0000-0000-0000-000000000001"}',
    TRUE, '2025-01-28 09:00:00'
),
(
    'n0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'PAYMENT_RECEIVED',
    'Pembayaran Diterima',
    'Pembayaran DP sebesar Rp 2.797.200 telah diterima. Booking Anda aktif!',
    '{"payment_id": "p0000000-0000-0000-0000-000000000001"}',
    TRUE, '2025-01-28 10:00:00'
);

-- ============================================================================
-- MAINTENANCE LOGS
-- ============================================================================

INSERT INTO maintenance_logs (
    id, vehicle_id, type, title, description, cost, mileage_at_service,
    service_date, next_service_date, workshop, created_at
) VALUES
(
    'm0000000-0000-0000-0000-000000000001',
    'v0000000-0000-0000-0000-000000000001',
    'oil_change',
    'Ganti Oli Mesin',
    'Ganti oli mesin dan filter oli',
    850000, 45000.00,
    '2025-01-15', '2025-04-15',
    'Auto2000 Sudirman', '2025-01-15 10:00:00'
),
(
    'm0000000-0000-0000-0000-000000000002',
    'v0000000-0000-0000-0000-000000000004',
    'tire_rotation',
    'Rotasi Ban',
    'Rotasi ban dan balancing',
    450000, 45000.00,
    '2025-01-10', '2025-07-10',
    'Bengkel Ban Jaya', '2025-01-10 14:00:00'
);

-- ============================================================================
-- PROMOTIONS
-- ============================================================================

INSERT INTO promotions (
    id, code, title, description, discount_type, discount_value,
    min_booking, max_discount, usage_limit, used_count, per_user_limit,
    start_date, end_date, applicable_roles, is_active, created_at
) VALUES
(
    'pr0000000-0000-0000-0000-000000000001',
    'HEMAT20',
    'Diskon 20%',
    'Dapatkan diskon 20% untuk sewa mingguan',
    'percentage', 20,
    5000000, 2000000, 100, 23, 1,
    '2025-01-01 00:00:00', '2025-03-31 23:59:59',
    ARRAY['INDIVIDUAL', 'CORPORATE'], TRUE, '2025-01-01 00:00:00'
),
(
    'pr0000000-0000-0000-0000-000000000002',
    'NEWUSER',
    'Welcome Bonus',
    'Diskon Rp 500.000 untuk pengguna baru',
    'fixed', 500000,
    2000000, 500000, 500, 87, 1,
    '2025-01-01 00:00:00', '2025-12-31 23:59:59',
    ARRAY['INDIVIDUAL'], TRUE, '2025-01-01 00:00:00'
);

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================

INSERT INTO activity_logs (
    id, user_id, action, entity_type, entity_id, new_values, ip_address, created_at
) VALUES
(
    'al0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'booking.created',
    'booking',
    'b0000000-0000-0000-0000-000000000001',
    '{"status": "DRAFT", "vehicle": "Toyota Alphard"}',
    '103.28.12.34', '2025-01-28 09:00:00'
),
(
    'al0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'payment.completed',
    'payment',
    'p0000000-0000-0000-0000-000000000001',
    '{"status": "DP_PAID", "amount": 2797200}',
    '103.28.12.34', '2025-01-28 10:00:00'
);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

-- Summary
SELECT 'Seed data inserted successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_vehicles FROM vehicles;
SELECT COUNT(*) as total_bookings FROM bookings;
SELECT COUNT(*) as total_payments FROM payments;
