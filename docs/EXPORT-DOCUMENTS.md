# Export Documents - Complete Implementation Guide

## Overview

Sistem export dokumen lengkap untuk platform Renmoku dengan dukungan PDF, Excel, dan CSV. Menggunakan library jsPDF, xlsx, dan file-saver.

## Installation

```bash
# Install dependencies
npm install jspdf jspdf-autotable xlsx file-saver
npm install -D @types/file-saver
```

## Features

✅ **PDF Export** - Export dengan styling premium (gold accent theme)  
✅ **Excel Export** - Export dengan auto-size columns  
✅ **CSV Export** - Export universal dengan UTF-8 encoding  
✅ **Custom Formatting** - Support untuk custom headers dan data transformation  
✅ **Multiple Formats** - Pilih format export sesuai kebutuhan  
✅ **Loading States** - Visual feedback saat proses export  
✅ **Error Handling** - Graceful error handling  
✅ **Type Safety** - Full TypeScript support  

## Components

### 1. ExportButton (Generic)

Komponen button generic untuk export data dengan berbagai format.

**Usage:**
```typescript
import ExportButton from './components/ExportButton';

function MyComponent() {
  const data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ];

  return (
    <ExportButton
      data={data}
      filename="users"
      format="excel"
      variant="primary"
      size="md"
      showFormatSelector={true}
    />
  );
}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | Required | Data yang akan diexport |
| `filename` | `string` | Required | Nama file (tanpa extension) |
| `format` | `'pdf' \| 'excel' \| 'csv'` | `'excel'` | Format default |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `showFormatSelector` | `boolean` | `false` | Show format dropdown |
| `customHeaders` | `string[]` | - | Custom headers untuk PDF |
| `customData` | `(item) => Record` | - | Transform function |

### 2. BookingExportButton

Specialized button untuk export data booking.

**Usage:**
```typescript
import { BookingExportButton } from './components/ExportButton';

function BookingsList() {
  const [bookings, setBookings] = useState([]);

  return (
    <BookingExportButton
      bookings={bookings}
      variant="primary"
      size="md"
    />
  );
}
```

**Features:**
- Export ke Excel dengan format booking
- Export ke PDF invoice untuk single booking
- Auto-format currency dan tanggal
- Include semua informasi booking

### 3. VehicleExportButton

Specialized button untuk export data kendaraan.

**Usage:**
```typescript
import { VehicleExportButton } from './components/ExportButton';

function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);

  return (
    <VehicleExportButton
      vehicles={vehicles}
      variant="primary"
      size="md"
    />
  );
}
```

### 4. RevenueExportButton

Specialized button untuk export laporan pendapatan.

**Usage:**
```typescript
import { RevenueExportButton } from './components/ExportButton';

function RevenueReport() {
  const [report, setReport] = useState(null);

  return (
    <RevenueExportButton
      report={report}
      variant="primary"
      size="md"
    />
  );
}
```

## Utility Functions

### PDF Export

#### `exportBookingToPDF(booking)`

Export detail booking ke PDF invoice dengan styling premium.

```typescript
import { exportBookingToPDF } from './lib/exportUtils';

exportBookingToPDF({
  id: 'booking-123',
  createdAt: '2026-10-15T10:00:00Z',
  status: 'CONFIRMED',
  renter: {
    renterIndividual: {
      fullName: 'Ahmad Sudirman',
    },
  },
  vehicle: {
    brand: 'Toyota',
    model: 'Alphard',
    year: 2023,
  },
  startDate: '2026-10-20',
  endDate: '2026-10-25',
  durationType: 'DAILY',
  withDriver: true,
  tripOrigin: 'Jakarta',
  tripDestination: 'Bandung',
  guaranteeType: 'KTP',
  totalPrice: 12500000,
  dpAmount: 6250000,
});
```

**PDF Features:**
- ✅ Dark header dengan gold accent (RENMOKU branding)
- ✅ Invoice title "Invoice Sewa Kendaraan"
- ✅ Booking info (ID, tanggal, status)
- ✅ Details table dengan grid theme
- ✅ Payment summary dengan striped theme
- ✅ Footer dengan legal disclaimer
- ✅ Auto-pagination

#### `exportRevenueReportPDF(report)`

Export laporan pendapatan ke PDF.

```typescript
import { exportRevenueReportPDF } from './lib/exportUtils';

exportRevenueReportPDF({
  period: 'Oktober 2026',
  totalRevenue: 1200000000,
  totalBookings: 810,
  vehicles: [
    { name: 'Toyota Alphard', revenue: 45000000, bookings: 15 },
    { name: 'Honda HR-V', revenue: 38000000, bookings: 12 },
  ],
});
```

**PDF Features:**
- ✅ Dark header dengan gold accent
- ✅ Period information
- ✅ Summary table (Total Pendapatan, Total Booking, Rata-rata)
- ✅ Vehicle breakdown table dengan purple accent
- ✅ Auto-format currency

### Excel Export

#### `exportBookingsToExcel(bookings, filename)`

Export data booking ke Excel dengan format khusus.

```typescript
import { exportBookingsToExcel } from './lib/exportUtils';

exportBookingsToExcel(bookings, 'bookings');
// Output: bookings-2026-10-15.xlsx
```

**Columns:**
- ID Booking
- Tanggal Booking
- Kendaraan
- Tahun
- Penyewa
- Tipe Penyewa (Individual/Corporate)
- Mulai
- Selesai
- Durasi
- Dengan Driver
- Total (Rp)
- DP (Rp)
- Status

**Features:**
- ✅ Auto-size columns
- ✅ Formatted currency
- ✅ Indonesian date format
- ✅ Multiple sheets support

#### `exportVehiclesToExcel(vehicles, filename)`

Export data kendaraan ke Excel.

```typescript
import { exportVehiclesToExcel } from './lib/exportUtils';

exportVehiclesToExcel(vehicles, 'vehicles');
// Output: vehicles-2026-10-15.xlsx
```

**Columns:**
- ID
- Brand
- Model
- Tahun
- Transmisi (Otomatis/Manual)
- Kapasitas
- BBM
- Harga/Hari (Rp)
- Harga/Minggu (Rp)
- Harga/Bulan (Rp)
- Status
- Lokasi

#### `exportUsersToExcel(users, filename)`

Export data users ke Excel.

```typescript
import { exportUsersToExcel } from './lib/exportUtils';

exportUsersToExcel(users, 'users');
// Output: users-2026-10-15.xlsx
```

**Columns:**
- ID
- Email
- Nama
- Role (Penyewa/Pemilik/Admin)
- Status (Terverifikasi/Pending/Ditolak)
- Tanggal Daftar

### CSV Export

#### `exportToCSV(data, filename)`

Export generic data ke CSV.

```typescript
import { exportToCSV } from './lib/exportUtils';

exportToCSV(data, 'users');
// Output: users-2026-10-15.csv
```

**Features:**
- ✅ UTF-8 encoding
- ✅ Proper escaping untuk special characters
- ✅ Universal compatibility
- ✅ Easy import ke sistem lain

## PDF Styling

### Header Design

```typescript
// Dark background dengan gold accent
doc.setFillColor(10, 10, 10);
doc.rect(0, 0, 210, 40, 'F');

doc.setTextColor(212, 175, 55); // Gold
doc.setFontSize(24);
doc.setFont('helvetica', 'bold');
doc.text('RENMOKU', 20, 25);

doc.setTextColor(255, 255, 255);
doc.setFontSize(10);
doc.text('Premium Car Rental', 20, 32);
```

### Table Themes

```typescript
// Grid theme untuk details
autoTable(doc, {
  theme: 'grid',
  headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
  styles: { fontSize: 10 },
});

// Striped theme untuk payment summary
autoTable(doc, {
  theme: 'striped',
  headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
  styles: { fontSize: 11 },
  columnStyles: {
    1: { halign: 'right', fontStyle: 'bold' },
  },
});

// Purple accent untuk vehicle breakdown
autoTable(doc, {
  theme: 'striped',
  headStyles: { fillColor: [139, 92, 246] }, // Purple
  columnStyles: {
    1: { halign: 'center' },
    2: { halign: 'right' },
  },
});
```

### Footer

```typescript
const pageHeight = doc.internal.pageSize.height;
doc.setFontSize(8);
doc.setTextColor(150, 150, 150);
doc.text('Dokumen ini dihasilkan secara elektronik dan sah tanpa tanda tangan basah.', 20, pageHeight - 20);
doc.text('© 2026 Renmoku. All rights reserved.', 20, pageHeight - 14);
```

## Excel Styling

### Auto-size Columns

```typescript
ws['!cols'] = [
  { wch: 20 }, // ID
  { wch: 15 }, // Tanggal
  { wch: 25 }, // Kendaraan
  { wch: 8 },  // Tahun
  { wch: 25 }, // Penyewa
  { wch: 15 }, // Tipe
  { wch: 15 }, // Mulai
  { wch: 15 }, // Selesai
  { wch: 12 }, // Durasi
  { wch: 12 }, // Driver
  { wch: 15 }, // Total
  { wch: 15 }, // DP
  { wch: 12 }, // Status
];
```

### Multiple Sheets

```typescript
const wb = XLSX.utils.book_new();

// Sheet 1: Summary
const summarySheet = XLSX.utils.json_to_sheet(summaryData);
XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan');

// Sheet 2: Details
const detailsSheet = XLSX.utils.json_to_sheet(detailsData);
XLSX.utils.book_append_sheet(wb, detailsSheet, 'Detail');
```

## Usage Examples

### Example 1: Export Single Booking as PDF Invoice

```typescript
import { exportBookingToPDF } from './lib/exportUtils';

function BookingDetail({ booking }) {
  const handleDownloadInvoice = () => {
    exportBookingToPDF(booking);
  };

  return (
    <button onClick={handleDownloadInvoice}>
      Download Invoice PDF
    </button>
  );
}
```

### Example 2: Export Bookings List

```typescript
import { BookingExportButton } from './components/ExportButton';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  return (
    <div>
      <h1>Daftar Booking</h1>
      
      <div className="flex justify-end mb-4">
        <BookingExportButton
          bookings={bookings}
          variant="primary"
          size="md"
        />
      </div>

      {/* Bookings list */}
    </div>
  );
}
```

### Example 3: Export with Custom Format

```typescript
import ExportButton from './components/ExportButton';

function UsersPage() {
  const [users, setUsers] = useState([]);

  return (
    <ExportButton
      data={users}
      filename="users"
      format="excel"
      showFormatSelector={true}
      customHeaders={['Nama', 'Email', 'Role']}
      customData={(user) => ({
        'Nama': user.name,
        'Email': user.email,
        'Role': user.role === 'RENTER' ? 'Penyewa' : 'Pemilik',
      })}
    />
  );
}
```

### Example 4: Export Revenue Report

```typescript
import { RevenueExportButton } from './components/ExportButton';
import { reportsApi } from './api';

function RevenuePage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    reportsApi.revenue({
      startDate: '2026-01-01',
      endDate: '2026-10-31',
      groupBy: 'month',
    }).then(setReport);
  }, []);

  return (
    <div>
      <h1>Laporan Pendapatan</h1>
      
      {report && (
        <div className="flex justify-end mb-4">
          <RevenueExportButton
            report={report}
            variant="primary"
            size="md"
          />
        </div>
      )}

      {/* Report content */}
    </div>
  );
}
```

## Error Handling

### Try-Catch Pattern

```typescript
const handleExport = async () => {
  try {
    await exportBookingsToExcel(bookings);
    console.log('Export successful');
  } catch (error) {
    console.error('Export failed:', error);
    alert('Gagal mengexport data. Silakan coba lagi.');
  }
};
```

### Loading State

```typescript
const [isExporting, setIsExporting] = useState(false);

const handleExport = async () => {
  setIsExporting(true);
  try {
    await exportBookingsToExcel(bookings);
  } catch (error) {
    console.error(error);
  } finally {
    setIsExporting(false);
  }
};

return (
  <button disabled={isExporting}>
    {isExporting ? 'Exporting...' : 'Export'}
  </button>
);
```

## Performance Optimization

### Large Data Sets

Untuk data besar (> 10,000 rows), gunakan pagination atau chunking:

```typescript
const exportLargeDataset = async (data: any[]) => {
  const CHUNK_SIZE = 5000;
  const chunks = [];
  
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }
  
  // Export each chunk separately
  for (const chunk of chunks) {
    await exportBookingsToExcel(chunk, `data-part-${chunks.indexOf(chunk)}`);
  }
};
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const ExportButton = lazy(() => import('./components/ExportButton'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExportButton data={data} filename="export" />
    </Suspense>
  );
}
```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Mobile Chrome | 90+ | ✅ Full |

## File Size Limits

| Format | Recommended Max | Notes |
|--------|----------------|-------|
| PDF | 10,000 rows | Larger files may be slow |
| Excel | 50,000 rows | Excel has 1M row limit |
| CSV | 100,000 rows | No hard limit |

## Security Considerations

### Data Sanitization

```typescript
const sanitizeData = (data: any[]) => {
  return data.map((item) => {
    const sanitized = {};
    for (const key in item) {
      if (typeof item[key] === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = item[key].replace(/[<>]/g, '');
      } else {
        sanitized[key] = item[key];
      }
    }
    return sanitized;
  });
};
```

### Access Control

```typescript
// Only allow authorized users to export
const handleExport = async () => {
  if (!user || user.role !== 'ADMIN') {
    alert('Anda tidak memiliki izin untuk export data');
    return;
  }
  
  await exportBookingsToExcel(bookings);
};
```

## Testing

### Unit Test Example

```typescript
import { exportBookingsToExcel } from './lib/exportUtils';

describe('exportBookingsToExcel', () => {
  it('should export bookings to Excel file', () => {
    const bookings = [
      { id: '1', vehicle: { brand: 'Toyota', model: 'Alphard' } },
      { id: '2', vehicle: { brand: 'Honda', model: 'HR-V' } },
    ];

    // Mock saveAs
    global.saveAs = jest.fn();

    exportBookingsToExcel(bookings);

    expect(global.saveAs).toHaveBeenCalled();
  });

  it('should handle empty data', () => {
    const bookings = [];
    
    expect(() => {
      exportBookingsToExcel(bookings);
    }).not.toThrow();
  });
});
```

## Troubleshooting

### Issue: PDF not generating

**Solutions:**
- Check if jsPDF is imported correctly
- Verify data is not empty
- Check browser console for errors
- Ensure fonts are loaded

### Issue: Excel file corrupted

**Solutions:**
- Check data format (must be array of objects)
- Verify no circular references
- Check for special characters in data
- Try exporting smaller dataset

### Issue: CSV encoding problems

**Solutions:**
- Add BOM (Byte Order Mark) for UTF-8:
```typescript
const BOM = '\uFEFF';
const csvContent = BOM + csvData;
```

### Issue: Large file export slow

**Solutions:**
- Use pagination
- Export in chunks
- Show progress indicator
- Use web workers for processing

## Related Documentation

- [API Documentation](./API-DOCUMENTATION.md)
- [Admin Dashboard](./ADMIN-DASHBOARD.md)
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 2.0.0
