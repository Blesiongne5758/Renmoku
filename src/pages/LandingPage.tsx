import { motion } from 'framer-motion';
import {
  Car, Shield, Clock, Award, Users, Star,
  ArrowRight, CheckCircle2, Sparkles, Crown,
  MapPin, Calendar, CreditCard, FileText, Search
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function LandingPage() {
  const { setCurrentPage, setAuthModalOpen, setAuthMode } = useAppStore();

  const handleGetStarted = () => {
    setAuthMode('register');
    setCurrentPage('auth');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setCurrentPage('auth');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-900 via-luxury-800 to-luxury-900" />
          <div className="absolute inset-0 bg-radial-gold" />
          
          {/* Animated grid */}
          <motion.div
            animate={{ opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(212,168,83,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(212,168,83,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 1, 0],
                y: [100, -100],
                x: [0, Math.sin(i) * 50],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
              className="absolute w-1 h-1 rounded-full bg-gold-500/30"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-gold-500/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs sm:text-sm text-gold-300 font-medium tracking-wide">
              PREMIUM CAR RENTAL PLATFORM
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-[Playfair_Display] text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="block text-white">Sewa Mobil</span>
            <span className="block text-gold-gradient">Premium</span>
            <span className="block text-white">Tanpa Ribet</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          >
            Platform rental mobil terpercaya dengan koleksi kendaraan mewah.
            Proses mudah, harga transparan, dan layanan profesional 24/7.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212,168,83,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="btn-luxury text-base px-8 py-4 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Daftar Sekarang
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="px-8 py-4 rounded-lg border border-gold-500/30 text-gold-300 font-medium hover:bg-gold-500/5 transition-all"
            >
              Sudah Punya Akun? Masuk
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Car, label: 'Armada Aktif', value: '500+' },
              { icon: Users, label: 'Pelanggan Puas', value: '2,500+' },
              { icon: Star, label: 'Rating', value: '4.9/5' },
              { icon: MapPin, label: 'Kota', value: '15+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, borderColor: 'rgba(212,168,83,0.3)' }}
                className="glass-light rounded-xl p-4 text-center border border-transparent transition-all"
              >
                <stat.icon className="w-5 h-5 text-gold-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4">
              Mengapa Memilih <span className="text-gold-gradient">Renmoku</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Kami menyediakan layanan rental mobil terbaik dengan standar premium
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Asuransi Lengkap',
                desc: 'Semua kendaraan dilengkapi asuransi all-risk untuk ketenangan Anda',
                color: 'emerald',
              },
              {
                icon: Clock,
                title: 'Proses Cepat',
                desc: 'Booking online, verifikasi dokumen, dan pick-up dalam hitungan jam',
                color: 'blue',
              },
              {
                icon: Award,
                title: 'Kendaraan Premium',
                desc: 'Hanya kendaraan terbaik dan terawat yang masuk dalam armada kami',
                color: 'gold',
              },
              {
                icon: Users,
                title: 'Driver Profesional',
                desc: 'Driver berpengalaman, ramah, dan mengenal rute dengan baik',
                color: 'purple',
              },
              {
                icon: CreditCard,
                title: 'Pembayaran Fleksibel',
                desc: 'DP 30-50%, pelunasan saat pick-up. Berbagai metode pembayaran',
                color: 'pink',
              },
              {
                icon: FileText,
                title: 'E-Contract Digital',
                desc: 'Kontrak digital yang aman dan transparan dengan tanda tangan elektronik',
                color: 'cyan',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-gold-500/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'emerald' ? 'bg-emerald-500/10' :
                  feature.color === 'blue' ? 'bg-blue-500/10' :
                  feature.color === 'gold' ? 'bg-gold-500/10' :
                  feature.color === 'purple' ? 'bg-purple-500/10' :
                  feature.color === 'pink' ? 'bg-pink-500/10' : 'bg-cyan-500/10'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'emerald' ? 'text-emerald-400' :
                    feature.color === 'blue' ? 'text-blue-400' :
                    feature.color === 'gold' ? 'text-gold-400' :
                    feature.color === 'purple' ? 'text-purple-400' :
                    feature.color === 'pink' ? 'text-pink-400' : 'text-cyan-400'
                  } group-hover:scale-110 transition-transform`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4">
              Cara <span className="text-gold-gradient">Mudah</span> Menyewa
            </h2>
            <p className="text-gray-400">Hanya 4 langkah untuk mendapatkan kendaraan impian Anda</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Search, title: 'Pilih Kendaraan', desc: 'Jelajahi armada dan pilih yang sesuai kebutuhan' },
              { step: '02', icon: FileText, title: 'Upload Dokumen', desc: 'Upload KTP, SIM, dan dokumen persyaratan' },
              { step: '03', icon: CreditCard, title: 'Bayar DP', desc: 'Konfirmasi booking dengan pembayaran DP 30%' },
              { step: '04', icon: Car, title: 'Nikmati Perjalanan', desc: 'Pick-up kendaraan dan mulai perjalanan' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-gold-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500 text-luxury-900 text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="text-xs text-gold-300 font-medium">UNTUK PEMILIK RENTAL</span>
              </div>
              <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4">
                Kelola Armada <span className="text-gold-gradient">Lebih Mudah</span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Daftarkan kendaraan Anda dan dapatkan penghasilan tambahan. 
                Kami menyediakan platform lengkap untuk manajemen rental mobil.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Dashboard lengkap untuk manajemen armada',
                  'Kalender booking real-time',
                  'Pengaturan DP fleksibel (20-50%)',
                  'Laporan pendapatan detail',
                  'Verifikasi penyewa otomatis',
                  'Support 24/7 untuk owner',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="btn-luxury flex items-center gap-2"
              >
                Daftar Sebagai Owner
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-2xl p-6 border border-gold-500/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Dashboard Owner</h3>
                  <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Total Armada</p>
                    <p className="text-white font-bold text-xl">12</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Booking Aktif</p>
                    <p className="text-gold-400 font-bold text-xl">4</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Pendapatan Bulan Ini</p>
                  <p className="text-gold-gradient font-bold text-2xl">Rp 45.5jt</p>
                  <p className="text-xs text-emerald-400 mt-1">+15% dari bulan lalu</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Pengaturan DP:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[30%] bg-gradient-to-r from-gold-500 to-gold-600 rounded-full" />
                    </div>
                    <span className="text-sm text-gold-400 font-medium">30%</span>
                  </div>
                  <p className="text-xs text-gray-600">Default: 30% | Range: 20-50%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-8 sm:p-12 text-center border border-gold-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-gold" />
            
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-4" />
              <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-4">
                Siap Bergabung dengan Renmoku?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Bergabunglah dengan ribuan pelanggan dan owner yang telah mempercayakan
                kebutuhan rental mobil mereka kepada Renmoku
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="btn-luxury text-base px-8 py-4"
                >
                  Daftar Sekarang - Gratis
                </motion.button>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border-2 border-luxury-900 flex items-center justify-center text-xs font-bold text-luxury-900">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">2,500+ pengguna aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                  <Car className="w-5 h-5 text-luxury-900" />
                </div>
                <span className="font-[Playfair_Display] text-lg font-bold text-gold-gradient">RENMOKU</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Platform rental kendaraan premium terpercaya di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Layanan</h4>
              <ul className="space-y-2">
                {['Sewa Harian', 'Sewa Mingguan', 'Sewa Bulanan', 'Dengan Driver', 'Lepas Kunci'].map((item) => (
                  <li key={item}><span className="text-gray-500 text-sm hover:text-gold-400 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Perusahaan</h4>
              <ul className="space-y-2">
                {['Tentang Kami', 'Karir', 'Blog', 'Kontak', 'FAQ'].map((item) => (
                  <li key={item}><span className="text-gray-500 text-sm hover:text-gold-400 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                {['Syarat & Ketentuan', 'Kebijakan Privasi', 'Kebijakan Pembatalan', 'Asuransi'].map((item) => (
                  <li key={item}><span className="text-gray-500 text-sm hover:text-gold-400 cursor-pointer transition-colors">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Renmoku. All rights reserved. Premium Car Rental Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
