# Export Documents Feature

## Overview

Fitur export dokumen untuk Renmoku platform yang mendukung export data ke format PDF, Excel, dan CSV. Menggunakan library jsPDF, xlsx, dan file-saver.

## Installation

```bash
# Install dependencies
npm install jspdf jspdf-autotable xlsx file-saver
npm install -D @types/file-saver
```

## Features

✅ **PDF Export** - Export data ke PDF dengan tabel dan formatting  
✅ **Excel Export** - Export data ke Excel (.xlsx) dengan auto-size columns  
✅ **CSV Export** - Export data ke CSV untuk kompatibilitas luas  
✅ **Custom Formatting** - Support untuk custom headers dan data transformation  
✅ **Multiple Formats** - Pilih format export sesuai kebutuhan  
✅ **Loading States** - Visual feedback saat proses export  
✅ **Error Handling** - Graceful error handling dengan user feedback  

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
- Export ke PDF dengan landscape orientation
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

#### `exportToPDF(options)`

Export generic data ke PDF.

```typescript
import { exportToPDF } from './lib/exportUtils';

exportToPDF({
  title: 'Laporan Users',
  subtitle: 'Total: 100 users',
  headers: ['ID', 'Nama', 'Email', 'Role'],
  data: [
    ['1', 'John Doe', 'john@example.com', 'RENTER'],
    ['2', 'Jane Smith', 'jane@example.com', 'OWNER'],
  ],
  filename: 'users-report',
  orientation: 'portrait', // or 'landscape'
});
```

#### `exportBookingToPDF(booking)`

Export detail booking ke PDF invoice.

```typescript
import { exportBookingToPDF } from './lib/exportUtils';

exportBookingToPDF({
  id: 'booking-123',
  createdAt: '2026-10-15T10:00:00Z',
  status: 'CONFIRMED',
  renter: {
    name: 'Ahmad Sudirman',
    email: 'ahmad@example.com',
    phone: '+6281234567890',
  },
  vehicle: {
    brand: 'Toyota',
    model: 'Alphard',
    year: 2023,
  },
  startDate: '2026-10-20',
  endDate: '2026-10-25',
  totalPrice: 12500000,
  dpAmount: 6250000,
});
```

#### `exportRevenueReportToPDF(report)`

Export laporan pendapatan ke PDF.

```typescript
import { exportRevenueReportToPDF } from './lib/exportUtils';

exportRevenueReportToPDF({
  period: '2026-01-01 to 2026-10-31',
  totalRevenue: 1200000000,
  totalBookings: 810,
  totalCommission: 150000000,
  averageBookingValue: 1481481,
  growthRate: 18.5,
  breakdown: [
    { date: '2026-01-01', revenue: 4200000, bookings: 3 },
    { date: '2026-01-02', revenue: 5800000, bookings: 4 },
  ],
});
```

### Excel Export

#### `exportToExcel(options)`

Export generic data ke Excel.

```typescript
import { exportToExcel } from './lib/exportUtils';

exportToExcel({
  data: [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ],
  filename: 'users',
  sheetName: 'Users',
});
```

#### `exportBookingsToExcel(bookings)`

Export data booking ke Excel dengan format khusus.

```typescript
import { exportBookingsToExcel } from './lib/exportUtils';

exportBookingsToExcel(bookings);
// Output: bookings-2026-10-15.xlsx
```

**Columns:**
- ID Booking
- Tanggal
- Penyewa
- Email
- Kendaraan
- Mulai
- Selesai
- Durasi
- Dengan Driver
- Total
- DP
- Status

#### `exportVehiclesToExcel(vehicles)`

Export data kendaraan ke Excel.

```typescript
import { exportVehiclesToExcel } from './lib/exportUtils';

exportVehiclesToExcel(vehicles);
// Output: vehicles-2026-10-15.xlsx
```

**Columns:**
- ID
- Brand
- Model
- Tahun
- Transmisi
- Kapasitas
- BBM
- Harga/Hari
- Harga/Minggu
- Harga/Bulan
- Status
- Lokasi

#### `exportRevenueReportToExcel(report)`

Export laporan pendapatan ke Excel dengan multiple sheets.

```typescript
import { exportRevenueReportToExcel } from './lib/exportUtils';

exportRevenueReportToExcel(report);
// Output: revenue-report-2026-10-15.xlsx
// Sheets: Ringkasan, Detail Harian
```

### CSV Export

#### `exportToCSV(options)`

Export generic data ke CSV.

```typescript
import { exportToCSV } from './lib/exportUtils';

exportToCSV({
  data: [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ],
  filename: 'users',
});
```

#### `exportUsersToCSV(users)`

Export data users ke CSV.

```typescript
import { exportUsersToCSV } from './lib/exportUtils';

exportUsersToCSV(users);
// Output: users-2026-10-15.csv
```

**Columns:**
- ID
- Email
- Nama
- Role
- Status
- Tanggal Daftar

## Helper Functions

### `formatCurrencyForExport(amount)`

Format currency untuk export.

```typescript
import { formatCurrencyForExport } from './lib/exportUtils';

formatCurrencyForExport(1500000);
// Output: "Rp 1.500.000"
```

### `formatDateForExport(date)`

Format tanggal untuk export.

```typescript
import { formatDateForExport } from './lib/exportUtils';

formatDateForExport('2026-10-15');
// Output: "15 Oktober 2026"
```

### `generateFilename(prefix, extension)`

Generate filename dengan timestamp.

```typescript
import { generateFilename } from './lib/exportUtils';

generateFilename('bookings', 'xlsx');
// Output: "bookings-2026-10-15.xlsx"
```

## Usage Examples

### Example 1: Export Bookings with Custom Format

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

### Example 2: Export with Custom Data Transformation

```typescript
import ExportButton from './components/ExportButton';

function UsersPage() {
  const [users, setUsers] = useState([]);

  const customHeaders = ['Nama Lengkap', 'Email', 'Role', 'Status'];
  
  const customData = (user) => ({
    'Nama Lengkap': user.name,
    'Email': user.email,
    'Role': user.role === 'RENTER' ? 'Penyewa' : 'Pemilik',
    'Status': user.status === 'VERIFIED' ? 'Terverifikasi' : 'Pending',
  });

  return (
    <ExportButton
      data={users}
      filename="users"
      format="excel"
      showFormatSelector={true}
      customHeaders={customHeaders}
      customData={customData}
    />
  );
}
```

### Example 3: Export Revenue Report

```typescript
import { RevenueExportButton } from './components/ExportButton';
import { reportsApi } from './api';

function RevenuePage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Fetch revenue report
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

### Example 4: Export Single Booking as PDF Invoice

```typescript
import { exportBookingToPDF } from './lib/exportUtils';

function BookingDetail({ booking }) {
  const handleDownloadInvoice = () => {
    exportBookingToPDF(booking);
  };

  return (
    <div>
      <h1>Detail Booking</h1>
      
      <button onClick={handleDownloadInvoice}>
        Download Invoice PDF
      </button>

      {/* Booking details */}
    </div>
  );
}
```

## PDF Styling

### Custom PDF Theme

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();

autoTable(doc, {
  head: [['Column 1', 'Column 2']],
  body: [['Data 1', 'Data 2']],
  theme: 'striped', // 'striped' | 'grid' | 'plain'
  headStyles: {
    fillColor: [212, 175, 55], // Gold
    textColor: [0, 0, 0],
    fontStyle: 'bold',
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245],
  },
  styles: {
    fontSize: 9,
    cellPadding: 3,
  },
});
```

### PDF Page Orientation

```typescript
// Portrait (default)
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

// Landscape
const doc = new jsPDF({
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4',
});
```

## Excel Styling

### Auto-size Columns

```typescript
import * as XLSX from 'xlsx';

const worksheet = XLSX.utils.json_to_sheet(data);

// Auto-size columns
const colWidths = Object.keys(data[0]).map((key) => {
  const maxLen = Math.max(
    key.length,
    ...data.map((row) => String(row[key] || '').length)
  );
  return { wch: Math.min(maxLen + 2, 50) };
});

worksheet['!cols'] = colWidths;
```

### Multiple Sheets

```typescript
import * as XLSX from 'xlsx';

const workbook = XLSX.utils.book_new();

// Sheet 1: Summary
const summarySheet = XLSX.utils.json_to_sheet(summaryData);
XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

// Sheet 2: Details
const detailsSheet = XLSX.utils.json_to_sheet(detailsData);
XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Detail');

// Save
const excelBuffer = XLSX.write(workbook, {
  bookType: 'xlsx',
  type: 'array',
});
```

## Error Handling

### Try-Catch Pattern

```typescript
const handleExport = async () => {
  try {
    await exportToExcel({ data, filename });
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
    await exportToExcel({ data, filename });
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
    await exportToExcel({ data: chunk, filename: `data-part-${chunks.indexOf(chunk)}` });
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
  
  await exportToExcel({ data, filename });
};
```

## Testing

### Unit Test Example

```typescript
import { exportToExcel } from './lib/exportUtils';

describe('exportToExcel', () => {
  it('should export data to Excel file', () => {
    const data = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];

    // Mock saveAs
    global.saveAs = jest.fn();

    exportToExcel({ data, filename: 'test' });

    expect(global.saveAs).toHaveBeenCalled();
  });

  it('should handle empty data', () => {
    const data = [];
    
    expect(() => {
      exportToExcel({ data, filename: 'test' });
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
**Version**: 1.0.0
