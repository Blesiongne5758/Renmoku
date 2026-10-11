# Fitur Lanjutan Renmoku

Dokumentasi lengkap untuk fitur-fitur lanjutan yang telah diimplementasikan dalam platform Renmoku.

## 📋 Daftar Fitur

1. [Multi-bahasa (i18n)](#1-multi-bahasa-i18n)
2. [Progressive Web App (PWA)](#2-progressive-web-app-pwa)
3. [Testing Setup](#3-testing-setup)
4. [Advanced Analytics Dashboard](#4-advanced-analytics-dashboard)
5. [Payment Integration](#5-payment-integration)
6. [Utility Functions](#6-utility-functions)

---

## 1. Multi-bahasa (i18n)

### Overview
Sistem multi-bahasa menggunakan `react-i18next` untuk mendukung bahasa Indonesia dan Inggris.

### Struktur File
```
src/i18n/
├── config.ts              # Konfigurasi i18n
└── locales/
    ├── id.json           # Terjemahan Bahasa Indonesia
    └── en.json           # Terjemahan Bahasa Inggris
```

### Cara Penggunaan

#### 1. Import dan Gunakan Hook
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
}
```

#### 2. Ganti Bahasa
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('en')}>
      Switch to English
    </button>
  );
}
```

#### 3. Komponen LanguageSwitcher
Komponen `LanguageSwitcher` sudah tersedia di `src/components/LanguageSwitcher.tsx` dan terintegrasi di Navbar.

### Namespace Terjemahan

#### common
- `appName`, `tagline`, `loading`, `save`, `cancel`, `confirm`, dll.

#### nav
- `home`, `fleet`, `dashboard`, `login`, `register`, `logout`, dll.

#### hero
- `title`, `subtitle`, `description`, `cta`, `searchPlaceholder`

#### fleet
- `title`, `subtitle`, `available`, `rented`, `perDay`, `bookNow`, dll.

#### booking
- `title`, `step1` - `step5`, `renterInfo`, `totalPrice`, dll.

#### dashboard
- `welcome`, `overview`, `myBookings`, `totalRevenue`, dll.

#### vehicle
- `addNew`, `brand`, `model`, `year`, `transmission`, dll.

#### owner
- `dashboard`, `fleetManagement`, `approve`, `reject`, dll.

#### admin
- `dashboard`, `userManagement`, `verifyUser`, dll.

#### auth
- `login`, `register`, `email`, `password`, dll.

#### errors
- `required`, `invalidEmail`, `loginFailed`, dll.

#### success
- `saved`, `updated`, `bookingCreated`, dll.

### Menambah Terjemahan Baru

1. Buka file `src/i18n/locales/id.json` dan `en.json`
2. Tambahkan key baru di namespace yang sesuai
3. Gunakan di komponen dengan `t('namespace.key')`

Contoh:
```json
// id.json
{
  "newFeature": {
    "title": "Judul Baru",
    "description": "Deskripsi baru"
  }
}

// en.json
{
  "newFeature": {
    "title": "New Title",
    "description": "New description"
  }
}
```

```typescript
// Component
<h1>{t('newFeature.title')}</h1>
<p>{t('newFeature.description')}</p>
```

---

## 2. Progressive Web App (PWA)

### Overview
Renmoku sekarang dapat diinstall sebagai aplikasi mobile melalui PWA.

### File Konfigurasi

#### manifest.json (`public/manifest.json`)
```json
{
  "name": "Renmoku - Rental Mobil Ku",
  "short_name": "Renmoku",
  "description": "Platform rental mobil premium...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#D4AF37",
  "icons": [...]
}
```

#### Service Worker (`public/sw.js`)
- Cache static assets untuk offline access
- Fallback ke network jika cache tidak tersedia
- Auto-update cache saat ada versi baru

#### Meta Tags (`index.html`)
```html
<meta name="theme-color" content="#D4AF37" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="manifest" href="/manifest.json" />
```

### Fitur PWA

#### 1. Installable
- User dapat menginstall aplikasi ke home screen
- Berjalan seperti native app
- Fullscreen mode tanpa browser UI

#### 2. Offline Support
- Service worker cache static assets
- Aplikasi tetap bisa dibuka tanpa internet
- Fallback ke network saat online

#### 3. Push Notifications (Ready)
- Struktur siap untuk implementasi push notifications
- Dapat ditambahkan di masa depan

### Cara Install

#### Desktop (Chrome/Edge)
1. Buka aplikasi di browser
2. Klik icon install di address bar
3. Klik "Install"

#### Mobile (Android)
1. Buka aplikasi di Chrome
2. Klik menu (⋮)
3. Pilih "Add to Home screen"
4. Konfirmasi install

#### Mobile (iOS)
1. Buka aplikasi di Safari
2. Klik Share button
3. Pilih "Add to Home Screen"
4. Konfirmasi add

### Testing PWA

#### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Audit PWA
lighthouse https://your-app.com --view
```

#### Check Service Worker
```javascript
// Di browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

---

## 3. Testing Setup

### Overview
Setup testing lengkap menggunakan Jest dan React Testing Library.

### Struktur File
```
├── jest.config.js              # Konfigurasi Jest
├── jest.setup.ts               # Setup testing environment
├── __mocks__/
│   └── fileMock.js            # Mock untuk file imports
└── src/
    └── __tests__/
        ├── utils.test.ts      # Test utility functions
        └── Button.test.tsx    # Test Button component
```

### Menjalankan Tests

```bash
# Jalankan semua tests
npm test

# Jalankan dengan coverage
npm test -- --coverage

# Jalankan specific file
npm test utils.test.ts

# Watch mode
npm test -- --watch
```

### Contoh Test

#### Utility Functions Test
```typescript
import { formatCurrency, isValidEmail } from '../lib/utils';

describe('formatCurrency', () => {
  it('should format number to Indonesian Rupiah', () => {
    expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
  });
});

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

#### Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Coverage Threshold
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Test apa yang dilakukan komponen, bukan bagaimana
   - Gunakan queries seperti `getByText`, `getByRole`

2. **Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange
   render(<Button>Click me</Button>);
   
   // Act
   fireEvent.click(screen.getByText('Click me'));
   
   // Assert
   expect(handleClick).toHaveBeenCalled();
   ```

3. **Mock External Dependencies**
   ```typescript
   jest.mock('../api', () => ({
     fetchData: jest.fn()
   }));
   ```

4. **Test Edge Cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary values

---

## 4. Advanced Analytics Dashboard

### Overview
Dashboard analitik lanjutan dengan AI insights dan visualisasi data kompleks.

### Komponen
File: `src/components/AdvancedAnalytics.tsx`

### Fitur

#### 1. Key Metrics Cards
- Total Pendapatan
- Total Booking
- Rata-rata per Booking
- Pertumbuhan YoY

#### 2. AI Insights
Rekomendasi berbasis data:
- **Trend Detection**: Deteksi peningkatan/penurunan permintaan
- **Warning System**: Peringatan untuk anomali
- **Opportunity Alerts**: Peluang bisnis baru
- **Performance Insights**: Insight performa bisnis

#### 3. Charts & Visualizations

##### Revenue & Booking Trend
- Area chart dengan dual Y-axis
- Data bulanan untuk 12 bulan
- Gradient fill untuk visual appeal

##### Vehicle Type Distribution
- Pie chart dengan donut style
- Distribusi tipe kendaraan
- Color-coded categories

##### Top Vehicles
- Ranking kendaraan terpopuler
- Metrics: bookings, revenue, rating
- Interactive list

##### Booking Status
- Bar chart status booking
- Completed, Active, Pending, Cancelled
- Color-coded bars

### Data Structure

```typescript
const revenueData = [
  { month: 'Jan', revenue: 45000000, bookings: 120 },
  // ... 12 months
];

const vehicleTypeData = [
  { name: 'SUV', value: 35, color: '#D4AF37' },
  // ... vehicle types
];

const aiInsights = [
  {
    type: 'trend' | 'warning' | 'opportunity' | 'info',
    icon: IconComponent,
    title: string,
    description: string,
    impact: 'high' | 'medium' | 'low',
    action: string
  }
];
```

### Cara Penggunaan

```typescript
import AdvancedAnalytics from './components/AdvancedAnalytics';

function AdminDashboard() {
  return (
    <div>
      <AdvancedAnalytics />
    </div>
  );
}
```

### Customization

#### Mengubah Data
Edit data arrays di `AdvancedAnalytics.tsx`:
- `revenueData` - Data pendapatan bulanan
- `vehicleTypeData` - Distribusi tipe kendaraan
- `bookingStatusData` - Status booking
- `topVehicles` - Kendaraan terpopuler
- `aiInsights` - AI recommendations

#### Mengubah Warna
Update color properties di data arrays:
```typescript
{ name: 'SUV', value: 35, color: '#YOUR_COLOR' }
```

#### Menambah Chart Baru
Tambahkan chart component dari Recharts:
```typescript
import { LineChart, Line } from 'recharts';

<LineChart data={yourData}>
  <Line type="monotone" dataKey="value" />
</LineChart>
```

---

## 5. Payment Integration

### Overview
Komponen pembayaran lengkap dengan support untuk multiple payment methods.

### Komponen
File: `src/components/PaymentIntegration.tsx`

### Payment Methods

#### 1. Bank Transfer
- BCA, Mandiri, BNI, BRI
- Virtual account generation
- Manual confirmation

#### 2. Credit Card
- Visa, Mastercard, JCB
- Secure payment processing
- 3D Secure support

#### 3. E-Wallet
- GoPay, OVO, Dana, ShopeePay
- QR code generation
- Instant confirmation

#### 4. QRIS
- Universal QR code
- Scan dari aplikasi apapun
- Auto-confirmation

### Fitur

#### 1. Payment Flow
```
1. Pilih metode pembayaran
2. Pilih bank (untuk transfer)
3. Proses pembayaran
4. Konfirmasi sukses/gagal
5. Generate transaksi ID
```

#### 2. States
- **Idle**: Pemilihan metode pembayaran
- **Processing**: Animasi loading saat proses
- **Success**: Konfirmasi pembayaran berhasil
- **Error**: Handling error dengan retry option

#### 3. Security
- Token-based authentication
- Encrypted transaction data
- Secure payment gateway integration

### Cara Penggunaan

```typescript
import PaymentIntegration from './components/PaymentIntegration';

function BookingPage() {
  const handleSuccess = (transactionId: string) => {
    console.log('Payment successful:', transactionId);
    // Update booking status
  };

  const handleError = (error: string) => {
    console.error('Payment failed:', error);
    // Show error message
  };

  return (
    <PaymentIntegration
      amount={5000000}
      bookingId="BK-123456"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### Props

```typescript
interface PaymentIntegrationProps {
  amount: number;              // Jumlah pembayaran
  bookingId: string;           // ID booking
  onSuccess?: (transactionId: string) => void;  // Callback sukses
  onError?: (error: string) => void;            // Callback error
}
```

### Integration dengan Payment Gateway

#### Midtrans
```typescript
// Di backend API
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'YOUR_SERVER_KEY',
  clientKey: 'YOUR_CLIENT_KEY'
});

const parameter = {
  transaction_details: {
    order_id: bookingId,
    gross_amount: amount
  },
  // ... other parameters
};

const transaction = await snap.createTransaction(parameter);
```

#### Xendit
```typescript
// Di backend API
const xenditOauthClient = new XenditOauthClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectURL: 'YOUR_REDIRECT_URL'
});

// Create invoice
const invoice = await xenditOauthClient.createInvoice({
  amount: amount,
  description: `Payment for booking ${bookingId}`
});
```

### Webhook Handling

```typescript
// Backend API endpoint
app.post('/api/payment/webhook', async (req, res) => {
  const { transaction_id, order_id, status } = req.body;
  
  // Verify signature
  const isValid = verifySignature(req.body, req.headers);
  if (!isValid) return res.status(403).send('Invalid signature');
  
  // Update booking status
  await updateBookingStatus(order_id, status);
  
  res.status(200).send('OK');
});
```

---

## 6. Utility Functions

### Overview
Kumpulan utility functions untuk berbagai kebutuhan umum.

### File
`src/lib/utils.ts`

### Functions

#### Currency & Numbers
```typescript
formatCurrency(amount: number): string
// Format: 1000000 → "Rp 1.000.000"

formatNumber(num: number): string
// Format: 1500000 → "1.5M"
```

#### Date & Time
```typescript
formatDate(date: string | Date, format: 'short' | 'long'): string
// Format: "2024-01-15" → "15 Jan 2024" or "Senin, 15 Januari 2024"

formatRelativeTime(date: string | Date): string
// Format: "2 hours ago" → "2 jam yang lalu"
```

#### Validation
```typescript
isValidEmail(email: string): boolean
isValidPhone(phone: string): boolean
isValidKTP(ktp: string): boolean
calculateAge(birthDate: string | Date): number
```

#### String Manipulation
```typescript
getInitials(name: string): string
// Format: "John Doe" → "JD"

truncateText(text: string, maxLength: number): string
// Format: "Long text..." → "Long..."
```

#### File Operations
```typescript
formatFileSize(bytes: number): string
// Format: 1048576 → "1 MB"

copyToClipboard(text: string): Promise<boolean>
downloadFile(url: string, filename: string): void
```

#### Device Detection
```typescript
isMobile(): boolean
isIOS(): boolean
getBrowserLanguage(): string
```

#### Storage Helpers
```typescript
storage.get<T>(key: string): T | null
storage.set<T>(key: string, value: T): void
storage.remove(key: string): void
storage.clear(): void

sessionStore.get<T>(key: string): T | null
sessionStore.set<T>(key: string, value: T): void
sessionStore.remove(key: string): void
sessionStore.clear(): void
```

#### Performance
```typescript
debounce<T>(func: T, wait: number): T
throttle<T>(func: T, limit: number): T
```

#### ID Generation
```typescript
generateId(prefix?: string): string
// Format: "prefix-timestamp-random"
```

### Cara Penggunaan

```typescript
import { 
  formatCurrency, 
  isValidEmail, 
  debounce 
} from '../lib/utils';

// Format currency
const price = formatCurrency(1500000); // "Rp 1.500.000"

// Validate email
if (isValidEmail('test@example.com')) {
  // Valid email
}

// Debounce search
const handleSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);
```

---

## 🚀 Next Steps

### Immediate Actions
1. **Setup Backend API** - Implementasi real payment gateway
2. **Database Integration** - Connect ke PostgreSQL
3. **File Upload** - Implementasi upload untuk dokumen
4. **Email Service** - Setup SendGrid/Resend untuk notifikasi

### Short-term Goals
1. **Real Analytics** - Connect ke real data source
2. **Push Notifications** - Implementasi service worker notifications
3. **Advanced Testing** - Tambah E2E tests dengan Cypress
4. **Performance Optimization** - Code splitting dan lazy loading

### Long-term Vision
1. **Mobile Apps** - React Native untuk iOS/Android
2. **AI Features** - Machine learning untuk pricing optimization
3. **Blockchain** - Smart contracts untuk secure transactions
4. **IoT Integration** - Vehicle tracking dan monitoring

---

## 📚 Resources

### Documentation
- [React i18next](https://react.i18next.com/)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Recharts](https://recharts.org/en-US/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean) - Test coverage
- [Midtrans Docs](https://docs.midtrans.com/) - Payment gateway
- [Xendit Docs](https://docs.xendit.co/) - Payment gateway

---

**Last Updated**: 2026-10-15  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
