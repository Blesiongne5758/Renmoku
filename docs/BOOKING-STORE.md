# 📦 useBookingStore - Zustand Booking State Management

## Overview

`useBookingStore` adalah Zustand store terpisah yang khusus mengelola state untuk proses booking kendaraan. Store ini menggantikan local state yang sebelumnya ada di `BookingFlow.tsx` untuk membuat state management lebih terstruktur, reusable, dan mudah di-test.

---

## 🎯 Tujuan

### Mengapa Store Terpisah?

1. **Separation of Concerns** - `useAppStore` untuk global state (auth, UI), `useBookingStore` untuk booking flow
2. **Reusability** - Store bisa digunakan di berbagai komponen (BookingFlow, SuccessPage, Dashboard)
3. **Testability** - Lebih mudah di-test secara unit
4. **Maintainability** - Logic booking terpusat di satu tempat
5. **Performance** - Hanya re-render komponen yang menggunakan state booking

---

## 📊 State Structure

```typescript
interface BookingState {
  // Step tracking
  currentStep: number;
  
  // Booking data
  vehicleId: string | null;
  durationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  withDriver: boolean;
  startDate: string | null;
  endDate: string | null;
  
  // Renter info
  renterInfo: {
    fullName: string;
    ktpNumber: string;
    simNumber: string;
    address: string;
    phone: string;
    email: string;
  };
  
  // Trip plan
  tripPlan: {
    origin: string;
    destination: string;
    purpose: string;
  };
  
  // Guarantee
  guaranteeType: 'KTP' | 'BPKB' | 'CASH' | 'GUARANTEE_LETTER' | null;
  guaranteeDocs: string[];
  
  // Pricing
  totalPrice: number;
  dpAmount: number;
}
```

---

## 🔧 Actions

### Step Management
```typescript
setCurrentStep: (step: number) => void
```
Mengatur step aktif dalam booking flow (1-5).

### Vehicle Selection
```typescript
setVehicle: (vehicleId: string) => void
```
Menyimpan ID kendaraan yang dipilih.

### Duration & Options
```typescript
setDuration: (
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY', 
  withDriver: boolean
) => void
```
Mengatur tipe durasi dan opsi driver.

### Date Selection
```typescript
setDates: (startDate: string, endDate: string) => void
```
Menyimpan tanggal mulai dan selesai sewa.

### Renter Information
```typescript
setRenterInfo: (info: Partial<BookingState['renterInfo']>) => void
```
Update informasi penyewa (partial update).

**Example:**
```typescript
setRenterInfo({ 
  fullName: 'John Doe',
  ktpNumber: '3174012345678901'
});
```

### Trip Plan
```typescript
setTripPlan: (plan: Partial<BookingState['tripPlan']>) => void
```
Update rencana perjalanan (partial update).

**Example:**
```typescript
setTripPlan({ 
  origin: 'Jakarta',
  destination: 'Bandung',
  purpose: 'wisata'
});
```

### Guarantee
```typescript
setGuarantee: (
  type: BookingState['guaranteeType'], 
  docs: string[]
) => void
```
Menyimpan jenis jaminan dan dokumen jaminan.

### Pricing Calculation
```typescript
calculatePricing: (
  dailyPrice: number, 
  weeklyPrice: number, 
  monthlyPrice: number
) => void
```
Menghitung total harga dan DP berdasarkan durasi dan opsi driver.

**Logic:**
```typescript
// Daily: days * dailyPrice
// Weekly: ceil(days / 7) * weeklyPrice
// Monthly: ceil(days / 30) * monthlyPrice

// Driver cost: withDriver ? days * 150000 : 0
// Total: basePrice + driverCost
// DP: total * 0.5 (50%)
```

### Reset
```typescript
reset: () => void
```
Reset semua state booking ke initial state.

---

## 💡 Penggunaan

### Di BookingFlow Component

```typescript
import { useBookingStore } from '../store/useBookingStore';

export default function BookingFlow() {
  const {
    currentStep,
    setCurrentStep,
    durationType,
    setDuration,
    withDriver,
    startDate,
    endDate,
    setDates,
    renterInfo,
    setRenterInfo,
    totalPrice,
    dpAmount,
    calculatePricing,
  } = useBookingStore();

  // Auto-calculate pricing when dates change
  useEffect(() => {
    if (selectedVehicle && durationType && startDate && endDate) {
      calculatePricing(
        selectedVehicle.pricePerDay,
        selectedVehicle.pricePerWeek,
        selectedVehicle.pricePerMonth
      );
    }
  }, [durationType, startDate, endDate, withDriver]);

  return (
    // ... component JSX
  );
}
```

### Di SuccessPage Component

```typescript
import { useBookingStore } from '../store/useBookingStore';

export default function SuccessPage() {
  const { totalPrice, dpAmount, renterInfo, tripPlan } = useBookingStore();

  return (
    <div>
      <h1>Booking Berhasil!</h1>
      <p>Total: {formatCurrency(totalPrice)}</p>
      <p>DP: {formatCurrency(dpAmount)}</p>
      <p>Nama: {renterInfo.fullName}</p>
      <p>Tujuan: {tripPlan.destination}</p>
    </div>
  );
}
```

### Reset After Booking

```typescript
import { useBookingStore } from '../store/useBookingStore';

export default function SuccessPage() {
  const { reset } = useBookingStore();

  useEffect(() => {
    // Reset booking state after 5 seconds
    const timer = setTimeout(() => {
      reset();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return <div>Success!</div>;
}
```

---

## 🔄 Workflow

### Step 1: Pilih Durasi & Opsi
```typescript
setDuration('WEEKLY', true);  // Mingguan dengan driver
setDates('2025-02-01', '2025-02-07');
// Auto-calculate: totalPrice, dpAmount
```

### Step 2: Data Penyewa
```typescript
setRenterInfo({
  fullName: 'John Doe',
  ktpNumber: '3174012345678901',
  simNumber: '12345678901234',
  address: 'Jl. Sudirman No. 123',
  phone: '+6281234567890',
  email: 'john@example.com',
});
```

### Step 3: Rencana Perjalanan
```typescript
setTripPlan({
  origin: 'Jakarta',
  destination: 'Bandung',
  purpose: 'wisata',
});
```

### Step 4: Jaminan & Pembayaran
```typescript
setGuarantee('KTP', ['ktp_scan.jpg']);
// paymentMethod disimpan di local state (UI-only)
```

### Step 5: Konfirmasi
```typescript
// agreeTerms disimpan di local state (UI-only)
// Submit booking ke API
```

---

## 📊 State vs Local State

### State di useBookingStore (Persistent)
- ✅ currentStep
- ✅ vehicleId
- ✅ durationType, withDriver
- ✅ startDate, endDate
- ✅ renterInfo
- ✅ tripPlan
- ✅ guaranteeType, guaranteeDocs
- ✅ totalPrice, dpAmount

**Alasan:** Data ini perlu persisten antar step dan bisa diakses di halaman lain (SuccessPage, Dashboard).

### State di Local Component (UI-only)
- ✅ uploadStatus (KTP, SIM, KK)
- ✅ paymentMethod
- ✅ agreeTerms

**Alasan:** Data ini hanya relevan di UI dan tidak perlu persisten.

---

## 🧪 Testing

### Unit Test Example

```typescript
import { useBookingStore } from './useBookingStore';

describe('useBookingStore', () => {
  beforeEach(() => {
    useBookingStore.getState().reset();
  });

  it('should set current step', () => {
    useBookingStore.getState().setCurrentStep(2);
    expect(useBookingStore.getState().currentStep).toBe(2);
  });

  it('should calculate pricing for daily rental', () => {
    const store = useBookingStore.getState();
    store.setDuration('DAILY', false);
    store.setDates('2025-02-01', '2025-02-03');
    store.calculatePricing(1000000, 6000000, 20000000);
    
    expect(store.totalPrice).toBe(2000000); // 2 days * 1M
    expect(store.dpAmount).toBe(1000000); // 50%
  });

  it('should calculate pricing with driver', () => {
    const store = useBookingStore.getState();
    store.setDuration('DAILY', true);
    store.setDates('2025-02-01', '2025-02-03');
    store.calculatePricing(1000000, 6000000, 20000000);
    
    expect(store.totalPrice).toBe(2300000); // 2M + (2 * 150K)
  });

  it('should update renter info partially', () => {
    const store = useBookingStore.getState();
    store.setRenterInfo({ fullName: 'John Doe' });
    
    expect(store.renterInfo.fullName).toBe('John Doe');
    expect(store.renterInfo.ktpNumber).toBe(''); // unchanged
  });

  it('should reset all state', () => {
    const store = useBookingStore.getState();
    store.setCurrentStep(3);
    store.setRenterInfo({ fullName: 'John' });
    
    store.reset();
    
    expect(store.currentStep).toBe(1);
    expect(store.renterInfo.fullName).toBe('');
  });
});
```

---

## 🎯 Best Practices

### 1. Gunakan Selector untuk Performance
```typescript
// ❌ Bad - Re-render semua state berubah
const store = useBookingStore();

// ✅ Good - Hanya re-render jika currentStep berubah
const currentStep = useBookingStore((state) => state.currentStep);

// ✅ Good - Multiple selectors
const { currentStep, totalPrice } = useBookingStore((state) => ({
  currentStep: state.currentStep,
  totalPrice: state.totalPrice,
}));
```

### 2. Reset State Setelah Booking
```typescript
// Di SuccessPage atau setelah submit berhasil
useEffect(() => {
  return () => {
    useBookingStore.getState().reset();
  };
}, []);
```

### 3. Validasi di Component, Bukan di Store
```typescript
// ✅ Good - Validasi di component
const handleNext = () => {
  if (!renterInfo.fullName) {
    setError('Nama wajib diisi');
    return;
  }
  setCurrentStep(currentStep + 1);
};

// ❌ Bad - Validasi di store
const setRenterInfo = (info) => {
  if (!info.fullName) throw new Error('Invalid'); // Jangan lakukan ini
  set({ renterInfo: info });
};
```

### 4. Gunakan Partial Update
```typescript
// ✅ Good - Partial update
setRenterInfo({ fullName: 'John' });

// ❌ Bad - Replace entire object
setRenterInfo({
  fullName: 'John',
  ktpNumber: '', // Harus include semua field
  simNumber: '',
  // ...
});
```

---

## 📈 Performance Benefits

### Sebelum (Local State di BookingFlow)
- ❌ Semua state hilang saat navigate away
- ❌ Tidak bisa diakses di halaman lain
- ❌ Sulit di-test
- ❌ Logic tersebar di component

### Sesudah (useBookingStore)
- ✅ State persisten antar navigasi
- ✅ Bisa diakses di SuccessPage, Dashboard
- ✅ Mudah di-test secara unit
- ✅ Logic terpusat di store
- ✅ Hanya re-render komponen yang menggunakan state

---

## 🔗 Integrasi dengan useAppStore

### useAppStore (Global State)
- Auth (user, login, logout)
- UI (currentPage, menuOpen)
- Selected vehicle
- Owner settings

### useBookingStore (Booking State)
- Booking flow steps
- Booking data
- Pricing calculation

**Kapan menggunakan yang mana?**
- `useAppStore` → Data global yang dibutuhkan di banyak tempat
- `useBookingStore` → Data spesifik untuk booking flow

---

## 📚 Related Documentation

- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [BOOKING-FLOW-STEP2-UPDATE.md](./BOOKING-FLOW-STEP2-UPDATE.md) - Step 2 update
- [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) - Project structure

---

## 🎉 Summary

**useBookingStore berhasil dibuat dengan:**

✅ **10 State Properties** - Step, vehicle, duration, dates, renter, trip, guarantee, pricing  
✅ **9 Actions** - Setters untuk setiap state + calculatePricing + reset  
✅ **Auto-calculation** - Pricing otomatis saat dates/duration berubah  
✅ **Partial Updates** - Update renterInfo dan tripPlan secara partial  
✅ **Type Safety** - TypeScript types untuk semua state dan actions  
✅ **Testability** - Mudah di-test secara unit  

**Benefits:**
- ✅ Separation of concerns
- ✅ Reusability across components
- ✅ Better performance (selective re-renders)
- ✅ Easier testing
- ✅ Centralized business logic

**Status**: ✅ Production Ready

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Author**: Renmoku Tech Team
