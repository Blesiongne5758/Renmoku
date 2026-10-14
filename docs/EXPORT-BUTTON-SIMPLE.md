# ExportButton Component - Simplified Implementation

## Overview

Komponen `ExportButton` yang disederhanakan untuk export data ke format PDF dan Excel dengan dropdown menu yang elegan.

## Features

✅ **Simple API** - Hanya perlu `type` dan `data` props  
✅ **Dropdown Menu** - Pilih format export (PDF/Excel)  
✅ **Loading State** - Visual feedback saat export  
✅ **Toast Notifications** - Success/error messages  
✅ **Backdrop** - Click outside untuk close dropdown  
✅ **Animations** - Smooth transitions dengan Framer Motion  
✅ **Type Safety** - Full TypeScript support  

## Installation

Dependencies sudah terinstall:
```bash
npm install jspdf jspdf-autotable xlsx file-saver sonner
```

## Usage

### Basic Usage

```typescript
import ExportButton from './components/ExportButton';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  return (
    <ExportButton 
      type="bookings" 
      data={bookings} 
    />
  );
}
```

### Export Single Booking

```typescript
function BookingDetail({ booking }) {
  return (
    <ExportButton 
      type="bookings" 
      data={booking} 
    />
  );
}
```

### Export Revenue Report

```typescript
function RevenuePage() {
  const [report, setReport] = useState(null);

  return (
    <ExportButton 
      type="revenue" 
      data={report} 
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `'bookings' \| 'revenue'` | Yes | Tipe data yang akan diexport |
| `data` | `any` | Yes | Data yang akan diexport |

## Component Behavior

### For `type="bookings"`

**PDF Export:**
- Menggunakan `exportBookingToPDF(data)`
- Generate invoice PDF dengan styling premium
- Dark header dengan gold accent
- Details table dan payment summary

**Excel Export:**
- Menggunakan `exportBookingsToExcel(data)`
- Jika data bukan array, akan di-wrap dalam array
- Auto-size columns
- 13 columns dengan formatting

### For `type="revenue"`

**PDF Export:**
- Menggunakan `exportRevenueReportPDF(data)`
- Generate laporan pendapatan
- Summary table dan vehicle breakdown
- Purple accent untuk breakdown table

**Excel Export:**
- Menggunakan `exportBookingsToExcel(data.breakdown)`
- Export breakdown data ke Excel

## UI Design

### Button
```typescript
<button className="bg-gradient-to-r from-purple-500 to-purple-700">
  <Download /> Export
</button>
```

- Purple gradient theme
- Hover effect dengan shadow
- Loading spinner saat export
- Scale animation on hover/tap

### Dropdown Menu
```typescript
<div className="bg-[#1a1a1a] border border-white/10">
  <button>
    <FileText /> Export PDF
  </button>
  <button>
    <FileSpreadsheet /> Export Excel
  </button>
</div>
```

- Dark theme dengan border
- Icon untuk setiap option
- Hover effect
- Backdrop untuk close

### Animations

**Button:**
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Dropdown:**
```typescript
initial={{ opacity: 0, y: -10, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -10, scale: 0.95 }}
```

## Toast Notifications

### Success
```typescript
toast.success(`✅ File ${format.toUpperCase()} berhasil diunduh`);
```

### Error
```typescript
toast.error('❌ Gagal mengekspor file');
```

## Error Handling

```typescript
try {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (type === 'bookings') {
    if (format === 'pdf') {
      exportBookingToPDF(data);
    } else {
      exportBookingsToExcel(Array.isArray(data) ? data : [data]);
    }
  } else if (type === 'revenue') {
    exportRevenueReportPDF(data);
  }
  
  toast.success(`✅ File ${format.toUpperCase()} berhasil diunduh`);
} catch (error) {
  toast.error('❌ Gagal mengekspor file');
}
```

## Integration Examples

### In Admin Dashboard

```typescript
import ExportButton from './components/ExportButton';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Dashboard</h1>
        <ExportButton type="bookings" data={bookings} />
      </div>

      {/* Revenue section */}
      <div className="flex justify-end mb-4">
        <ExportButton type="revenue" data={revenueReport} />
      </div>
    </div>
  );
}
```

### In Booking List

```typescript
function BookingsList() {
  const [bookings, setBookings] = useState([]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ExportButton type="bookings" data={bookings} />
      </div>

      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

### In Booking Detail

```typescript
function BookingDetail({ booking }) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <ExportButton type="bookings" data={booking} />
      </div>

      {/* Booking details */}
    </div>
  );
}
```

## Styling Customization

### Change Button Color

```typescript
// Purple (default)
className="bg-gradient-to-r from-purple-500 to-purple-700"

// Gold
className="bg-gradient-to-r from-gold-500 to-gold-600"

// Blue
className="bg-gradient-to-r from-blue-500 to-blue-700"
```

### Change Dropdown Theme

```typescript
// Dark (default)
className="bg-[#1a1a1a] border border-white/10"

// Light
className="bg-white border border-gray-200"

// Glass
className="glass border border-white/10"
```

## Performance Optimization

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const ExportButton = lazy(() => import('./components/ExportButton'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExportButton type="bookings" data={bookings} />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo } from 'react';

const MemoizedExportButton = memo(ExportButton);

function MyComponent() {
  return <MemoizedExportButton type="bookings" data={bookings} />;
}
```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

## File Structure

```
src/
├── components/
│   └── ExportButton.tsx          # Main component
├── lib/
│   └── export-utils.ts           # Export utility functions
└── App.tsx                        # Integration
```

## Dependencies

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "sonner": "^1.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.263.0"
  }
}
```

## TypeScript Configuration

Path alias sudah dikonfigurasi di `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

### Manual Testing

1. **PDF Export Test**
   - Click Export button
   - Select "Export PDF"
   - Verify PDF downloads
   - Check PDF content and styling

2. **Excel Export Test**
   - Click Export button
   - Select "Export Excel"
   - Verify Excel file downloads
   - Check Excel content and formatting

3. **Error Handling Test**
   - Pass invalid data
   - Verify error toast appears
   - Check console for errors

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

describe('ExportButton', () => {
  it('should render export button', () => {
    render(<ExportButton type="bookings" data={[]} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should open dropdown on click', () => {
    render(<ExportButton type="bookings" data={[]} />);
    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Export Excel')).toBeInTheDocument();
  });

  it('should close dropdown on backdrop click', () => {
    render(<ExportButton type="bookings" data={[]} />);
    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(document.querySelector('.fixed.inset-0'));
    expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Dropdown not closing

**Solution:**
- Check if backdrop div is rendered
- Verify onClick handler is attached
- Check z-index values

### Issue: Export not working

**Solution:**
- Check console for errors
- Verify data structure
- Check if export functions are imported correctly
- Verify file-saver is working

### Issue: Toast not showing

**Solution:**
- Verify Toaster component is rendered in App.tsx
- Check sonner is imported correctly
- Verify toast configuration

## Related Documentation

- [Export Documents](./EXPORT-DOCUMENTS.md) - Complete export documentation
- [Export Summary](./EXPORT-SUMMARY.md) - Implementation summary
- [Socket.io Implementation](./SOCKET-IO-IMPLEMENTATION.md) - Real-time features

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 2.0.0 (Simplified)
