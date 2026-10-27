import { motion } from 'framer-motion';
import { CheckCircle, Download, Calendar, MapPin, Clock, Car, ArrowRight } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';

export default function PaymentSuccessPage() {
  const { setCurrentPage, currentBooking } = useAppStore();

  // Get payment details from store or use defaults
  const bookingId = currentBooking?.id || 'BK-' + Date.now().toString(36).toUpperCase();
  const transactionId = 'TRX-' + Date.now().toString(36).toUpperCase();
  const amount = currentBooking?.totalPrice || 0;
  const paymentMethod = 'Bank Transfer';
  const vehicleName = currentBooking?.vehicleName || 'Toyota Alphard';
  const startDate = currentBooking?.startDate || '2026-10-20';
  const endDate = currentBooking?.endDate || '2026-10-25';
  const pickupLocation = currentBooking?.pickupLocation || 'Jakarta';

  const handleDownloadInvoice = () => {
    // Trigger PDF download
    alert('Invoice akan diunduh dalam format PDF');
  };

  const handleViewBooking = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </motion.div>
            </div>
            
            {/* Pulse rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-3"
          >
            Pembayaran Berhasil!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg"
          >
            Terima kasih telah melakukan pembayaran. Booking Anda telah dikonfirmasi.
          </motion.p>
        </motion.div>

        {/* Payment Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-luxury p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
            <div>
              <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
              <p className="text-gold-gradient font-bold text-xl font-mono">{transactionId}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-emerald-400 font-medium">✓ Lunas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Booking Info */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-gold-400" />
                Detail Booking
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kode Booking</span>
                  <span className="text-white font-medium">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kendaraan</span>
                  <span className="text-white font-medium">{vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Periode Sewa</span>
                  <span className="text-white font-medium">
                    {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lokasi Pick-up</span>
                  <span className="text-white font-medium">{pickupLocation}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-400" />
                Detail Pembayaran
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Metode Pembayaran</span>
                  <span className="text-white font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal Bayar</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-emerald-400 font-medium">Berhasil</span>
                </div>
                <div className="divider-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-300 font-semibold">Total Dibayar</span>
                  <span className="text-gold-gradient font-bold text-xl">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-luxury p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-4">📋 Langkah Selanjutnya</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-400 font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Cek Email Anda</p>
                <p className="text-sm text-gray-400">
                  Detail booking dan invoice telah dikirim ke email terdaftar Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-400 font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Siapkan Dokumen</p>
                <p className="text-sm text-gray-400">
                  Siapkan KTP asli, SIM A, dan dokumen jaminan saat pick-up kendaraan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-400 font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Pick-up Kendaraan</p>
                <p className="text-sm text-gray-400">
                  Datang ke lokasi pick-up pada tanggal {new Date(startDate).toLocaleDateString('id-ID')} pukul 09:00 WIB.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadInvoice}
            className="btn-ghost py-4 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Invoice
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewBooking}
            className="btn-luxury py-4 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Lihat Detail Booking
          </motion.button>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => setCurrentPage('home')}
            className="text-sm text-gray-500 hover:text-gold-400 transition-colors inline-flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  );
}
