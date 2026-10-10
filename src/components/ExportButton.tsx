import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportBookingsToExcel,
  exportVehiclesToExcel,
  exportUsersToCSV,
  exportRevenueReportToPDF,
  exportRevenueReportToExcel,
} from '../lib/exportUtils';

type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ExportButtonProps {
  data: any[];
  filename: string;
  format?: ExportFormat;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showFormatSelector?: boolean;
  customHeaders?: string[];
  customData?: (item: any) => Record<string, any>;
}

export default function ExportButton({
  data,
  filename,
  format = 'excel',
  variant = 'primary',
  size = 'md',
  showFormatSelector = false,
  customHeaders,
  customData,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(format);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (exportFormat?: ExportFormat) => {
    const formatToUse = exportFormat || selectedFormat;
    setIsExporting(true);

    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (customData && customHeaders) {
        // Custom data transformation
        const transformedData = data.map(customData);
        
        switch (formatToUse) {
          case 'pdf':
            exportToPDF({
              title: filename,
              headers: customHeaders,
              data: transformedData.map((item) =>
                customHeaders.map((header) => item[header] || '-')
              ),
              filename,
            });
            break;
          case 'excel':
            exportToExcel({
              data: transformedData,
              filename,
            });
            break;
          case 'csv':
            exportToCSV({
              data: transformedData,
              filename,
            });
            break;
        }
      } else {
        // Default export
        switch (formatToUse) {
          case 'pdf':
            exportToPDF({
              title: filename,
              headers: Object.keys(data[0] || {}),
              data: data.map((item) => Object.values(item)),
              filename,
            });
            break;
          case 'excel':
            exportToExcel({
              data,
              filename,
            });
            break;
          case 'csv':
            exportToCSV({
              data,
              filename,
            });
            break;
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const getIcon = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'csv':
        return <File className="w-4 h-4" />;
    }
  };

  const getLabel = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'excel':
        return 'Excel';
      case 'csv':
        return 'CSV';
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-luxury-900 hover:shadow-lg hover:shadow-gold-500/30',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
  };

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (showFormatSelector) {
            setShowDropdown(!showDropdown);
          } else {
            handleExport();
          }
        }}
        disabled={isExporting || data.length === 0}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            {showFormatSelector ? (
              <>
                <Download className="w-4 h-4" />
                <span>Export</span>
              </>
            ) : (
              <>
                {getIcon(selectedFormat)}
                <span>Export {getLabel(selectedFormat)}</span>
              </>
            )}
          </>
        )}
      </motion.button>

      {/* Format Dropdown */}
      {showFormatSelector && showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 bg-luxury-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[150px]"
        >
          {(['pdf', 'excel', 'csv'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              {getIcon(fmt)}
              <span className="text-sm text-white">Export {getLabel(fmt)}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED EXPORT BUTTONS
// ============================================================================

interface BookingExportButtonProps {
  bookings: any[];
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function BookingExportButton({ bookings, variant = 'primary', size = 'md' }: BookingExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (format === 'excel') {
        exportBookingsToExcel(bookings);
      } else {
        // PDF export for bookings
        const data = bookings.map((b) => [
          b.id,
          new Date(b.createdAt).toLocaleDateString('id-ID'),
          b.renter?.name || '-',
          `${b.vehicle?.brand} ${b.vehicle?.model}`,
          b.startDate,
          b.endDate,
          `Rp ${b.totalPrice?.toLocaleString('id-ID')}`,
          b.status,
        ]);

        exportToPDF({
          title: 'Laporan Booking',
          subtitle: `Total: ${bookings.length} booking`,
          headers: ['ID', 'Tanggal', 'Penyewa', 'Kendaraan', 'Mulai', 'Selesai', 'Total', 'Status'],
          data,
          filename: `bookings-${new Date().toISOString().split('T')[0]}`,
          orientation: 'landscape',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('excel')}
        disabled={isExporting || bookings.length === 0}
        className={`${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-luxury-900'
            : 'bg-white/5 border border-white/10 text-white'
        } rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50`}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('pdf')}
        disabled={isExporting || bookings.length === 0}
        className={`${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            : 'bg-white/5 border border-white/10 text-white'
        } rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50`}
      >
        <FileText className="w-4 h-4" />
        PDF
      </motion.button>
    </div>
  );
}

interface VehicleExportButtonProps {
  vehicles: any[];
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function VehicleExportButton({ vehicles, variant = 'primary', size = 'md' }: VehicleExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      exportVehiclesToExcel(vehicles);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleExport}
      disabled={isExporting || vehicles.length === 0}
      className={`${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-luxury-900'
          : 'bg-white/5 border border-white/10 text-white'
      } rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50`}
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel</span>
        </>
      )}
    </motion.button>
  );
}

interface RevenueExportButtonProps {
  report: any;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function RevenueExportButton({ report, variant = 'primary', size = 'md' }: RevenueExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (format === 'excel') {
        exportRevenueReportToExcel(report);
      } else {
        exportRevenueReportToPDF(report);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport laporan');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('excel')}
        disabled={isExporting}
        className={`${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-luxury-900'
            : 'bg-white/5 border border-white/10 text-white'
        } rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50`}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className={`${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            : 'bg-white/5 border border-white/10 text-white'
        } rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50`}
      >
        <FileText className="w-4 h-4" />
        PDF
      </motion.button>
    </div>
  );
}
