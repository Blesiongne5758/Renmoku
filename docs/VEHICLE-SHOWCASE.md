# 🚗 Vehicle Showcase - 360° Virtual View

## Overview

Fitur **Vehicle Showcase** menampilkan koleksi kendaraan premium dengan visual 360° berputar otomatis di tengah dengan background garasi mewah yang konsisten. Setiap kendaraan yang diupload oleh pemilik rental akan secara otomatis menghasilkan tampilan 3D interaktif.

---

## 🎯 Contoh Kendaraan yang Ditampilkan

### 1. **Toyota Alphard** (Luxury MPV)
- **Tipe**: Luxury MPV
- **Tahun**: 2024
- **Transmisi**: Automatic
- **Kapasitas**: 7 Orang
- **BBM**: Hybrid
- **Harga**: Rp 2.5jt/hari
- **Lokasi**: Jakarta
- **Rating**: 4.9/5 (128 reviews)
- **Fitur**: Captain Seat, Power Door, Panoramic Roof, JBL Sound, 360 Camera
- **360° View**: ✅ Aktif

### 2. **Lamborghini Huracan** (Sport Car)
- **Tipe**: Sport
- **Tahun**: 2024
- **Transmisi**: Automatic
- **Kapasitas**: 2 Orang
- **BBM**: Bensin
- **Harga**: Rp 8jt/hari
- **Lokasi**: Jakarta
- **Rating**: 5.0/5 (34 reviews)
- **Fitur**: V10 Engine, Carbon Fiber, Launch Control, Sport Exhaust, Digital Cockpit
- **360° View**: ✅ Aktif

### 3. **Rolls-Royce Ghost** (Ultra Luxury)
- **Tipe**: Luxury
- **Tahun**: 2024
- **Transmisi**: Automatic
- **Kapasitas**: 5 Orang
- **BBM**: Bensin
- **Harga**: Rp 12jt/hari
- **Lokasi**: Bali
- **Rating**: 5.0/5 (18 reviews)
- **Fitur**: Starlight Headliner, Bespoke Audio, Massage Seats, Champagne Cooler, Umbrella
- **360° View**: ✅ Aktif

### 4. **Porsche 911 Turbo** (Sport Car)
- **Tipe**: Sport
- **Tahun**: 2024
- **Transmisi**: Automatic
- **Kapasitas**: 4 Orang
- **BBM**: Bensin
- **Harga**: Rp 6jt/hari
- **Lokasi**: Jakarta
- **Rating**: 4.9/5 (52 reviews)
- **Fitur**: Twin Turbo, Sport Chrono, PASM, Rear-Axle Steering, Burmester Sound
- **360° View**: ✅ Aktif

### 5. **Range Rover Autobiography** (Luxury SUV)
- **Tipe**: SUV
- **Tahun**: 2024
- **Transmisi**: Automatic
- **Kapasitas**: 5 Orang
- **BBM**: Diesel
- **Harga**: Rp 4.5jt/hari
- **Lokasi**: Bandung
- **Rating**: 4.8/5 (76 reviews)
- **Fitur**: Air Suspension, Meridian Sound, Pixel LED, ClearSight Mirror, Terrain Response
- **360° View**: ✅ Aktif

---

## 🎨 Visual 360° Showcase

### Tampilan di Landing Page

Setiap kendaraan ditampilkan dalam card premium dengan:

1. **360° Viewer** - Visual berputar otomatis di tengah card
2. **Background Garasi Mewah** - Konsisten untuk semua kendaraan
3. **Vehicle Info Overlay** - Nama, brand, tahun, lokasi, harga
4. **Specs Grid** - 4 spesifikasi utama (tipe, transmisi, kapasitas, BBM)
5. **Features Tags** - Fitur unggulan kendaraan
6. **Rating & Reviews** - Rating bintang dan jumlah review
7. **Availability Status** - Indikator ketersediaan

### Komponen VehicleShowcase

```tsx
<VehicleShowcase />
```

**Features:**
- ✅ Grid 2 kolom (responsive)
- ✅ Auto-rotate 360° view
- ✅ Interactive drag to rotate
- ✅ Pause/play controls
- ✅ Angle indicator
- ✅ Smooth animations
- ✅ Neumorphic design elements

---

## 🏗️ Cara Kerja Virtual 360°

### 1. Upload Foto (Owner)

Pemilik rental mengupload 4 foto dari sisi berbeda:
- **Front** (0°) - Tampak depan
- **Right** (90°) - Tampak kanan
- **Back** (180°) - Tampak belakang
- **Left** (270°) - Tampak kiri

### 2. Auto-Generate 3D View

Sistem secara otomatis:
- ✅ Mendeteksi 4 foto yang terupload
- ✅ Membuat CSS 3D cube dengan 4 sisi
- ✅ Menambahkan background garasi mewah
- ✅ Mengaktifkan auto-rotate
- ✅ Menambahkan reflection effect

### 3. Tampilan di Listing

Kendaraan dengan 360° view akan:
- ✅ Menampilkan visual berputar di card
- ✅ Badge "360°" dengan animasi pulse
- ✅ Interactive controls (play/pause, drag)
- ✅ Angle indicator (Depan/Kanan/Belakang/Kiri)

---

## 🎬 Fitur Interaktif

### Auto-Rotate
- Rotasi otomatis 0.5° per 30ms
- Smooth dan continuous
- Bisa di-pause dengan tombol

### Drag to Rotate
- User bisa drag horizontal untuk putar manual
- Spring physics untuk smooth movement
- Release untuk kembali ke auto-rotate

### Angle Indicator
- Menampilkan sudut pandang saat ini
- Depan (0°), Kanan (90°), Belakang (180°), Kiri (270°)
- Real-time update

### Progress Bar
- Menunjukkan posisi rotasi
- Gradient gold yang smooth
- Real-time animation

---

## 🎨 Background Garasi Mewah

### Konsistensi Visual

Semua kendaraan menggunakan background garasi mewah yang sama:
- **Lighting**: Ambient gold lighting
- **Floor**: Polished black marble dengan reflection
- **Walls**: Dark luxury dengan LED strip
- **Atmosphere**: Premium showroom feel

### Technical Details

```css
/* Background garasi */
background: url('garage-luxury.jpg');
filter: brightness(0.4) saturate(0.8);

/* Overlay gradient */
background: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 0.3),
  transparent,
  rgba(0, 0, 0, 0.6)
);

/* Gold ambient glow */
background: radial-gradient(
  ellipse at center,
  rgba(184, 146, 63, 0.06),
  transparent 70%
);
```

### Reflection Effect

Lantai garasi memiliki efek reflection:
```css
/* Reflection */
transform: scaleY(-1);
opacity: 0.2;
filter: blur(4px);
mask-image: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
```

---

## 📊 Data Structure

### Vehicle dengan 360° View

```typescript
interface Vehicle {
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
  
  // 360° View Data
  sides?: {
    front?: string;  // URL foto depan
    back?: string;   // URL foto belakang
    left?: string;   // URL foto kiri
    right?: string;  // URL foto kanan
  };
  has360View?: boolean; // Auto true jika 4 sisi terupload
}
```

### Contoh Data

```typescript
{
  id: 'v7',
  name: 'Lamborghini Huracan',
  brand: 'Lamborghini',
  type: 'sport',
  year: 2024,
  transmission: 'automatic',
  seats: 2,
  fuel: 'bensin',
  pricePerDay: 8000000,
  pricePerWeek: 48000000,
  pricePerMonth: 160000000,
  image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  features: ['V10 Engine', 'Carbon Fiber', 'Launch Control', 'Sport Exhaust', 'Digital Cockpit'],
  available: true,
  ownerId: 'owner1',
  location: 'Jakarta',
  rating: 5.0,
  reviews: 34,
  sides: {
    front: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    back: 'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800&q=80',
    left: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&q=80',
    right: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  },
  has360View: true,
}
```

---

## 🎯 User Experience

### Untuk Penyewa

1. **Landing Page** - Lihat showcase kendaraan dengan 360° view
2. **Fleet Page** - Filter dan cari kendaraan dengan badge "360°"
3. **Detail Page** - Full screen 360° viewer dengan controls
4. **Interactive** - Drag, pause, zoom, rotate

### Untuk Owner

1. **Dashboard** - Tab "Upload 360°" untuk manage foto
2. **Upload** - Upload 4 foto dari sisi berbeda
3. **Preview** - Lihat preview sebelum publish
4. **Auto-Activate** - Otomatis aktif di listing setelah upload

---

## 🚀 Performance

### Optimizations

- ✅ **Lazy Loading** - Images di-load saat dibutuhkan
- ✅ **CSS 3D Transforms** - GPU accelerated
- ✅ **Spring Physics** - Smooth animations
- ✅ **Memoization** - React.memo untuk prevent re-renders
- ✅ **Code Splitting** - Components di-load on demand

### Bundle Size

- **VehicleShowcase**: ~5KB
- **Vehicle360Viewer**: ~8KB
- **Total Impact**: Minimal

---

## 🎨 Design System

### Card Layout

```tsx
<div className="card-luxury overflow-hidden">
  {/* 360° Viewer */}
  <div className="relative aspect-video">
    <Vehicle360Viewer vehicle={vehicle} />
    
    {/* Info Overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t">
      <h3>{vehicle.name}</h3>
      <p>{vehicle.brand} • {vehicle.year}</p>
    </div>
  </div>
  
  {/* Details */}
  <div className="p-6">
    {/* Specs Grid */}
    {/* Features Tags */}
    {/* Rating & Reviews */}
  </div>
</div>
```

### Neumorphic Elements

```tsx
// Specs pills
<div className="neu-pressed rounded-lg p-3">
  <p className="text-xs text-gray-500">Tipe</p>
  <p className="text-white font-semibold">{vehicle.type}</p>
</div>

// Feature tags
<span className="px-3 py-1 rounded-lg text-xs bg-white/[0.03] border border-white/[0.05]">
  {feature}
</span>
```

---

## 📱 Responsive Design

### Desktop (lg+)
- Grid 2 kolom
- Full 360° viewer
- All controls visible

### Tablet (md)
- Grid 2 kolom
- Scaled viewer
- Compact controls

### Mobile (sm)
- Grid 1 kolom
- Optimized viewer
- Minimal controls

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Interior 360° view
- [ ] Video walkthrough
- [ ] AR view (Augmented Reality)
- [ ] 3D model integration (glTF)

### Phase 3
- [ ] Multi-angle (8+ foto)
- [ ] Custom backgrounds
- [ ] AI auto-cropping
- [ ] Color correction

---

## 📚 Resources

### Images
- **Garage Background**: Unsplash (luxury garage interior)
- **Vehicle Photos**: Unsplash (high-quality car photos)
- **Icons**: Lucide React

### Documentation
- [360-VIEWER.md](./360-VIEWER.md) - Technical implementation
- [UI-UX-OVERHAUL.md](./UI-UX-OVERHAUL.md) - Design system

---

## ✅ Summary

Fitur **Vehicle Showcase** berhasil menampilkan:

✅ **5 Kendaraan Premium** dengan 360° view aktif  
✅ **Auto-Generate** dari 4 foto yang diupload  
✅ **Background Garasi Mewah** yang konsisten  
✅ **Interactive Controls** (drag, pause, rotate)  
✅ **Responsive Design** untuk semua devices  
✅ **Performance Optimized** dengan lazy loading  
✅ **Neumorphic Design** yang refined  

**Status**: ✅ Production Ready  
**Build**: ✅ Success (427.82 kB gzip: 118.73 kB)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Author**: Renmoku Tech Team
