import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================================================
// PDF EXPORT UTILITIES
// ============================================================================

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  data: (string | number)[][];
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Export data to PDF with table
 */
export const exportToPDF = (options: PDFExportOptions) => {
  const { title, subtitle, headers, data, filename, orientation = 'portrait' } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title, 14, 22);

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 30);
  }

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100);
  const date = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Tanggal: ${date}`, 14, subtitle ? 38 : 30);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: subtitle ? 45 : 37,
    theme: 'striped',
    headStyles: {
      fillColor: [212, 175, 55], // Gold color
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

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount} | Renmoku - Premium Car Rental`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export booking details to PDF
 */
export const exportBookingToPDF = (booking: any) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55);
  doc.text('RENMOKU', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Invoice Booking', 14, 28);

  // Booking Info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`No. Booking: ${booking.id}`, 14, 40);
  doc.text(`Tanggal: ${new Date(booking.createdAt).toLocaleDateString('id-ID')}`, 14, 46);
  doc.text(`Status: ${booking.status}`, 14, 52);

  // Renter Info
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Informasi Penyewa', 14, 65);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Nama: ${booking.renter?.name || '-'}`, 14, 72);
  doc.text(`Email: ${booking.renter?.email || '-'}`, 14, 78);
  doc.text(`Telepon: ${booking.renter?.phone || '-'}`, 14, 84);

  // Vehicle Info
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Informasi Kendaraan', 14, 97);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Kendaraan: ${booking.vehicle?.brand} ${booking.vehicle?.model}`, 14, 104);
  doc.text(`Tahun: ${booking.vehicle?.year || '-'}`, 14, 110);
  doc.text(`Durasi: ${booking.startDate} - ${booking.endDate}`, 14, 116);

  // Payment Info
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Informasi Pembayaran', 14, 129);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Total Harga: Rp ${booking.totalPrice?.toLocaleString('id-ID') || '0'}`, 14, 136);
  doc.text(`DP (50%): Rp ${booking.dpAmount?.toLocaleString('id-ID') || '0'}`, 14, 142);
  doc.text(`Sisa Pembayaran: Rp ${((booking.totalPrice || 0) - (booking.dpAmount || 0)).toLocaleString('id-ID')}`, 14, 148);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Terima kasih telah menggunakan layanan Renmoku', 14, 280);
  doc.text('www.renmoku.id', 14, 285);

  doc.save(`booking-${booking.id}.pdf`);
};

// ============================================================================
// EXCEL EXPORT UTILITIES
// ============================================================================

interface ExcelExportOptions {
  data: any[];
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel
 */
export const exportToExcel = (options: ExcelExportOptions) => {
  const { data, filename, sheetName = 'Data' } = options;

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  worksheet['!cols'] = colWidths;

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Save file
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Export bookings to Excel
 */
export const exportBookingsToExcel = (bookings: any[]) => {
  const data = bookings.map((booking) => ({
    'ID Booking': booking.id,
    'Tanggal': new Date(booking.createdAt).toLocaleDateString('id-ID'),
    'Penyewa': booking.renter?.name || '-',
    'Email': booking.renter?.email || '-',
    'Kendaraan': `${booking.vehicle?.brand} ${booking.vehicle?.model}`,
    'Mulai': booking.startDate,
    'Selesai': booking.endDate,
    'Durasi': `${booking.durationType}`,
    'Dengan Driver': booking.withDriver ? 'Ya' : 'Tidak',
    'Total': booking.totalPrice,
    'DP': booking.dpAmount,
    'Status': booking.status,
  }));

  exportToExcel({
    data,
    filename: `bookings-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Bookings',
  });
};

/**
 * Export vehicles to Excel
 */
export const exportVehiclesToExcel = (vehicles: any[]) => {
  const data = vehicles.map((vehicle) => ({
    'ID': vehicle.id,
    'Brand': vehicle.brand,
    'Model': vehicle.model,
    'Tahun': vehicle.year,
    'Transmisi': vehicle.transmission,
    'Kapasitas': vehicle.capacity,
    'BBM': vehicle.fuelType,
    'Harga/Hari': vehicle.priceDaily,
    'Harga/Minggu': vehicle.priceWeekly,
    'Harga/Bulan': vehicle.priceMonthly,
    'Status': vehicle.status,
    'Lokasi': vehicle.location,
  }));

  exportToExcel({
    data,
    filename: `vehicles-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Vehicles',
  });
};

// ============================================================================
// CSV EXPORT UTILITIES
// ============================================================================

interface CSVExportOptions {
  data: any[];
  filename: string;
}

/**
 * Export data to CSV
 */
export const exportToCSV = (options: CSVExportOptions) => {
  const { data, filename } = options;

  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and save
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

/**
 * Export users to CSV
 */
export const exportUsersToCSV = (users: any[]) => {
  const data = users.map((user) => ({
    ID: user.id,
    Email: user.email,
    Nama: user.name,
    Role: user.role,
    Status: user.status,
    'Tanggal Daftar': new Date(user.createdAt).toLocaleDateString('id-ID'),
  }));

  exportToCSV({
    data,
    filename: `users-${new Date().toISOString().split('T')[0]}`,
  });
};

// ============================================================================
// REVENUE REPORT EXPORT
// ============================================================================

/**
 * Export revenue report to PDF
 */
export const exportRevenueReportToPDF = (report: any) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55);
  doc.text('RENMOKU', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Laporan Pendapatan', 14, 28);

  // Period
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Periode: ${report.period}`, 14, 36);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Ringkasan', 14, 55);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Total Pendapatan: Rp ${report.totalRevenue?.toLocaleString('id-ID') || '0'}`, 14, 62);
  doc.text(`Total Booking: ${report.totalBookings || 0}`, 14, 68);
  doc.text(`Komisi Platform: Rp ${report.totalCommission?.toLocaleString('id-ID') || '0'}`, 14, 74);
  doc.text(`Rata-rata per Booking: Rp ${report.averageBookingValue?.toLocaleString('id-ID') || '0'}`, 14, 80);
  doc.text(`Pertumbuhan: ${report.growthRate || 0}%`, 14, 86);

  // Breakdown table
  if (report.breakdown && report.breakdown.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Detail Harian', 14, 100);

    autoTable(doc, {
      head: [['Tanggal', 'Pendapatan', 'Jumlah Booking']],
      body: report.breakdown.map((item: any) => [
        item.date,
        `Rp ${item.revenue?.toLocaleString('id-ID') || '0'}`,
        item.bookings || 0,
      ]),
      startY: 107,
      theme: 'striped',
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Renmoku - Premium Car Rental Platform', 14, 280);

  doc.save(`revenue-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export revenue report to Excel
 */
export const exportRevenueReportToExcel = (report: any) => {
  // Summary sheet
  const summaryData = [
    { Metric: 'Total Pendapatan', Value: `Rp ${report.totalRevenue?.toLocaleString('id-ID') || '0'}` },
    { Metric: 'Total Booking', Value: report.totalBookings || 0 },
    { Metric: 'Komisi Platform', Value: `Rp ${report.totalCommission?.toLocaleString('id-ID') || '0'}` },
    { Metric: 'Rata-rata per Booking', Value: `Rp ${report.averageBookingValue?.toLocaleString('id-ID') || '0'}` },
    { Metric: 'Pertumbuhan', Value: `${report.growthRate || 0}%` },
  ];

  // Breakdown sheet
  const breakdownData = report.breakdown?.map((item: any) => ({
    Tanggal: item.date,
    Pendapatan: item.revenue,
    'Jumlah Booking': item.bookings,
  })) || [];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Add summary sheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

  // Add breakdown sheet
  if (breakdownData.length > 0) {
    const breakdownSheet = XLSX.utils.json_to_sheet(breakdownData);
    XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Detail Harian');
  }

  // Save
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `revenue-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.${extension}`;
};
