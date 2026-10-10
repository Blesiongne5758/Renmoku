'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportBookingsToExcel, exportBookingToPDF, exportRevenueReportPDF } from '@/lib/export-utils';
import { toast } from 'sonner';

interface ExportButtonProps {
  type: 'bookings' | 'revenue';
  data: any;
}

export default function ExportButton({ type, data }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      
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
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="text-sm">Export</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Export PDF</p>
                  <p className="text-xs text-gray-500">Invoice & laporan</p>
                </div>
              </button>
              <div className="border-t border-white/5" />
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-sm font-medium">Export Excel</p>
                  <p className="text-xs text-gray-500">Data tabular</p>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
