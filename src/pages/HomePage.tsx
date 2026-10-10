import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import HeroCinematic from '../components/HeroCinematic';
import SearchFilter from '../components/SearchFilter';
import VehicleCard from '../components/VehicleCard';
import { vehicles } from '../data/mockData';
import { useAppStore } from '../stores/useAppStore';
import { Vehicle } from '../stores/useAppStore';
import {
  Shield, Clock, Award, Headphones, Car, Star,
  ArrowRight, Sparkles, Gem, Zap, FileText
} from 'lucide-react';

export default function HomePage() {
  const { setCurrentPage, setSelectedVehicle, setShowBookingModal } = useAppStore();
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: featuresScroll } = useScroll({
    target: featuresRef,
    offset: ['start end', 'end start'],
  });
  const featuresY = useTransform(featuresScroll, [0, 1], [100, -100]);

  const handleBook = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
    setCurrentPage('booking');
  };

  const handleView360 = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentPage('fleet');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCinematic />

      {/* Search Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-3">
              Temukan Kendaraan <span className="text-gold-gradient">Sempurna</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Filter berdasarkan lokasi, tanggal, tipe kendaraan, dan preferensi Anda
            </p>
          </motion.div>
          <SearchFilter />
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-2">
                Armada <span className="text-gold-gradient">Unggulan</span>
              </h2>
              <p className="text-gray-400">Koleksi kendaraan premium terpopuler</p>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => setCurrentPage('fleet')}
              className="hidden sm:flex items-center gap-2 text-gold-400 text-sm font-medium hover:text-gold-300 transition-colors"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 3).map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                onView360={handleView360}
                onBook={handleBook}
              />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <button
              onClick={() => setCurrentPage('fleet')}
              className="text-gold-400 text-sm font-medium flex items-center gap-2 mx-auto"
            >
              Lihat Semua Armada <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section with Parallax */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <motion.div
          style={{ y: featuresY }}
          className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(featuresScroll, [0, 1], [-50, 50]) }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/3 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-3">
              Mengapa <span className="text-gold-gradient">Renmoku</span>?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Layanan premium dengan standar tertinggi untuk kenyamanan perjalanan Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Asuransi Penuh',
                desc: 'Semua kendaraan dilengkapi asuransi all-risk untuk ketenangan Anda',
                color: 'emerald',
              },
              {
                icon: Clock,
                title: '24/7 Support',
                desc: 'Tim support siap membantu kapan saja, di mana saja',
                color: 'blue',
              },
              {
                icon: Award,
                title: 'Kendaraan Premium',
                desc: 'Hanya kendaraan terbaik dan terawat yang masuk dalam armada kami',
                color: 'gold',
              },
              {
                icon: Headphones,
                title: 'Driver Profesional',
                desc: 'Driver berpengalaman, ramah, dan mengenal rute dengan baik',
                color: 'purple',
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
                  feature.color === 'gold' ? 'bg-gold-500/10' : 'bg-purple-500/10'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'emerald' ? 'text-emerald-400' :
                    feature.color === 'blue' ? 'text-blue-400' :
                    feature.color === 'gold' ? 'text-gold-400' : 'text-purple-400'
                  } group-hover:scale-110 transition-transform`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-3">
              Cara <span className="text-gold-gradient">Mudah</span> Menyewa
            </h2>
            <p className="text-gray-400">Hanya 4 langkah untuk mendapatkan kendaraan impian Anda</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Sparkles, title: 'Pilih Kendaraan', desc: 'Jelajahi armada dan pilih yang sesuai kebutuhan' },
              { step: '02', icon: FileText, title: 'Isi Data & Dokumen', desc: 'Upload dokumen persyaratan sesuai tipe penyewa' },
              { step: '03', icon: Zap, title: 'Bayar DP', desc: 'Konfirmasi booking dengan pembayaran DP 30%' },
              { step: '04', icon: Car, title: 'Nikmati Perjalanan', desc: 'Pick-up kendaraan dan mulai perjalanan mewah Anda' },
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-8 sm:p-12 text-center border border-gold-500/10 overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-radial-gold" />
            
            <div className="relative z-10">
              <Gem className="w-12 h-12 text-gold-400 mx-auto mb-4" />
              <h2 className="font-[Playfair_Display] text-2xl sm:text-4xl font-bold text-white mb-4">
                Siap Merasakan Kemewahan?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Bergabunglah dengan ribuan pelanggan puas yang telah mempercayakan
                perjalanan mereka kepada Renmoku
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('fleet')}
                  className="btn-luxury text-base px-8 py-4"
                >
                  Mulai Sewa Sekarang
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
                    <p className="text-xs text-gray-500">2,500+ pelanggan puas</p>
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
              © 2025 Renmoku. All rights reserved. Premium Car Rental Experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
