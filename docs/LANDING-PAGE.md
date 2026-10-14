# 🏠 Landing Page - Renmoku

## Overview

Landing page baru dengan desain gradient hitam-ungu, partikel dinamis, dan layout yang lebih fokus sesuai wireframe terbaru.

---

## 🎨 Desain Baru

### Hero Section
- **Background**: Gradient hitam → ungu gelap (`bg-gradient-dark-purple`)
- **Partikel**: 50 partikel cahaya bergerak dinamis dengan animasi random
- **Mobil**: Gambar mobil mewah dengan animasi reveal + parallax effect
- **Sparkles**: 8 sparkles animasi di sekitar mobil
- **Glow Effects**: 2 glow orbs (purple & gold) dengan pulse animation
- **Tagline**: "Rasakan Kemewahan di Setiap Perjalanan"
  - Font: Playfair Display
  - Size: 64px (lg:7xl)
  - Color: Gold gradient
- **Search Bar**: Compact dengan 4 kolom (Lokasi, Tanggal, Tipe, Search)

### Mobil Populer Section
- **Grid**: 4 kolom (responsive: 1/2/4)
- **Mobil**:
  1. Toyota Avanza - Rp 350k/hari
  2. Honda HR-V - Rp 450k/hari
  3. BMW X5 - Rp 2.5jt/hari
  4. Mercedes S-Class - Rp 3.5jt/hari
- **Card Design**: Card luxury dengan hover lift effect
- **Rating Badge**: Glass morphism badge di pojok kanan atas

---

## 🎬 Animasi

### Partikel Dinamis
```tsx
{Array.from({ length: 50 }).map((_, i) => (
  <motion.div
    className="absolute w-1 h-1 bg-gold-400/30 rounded-full"
    animate={{
      x: [random, random, random],
      y: [random, random, random],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 10 + Math.random() * 10,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
))}
```

### Parallax Mouse Effect
```tsx
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);

// Apply to car image
<motion.div
  animate={{ x: mousePosition.x * 0.5 }}
>
```

### Car Reveal Animation
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8, y: 50 }}
  animate={{ 
    opacity: 1, 
    scale: 1, 
    y: 0,
    x: mousePosition.x * 0.5,
  }}
  transition={{ 
    duration: 1.2,
    ease: [0.22, 1, 0.36, 1],
  }}
>
```

### Floating Car
```tsx
<motion.img
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Sparkles Around Car
```tsx
{Array.from({ length: 8 }).map((_, i) => (
  <motion.div
    className="absolute w-2 h-2 bg-gold-400 rounded-full"
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: i * 0.3,
    }}
  />
))}
```

### Glow Orbs
```tsx
<motion.div
  className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.5, 0.3],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

---

## 🎯 Search Bar

### Layout
```tsx
<div className="glass rounded-2xl p-2 border border-gold-500/10">
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
    {/* Location */}
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
      <input type="text" placeholder="Lokasi" className="input-luxury pl-10 py-3 rounded-xl w-full" />
    </div>

    {/* Date */}
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
      <input type="date" className="input-luxury pl-10 py-3 rounded-xl w-full [color-scheme:dark]" />
    </div>

    {/* Car Type */}
    <div className="relative">
      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
      <select className="input-luxury pl-10 py-3 rounded-xl w-full appearance-none cursor-pointer">
        <option value="">Tipe Mobil</option>
        <option value="suv">SUV</option>
        <option value="sedan">Sedan</option>
        <option value="mpv">MPV</option>
        <option value="sport">Sport</option>
      </select>
    </div>

    {/* Search Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="btn-luxury py-3 rounded-xl flex items-center justify-center gap-2"
    >
      <Search className="w-5 h-5" />
      <span className="font-semibold">Cari</span>
    </motion.button>
  </div>
</div>
```

---

## 🚗 Popular Cars Section

### Data Structure
```typescript
const popularCars = [
  {
    name: 'Toyota Avanza',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=800&q=80',
    rating: 4.8,
  },
  {
    name: 'Honda HR-V',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    rating: 4.9,
  },
  {
    name: 'BMW X5',
    price: 2500000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    rating: 5.0,
  },
  {
    name: 'Mercedes S-Class',
    price: 3500000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    rating: 5.0,
  },
];
```

### Card Component
```tsx
<motion.div
  whileHover={{ y: -8 }}
  className="card-luxury rounded-2xl overflow-hidden group cursor-pointer"
>
  {/* Car Image */}
  <div className="relative h-48 overflow-hidden">
    <motion.img
      src={car.image}
      alt={car.name}
      className="w-full h-full object-cover"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.4 }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent" />
    
    {/* Rating Badge */}
    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg glass">
      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
      <span className="text-xs text-white font-medium">{car.rating}</span>
    </div>
  </div>

  {/* Car Info */}
  <div className="p-5">
    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-gold-300 transition-colors">
      {car.name}
    </h3>
    <div className="flex items-baseline gap-1">
      <span className="text-gold-gradient font-bold text-xl">
        Rp {(car.price / 1000).toFixed(0)}k
      </span>
      <span className="text-xs text-gray-500">/hari</span>
    </div>
  </div>
</motion.div>
```

---

## 🎨 Custom CSS

### Gradient Background
```css
.bg-gradient-dark-purple {
  background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0f0520 100%);
}
```

**Color Stops:**
- `#0a0a0f` - Luxury 900 (hitam)
- `#1a0a2e` - Ungu gelap
- `#0f0520` - Ungu sangat gelap

---

## 📊 Sections

### 1. Hero Section
- Full screen height
- Gradient dark purple background
- 50 animated particles
- 2 glow orbs (purple & gold)
- Car image with reveal animation + parallax
- 8 sparkles around car
- Tagline: "Rasakan Kemewahan di Setiap Perjalanan"
- Subtitle
- Search bar (4 kolom)
- Scroll indicator

### 2. Popular Cars Section
- Background: luxury-950
- Header: "Mobil Populer"
- Grid 4 kolom (responsive)
- 4 car cards
- "Lihat Semua Armada" button

### 3. Features Section
- Background: gradient-luxury
- Header: "Mengapa Renmoku?"
- Grid 3 kolom
- 6 feature cards:
  1. Asuransi Lengkap
  2. Proses Cepat
  3. Kendaraan Premium
  4. Driver Profesional
  5. Pembayaran Fleksibel
  6. E-Contract Digital

### 4. CTA Section
- Card luxury
- Radial gold background
- Sparkles icon
- "Siap Bergabung?"
- "Daftar Sekarang - Gratis" button

### 5. Footer
- Border top
- Logo + brand name
- Copyright

---

## 🎯 Interactions

### Mouse Parallax
- Car image bergerak mengikuti mouse
- Intensity: 50% dari mouse position
- Smooth transition

### Hover Effects
- Car cards: lift up 8px
- Images: scale 1.1
- Buttons: scale 1.05
- Feature cards: lift up 6px

### Click Effects
- Buttons: scale 0.95
- Car cards: navigate to detail page

---

## 📱 Responsive Design

### Mobile (< 640px)
- Search bar: 1 kolom (stacked)
- Popular cars: 1 kolom
- Features: 1 kolom

### Tablet (640px - 1024px)
- Search bar: 2 kolom
- Popular cars: 2 kolom
- Features: 2 kolom

### Desktop (> 1024px)
- Search bar: 4 kolom
- Popular cars: 4 kolom
- Features: 3 kolom

---

## 🚀 Performance

### Optimizations
- ✅ Lazy loading untuk images
- ✅ GPU-accelerated animations
- ✅ Minimal re-renders
- ✅ Optimized particle count (50)

### Bundle Size
- **CSS**: 76.59 kB (gzip: 12.19 kB)
- **JS**: 458.31 kB (gzip: 123.75 kB)
- **Total**: ~136 kB gzipped

---

## ✅ Checklist

### Hero Section
- [x] Gradient dark purple background
- [x] 50 animated particles
- [x] 2 glow orbs (purple & gold)
- [x] Car image dengan reveal animation
- [x] Parallax mouse effect
- [x] 8 sparkles around car
- [x] Floating car animation
- [x] Tagline: "Rasakan Kemewahan di Setiap Perjalanan"
- [x] Subtitle
- [x] Search bar (4 kolom)
- [x] Scroll indicator

### Popular Cars Section
- [x] Header: "Mobil Populer"
- [x] Grid 4 kolom (responsive)
- [x] 4 car cards (Avanza, HR-V, X5, S-Class)
- [x] Rating badge
- [x] Price display
- [x] Hover effects
- [x] "Lihat Semua Armada" button

### Features Section
- [x] Header: "Mengapa Renmoku?"
- [x] 6 feature cards
- [x] Icons
- [x] Hover effects

### CTA Section
- [x] Card luxury
- [x] Radial gold background
- [x] Sparkles icon
- [x] "Siap Bergabung?"
- [x] "Daftar Sekarang - Gratis" button

### Footer
- [x] Logo + brand name
- [x] Copyright

---

## 📚 Related Documentation

- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [VEHICLE-SHOWCASE.md](./VEHICLE-SHOWCASE.md) - 360° showcase
- [OWNER-DASHBOARD.md](./OWNER-DASHBOARD.md) - Owner dashboard
- [UI-UX-OVERHAUL.md](./UI-UX-OVERHAUL.md) - Design system

---

## 🎉 Summary

**Status**: ✅ Complete

Landing page baru berhasil diimplementasikan dengan:

✅ **Hero Section** - Gradient hitam-ungu, partikel dinamis, parallax effect  
✅ **Popular Cars** - 4 mobil populer (Avanza, HR-V, X5, S-Class)  
✅ **Features Section** - 6 keunggulan Renmoku  
✅ **CTA Section** - Call-to-action yang menarik  
✅ **Responsive Design** - Mobile-first dengan breakpoints  
✅ **Animations** - Smooth dan purposeful  

**Build Status**: ✅ Success (458.31 kB gzip: 123.75 kB)

---

**Last Updated**: 2025-01-15  
**Version**: 2.0.0  
**Author**: Renmoku Tech Team
