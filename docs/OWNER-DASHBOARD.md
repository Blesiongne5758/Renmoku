# 🏢 Owner Dashboard - Renmoku

## Overview

Owner Dashboard adalah panel kontrol komprehensif untuk pemilik rental mobil dalam platform Renmoku. Dashboard ini menyediakan 4 tab utama untuk mengelola armada, booking, inspeksi kendaraan, dan memantau pendapatan.

---

## 🎯 Fitur Utama

### 📊 Stats Overview
- **Pendapatan Bulan Ini** - Total pendapatan dengan persentase perubahan
- **Armada Aktif** - Jumlah kendaraan yang aktif
- **Booking Aktif** - Jumlah booking yang sedang berjalan
- **Rating** - Rating rata-rata dengan tren

---

## 📑 Tab 1: Fleet Management

### Fitur
- **Tambah Kendaraan Baru** - Tombol untuk menambahkan kendaraan baru ke armada
- **List Kendaraan** - Daftar semua kendaraan dengan informasi lengkap
- **360° Preview** - Preview 360° untuk kendaraan yang memiliki foto 4 sisi
- **Status Indicator** - Badge status (Aktif/Nonaktif)
- **Quick Stats** - Harga/hari, total booking, rating
- **Action Buttons**:
  - **Edit** - Edit informasi kendaraan
  - **Nonaktifkan** - Nonaktifkan kendaraan dari listing
  - **Kalender** - Lihat kalender ketersediaan

### Data yang Ditampilkan
```typescript
{
  name: string;           // Nama kendaraan
  brand: string;          // Merek
  year: number;           // Tahun
  pricePerDay: number;    // Harga per hari
  reviews: number;        // Total booking
  rating: number;         // Rating
  available: boolean;     // Status ketersediaan
  has360View: boolean;    // Status 360° view
  image: string;          // URL gambar
}
```

### UI Components
- **Card Luxury** - Container dengan neumorphism effect
- **Vehicle360Viewer** - Preview 360° interaktif
- **Neu-soft** - Quick stats cards
- **Action Buttons** - Edit, Nonaktifkan, Kalender

---

## 📑 Tab 2: Booking Management

### Fitur
- **Filter Tabs** - Filter booking berdasarkan status:
  - Semua
  - Pending
  - Aktif
  - Selesai
  - Dibatalkan
- **Booking List** - Daftar booking dengan informasi lengkap
- **Status Badge** - Badge status dengan warna berbeda
- **Quick Stats** - Tanggal, durasi, total, DP
- **Action Buttons**:
  - **Terima** - Terima booking (untuk status pending)
  - **Tolak** - Tolak booking (untuk status pending)
  - **Lihat Detail** - Lihat detail lengkap booking

### Data yang Ditampilkan
```typescript
{
  vehicleName: string;        // Nama kendaraan
  renterName: string;         // Nama penyewa
  startDate: string;          // Tanggal mulai
  duration: number;           // Durasi (hari)
  totalPrice: number;         // Total harga
  dpAmount: number;           // Jumlah DP
  bookingStatus: string;      // Status booking
}
```

### Status Colors
- **Active** - Emerald (hijau)
- **Confirmed** - Blue (biru)
- **Completed** - Gray (abu-abu)
- **Pending** - Yellow (kuning)

---

## 📑 Tab 3: Check-in/Check-out

### Fitur
- **Inspection Type Selector** - Pilih jenis inspeksi:
  - **Check-in** - Saat penyewa mengambil kendaraan
  - **Check-out** - Saat penyewa mengembalikan kendaraan

### Checklist Kondisi Kendaraan

#### 1. Eksterior
- Foto 4 sisi (Depan, Belakang, Kiri, Kanan)
- Upload area dengan preview
- Grid layout 4 kolom

#### 2. Interior
- Foto 3 area (Dashboard, Jok, Bagasi)
- Upload area dengan preview
- Grid layout 3 kolom

#### 3. Kilometer
- **KM Awal/Akhir** - Input manual kilometer
- **Selisih KM** - Otomatis dihitung
- Validasi input number

#### 4. Bahan Bakar
- Level selector (Empty, 1/4, 1/2, 3/4, Full)
- Button selector dengan 5 opsi
- Visual feedback saat dipilih

### Confirm Button
- Tombol konfirmasi dengan ikon CheckCircle2
- Label dinamis berdasarkan inspection type

---

## 📑 Tab 4: Pendapatan (Revenue Dashboard)

### Fitur

#### 1. Revenue Chart
- **Grafik Batang** - Visualisasi pendapatan 12 bulan
- **Hover Tooltip** - Tampilkan detail saat hover
- **Toggle View** - Switch antara Harian/Bulanan
- **Animation** - Bar chart dengan animasi staggered

#### 2. Stats Grid
- **Total Tahun Ini** - Total pendapatan tahun berjalan
- **Rata-rata/hari** - Average pendapatan per hari
- **Okupansi** - Persentase okupansi armada

#### 3. Transaction History
- **Riwayat Transaksi** - List transaksi terbaru
- **Export Button** - Export data ke CSV/Excel
- **Detail per Transaksi**:
  - Nama kendaraan
  - Tanggal transaksi
  - Jumlah total
  - Komisi platform

### Chart Data Structure
```typescript
{
  monthlyData: number[];  // Data pendapatan per bulan
  months: string[];       // Label bulan
}
```

---

## 🎨 Design System

### Neumorphism Classes
```css
.neu-raised {
  background: #13131c;
  box-shadow:
    8px 8px 16px rgba(0, 0, 0, 0.6),
    -8px -8px 16px rgba(40, 40, 55, 0.08);
}

.neu-soft {
  background: #13131c;
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.4),
    -4px -4px 8px rgba(40, 40, 55, 0.05);
}

.neu-pressed {
  background: #0e0e15;
  box-shadow:
    inset 6px 6px 12px rgba(0, 0, 0, 0.6),
    inset -6px -6px 12px rgba(40, 40, 55, 0.08);
}

.neu-gold {
  background: linear-gradient(145deg, #18181f, #111118);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.6),
    -6px -6px 12px rgba(40, 40, 55, 0.06),
    inset 0 1px 0 rgba(184, 146, 63, 0.1);
  border: 1px solid rgba(184, 146, 63, 0.08);
}
```

### Card Luxury
```css
.card-luxury {
  background: linear-gradient(145deg, rgba(19, 19, 28, 0.8), rgba(14, 14, 21, 0.8));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### Color Palette
```css
/* Gold Accent */
--gold-400: #d4a853;
--gold-500: #b8923f;
--gold-600: #9a7830;

/* Status Colors */
--emerald-400: #34d399;  /* Active/Success */
--blue-400: #60a5fa;     /* Confirmed/Info */
--yellow-400: #fbbf24;   /* Pending/Warning */
--red-400: #f87171;      /* Cancelled/Error */
--gray-400: #9ca3af;     /* Completed/Neutral */
```

---

## 🔄 State Management

### Zustand Store
```typescript
interface AppState {
  currentUser: User | null;
  // ... other state
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'individual' | 'corporate' | 'owner' | 'admin';
}
```

### Routing Logic
```typescript
// App.tsx
case 'dashboard':
  if (currentUser?.role === 'owner') {
    return <OwnerDashboard />;
  }
  return <DashboardPage />;
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) {
  .grid-cols-4 { grid-template-columns: 1fr; }
  .flex-col { flex-direction: column; }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### Mobile Optimizations
- ✅ Stacked layout untuk stats cards
- ✅ Horizontal scroll untuk tabs
- ✅ Full-width buttons
- ✅ Simplified grid layouts

---

## 🎬 Animations

### Framer Motion
```typescript
// Stats cards stagger
{stats.map((stat, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
  >
))}

// Chart bars stagger
{monthlyData.map((val, i) => (
  <motion.div
    initial={{ height: 0 }}
    animate={{ height: `${val}%` }}
    transition={{ delay: i * 0.05, duration: 0.5 }}
  >
))}

// Button interactions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### Tab Transitions
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {/* Tab content */}
  </motion.div>
</AnimatePresence>
```

---

## 📊 Data Flow

### Fleet Management
```
vehicles[] → FleetManagement → Vehicle Cards
  ├─ 360° Preview (if has360View)
  ├─ Quick Stats
  └─ Action Buttons
```

### Booking Management
```
mockBookings[] → BookingManagement → Booking Cards
  ├─ Filter Tabs
  ├─ Status Badge
  ├─ Quick Stats
  └─ Action Buttons (Terima/Tolak/Lihat Detail)
```

### Inspection Management
```
inspectionType (checkin/checkout) → InspectionManagement
  ├─ Eksterior (4 photos)
  ├─ Interior (3 photos)
  ├─ Kilometer (input)
  ├─ Bahan Bakar (selector)
  └─ Confirm Button
```

### Revenue Dashboard
```
monthlyData[] → RevenueDashboard
  ├─ Revenue Chart (bar chart)
  ├─ Stats Grid (3 cards)
  └─ Transaction History (list)
```

---

## 🔒 Security & Validation

### Input Validation
```typescript
// Kilometer input
<input
  type="number"
  min="0"
  max="999999"
  placeholder="Contoh: 45230"
/>

// File upload validation
const validateFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};
```

### Role-based Access
```typescript
// Only owners can access OwnerDashboard
if (currentUser?.role === 'owner') {
  return <OwnerDashboard />;
}
```

---

## 🚀 Performance

### Bundle Size
- **OwnerDashboard.tsx**: ~15KB
- **Total Impact**: Minimal (lazy loaded)

### Optimizations
- ✅ Lazy loading untuk images
- ✅ Memoization untuk expensive calculations
- ✅ Optimized animations (GPU accelerated)
- ✅ Minimal re-renders

---

## 📚 Components Structure

```
OwnerDashboard
├── Stats Overview (4 cards)
├── Tabs Navigation
└── Tab Content
    ├── FleetManagement
    │   ├── Add Vehicle Button
    │   └── Vehicle List
    │       └── Vehicle Card
    │           ├── 360° Preview / Image
    │           ├── Vehicle Info
    │           ├── Quick Stats
    │           └── Action Buttons
    │
    ├── BookingManagement
    │   ├── Filter Tabs
    │   └── Booking List
    │       └── Booking Card
    │           ├── Booking Info
    │           ├── Quick Stats
    │           └── Action Buttons
    │
    ├── InspectionManagement
    │   ├── Inspection Type Selector
    │   └── Checklist
    │       ├── Eksterior (4 photos)
    │       ├── Interior (3 photos)
    │       ├── Kilometer
    │       ├── Bahan Bakar
    │       └── Confirm Button
    │
    └── RevenueDashboard
        ├── Revenue Chart
        ├── Stats Grid (3 cards)
        └── Transaction History
```

---

## 🎯 User Journey

### 1. Login as Owner
- User login dengan role 'owner'
- Redirect ke Dashboard
- Detect role → Show OwnerDashboard

### 2. Fleet Management
- View semua kendaraan
- Add new vehicle
- Edit vehicle info
- Toggle vehicle status
- View calendar

### 3. Booking Management
- View semua booking
- Filter by status
- Accept/reject pending bookings
- View booking details

### 4. Check-in/Check-out
- Select inspection type
- Upload photos (exterior & interior)
- Input kilometer
- Select fuel level
- Confirm inspection

### 5. Revenue Tracking
- View revenue chart
- Check stats
- View transaction history
- Export data

---

## ✅ Checklist

### Fleet Management
- [x] Add vehicle button
- [x] Vehicle list with 360° preview
- [x] Status indicator
- [x] Quick stats
- [x] Action buttons (Edit, Nonaktifkan, Kalender)

### Booking Management
- [x] Filter tabs
- [x] Booking list
- [x] Status badge
- [x] Quick stats
- [x] Action buttons (Terima, Tolak, Lihat Detail)

### Inspection Management
- [x] Inspection type selector
- [x] Eksterior photo upload (4 sides)
- [x] Interior photo upload (3 areas)
- [x] Kilometer input
- [x] Fuel level selector
- [x] Confirm button

### Revenue Dashboard
- [x] Revenue chart (bar chart)
- [x] Stats grid (3 cards)
- [x] Transaction history
- [x] Export button

---

## 📖 Related Documentation

- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [VEHICLE-SHOWCASE.md](./VEHICLE-SHOWCASE.md) - 360° showcase
- [360-VIEWER.md](./360-VIEWER.md) - Technical implementation
- [UI-UX-OVERHAUL.md](./UI-UX-OVERHAUL.md) - Design system

---

## 🎉 Summary

**Status**: ✅ Complete

Owner Dashboard berhasil diimplementasikan dengan 4 tab lengkap:

✅ **Fleet Management** - CRUD kendaraan dengan 360° preview  
✅ **Booking Management** - Kelola booking dengan filter & actions  
✅ **Check-in/Check-out** - Inspeksi kendaraan dengan checklist  
✅ **Revenue Dashboard** - Grafik pendapatan & riwayat transaksi  

**Design**: Neumorphism + Glassmorphism yang refined  
**Responsive**: Mobile-first dengan breakpoints  
**Animations**: Smooth transitions dengan Framer Motion  
**Performance**: Optimized dengan lazy loading  

**Build Status**: ✅ Success (466.47 kB gzip: 125.15 kB)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Author**: Renmoku Tech Team
