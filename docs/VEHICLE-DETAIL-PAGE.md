# 🚗 Vehicle Detail Page - Renmoku

## Overview

Halaman detail kendaraan yang lengkap dengan 360° viewer interaktif, kalkulator sewa, dan pilihan opsi sewa sesuai wireframe.

---

## 🎯 Fitur Utama

### 1. 360° Viewer Interaktif

**Kontrol:**
- ✅ **Arrow Navigation** - Tombol kiri/kanan untuk rotasi 45°
- ✅ **Zoom In/Out** - Zoom 0.6x hingga 2x
- ✅ **View Mode Toggle** - Switch antara Exterior/Interior
- ✅ **Rotation Indicator** - Menampilkan derajat rotasi saat ini
- ✅ **Drag to Rotate** - Instruksi untuk drag manual
- ✅ **360° Badge** - Badge dengan animasi pulse

**Animasi:**
```tsx
transform: `rotateY(${rotation}deg) scale(${zoom})`
transition: 'transform 0.3s ease'
```

### 2. Informasi Kendaraan

**Data yang Ditampilkan:**
- ✅ Nama kendaraan + tahun
- ✅ Rating bintang (1-5)
- ✅ Jumlah review
- ✅ Harga per hari
- ✅ Spesifikasi:
  - Transmisi (Automatic/Manual)
  - Kapasitas (jumlah penumpang)
  - Bahan Bakar (bensin/diesel/hybrid/electric)
  - Lokasi
- ✅ Fitur unggulan (6 fitur utama)

### 3. Pilihan Opsi Sewa

**Dua Opsi:**
1. **Dengan Driver** 
   - Termasuk driver profesional
   - Harga: `pricePerDay + 500.000`/hari
   
2. **Lepas Kunci**
   - Self drive, bebas kemana saja
   - Harga: `pricePerDay`/hari

**UI:**
- Card design dengan neu-gold/neu-soft
- Icon berbeda untuk setiap opsi
- Harga ditampilkan dengan gold gradient

### 4. Kalkulator Sewa

**Durasi dengan Diskon:**
- **Harian** - 0% diskon
- **Mingguan** - 10% diskon
- **Bulanan** - 25% diskon

**Date Picker:**
- Tanggal Mulai
- Tanggal Selesai
- Auto-calculate jumlah hari

**Price Breakdown:**
- Harga Dasar
- Jasa Driver (jika dengan driver)
- Diskon (jika mingguan/bulanan)
- **Total**
- **DP (50%)**

### 5. Button BOOK NOW

- Gold gradient button
- Full width
- Icon ChevronRight
- Navigate ke halaman booking

---

## 🎨 Layout

### Grid Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Left Column - 360° Viewer + Info */}
  <motion.div>...</motion.div>
  
  {/* Right Column - Booking Panel */}
  <motion.div>...</motion.div>
</div>
```

### Left Column
1. **360° Viewer Card**
   - Aspect ratio video
   - Controls di bawah
   - Badge dan toggle di atas

2. **Vehicle Info Card**
   - Header dengan nama + rating
   - Spesifikasi grid 2x2
   - Fitur unggulan grid 2x3

### Right Column
1. **Rental Type Selection Card**
   - 2 opsi (Dengan Driver / Lepas Kunci)
   - Grid 2 kolom
   - Harga per hari

2. **Rental Calculator Card**
   - Durasi selection (3 opsi)
   - Date picker (2 kolom)
   - Price breakdown
   - BOOK NOW button
   - Trust badges

---

## 📊 State Management

### Local State
```typescript
const [rentalType, setRentalType] = useState<'with_driver' | 'self_drive'>('with_driver');
const [duration, setDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [rotation, setRotation] = useState(0);
const [zoom, setZoom] = useState(1);
const [viewMode, setViewMode] = useState<'exterior' | 'interior'>('exterior');
```

### Global State (Zustand)
```typescript
const { selectedVehicle, setCurrentPage } = useAppStore();
```

---

## 🧮 Price Calculation

### Logic
```typescript
const priceCalculation = useMemo(() => {
  let basePrice = 0;
  let discount = 0;

  if (duration === 'daily') {
    basePrice = days * vehicle.pricePerDay;
  } else if (duration === 'weekly') {
    basePrice = Math.ceil(days / 7) * vehicle.pricePerWeek;
    discount = 10;
  } else {
    basePrice = Math.ceil(days / 30) * vehicle.pricePerMonth;
    discount = 25;
  }

  const driverFee = rentalType === 'with_driver' ? days * 500000 : 0;
  const subtotal = basePrice + driverFee;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const dp = total * 0.5;

  return {
    basePrice,
    driverFee,
    discount,
    discountAmount,
    total,
    dp,
  };
}, [duration, days, vehicle, rentalType]);
```

### Contoh Perhitungan
**Toyota Alphard - 7 hari - Dengan Driver - Mingguan:**
- Harga dasar: 7 × Rp 2.500.000 = Rp 17.500.000
- Jasa driver: 7 × Rp 500.000 = Rp 3.500.000
- Subtotal: Rp 21.000.000
- Diskon 10%: -Rp 2.100.000
- **Total: Rp 18.900.000**
- **DP (50%): Rp 9.450.000**

---

## 🎬 Animasi

### 360° Rotation
```tsx
const handleRotate = (direction: 'left' | 'right') => {
  setRotation((prev) => (direction === 'left' ? prev - 45 : prev + 45));
};
```

### Zoom
```tsx
onClick={() => setZoom(Math.min(zoom + 0.2, 2))}  // Zoom In
onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))} // Zoom Out
```

### View Mode Toggle
```tsx
<img
  src={viewMode === 'exterior' ? vehicle.image : vehicle.images[1] || vehicle.image}
  alt={vehicle.name}
/>
```

---

## 🎨 Design System

### 360° Viewer
```tsx
<div className="card-luxury p-6">
  <div className="relative aspect-video rounded-xl overflow-hidden neu-pressed mb-4">
    {/* 360° View */}
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        transform: `rotateY(${rotation}deg) scale(${zoom})`,
        transition: 'transform 0.3s ease',
      }}
    >
      <img src={...} className="max-w-full max-h-full object-contain" />
    </div>
  </div>
</div>
```

### Controls
```tsx
<div className="flex items-center justify-between">
  {/* Arrow Navigation */}
  <div className="flex gap-2">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => handleRotate('left')}
      className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
    >
      <ChevronLeft className="w-5 h-5" />
    </motion.button>
  </div>

  {/* Zoom Controls */}
  <div className="flex gap-2">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
      className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
    >
      <ZoomIn className="w-5 h-5" />
    </motion.button>
  </div>
</div>
```

### Rental Type Selection
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => setRentalType('with_driver')}
  className={`p-4 rounded-xl text-left transition-all ${
    rentalType === 'with_driver' ? 'neu-gold' : 'neu-soft'
  }`}
>
  <div className="flex items-center gap-2 mb-2">
    <Users className={`w-5 h-5 ${rentalType === 'with_driver' ? 'text-gold-400' : 'text-gray-400'}`} />
    <span className={`font-medium ${rentalType === 'with_driver' ? 'text-gold-300' : 'text-gray-300'}`}>
      Dengan Driver
    </span>
  </div>
  <p className="text-xs text-gray-500 mb-2">Termasuk driver profesional</p>
  <p className="text-gold-gradient font-bold">
    {formatCurrency(vehicle.pricePerDay + 500000)}/hr
  </p>
</motion.button>
```

### Price Breakdown
```tsx
<div className="neu-pressed rounded-xl p-4 space-y-2 mb-4">
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Durasi</span>
    <span className="text-white">{days} hari</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Harga Dasar</span>
    <span className="text-white">{formatCurrency(priceCalculation.basePrice)}</span>
  </div>
  {priceCalculation.driverFee > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">Jasa Driver</span>
      <span className="text-white">{formatCurrency(priceCalculation.driverFee)}</span>
    </div>
  )}
  {priceCalculation.discount > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">Diskon ({priceCalculation.discount}%)</span>
      <span className="text-emerald-400">-{formatCurrency(priceCalculation.discountAmount)}</span>
    </div>
  )}
  <div className="divider-subtle my-2" />
  <div className="flex justify-between">
    <span className="text-gray-300 font-medium">Total</span>
    <span className="text-gold-gradient font-bold text-xl">
      {formatCurrency(priceCalculation.total)}
    </span>
  </div>
  <div className="flex justify-between text-sm pt-2 border-t border-white/5">
    <span className="text-gray-400">DP (50%)</span>
    <span className="text-gold-400 font-medium">
      {formatCurrency(priceCalculation.dp)}
    </span>
  </div>
</div>
```

---

## 📱 Responsive Design

### Mobile (< 1024px)
- Grid 1 kolom (stacked)
- 360° viewer full width
- Booking panel di bawah

### Desktop (≥ 1024px)
- Grid 2 kolom
- 360° viewer di kiri
- Booking panel di kanan (sticky)

---

## 🎯 User Flow

```
1. User click kendaraan dari Fleet Page
   ↓
2. VehicleDetailPage terbuka
   ↓
3. User explore 360° viewer
   - Rotate dengan arrow buttons
   - Zoom in/out
   - Switch exterior/interior
   ↓
4. User baca spesifikasi & fitur
   ↓
5. User pilih opsi sewa
   - Dengan Driver / Lepas Kunci
   ↓
6. User pilih durasi
   - Harian / Mingguan / Bulanan
   ↓
7. User pilih tanggal
   - Tanggal mulai & selesai
   ↓
8. Kalkulator hitung otomatis
   - Total harga
   - DP 50%
   ↓
9. User click "BOOK NOW"
   ↓
10. Navigate ke BookingFlow
```

---

## 📦 Data Structure

### Vehicle (from mockData)
```typescript
{
  id: string;
  name: string;
  brand: string;
  type: 'sedan' | 'suv' | 'mpv' | 'luxury' | 'sport';
  year: number;
  transmission: 'automatic' | 'manual';
  seats: number;
  fuel: 'bensin' | 'diesel' | 'hybrid' | 'electric';
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  image: string;
  images: string[];
  features: string[];
  available: boolean;
  ownerId: string;
  location: string;
  rating: number;
  reviews: number;
  sides?: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  has360View?: boolean;
}
```

---

## ✅ Checklist

### 360° Viewer
- [x] Arrow navigation (left/right)
- [x] Zoom in/out controls
- [x] View mode toggle (exterior/interior)
- [x] Rotation indicator
- [x] 360° badge dengan pulse animation
- [x] Drag instruction

### Vehicle Info
- [x] Nama + tahun
- [x] Rating bintang
- [x] Jumlah review
- [x] Harga per hari
- [x] Spesifikasi (4 items)
- [x] Fitur unggulan (6 items)

### Rental Options
- [x] Dengan Driver option
- [x] Lepas Kunci option
- [x] Harga per hari untuk setiap opsi
- [x] Visual feedback (neu-gold/neu-soft)

### Rental Calculator
- [x] Durasi selection (3 opsi)
- [x] Diskon indicator
- [x] Date picker (2 fields)
- [x] Price breakdown
- [x] Total calculation
- [x] DP (50%) calculation

### Booking
- [x] BOOK NOW button
- [x] Trust badges
- [x] Navigate to booking flow

---

## 🚀 Build Status

```
✓ 1732 modules transformed
✓ dist/index.html                   0.84 kB
✓ dist/assets/index-BXsd3M80.css   76.35 kB │ gzip: 12.15 kB
✓ dist/assets/index-BnDd64TA.js   458.97 kB │ gzip: 123.52 kB
✓ built in 6.54s
```

**Status**: ✅ Production Ready

---

## 📚 Related Documentation

- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [VEHICLE-SHOWCASE.md](./VEHICLE-SHOWCASE.md) - 360° showcase
- [360-VIEWER.md](./360-VIEWER.md) - Technical implementation
- [OWNER-DASHBOARD.md](./OWNER-DASHBOARD.md) - Owner dashboard

---

## 🎉 Summary

**Status**: ✅ Complete

Vehicle Detail Page berhasil diimplementasikan sesuai wireframe:

✅ **360° Viewer** - Interaktif dengan arrow navigation, zoom, view mode toggle  
✅ **Vehicle Info** - Spesifikasi lengkap + fitur unggulan  
✅ **Rental Options** - Dengan Driver / Lepas Kunci dengan harga berbeda  
✅ **Rental Calculator** - Durasi dengan diskon, date picker, price breakdown  
✅ **BOOK NOW** - Button dengan gold gradient  

**Design**: Neumorphism + Glassmorphism yang refined  
**Responsive**: Mobile-first dengan grid layout  
**Animations**: Smooth transitions dengan Framer Motion  

**Build Status**: ✅ Success (458.97 kB gzip: 123.52 kB)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Author**: Renmoku Tech Team
