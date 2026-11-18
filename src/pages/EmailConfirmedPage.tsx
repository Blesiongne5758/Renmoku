import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Car } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function EmailConfirmedPage() {
  const { setCurrentPage, setAuthMode, setAuthModalOpen } = useAppStore();

  const handleGoToLogin = () => {
    setAuthMode('login');
    setCurrentPage('auth');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10 rounded-3xl border border-white/10 bg-[#12151c]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Car className="h-6 w-6 text-yellow-400" />
          <span className="font-serif text-xl tracking-widest uppercase font-bold text-white">
            RENMOKU
          </span>
        </div>

        {/* Animated Check Icon */}
        <div className="relative inline-block mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 16 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 via-emerald-400/20 to-yellow-400/20 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          {/* Subtle pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-emerald-400/30"
          />
        </div>

        {/* Main Heading Text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug"
        >
          Terima Kasih telah mendaftar Renmoku, Selamat bergabung.
        </motion.h1>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
        >
          Alamat email Anda telah berhasil diverifikasi. Akun Anda kini aktif dan siap digunakan untuk menikmati layanan rental armada eksklusif kami.
        </motion.p>

        {/* Feature Highlights Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-gray-300"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Akun Terverifikasi
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Layanan Armada Siap
          </span>
        </motion.div>

        {/* Action Button: Lanjutkan ke Halaman Login */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoToLogin}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold text-sm shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 transition"
        >
          <span>Lanjutkan ke Halaman Login</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
