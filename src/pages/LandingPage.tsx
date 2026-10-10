import { motion } from 'framer-motion';
import {
  Star,
  ArrowRight,
  Sparkles,
  Crown,
  Shield,
  Clock,
  Award,
  Users,
  CreditCard,
  FileText,
  Car
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import VehicleShowcase from '../components/VehicleShowcase';
import HeroCinematic from '../components/vehicle/HeroCinematic';

export default function LandingPage() {
  const { setCurrentPage, setAuthMode } = useAppStore();

  const handleGetStarted = () => {
    setAuthMode('register');
    setCurrentPage('auth');
  };

  // Popular cars data
  const popularCars = [
    {
      name: 'Toyota Avanza',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=800&q=80',
      rating: 4.8,
    },
    {
      name: 'Honda HR-V',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      rating: 4.9,
    },
    {
      name: 'BMW X5',
      price: 2500000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      rating: 5.0,
    },
    {
      name: 'Mercedes S-Class',
      price: 3500000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      rating: 5.0,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Using HeroCinematic Component */}
      <HeroCinematic />

      {/* Popular Cars Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-luxury-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
              Mobil <span className="text-gold-gradient">Populer</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Pilihan kendaraan terbaik yang paling banyak diminati pelanggan kami
            </p>
          </motion.div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCars.map((car, index) => (
              <motion.div
                key={car.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card-luxury rounded-2xl overflow-hidden group cursor-pointer"
              >
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg glass">
                    <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                    <span className="text-xs text-white font-medium">{car.rating}</span>
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-gold-300 transition-colors">
                    {car.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gold-gradient font-bold text-xl">
                      Rp {(car.price / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs text-gray-500">/hari</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('fleet')}
              className="btn-ghost px-8 py-3 rounded-xl inline-flex items-center gap-2"
            >
              Lihat Semua Armada
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Vehicle Showcase - 360° View */}
      <VehicleShowcase />

      {/* Features Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-luxury">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
              Mengapa <span className="text-gold-gradient">Renmoku</span>?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Layanan premium dengan standar tertinggi untuk kenyamanan perjalanan Anda
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
                <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
              <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
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
                    <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
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

      {/* CTA Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-luxury p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-gold opacity-40" />
            
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-6" />
              <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
                Siap Bergabung?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
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

      {/* Footer */}
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
            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentPage('terms')}
                className="text-sm text-gray-500 hover:text-gold-400 transition-colors"
              >
                Syarat & Ketentuan
              </button>
              <p className="text-gray-600 text-sm">
                © 2025 Renmoku
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
