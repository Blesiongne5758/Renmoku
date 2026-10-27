import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, RefreshCw, Home, ArrowRight, Phone, Mail } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function PaymentFailedPage() {
  const { setCurrentPage, currentBooking } = useAppStore();

  // Get error details from store or use defaults
  const bookingId = currentBooking?.id || 'BK-UNKNOWN';
  const errorCode = 'PAYMENT_FAILED';
  const errorMessage = 'Pembayaran tidak dapat diproses';
  const paymentMethod = 'Bank Transfer';

  const handleRetryPayment = () => {
    setCurrentPage('booking');
  };

  const handleContactSupport = () => {
    // Open contact modal or redirect to contact page
    alert('Tim support akan menghubungi Anda segera');
  };

  const errorDetails = {
    'INSUFFICIENT_BALANCE': {
      title: 'Saldo Tidak Cukup',
      description: 'Saldo akun Anda tidak mencukupi untuk melakukan pembayaran.',
      suggestion: 'Silakan isi ulang akun Anda atau gunakan metode pembayaran lain.',
    },
    'CARD_DECLINED': {
      title: 'Kartu Ditolak',
      description: 'Kartu kredit/debit Anda ditolak oleh bank penerbit.',
      suggestion: 'Periksa limit kartu atau gunakan kartu lain.',
    },
    'EXPIRED_CARD': {
      title: 'Kartu Kedaluwarsa',
      description: 'Kartu yang Anda gunakan sudah kedaluwarsa.',
      suggestion: 'Gunakan kartu yang masih aktif.',
    },
    'INVALID_CARD': {
      title: 'Kartu Tidak Valid',
      description: 'Nomor kartu yang Anda masukkan tidak valid.',
      suggestion: 'Periksa kembali nomor kartu Anda.',
    },
    'BANK_ERROR': {
      title: 'Error Bank',
      description: 'Terjadi kesalahan pada sistem bank.',
      suggestion: 'Silakan coba lagi dalam beberapa menit atau gunakan metode pembayaran lain.',
    },
    'TIMEOUT': {
      title: 'Waktu Habis',
      description: 'Sesi pembayaran telah berakhir.',
      suggestion: 'Silakan ulangi proses pembayaran dari awal.',
    },
    'PAYMENT_FAILED': {
      title: 'Pembayaran Gagal',
      description: 'Pembayaran tidak dapat diproses.',
      suggestion: 'Silakan coba lagi atau hubungi customer support.',
    },
  };

  const errorInfo = errorDetails[errorCode as keyof typeof errorDetails] || errorDetails['PAYMENT_FAILED'];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 flex items-center justify-center mx-auto">
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <XCircle className="w-12 h-12 text-red-400" />
              </motion.div>
            </div>
            
            {/* Pulse rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-red-500/30"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-3"
          >
            Pembayaran Gagal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg"
          >
            Maaf, pembayaran Anda tidak dapat diproses
          </motion.p>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-luxury p-6 sm:p-8 mb-6"
        >
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{errorInfo.title}</h2>
              <p className="text-gray-400">{errorInfo.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Error Info */}
            <div>
              <h3 className="text-white font-semibold mb-3">Informasi Error</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kode Booking</span>
                  <span className="text-white font-medium font-mono">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kode Error</span>
                  <span className="text-red-400 font-medium font-mono">{errorCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Metode Pembayaran</span>
                  <span className="text-white font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Waktu</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggestion */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Saran</p>
                  <p className="text-sm text-gray-400">{errorInfo.suggestion}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetryPayment}
            className="btn-luxury py-4 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContactSupport}
            className="btn-ghost py-4 flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Hubungi Support
          </motion.button>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card-luxury p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-4">📞 Butuh Bantuan?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Telepon</p>
                <p className="text-sm text-gray-400">+62 21 1234 5678</p>
                <p className="text-xs text-gray-500">Senin - Minggu, 08:00 - 22:00 WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Email</p>
                <p className="text-sm text-gray-400">support@renmoku.id</p>
                <p className="text-xs text-gray-500">Respon dalam 1x24 jam</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <button
            onClick={() => setCurrentPage('home')}
            className="text-sm text-gray-500 hover:text-gold-400 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  );
}
