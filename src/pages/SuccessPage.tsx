import { motion } from 'framer-motion';
import { CheckCircle2, Download, Calendar, MapPin, Clock, Car } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function SuccessPage() {
  const { setCurrentPage, currentBooking } = useAppStore();

  const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
  const pickupDate = currentBooking?.startDate || '2025-02-01';
  const vehicleName = currentBooking?.vehicleName || 'Toyota Alphard';

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          {/* Animated Check Icon */}
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
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
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
            Booking Berhasil!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400"
          >
            Terima kasih telah mempercayakan perjalanan Anda kepada Renmoku
          </motion.p>
        </motion.div>

        {/* Car Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative h-32 mb-8 overflow-hidden rounded-2xl neu-pressed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-900 via-luxury-800 to-luxury-900" />
          
          {/* Road */}
          <div className="absolute bottom-8 left-0 right-0 h-1 bg-gray-700">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 flex gap-4"
            >
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-8 h-1 bg-gold-500/30" />
              ))}
            </motion.div>
          </div>

          {/* Moving Car */}
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="absolute bottom-10 left-0"
          >
            <Car className="w-16 h-16 text-gold-400" />
          </motion.div>

          {/* Sparkles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 100],
                y: [0, Math.random() * -50]
              }}
              transition={{ 
                duration: 2,
                delay: 1 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute w-2 h-2 rounded-full bg-gold-400"
              style={{ left: `${20 + i * 15}%`, bottom: '50%' }}
            />
          ))}
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-luxury p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kode Booking</p>
              <p className="text-gold-gradient font-bold text-xl font-mono">{bookingCode}</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg badge-gold">
              <span className="text-xs font-medium">Dikonfirmasi</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Vehicle */}
            <div className="flex items-center gap-3 p-3 rounded-xl neu-soft">
              <Car className="w-5 h-5 text-gold-400" />
              <div className="flex-1">
                <p className="text-white font-medium">{vehicleName}</p>
                <p className="text-xs text-gray-500">Premium Vehicle</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3 p-3 rounded-xl neu-soft">
              <Calendar className="w-5 h-5 text-gold-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Jadwal Serah Terima</p>
                <p className="text-xs text-gray-500">{pickupDate}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 p-3 rounded-xl neu-soft">
              <MapPin className="w-5 h-5 text-gold-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Lokasi Pick-up</p>
                <p className="text-xs text-gray-500">Jakarta</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 p-3 rounded-xl neu-soft">
              <Clock className="w-5 h-5 text-gold-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Waktu Pick-up</p>
                <p className="text-xs text-gray-500">09:00 WIB</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-gold rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gold-300 font-medium mb-1">Detail Lengkap</p>
              <p className="text-xs text-gray-400">
                Detail booking lengkap telah dikirim ke email Anda. Tim kami akan menghubungi dalam 5 menit untuk konfirmasi.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('dashboard')}
            className="btn-luxury py-3 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Lihat Detail
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-ghost py-3 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </motion.button>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => setCurrentPage('home')}
            className="text-sm text-gray-500 hover:text-gold-400 transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  );
}
