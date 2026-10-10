import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Car,
  Search,
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
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function LandingPage() {
  const { setCurrentPage, setAuthMode } = useAppStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    setAuthMode('register');
    setCurrentPage('auth');
  };

  const handleLogin = () => {
    setAuthMode('login');
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark-purple">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-luxury-950" />
          
          {/* Dynamic Particles */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}

          {/* Glow Effects */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Car Image with Reveal Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: mousePosition.x * 0.5,
            }}
            transition={{ 
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-12 relative"
          >
            <div className="relative inline-block">
              <motion.img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80"
                alt="Luxury Car"
                className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 60px rgba(212, 168, 83, 0.3))',
                }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Sparkles around car */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gold-400 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-[Playfair_Display] text-5xl sm:text-6xl lg:text-7xl font-bold text-gold-gradient mb-6 tracking-tight-custom"
          >
            Rasakan Kemewahan
            <br />
            di Setiap Perjalanan
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          >
            Platform rental mobil premium dengan koleksi kendaraan mewah terbaik.
            Proses mudah, harga transparan, layanan profesional 24/7.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-2xl p-2 border border-gold-500/10">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
                  <input
                    type="text"
                    placeholder="Lokasi"
                    className="input-luxury pl-10 py-3 rounded-xl w-full"
                  />
                </div>

                {/* Date */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
                  <input
                    type="date"
                    className="input-luxury pl-10 py-3 rounded-xl w-full [color-scheme:dark]"
                  />
                </div>

                {/* Car Type */}
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
                  <select className="input-luxury pl-10 py-3 rounded-xl w-full appearance-none cursor-pointer">
                    <option value="">Tipe Mobil</option>
                    <option value="suv">SUV</option>
                    <option value="sedan">Sedan</option>
                    <option value="mpv">MPV</option>
                    <option value="sport">Sport</option>
                  </select>
                </div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-luxury py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="font-semibold">Cari</span>
                </motion.button>
              </div>
            </div>
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
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gold-500/50 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Popular Cars Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-luxury-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight-custom">
              Mobil <span className="text-gold-gradient">Populer</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
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
                <div className="p-5">
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

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-luxury">
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
            <p className="text-gray-400 max-w-xl mx-auto">
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
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
