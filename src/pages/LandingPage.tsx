import { motion } from 'framer-motion';
import {
  Car, Shield, Clock, Award, Users, Star,
  ArrowRight, CheckCircle2, Sparkles, Crown,
  MapPin, CreditCard, FileText, Search
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function LandingPage() {
  const { setCurrentPage, setAuthMode } = useAppStore();

  const handleGetStarted = () => {
    setAuthMode('register');
    setCurrentPage('auth');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setCurrentPage('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {/* Hero Section - Minimal & Focused */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Atmospheric Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-radial-gold opacity-60" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-gold-500/10 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
            <span className="text-xs text-gold-300/80 font-medium tracking-wider uppercase">
              Premium Car Rental
            </span>
          </motion.div>

          {/* Heading - Clean Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-[Playfair_Display] text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight-custom"
          >
            <span className="block text-white">Sewa Mobil</span>
            <span className="block text-gold-gradient mt-2">Premium</span>
            <span className="block text-white/90 mt-2 text-4xl sm:text-5xl lg:text-6xl font-medium">
              Tanpa Ribet
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Platform rental mobil terpercaya dengan koleksi kendaraan mewah.
            Proses mudah, harga transparan, layanan profesional.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStarted}
              className="btn-luxury text-base px-8 py-4 flex items-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Daftar Sekarang
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="btn-ghost text-base px-8 py-4"
            >
              Sudah Punya Akun?
            </motion.button>
          </motion.div>

          {/* Stats - Neumorphic Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: Car, label: 'Armada', value: '500+' },
              { icon: Users, label: 'Pelanggan', value: '2,500+' },
              { icon: Star, label: 'Rating', value: '4.9/5' },
              { icon: MapPin, label: 'Kota', value: '15+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="neu-raised rounded-2xl p-5 text-center"
              >
                <stat.icon className="w-5 h-5 text-gold-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl mb-0.5">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-gray-600 tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gold-500/30 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
              Mengapa <span className="text-gold-gradient">Renmoku</span>?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Layanan premium dengan standar tertinggi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Asuransi Lengkap',
                desc: 'Semua kendaraan dilengkapi asuransi all-risk',
              },
              {
                icon: Clock,
                title: 'Proses Cepat',
                desc: 'Booking online, verifikasi dalam hitungan jam',
              },
              {
                icon: Award,
                title: 'Kendaraan Premium',
                desc: 'Hanya kendaraan terbaik dan terawat',
              },
              {
                icon: Users,
                title: 'Driver Profesional',
                desc: 'Driver berpengalaman dan ramah',
              },
              {
                icon: CreditCard,
                title: 'Pembayaran Fleksibel',
                desc: 'DP 30-50%, pelunasan saat pick-up',
              },
              {
                icon: FileText,
                title: 'E-Contract Digital',
                desc: 'Kontrak digital yang aman dan transparan',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="card-luxury p-6 group"
              >
                <div className="w-12 h-12 rounded-xl neu-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Minimal Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-radial-gold opacity-30" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
              Cara <span className="text-gold-gradient">Mudah</span> Menyewa
            </h2>
            <p className="text-gray-500">Hanya 4 langkah sederhana</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Search, title: 'Pilih Kendaraan', desc: 'Jelajahi armada kami' },
              { step: '02', icon: FileText, title: 'Upload Dokumen', desc: 'KTP, SIM, dan persyaratan' },
              { step: '03', icon: CreditCard, title: 'Bayar DP', desc: 'Konfirmasi dengan DP 30%' },
              { step: '04', icon: Car, title: 'Nikmati Perjalanan', desc: 'Pick-up dan mulai perjalanan' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="neu-raised rounded-2xl p-6 text-center h-full">
                  <div className="relative inline-block mb-4">
                    <div className="w-14 h-14 rounded-2xl neu-gold flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-gold-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-luxury-900 text-xs font-bold flex items-center justify-center shadow-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge-gold mb-4">
                <Crown className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">UNTUK PEMILIK RENTAL</span>
              </div>
              <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
                Kelola Armada <span className="text-gold-gradient">Lebih Mudah</span>
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Daftarkan kendaraan Anda dan dapatkan penghasilan tambahan dengan platform lengkap.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Dashboard lengkap untuk manajemen armada',
                  'Kalender booking real-time',
                  'Pengaturan DP fleksibel (20-50%)',
                  'Laporan pendapatan detail',
                  'Virtual 360° showcase',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="btn-luxury flex items-center gap-2 group"
              >
                Daftar Sebagai Owner
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-luxury p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold">Dashboard Owner</h3>
                  <span className="badge-gold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="neu-pressed rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Armada</p>
                    <p className="text-white font-bold text-2xl">12</p>
                  </div>
                  <div className="neu-pressed rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Booking Aktif</p>
                    <p className="text-gold-400 font-bold text-2xl">4</p>
                  </div>
                </div>

                <div className="neu-pressed rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Pendapatan Bulan Ini</p>
                  <p className="text-gold-gradient font-bold text-3xl">Rp 45.5jt</p>
                  <p className="text-xs text-emerald-400 mt-1">+15% dari bulan lalu</p>
                </div>

                <div className="neu-soft rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3">Pengaturan DP</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-luxury-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '30%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gold-400 font-semibold">30%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-luxury p-10 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-gold opacity-40" />
            
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-gold-400 mx-auto mb-4" />
              <h2 className="font-[Playfair_Display] text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight-custom">
                Siap Bergabung?
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Bergabunglah dengan ribuan pengguna yang telah mempercayakan kebutuhan rental mobil mereka
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="btn-luxury text-base px-8 py-4"
              >
                Daftar Sekarang - Gratis
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg neu-gold flex items-center justify-center">
                <Car className="w-4 h-4 text-gold-400" />
              </div>
              <span className="font-[Playfair_Display] text-lg font-semibold text-gold-gradient-soft">
                RENMOKU
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 Renmoku. Premium Car Rental Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
