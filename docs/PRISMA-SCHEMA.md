# 🗄️ Prisma Schema Documentation - Renmoku

## Overview

Dokumentasi lengkap untuk Prisma schema aplikasi Renmoku. Schema ini dirancang untuk platform rental mobil dengan 3 role utama: **Renter** (Penyewa), **Owner** (Pemilik Armada), dan **Admin**.

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│  (email, phone, password, role, status)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┐
             │              │              │
             ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  RENTER    │  │  RENTER    │  │   FLEET    │
    │INDIVIDUAL  │  │ CORPORATE  │  │   OWNER    │
    └────────────┘  └────────────┘  └─────┬──────┘
                                          │
                                          │ 1:N
                                          ▼
                                   ┌────────────┐
                                   │  VEHICLE   │
                                   └─────┬──────┘
                                         │
                                         │ 1:N
                                         ▼
                                   ┌────────────┐
                                   │  BOOKING   │◄───────┐
                                   └─────┬──────┘        │
                                         │               │
                                         │ 1:N           │
                                         ▼               │
                                   ┌────────────┐        │
                                   │  PAYMENT   │        │
                                   └────────────┘        │
                                                         │
                              ┌──────────────────────────┘
                              │
                              └──────────────────────────┐
                                                         │
                              ┌──────────────────────────┘
                              │
                              ▼
                        (User sebagai renter)
```

---

## 🎯 Model Details

### 1. **User** (Tabel Utama)

Tabel utama untuk semua pengguna platform.

```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  phone         String
  password      String
  role          UserRole    @default(RENTER)
  status        UserStatus  @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

**Fields:**
- `id` - Unique identifier (CUID)
- `email` - Email unik untuk login
- `phone` - Nomor telepon
- `password` - Password ter-hash (bcrypt)
- `role` - Role user (RENTER/OWNER/ADMIN)
- `status` - Status verifikasi (PENDING/VERIFIED/REJECTED)

**Enum UserRole:**
```typescript
enum UserRole {
  RENTER  // Penyewa (Individual/Corporate)
  OWNER   // Pemilik armada
  ADMIN   // Admin platform
}
```

**Enum UserStatus:**
```typescript
enum UserStatus {
  PENDING   // Menunggu verifikasi
  VERIFIED  // Sudah diverifikasi
  REJECTED  // Ditolak
}
```

**Relasi:**
- 1:1 → `RenterIndividual` (jika role = RENTER & tipe = Individual)
- 1:1 → `RenterCorporate` (jika role = RENTER & tipe = Corporate)
- 1:1 → `FleetOwner` (jika role = OWNER)
- 1:N → `Booking` (sebagai renter)
- 1:N → `Payment` (sebagai payer)

---

### 2. **RenterIndividual** (Profil Penyewa Pribadi)

Profil untuk penyewa individu/pribadi.

```prisma
model RenterIndividual {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(...)
  
  fullName    String
  ktpNumber   String
  ktpScan     String    // URL file scan KTP
  simNumber   String
  simScan     String    // URL file scan SIM
  kkScan      String    // URL file scan KK
  address     String
  
  verifiedAt  DateTime?
}
```

**Dokumen yang Diperlukan:**
- ✅ KTP (Kartu Tanda Penduduk)
- ✅ SIM A (Surat Izin Mengemudi)
- ✅ KK (Kartu Keluarga)

**Syarat:**
- Usia minimal 21 tahun
- SIM A masih aktif
- Alamat sesuai KTP

---

### 3. **RenterCorporate** (Profil Penyewa Corporate)

Profil untuk penyewa perusahaan/korporat.

```prisma
model RenterCorporate {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(...)
  
  // Company Info
  companyName     String
  nib             String
  nibDocument     String    // URL file NIB
  akta            String    // URL file Akta
  npwp            String
  npwpDocument    String    // URL file NPWP
  
  // PIC (Person in Charge)
  picName         String
  picKtp          String
  picKtpScan      String    // URL file KTP PIC
  picSim          String
  picSimScan      String    // URL file SIM PIC
}
```

**Dokumen Perusahaan:**
- ✅ NIB (Nomor Induk Berusaha)
- ✅ Akta Pendirian Perusahaan
- ✅ NPWP Badan Usaha

**Dokumen PIC:**
- ✅ KTP PIC
- ✅ SIM A PIC
- ✅ Surat Tugas dari perusahaan

**Jaminan:**
- Guarantee Letter (GL) dari perusahaan, ATAU
- Deposit perusahaan minimal Rp 10.000.000

---

### 4. **FleetOwner** (Pemilik Armada)

Profil untuk pemilik rental/armada kendaraan.

```prisma
model FleetOwner {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(...)
  
  businessName    String
  bankAccount     String
  bankName        String
  
  verifiedAt      DateTime?
}
```

**Info Bisnis:**
- Nama bisnis/perusahaan
- Rekening bank untuk pencairan pendapatan
- Nama bank

**Relasi:**
- 1:N → `Vehicle` (armada kendaraan)

---

### 5. **Vehicle** (Kendaraan)

Data kendaraan yang tersedia untuk disewa.

```prisma
model Vehicle {
  id                String          @id @default(cuid())
  ownerId           String
  owner             FleetOwner      @relation(...)
  
  // Basic Info
  brand             String          // e.g., "Toyota"
  model             String          // e.g., "Alphard"
  year              Int             // e.g., 2024
  transmission      Transmission    // MANUAL/AUTOMATIC
  capacity          Int             // Jumlah penumpang
  fuelType          String          // e.g., "Bensin", "Diesel"
  features          String[]        // Array fitur
  
  // Pricing
  priceDaily        Float
  priceWeekly       Float
  priceMonthly      Float
  hasDriverOption   Boolean         @default(false)
  driverPriceDaily  Float?
  
  // Status & Location
  status            VehicleStatus   @default(AVAILABLE)
  location          String
  
  // Media
  images            String[]        // Array URL gambar
  model3D           String?         // URL 3D model (optional)
}
```

**Enum Transmission:**
```typescript
enum Transmission {
  MANUAL
  AUTOMATIC
}
```

**Enum VehicleStatus:**
```typescript
enum VehicleStatus {
  AVAILABLE     // Tersedia untuk disewa
  RENTED        // Sedang disewa
  MAINTENANCE   // Dalam perawatan
  INACTIVE      // Tidak aktif
}
```

**Features Example:**
```typescript
features: ["Captain Seat", "Panoramic Roof", "JBL Sound", "360 Camera"]
```

**Images:**
```typescript
images: [
  "https://storage.renmoku.id/vehicles/v1/front.jpg",
  "https://storage.renmoku.id/vehicles/v1/back.jpg",
  "https://storage.renmoku.id/vehicles/v1/left.jpg",
  "https://storage.renmoku.id/vehicles/v1/right.jpg"
]
```

**Indexes:**
- `ownerId` - Untuk query kendaraan by owner
- `status` - Untuk filter kendaraan available
- `location` - Untuk search by location

---

### 6. **Booking** (Pemesanan)

Data pemesanan/booking kendaraan.

```prisma
model Booking {
  id              String          @id @default(cuid())
  
  // Parties
  renterId        String
  renter          User            @relation(...)
  vehicleId       String
  vehicle         Vehicle         @relation(...)
  
  // Rental Details
  startDate       DateTime
  endDate         DateTime
  durationType    DurationType
  withDriver      Boolean         @default(false)
  
  // Pricing
  totalPrice      Float
  dpAmount        Float
  
  // Trip Info
  tripOrigin      String
  tripDestination String
  tripPurpose     String
  
  // Guarantee
  guaranteeType   GuaranteeType
  guaranteeDoc    String?         // URL file dokumen jaminan
  
  // Status
  status          BookingStatus   @default(PENDING)
  contractSigned  Boolean         @default(false)
}
```

**Enum DurationType:**
```typescript
enum DurationType {
  DAILY     // Sewa harian
  WEEKLY    // Sewa mingguan
  MONTHLY   // Sewa bulanan
}
```

**Enum GuaranteeType:**
```typescript
enum GuaranteeType {
  KTP                 // KTP asli (ditahan)
  BPKB                // BPKB kendaraan
  CASH                // Uang tunai
  GUARANTEE_LETTER    // Surat jaminan (corporate)
}
```

**Enum BookingStatus:**
```typescript
enum BookingStatus {
  PENDING     // Menunggu konfirmasi owner
  CONFIRMED   // Sudah dikonfirmasi, menunggu pembayaran
  ACTIVE      // Sedang dalam masa sewa
  COMPLETED   // Selesai
  CANCELLED   // Dibatalkan
}
```

**Workflow:**
```
PENDING → CONFIRMED → ACTIVE → COMPLETED
   ↓
CANCELLED
```

**Indexes:**
- `renterId` - Untuk query booking by renter
- `vehicleId` - Untuk query booking by vehicle
- `status` - Untuk filter booking by status
- `startDate, endDate` - Untuk query booking by date range

---

### 7. **Payment** (Pembayaran)

Data transaksi pembayaran.

```prisma
model Payment {
  id              String          @id @default(cuid())
  
  bookingId       String
  booking         Booking         @relation(...)
  userId          String?
  user            User?           @relation(...)
  
  type            PaymentType
  amount          Float
  method          String
  status          PaymentStatus   @default(PENDING)
  
  transactionId   String?         // ID dari payment gateway
  paidAt          DateTime?
}
```

**Enum PaymentType:**
```typescript
enum PaymentType {
  DP              // Down Payment (30-50%)
  FULL_PAYMENT    // Pelunasan
}
```

**Enum PaymentStatus:**
```typescript
enum PaymentStatus {
  PENDING     // Menunggu pembayaran
  PAID        // Sudah dibayar
  FAILED      // Pembayaran gagal
  REFUNDED    // Dana dikembalikan
}
```

**Payment Methods:**
```typescript
method: "bank_transfer" | "credit_card" | "ewallet" | "qris"
```

**Workflow:**
```
PENDING → PAID
   ↓
FAILED → REFUNDED
```

**Indexes:**
- `bookingId` - Untuk query payment by booking
- `status` - Untuk filter payment by status

---

## 🔗 Relasi Antar Model

### User → Profiles
```typescript
User (1) ──→ (1) RenterIndividual  // Jika role = RENTER & tipe = Individual
User (1) ──→ (1) RenterCorporate   // Jika role = RENTER & tipe = Corporate
User (1) ──→ (1) FleetOwner        // Jika role = OWNER
```

### FleetOwner → Vehicle
```typescript
FleetOwner (1) ──→ (N) Vehicle  // Owner memiliki banyak kendaraan
```

### User + Vehicle → Booking
```typescript
User (1) ──→ (N) Booking      // Renter memiliki banyak booking
Vehicle (1) ──→ (N) Booking   // Vehicle memiliki banyak booking
```

### Booking → Payment
```typescript
Booking (1) ──→ (N) Payment   // Booking memiliki banyak payment (DP + pelunasan)
```

---

## 💾 Database Indexes

### Performance Optimization

```prisma
// Vehicle indexes
@@index([ownerId])      // Query kendaraan by owner
@@index([status])       // Filter kendaraan available
@@index([location])     // Search by location

// Booking indexes
@@index([renterId])           // Query booking by renter
@@index([vehicleId])          // Query booking by vehicle
@@index([status])             // Filter booking by status
@@index([startDate, endDate]) // Query booking by date range

// Payment indexes
@@index([bookingId])  // Query payment by booking
@@index([status])     // Filter payment by status
```

---

## 🔒 Security & Validation

### Password Hashing
```typescript
// Gunakan bcrypt untuk hash password
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
```

### File Upload Validation
```typescript
// Validasi file upload
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### Role-Based Access Control
```typescript
// Middleware untuk RBAC
const requireRole = (roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
app.get('/api/owner/vehicles', requireRole(['OWNER']), getVehicles);
app.get('/api/admin/users', requireRole(['ADMIN']), getUsers);
```

---

## 📝 Contoh Query

### Get Available Vehicles
```typescript
const vehicles = await prisma.vehicle.findMany({
  where: {
    status: 'AVAILABLE',
    location: 'Jakarta',
  },
  include: {
    owner: {
      include: {
        user: true,
      },
    },
  },
  orderBy: {
    priceDaily: 'asc',
  },
});
```

### Create Booking
```typescript
const booking = await prisma.booking.create({
   {
    renterId: userId,
    vehicleId: vehicleId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    durationType: 'DAILY',
    withDriver: true,
    totalPrice: 5000000,
    dpAmount: 2500000,
    tripOrigin: 'Jakarta',
    tripDestination: 'Bandung',
    tripPurpose: 'Wisata',
    guaranteeType: 'KTP',
    status: 'PENDING',
  },
});
```

### Get User Bookings
```typescript
const bookings = await prisma.booking.findMany({
  where: {
    renterId: userId,
  },
  include: {
    vehicle: true,
    payments: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Update Booking Status
```typescript
const updatedBooking = await prisma.booking.update({
  where: { id: bookingId },
   {
    status: 'CONFIRMED',
  },
});
```

### Create Payment
```typescript
const payment = await prisma.payment.create({
   {
    bookingId: bookingId,
    userId: userId,
    type: 'DP',
    amount: 2500000,
    method: 'bank_transfer',
    status: 'PENDING',
    transactionId: 'TRX-123456',
  },
});
```

---

## 🚀 Migration Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Run Migrations
```bash
npx prisma migrate dev --name init
```

### Reset Database
```bash
npx prisma migrate reset
```

### Seed Database
```bash
npx prisma db seed
```

### Open Prisma Studio
```bash
npx prisma studio
```

---

## 📊 Database Statistics

| Model | Count | Description |
|-------|-------|-------------|
| User | - | Total pengguna |
| RenterIndividual | - | Penyewa pribadi |
| RenterCorporate | - | Penyewa corporate |
| FleetOwner | - | Pemilik armada |
| Vehicle | - | Kendaraan |
| Booking | - | Pemesanan |
| Payment | - | Pembayaran |

---

## 🎯 Business Logic

### Booking Workflow
```
1. Renter memilih kendaraan
   ↓
2. Renter mengisi form booking
   ↓
3. Booking status = PENDING
   ↓
4. Owner menerima/menolak booking
   ↓
5. Jika diterima → status = CONFIRMED
   ↓
6. Renter membayar DP
   ↓
7. Payment status = PAID
   ↓
8. Renter pick-up kendaraan
   ↓
9. Booking status = ACTIVE
   ↓
10. Renter kembalikan kendaraan
    ↓
11. Renter bayar pelunasan
    ↓
12. Booking status = COMPLETED
```

### Payment Workflow
```
1. Booking confirmed
   ↓
2. Create payment DP
   ↓
3. Payment status = PENDING
   ↓
4. Renter bayar via payment gateway
   ↓
5. Payment gateway callback
   ↓
6. Update payment status = PAID
   ↓
7. Update booking status = CONFIRMED
```

---

## ✅ Checklist

### Models
- [x] User
- [x] RenterIndividual
- [x] RenterCorporate
- [x] FleetOwner
- [x] Vehicle
- [x] Booking
- [x] Payment

### Enums
- [x] UserRole
- [x] UserStatus
- [x] Transmission
- [x] VehicleStatus
- [x] DurationType
- [x] GuaranteeType
- [x] BookingStatus
- [x] PaymentType
- [x] PaymentStatus

### Relations
- [x] User → RenterIndividual (1:1)
- [x] User → RenterCorporate (1:1)
- [x] User → FleetOwner (1:1)
- [x] FleetOwner → Vehicle (1:N)
- [x] User → Booking (1:N)
- [x] Vehicle → Booking (1:N)
- [x] Booking → Payment (1:N)

### Indexes
- [x] Vehicle (ownerId, status, location)
- [x] Booking (renterId, vehicleId, status, dates)
- [x] Payment (bookingId, status)

---

## 📚 Related Documentation

- [DATABASE.md](../DATABASE.md) - Database documentation
- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) - Project structure

---

## 🎉 Summary

**Prisma Schema berhasil dibuat dengan:**

✅ **7 Models** - User, RenterIndividual, RenterCorporate, FleetOwner, Vehicle, Booking, Payment  
✅ **9 Enums** - UserRole, UserStatus, Transmission, VehicleStatus, DurationType, GuaranteeType, BookingStatus, PaymentType, PaymentStatus  
✅ **7 Relations** - 1:1 dan 1:N relationships  
✅ **8 Indexes** - Performance optimization  
✅ **Business Logic** - Booking & payment workflows  

**Status**: ✅ Production Ready

---

**Last Updated**: 2025-01-15  
**Version**: 2.0.0  
**Author**: Renmoku Tech Team
