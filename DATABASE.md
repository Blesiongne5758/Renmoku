# 🗄️ Renmoku Database Documentation

## Overview

Database Renmoku menggunakan **PostgreSQL 15+** dengan **Prisma ORM** untuk manajemen schema dan migrasi.

### Tech Stack
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Migration**: Prisma Migrate
- **Connection Pool**: Built-in Prisma

---

## 📊 Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 15 |
| Total Relations | 30+ |
| Enums | 12 |
| Indexes | 40+ |
| Triggers | 5 |

---

## 🏗️ Core Tables

### 1. **users** - Pengguna Platform
Tabel utama untuk semua pengguna (penyewa, pemilik, admin, driver).

**Fields Penting:**
- `role`: ENUM (INDIVIDUAL, CORPORATE, OWNER, ADMIN, DRIVER)
- `email_verified`: Status verifikasi email
- `is_active`: Status akun aktif

**Relasi:**
- 1:1 → `individual_profiles` (jika role = INDIVIDUAL)
- 1:1 → `corporate_profiles` (jika role = CORPORATE)
- 1:1 → `owner_profiles` (jika role = OWNER)
- 1:1 → `driver_profiles` (jika role = DRIVER)
- 1:N → `bookings` (sebagai renter atau owner)

---

### 2. **vehicles** - Armada Kendaraan
Data lengkap kendaraan yang tersedia untuk disewa.

**Fields Penting:**
- `plate_number`: Nomor polisi (unique)
- `status`: AVAILABLE, RENTED, MAINTENANCE, INSPECTION, INACTIVE
- `price_per_day/week/month`: Harga sewa
- `images`: Array URL gambar (PostgreSQL array)
- `features`: Array fitur kendaraan

**Business Rules:**
- Harus ada minimal 3 foto (exterior, interior, dashboard)
- Status otomatis berubah saat ada booking aktif
- Rating dihitung otomatis dari reviews

---

### 3. **bookings** - Pemesanan
Data transaksi pemesanan kendaraan.

**Fields Penting:**
- `booking_number`: Format BK-YYYYMMDD-XXXX (auto-generated)
- `rental_type`: WITH_DRIVER atau SELF_DRIVE
- `status`: DRAFT → PENDING → CONFIRMED → ACTIVE → COMPLETED
- `dp_amount`: Uang muka 30-50%
- `total_price`: Total harga termasuk diskon & pajak

**Workflow:**
1. **DRAFT**: User membuat booking, belum submit
2. **PENDING**: Dokumen diupload, menunggu verifikasi
3. **CONFIRMED**: DP dibayar, booking dikonfirmasi
4. **ACTIVE**: Kendaraan sedang digunakan (check-in)
5. **COMPLETED**: Kendaraan dikembalikan (check-out)
6. **CANCELLED**: Dibatalkan (dengan alasan)

---

### 4. **payments** - Pembayaran
Transaksi pembayaran DP dan pelunasan.

**Fields Penting:**
- `payment_number`: Format PAY-YYYYMMDD-XXXX
- `type`: "dp", "remaining", atau "full"
- `method`: BANK_TRANSFER, VIRTUAL_ACCOUNT, E_WALLET, CREDIT_CARD, QRIS
- `status`: UNPAID → DP_PAID → FULLY_PAID

**Payment Gateway Integration:**
- `transaction_id`: ID dari Midtrans/Xendit
- `va_number`: Virtual account number
- `qr_code_url`: URL QR code untuk QRIS
- `payment_url`: URL redirect ke payment gateway

---

### 5. **individual_profiles** - Profil Penyewa Pribadi
Data lengkap penyewa individual.

**Syarat Dokumen:**
- ✅ KTP (NIK 16 digit)
- ✅ SIM A (masih berlaku)
- ✅ KK (Kartu Keluarga)
- ✅ Jaminan pribadi (BPKB/Sertifikat)

**Validasi:**
- NIK harus valid (16 digit)
- SIM harus masih berlaku (tidak expired)
- Usia minimal 21 tahun (dari birth_date)

---

### 6. **corporate_profiles** - Profil Penyewa Corporate
Data perusahaan yang menyewa kendaraan.

**Syarat Dokumen:**
- ✅ NIB (Nomor Induk Berusaha)
- ✅ Akta Pendirian Perusahaan
- ✅ NPWP Perusahaan
- ✅ Guarantee Letter
- ✅ KTP PIC (Person In Charge)

**Fitur Khusus:**
- `credit_limit`: Limit kredit berdasarkan verifikasi
- Corporate billing (bayar di akhir bulan)
- Multi-vehicle booking

---

### 7. **contracts** - E-Contract Digital
Kontrak digital antara penyewa dan pemilik.

**Fields Penting:**
- `contract_number`: Format CTR-YYYYMMDD-XXXX
- `terms_and_conditions`: S&K spesifik per tipe user
- `renter_signature`: Base64 signature image
- `owner_signature`: Base64 signature image
- `pdf_url`: URL PDF final yang sudah ditandatangani

**Workflow:**
1. **DRAFT**: Kontrak dibuat dari booking
2. **SENT**: Dikirim ke renter & owner
3. **SIGNED_BY_RENTER**: Renter sudah tanda tangan
4. **SIGNED_BY_OWNER**: Owner sudah tanda tangan
5. **FULLY_SIGNED**: Kedua pihak sudah tanda tangan
6. **EXPIRED**: Batas waktu tanda tangan terlewat

---

### 8. **vehicle_inspections** - Inspeksi Kendaraan
Check-in dan check-out digital dengan foto kondisi.

**Types:**
- **CHECK_IN**: Saat ambil kendaraan
- **CHECK_OUT**: Saat kembalikan kendaraan

**Data yang Dicatat:**
- `fuel_level`: Level BBM (0-100%)
- `odometer_reading`: KM saat inspeksi
- `exterior_photos`: Foto kondisi luar (8 sudut)
- `interior_photos`: Foto kondisi dalam
- `damage_photos`: Foto kerusakan (jika ada)
- `damage_level`: NONE, MINOR, MODERATE, MAJOR, TOTAL_LOSS
- `equipment_check`: Checklist perlengkapan (JSON)

**Business Rules:**
- Check-in wajib minimal 8 foto exterior + 4 foto interior
- Check-out dibandingkan dengan check-in
- Jika ada damage baru → otomatis charge ke renter
- Fuel level harus sama saat check-out

---

### 9. **reviews** - Rating & Review
Feedback dari penyewa setelah selesai sewa.

**Rating System:**
- `overall_rating`: 1-5 stars (wajib)
- `vehicle_rating`: Kondisi kendaraan
- `service_rating`: Pelayanan
- `value_rating`: Value for money

**Rules:**
- 1 booking = 1 review (unique constraint)
- Review hanya bisa dibuat setelah status = COMPLETED
- Owner bisa reply review
- Rating kendaraan & owner dihitung otomatis

---

### 10. **documents** - Upload Dokumen
File dokumen persyaratan penyewa.

**Types:**
- `ktp`: Kartu Tanda Penduduk
- `sim`: Surat Izin Mengemudi
- `kk`: Kartu Keluarga
- `npwp`: NPWP (untuk corporate)
- `nib`: NIB (untuk corporate)
- `akta`: Akta Pendirian
- `guarantee_letter`: Surat jaminan
- `jaminan`: BPKB/Sertifikat

**Status:**
- `pending`: Menunggu verifikasi admin
- `verified`: Sudah diverifikasi
- `rejected`: Ditolak (dengan alasan)

**Storage:**
- File disimpan di cloud storage (S3/GCS)
- `file_url`: URL public
- `file_size`: Ukuran file (max 5MB untuk image, 10MB untuk PDF)

---

### 11. **notifications** - Notifikasi Real-time
Notifikasi untuk pengguna.

**Types:**
- `BOOKING_CONFIRMED`: Booking dikonfirmasi
- `PAYMENT_RECEIVED`: Pembayaran diterima
- `PAYMENT_REMINDER`: Pengingat pembayaran
- `DOCUMENT_VERIFIED`: Dokumen diverifikasi
- `DOCUMENT_REJECTED`: Dokumen ditolak
- `CHECK_IN_REMINDER`: Pengingat check-in
- `CHECK_OUT_REMINDER`: Pengingat check-out
- `OVERDUE_WARNING`: Peringatan terlambat

**Features:**
- Real-time via WebSocket (future)
- Push notification (future)
- Email notification (integrated)
- Deep link untuk aksi cepat

---

### 12. **maintenance_logs** - Log Perawatan
Catatan servis dan perawatan kendaraan.

**Types:**
- `oil_change`: Ganti oli
- `tire_rotation`: Rotasi ban
- `brake_service`: Servis rem
- `general`: Servis umum
- `accident_repair`: Perbaikan kecelakaan

**Fields:**
- `cost`: Biaya servis
- `mileage_at_service`: KM saat servis
- `next_service_date`: Jadwal servis berikutnya
- `workshop`: Nama bengkel
- `invoice_url`: Foto/faktur servis

**Business Rules:**
- Reminder otomatis 7 hari sebelum servis berikutnya
- Kendaraan otomatis status = MAINTENANCE saat servis
- Biaya servis mempengaruhi profit calculation

---

### 13. **promotions** - Kode Promo
Kode promo dan diskon.

**Fields:**
- `code`: Kode promo (HEMAT20, NEWUSER, etc.)
- `discount_type`: percentage atau fixed
- `discount_value`: Nilai diskon
- `min_booking`: Minimum total booking
- `max_discount`: Maksimum potongan
- `usage_limit`: Total penggunaan
- `used_count`: Sudah digunakan
- `start_date` & `end_date`: Periode berlaku
- `applicable_roles`: Role yang bisa pakai

**Validation:**
- Kode harus unique
- Tidak bisa digunakan jika sudah expired
- Tidak bisa digunakan jika sudah mencapai limit
- Minimum booking harus terpenuhi

---

## 🔗 Entity Relationships

```
users (1) ──→ (1) individual_profiles
users (1) ──→ (1) corporate_profiles
users (1) ──→ (1) owner_profiles
users (1) ──→ (1) driver_profiles

owner_profiles (1) ──→ (N) vehicles

vehicles (1) ──→ (N) bookings
vehicles (1) ──→ (N) reviews
vehicles (1) ──→ (N) vehicle_inspections
vehicles (1) ──→ (N) maintenance_logs

bookings (1) ──→ (N) payments
bookings (1) ──→ (1) contracts
bookings (1) ──→ (N) vehicle_inspections
bookings (1) ──→ (1) reviews

users (1) ──→ (N) documents
users (1) ──→ (N) notifications
```

---

## 🚀 Setup & Migration

### Prerequisites
```bash
# Install PostgreSQL 15+
# Install Node.js 18+
# Install pnpm
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd renmoku

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env dengan database credentials

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma db seed
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku?schema=public"

# Prisma
PRISMA_BINARY_TARGET="native"

# Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION="false"

# Cloud Storage (S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="renmoku-documents"

# Email (SendGrid)
SENDGRID_API_KEY="your-api-key"
SENDGRID_FROM_EMAIL="noreply@renmoku.id"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
```

---

## 📝 Query Examples

### Get Available Vehicles with Filters
```typescript
const vehicles = await prisma.vehicle.findMany({
  where: {
    status: 'AVAILABLE',
    location: { equals: 'Jakarta' },
    type: { in: ['SUV', 'MPV'] },
    pricePerDay: { lte: 1000000 },
  },
  include: {
    owner: {
      include: {
        user: true,
      },
    },
    reviews: {
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  },
  orderBy: { rating: 'desc' },
});
```

### Create Booking with Payment
```typescript
const booking = await prisma.booking.create({
  data: {
    bookingNumber: generateBookingNumber(),
    renterId: userId,
    ownerId: vehicle.ownerId,
    vehicleId: vehicleId,
    rentalType: 'WITH_DRIVER',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    duration: calculateDuration(startDate, endDate),
    pickupLocation: pickup,
    dropoffLocation: dropoff,
    basePrice: vehicle.pricePerDay * duration,
    dpAmount: vehicle.pricePerDay * duration * 0.3,
    totalPrice: vehicle.pricePerDay * duration,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
  },
});

// Create payment record
const payment = await prisma.payment.create({
  data: {
    paymentNumber: generatePaymentNumber(),
    bookingId: booking.id,
    userId: userId,
    type: 'dp',
    amount: booking.dpAmount,
    method: 'BANK_TRANSFER',
    status: 'UNPAID',
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
});
```

### Get User Bookings with Relations
```typescript
const bookings = await prisma.booking.findMany({
  where: { renterId: userId },
  include: {
    vehicle: true,
    driver: true,
    payments: true,
    contract: true,
    inspections: {
      orderBy: { createdAt: 'desc' },
    },
    reviews: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

---

## 🔒 Security & Compliance

### Data Encryption
- Password: bcrypt (10 rounds)
- Sensitive data: AES-256 encryption
- API keys: Environment variables (never in code)

### Access Control
- Role-based access control (RBAC)
- JWT authentication
- API rate limiting
- SQL injection prevention (Prisma ORM)

### Compliance
- GDPR ready (data export & deletion)
- Indonesian Data Protection Law (UU PDP)
- Audit logs for all critical actions
- Data retention policy

---

## 📈 Performance Optimization

### Indexes
```sql
-- Critical indexes for performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_vehicles_location_status ON vehicles(location, status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_users_email ON users(email);
```

### Query Optimization
- Use `select` untuk limit fields
- Use `include` sparingly (avoid N+1)
- Pagination dengan `cursor` untuk large datasets
- Connection pooling (built-in Prisma)

### Caching Strategy
- Redis for session & frequently accessed data
- Vehicle availability cache (5 min TTL)
- User profile cache (1 hour TTL)

---

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### Database Tests
```bash
pnpm test:database
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.vertabelo.com/blog/database-design-best-practices/)

---

## 🤝 Support

Untuk pertanyaan tentang database schema:
- Email: tech@renmoku.id
- Discord: [Renmoku Dev Community](https://discord.gg/renmoku)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Maintainer**: Renmoku Tech Team
