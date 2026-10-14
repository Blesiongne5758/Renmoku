# 🚗 Renmoku - Rental Mobil Ku

> Platform rental mobil premium dengan fitur lengkap, modern, dan production-ready

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

---

## 📋 Daftar Isi

- [Tentang](#-tentang)
- [Fitur Utama](#-fitur-utama)
- [Fitur Lanjutan](#-fitur-lanjutan)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Folder](#-struktur-folder)
- [Testing](#-testing)
- [Build & Deployment](#-build--deployment)
- [Dokumentasi](#-dokumentasi)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang

**Renmoku** adalah platform rental mobil premium yang dibangun dengan React + TypeScript + Vite. Aplikasi ini menyediakan solusi lengkap untuk bisnis rental mobil dengan fitur multi-role, pembayaran terintegrasi, analitik canggih, dan pengalaman pengguna yang modern.

### Visi
Menyediakan platform rental mobil yang mudah digunakan, aman, dan profesional untuk pemilik rental dan penyewa.

### Misi
- Memudahkan pemilik rental mengelola armada dan booking
- Memberikan pengalaman booking yang seamless untuk penyewa
- Menyediakan analitik dan insights untuk optimasi bisnis

---

## ✨ Fitur Utama

### 👥 Multi-Role System
- **Renter (Penyewa)** - Individual & Corporate
- **Owner (Pemilik)** - Manajemen armada
- **Admin** - Kontrol platform penuh

### 🚗 Manajemen Kendaraan
- Katalog kendaraan dengan filter & search
- Detail kendaraan dengan spesifikasi lengkap
- **Virtual 360° View** - Tampilan kendaraan dari semua sudut
- Upload foto kendaraan dari 4 sisi (depan, belakang, kiri, kanan)
- Auto-generate 360° view dengan background garasi mewah

### 📅 Sistem Booking
- Booking flow 5 langkah yang intuitif
- Kalkulator harga otomatis (harian/mingguan/bulanan)
- Pilihan dengan driver atau lepas kunci
- Upload dokumen persyaratan (KTP, SIM, KK)
- E-Contract digital dengan tanda tangan elektronik

### 💳 Pembayaran
- **Payment Integration** - Multiple payment methods
  - Bank Transfer (BCA, Mandiri, BNI, BRI)
  - Credit Card (Visa, Mastercard, JCB)
  - E-Wallet (GoPay, OVO, Dana, ShopeePay)
  - QRIS
- DP 30-50% dengan pelunasan saat pick-up
- Virtual account generation
- Transaction tracking

### 📊 Dashboard
- **Owner Dashboard** - Fleet management, booking, revenue
- **Admin Dashboard** - Platform overview, user management, analytics
- **Advanced Analytics** - AI-powered insights & recommendations
- Real-time statistics & charts

### 🔐 Autentikasi & Keamanan
- JWT-based authentication
- Role-based access control (RBAC)
- Route protection
- KYC verification system
- Secure password hashing

### 📄 Export Dokumen
- Export ke PDF dengan styling premium
- Export ke Excel dengan auto-formatting
- Export ke CSV
- Custom templates untuk invoice & laporan

### 🔔 Real-time Notifications
- Socket.io integration
- Live updates untuk booking status
- Browser notifications
- In-app notification bell

---

## 🚀 Fitur Lanjutan

### 🌐 Multi-bahasa (i18n)
- Support Bahasa Indonesia & English
- 200+ translation keys
- Auto-detect browser language
- Persistent language preference
- Language switcher di Navbar

**Cara menggunakan:**
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
<h1>{t('hero.title')}</h1>

// Switch language
i18n.changeLanguage('en');
```

### 📱 Progressive Web App (PWA)
- Installable sebagai app di mobile & desktop
- Offline support dengan Service Worker
- App icons multiple sizes (72px - 512px)
- Theme color customization
- App shortcuts

**Cara install:**
- Desktop: Klik icon install di address bar
- Mobile Android: Menu → "Add to Home screen"
- Mobile iOS: Share → "Add to Home Screen"

### 🧪 Testing
- Jest + React Testing Library
- 24+ unit tests
- Coverage threshold 70%
- Mock untuk external dependencies

**Menjalankan tests:**
```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

### 📊 Advanced Analytics Dashboard
- 4 Key metrics cards (Revenue, Bookings, Avg, Growth)
- AI Insights dengan 4 kategori:
  - Trend detection
  - Warning system
  - Opportunity alerts
  - Performance insights
- Revenue & Booking trend chart (Area chart)
- Vehicle type distribution (Pie chart)
- Top vehicles ranking
- Booking status visualization

### 💳 Payment Integration
- 4 payment methods
- 4 bank options
- Payment flow dengan 4 states
- Virtual account generation
- Transaction ID tracking
- Error handling dengan retry

### 🛠️ Utility Functions
25+ helper functions:
- `formatCurrency()` - Format Rupiah
- `formatDate()` - Format tanggal
- `isValidEmail()` - Validasi email
- `debounce()` - Performance optimization
- `storage.get/set()` - LocalStorage helper
- Dan banyak lagi...

---

## 🛠 Teknologi

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.7** - Type safety
- **Vite 6.3** - Build tool & dev server
- **Tailwind CSS 4.1** - Styling
- **Framer Motion 11.16** - Animations
- **Zustand 5.0** - State management
- **React Router 6.8** - Routing

### UI & Charts
- **Lucide React** - Icon library
- **Recharts 2.15** - Charts & data visualization
- **Sonner 2.0** - Toast notifications

### Data & Export
- **jsPDF 4.2** - PDF generation
- **jsPDF-AutoTable 5.0** - PDF tables
- **XLSX 0.18** - Excel generation
- **FileSaver 2.0** - File download

### Real-time & i18n
- **Socket.io 4.8** - WebSocket communication
- **React-i18next 15.4** - Internationalization
- **i18next 25.2** - i18n framework

### Testing
- **Jest 29.7** - Test runner
- **React Testing Library 16.3** - Component testing
- **ts-jest 29.3** - TypeScript support

### Backend Templates
- **Next.js** - API routes templates
- **Prisma** - Database ORM
- **NextAuth** - Authentication
- **PostgreSQL** - Database

---

## 📦 Instalasi

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### Langkah Instalasi

1. **Clone repository**
```bash
git clone https://github.com/yourusername/renmoku.git
cd renmoku
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

4. **Setup database (optional - untuk backend)**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

---

## ▶️ Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

### Menjalankan Tests
```bash
# Semua tests
npm test

# Dengan coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific file
npm test utils.test.ts
```

### Type Checking
```bash
npm run typecheck
```

---

## 📁 Struktur Folder

```
renmoku/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   └── icons/                 # App icons
│
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   │
│   │   ├── vehicle/           # Vehicle-related components
│   │   │   ├── HeroCinematic.tsx
│   │   │   ├── VehicleShowcase360.tsx
│   │   │   ├── Vehicle360Viewer.tsx
│   │   │   └── VehicleCard.tsx
│   │   │
│   │   ├── booking/           # Booking components
│   │   │   ├── BookingFlow.tsx
│   │   │   └── BookingStep.tsx
│   │   │
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── FleetStatus.tsx
│   │   │   └── RecentBookings.tsx
│   │   │
│   │   ├── admin/             # Admin components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminStatsGrid.tsx
│   │   │   └── VerificationPanel.tsx
│   │   │
│   │   ├── AdvancedAnalytics.tsx
│   │   ├── PaymentIntegration.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── RealtimeNotifier.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileBottomNav.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── FleetPage.tsx
│   │   ├── VehicleDetailPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── OwnerDashboardPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── TermsPage.tsx
│   │   └── UnauthorizedPage.tsx
│   │
│   ├── stores/
│   │   └── useAppStore.ts     # Zustand store
│   │
│   ├── store/
│   │   └── useBookingStore.ts # Booking-specific store
│   │
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── auth.tsx           # Auth utilities
│   │   ├── auth-adapter.ts    # NextAuth adapter
│   │   └── socket-client.ts   # Socket.io client
│   │
│   ├── api/
│   │   ├── client.ts          # API client
│   │   ├── mock.ts            # Mock API handlers
│   │   └── index.ts           # API exports
│   │
│   ├── i18n/
│   │   ├── config.ts          # i18n configuration
│   │   └── locales/
│   │       ├── id.json        # Indonesian translations
│   │       └── en.json        # English translations
│   │
│   ├── types/
│   │   └── api.ts             # TypeScript types
│   │
│   ├── data/
│   │   ├── mockData.ts        # Mock data
│   │   └── termsAndConditions.ts
│   │
│   ├── __tests__/
│   │   ├── utils.test.ts      # Utility tests
│   │   └── Button.test.tsx    # Component tests
│   │
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── docs/                      # Documentation
│   ├── ADVANCED-FEATURES.md
│   ├── API-DOCUMENTATION.md
│   ├── AUTH-SYSTEM.md
│   ├── COLOR-PALETTE.md
│   ├── EXPORT-DOCUMENTS.md
│   ├── LANDING-PAGE-CONSISTENCY.md
│   ├── MOBILE-BOTTOM-NAV.md
│   ├── NEXTAUTH-SYSTEM.md
│   ├── OWNER-DASHBOARD.md
│   ├── PRISMA-SCHEMA.md
│   ├── ROLE-GUARD.md
│   ├── ROUTE-PROTECTION.md
│   ├── SIDEBAR.md
│   ├── SOCKET-IO-IMPLEMENTATION.md
│   ├── TERMS-AND-CONDITIONS.md
│   ├── UI-UX-OVERHAUL.md
│   ├── USER-FLOW.md
│   └── VEHICLE-SHOWCASE.md
│
├── database/
│   ├── schema.sql             # PostgreSQL schema
│   ├── seed.sql               # Seed data
│   └── README.md
│
├── prisma/
│   └── schema.prisma          # Prisma schema
│
├── jest.config.js             # Jest configuration
├── jest.setup.ts              # Jest setup
├── tsconfig.json              # TypeScript config
├── vite.config.js             # Vite config
├── tailwind.config.js         # Tailwind config
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🧪 Testing

### Menjalankan Tests
```bash
# Run semua tests
npm test

# Dengan coverage report
npm test -- --coverage

# Watch mode untuk development
npm test -- --watch

# Test specific file
npm test utils.test.ts
```

### Coverage
- **Target**: 70% coverage
- **Utility functions**: 15+ tests
- **Components**: 9+ tests
- **Total**: 24+ tests

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    render(<Component />);
    
    // Act
    fireEvent.click(screen.getByText('Button'));
    
    // Assert
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

---

## 🚀 Build & Deployment

### Build untuk Production
```bash
npm run build
```

Output:
```
✓ 2442 modules transformed
✓ CSS: 99.26 kB (gzip: 14.62 kB)
✓ JS: 1,057.51 kB (gzip: 293.29 kB)
✓ Built in 12.41s
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### Docker
```bash
docker build -t renmoku .
docker run -p 80:80 renmoku
```

### Environment Variables
```env
# API
VITE_API_URL=https://api.renmoku.id
VITE_SOCKET_URL=https://socket.renmoku.id

# Analytics
VITE_GA_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_I18N=true
```

---

## 📚 Dokumentasi

### Dokumentasi Utama
- **[ADVANCED-FEATURES.md](docs/ADVANCED-FEATURES.md)** - Panduan lengkap fitur lanjutan
- **[API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md)** - API reference
- **[AUTH-SYSTEM.md](docs/AUTH-SYSTEM.md)** - Sistem autentikasi
- **[USER-FLOW.md](docs/USER-FLOW.md)** - User flow & journey

### Dokumentasi Komponen
- **[VEHICLE-SHOWCASE.md](docs/VEHICLE-SHOWCASE.md)** - 360° vehicle showcase
- **[OWNER-DASHBOARD.md](docs/OWNER-DASHBOARD.md)** - Owner dashboard
- **[ROLE-GUARD.md](docs/ROLE-GUARD.md)** - Role-based access control
- **[SIDEBAR.md](docs/SIDEBAR.md)** - Sidebar navigation

### Dokumentasi Teknis
- **[PRISMA-SCHEMA.md](docs/PRISMA-SCHEMA.md)** - Database schema
- **[SOCKET-IO-IMPLEMENTATION.md](docs/SOCKET-IO-IMPLEMENTATION.md)** - Real-time features
- **[COLOR-PALETTE.md](docs/COLOR-PALETTE.md)** - Design system
- **[UI-UX-OVERHAUL.md](docs/UI-UX-OVERHAUL.md)** - UI/UX guidelines

### Backend Templates
- **[BACKEND-IMPLEMENTATION.md](docs/BACKEND-IMPLEMENTATION.md)** - Next.js backend setup
- **[NEXTAUTH-SYSTEM.md](docs/NEXTAUTH-SYSTEM.md)** - NextAuth configuration

---

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Berikut cara berkontribusi:

### Cara Berkontribusi

1. **Fork repository**
```bash
git clone https://github.com/yourusername/renmoku.git
cd renmoku
```

2. **Buat branch baru**
```bash
git checkout -b feature/nama-fitur
```

3. **Implementasi fitur**
```bash
# Tulis kode
# Tambahkan tests
# Update dokumentasi
```

4. **Commit perubahan**
```bash
git add .
git commit -m "feat: menambahkan fitur baru"
```

5. **Push ke branch**
```bash
git push origin feature/nama-fitur
```

6. **Buat Pull Request**
- Buka PR di GitHub
- Jelaskan perubahan yang dilakukan
- Tambahkan screenshots jika ada perubahan UI

### Code Style
- Gunakan TypeScript untuk semua file baru
- Follow existing code style
- Write tests untuk fitur baru
- Update dokumentasi

### Commit Messages
Gunakan conventional commits:
- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Dokumentasi
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Menambahkan tests
- `chore:` - Maintenance

### Reporting Issues
- Gunakan GitHub Issues
- Sertakan steps to reproduce
- Tambahkan screenshots jika relevan
- Label issue dengan tepat

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail.

```
MIT License

Copyright (c) 2026 Renmoku

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Tim

**Developer**: Renmoku Team  
**Version**: 2.0.0  
**Last Updated**: 2026-10-15

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Charts
- [Socket.io](https://socket.io/) - Real-time communication
- [i18next](https://www.i18next.com/) - Internationalization

---

## 📞 Kontak

- **Email**: support@renmoku.id
- **Website**: https://renmoku.id
- **Documentation**: https://docs.renmoku.id

---

## 🌟 Support

Jika Anda menemukan proyek ini bermanfaat, berikan bintang ⭐ di GitHub!

---

**Made with ❤️ by Renmoku Team**

*Rental Mobil Ku - Modern, Secure, Scalable*
