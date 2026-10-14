import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================================================
// PDF EXPORT FUNCTIONS
// ============================================================================

/**
 * Export booking detail to PDF invoice
 */
export function exportBookingToPDF(booking: any) {
  const doc = new jsPDF();
  
  // Header - Dark background with gold accent
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RENMOKU', 20, 25);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Rental Mobil Ku', 20, 32);
  
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('Invoice Sewa Kendaraan', 20, 60);
  
  // Booking Info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`No. Booking: ${booking.id}`, 20, 75);
  doc.text(`Tanggal: ${new Date(booking.createdAt).toLocaleDateString('id-ID')}`, 20, 82);
  doc.text(`Status: ${booking.status}`, 20, 89);
  
  // Details Table
  autoTable(doc, {
    startY: 100,
    head: [['Item', 'Detail']],
    body: [
      ['Kendaraan', `${booking.vehicle?.brand || '-'} ${booking.vehicle?.model || '-'} ${booking.vehicle?.year || ''}`],
      ['Penyewa', booking.renter?.renterIndividual?.fullName || booking.renter?.renterCorporate?.companyName || booking.renter?.name || '-'],
      ['Periode Sewa', `${new Date(booking.startDate).toLocaleDateString('id-ID')} - ${new Date(booking.endDate).toLocaleDateString('id-ID')}`],
      ['Durasi', booking.durationType || '-'],
      ['Dengan Driver', booking.withDriver ? 'Ya' : 'Tidak'],
      ['Rute', `${booking.tripOrigin || '-'} → ${booking.tripDestination || '-'}`],
      ['Jaminan', booking.guaranteeType || '-'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });
  
  // Payment Summary
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  autoTable(doc, {
    startY: finalY,
    head: [['Keterangan', 'Jumlah']],
    body: [
      ['Total Sewa', `Rp ${(booking.totalPrice || 0).toLocaleString('id-ID')}`],
      ['DP (50%)', `Rp ${(booking.dpAmount || 0).toLocaleString('id-ID')}`],
      ['Sisa Pelunasan', `Rp ${((booking.totalPrice || 0) - (booking.dpAmount || 0)).toLocaleString('id-ID')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
    styles: { fontSize: 11 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
    },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Dokumen ini dihasilkan secara elektronik dan sah tanpa tanda tangan basah.', 20, pageHeight - 20);
  doc.text('© 2026 Renmoku. All rights reserved.', 20, pageHeight - 14);
  
  // Save
  doc.save(`Booking-${booking.id}.pdf`);
}

/**
 * Export revenue report to PDF
 */
export function exportRevenueReportPDF(data: {
  period: string;
  totalRevenue: number;
  totalBookings: number;
  vehicles: Array<{ name: string; revenue: number; bookings: number }>;
}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(20);
  doc.text('LAPORAN PENDAPATAN', 20, 20);
  
  // Period
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Periode: ${data.period}`, 20, 45);
  
  // Summary
  autoTable(doc, {
    startY: 55,
    head: [['Metrik', 'Nilai']],
    body: [
      ['Total Pendapatan', `Rp ${data.totalRevenue.toLocaleString('id-ID')}`],
      ['Total Booking', data.totalBookings.toString()],
      ['Rata-rata per Booking', `Rp ${Math.round(data.totalRevenue / data.totalBookings).toLocaleString('id-ID')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
  });
  
  // Vehicle breakdown
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Breakdown per Kendaraan', 20, finalY);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Kendaraan', 'Jumlah Booking', 'Pendapatan (Rp)']],
    body: data.vehicles.map(v => [
      v.name,
      v.bookings.toString(),
      v.revenue.toLocaleString('id-ID'),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }, // Purple
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
    },
  });
  
  doc.save(`Revenue-Report-${data.period}.pdf`);
}

// ============================================================================
// EXCEL EXPORT FUNCTIONS
// ============================================================================

/**
 * Export bookings to Excel
 */
export function exportBookingsToExcel(bookings: any[], filename = 'bookings') {
  // Transform data
  const data = bookings.map((b) => ({
    'ID Booking': b.id,
    'Tanggal Booking': new Date(b.createdAt).toLocaleDateString('id-ID'),
    'Kendaraan': `${b.vehicle?.brand || '-'} ${b.vehicle?.model || '-'}`,
    'Tahun': b.vehicle?.year || '-',
    'Penyewa': b.renter?.renterIndividual?.fullName || b.renter?.renterCorporate?.companyName || b.renter?.name || '-',
    'Tipe Penyewa': b.renter?.renterIndividual ? 'Individual' : 'Corporate',
    'Mulai': new Date(b.startDate).toLocaleDateString('id-ID'),
    'Selesai': new Date(b.endDate).toLocaleDateString('id-ID'),
    'Durasi': b.durationType || '-',
    'Dengan Driver': b.withDriver ? 'Ya' : 'Tidak',
    'Total (Rp)': b.totalPrice || 0,
    'DP (Rp)': b.dpAmount || 0,
    'Status': b.status || '-',
  }));
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
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
  
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  
  // Export
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export vehicles to Excel
 */
export function exportVehiclesToExcel(vehicles: any[], filename = 'vehicles') {
  const data = vehicles.map((v) => ({
    'ID': v.id,
    'Brand': v.brand,
    'Model': v.model,
    'Tahun': v.year,
    'Transmisi': v.transmission === 'automatic' ? 'Otomatis' : 'Manual',
    'Kapasitas': v.capacity,
    'BBM': v.fuelType,
    'Harga/Hari (Rp)': v.priceDaily,
    'Harga/Minggu (Rp)': v.priceWeekly,
    'Harga/Bulan (Rp)': v.priceMonthly,
    'Status': v.status,
    'Lokasi': v.location,
  }));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 20 }, // ID
    { wch: 15 }, // Brand
    { wch: 20 }, // Model
    { wch: 8 },  // Tahun
    { wch: 12 }, // Transmisi
    { wch: 10 }, // Kapasitas
    { wch: 10 }, // BBM
    { wch: 15 }, // Harga/Hari
    { wch: 15 }, // Harga/Minggu
    { wch: 15 }, // Harga/Bulan
    { wch: 12 }, // Status
    { wch: 15 }, // Lokasi
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export users to Excel
 */
export function exportUsersToExcel(users: any[], filename = 'users') {
  const data = users.map((u) => ({
    'ID': u.id,
    'Email': u.email,
    'Nama': u.name,
    'Role': u.role === 'RENTER' ? 'Penyewa' : u.role === 'OWNER' ? 'Pemilik' : 'Admin',
    'Status': u.status === 'VERIFIED' ? 'Terverifikasi' : u.status === 'PENDING' ? 'Pending' : 'Ditolak',
    'Tanggal Daftar': new Date(u.createdAt).toLocaleDateString('id-ID'),
  }));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 20 }, // ID
    { wch: 25 }, // Email
    { wch: 25 }, // Nama
    { wch: 12 }, // Role
    { wch: 15 }, // Status
    { wch: 15 }, // Tanggal Daftar
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ============================================================================
// CSV EXPORT FUNCTIONS
// ============================================================================

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
}
