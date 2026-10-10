import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function UnauthorizedPage() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-luxury px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-luxury p-8 sm:p-12 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <Shield className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-[Playfair_Display] text-3xl font-bold text-white mb-3"
        >
          Akses Ditolak
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8"
        >
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login dengan akun yang sesuai atau hubungi administrator.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('home')}
            className="flex-1 btn-ghost py-3 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('auth')}
            className="flex-1 btn-luxury py-3 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Login
          </motion.button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-white/5"
        >
          <p className="text-xs text-gray-500">
            Jika Anda yakin memiliki akses, silakan coba login kembali atau hubungi support.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
