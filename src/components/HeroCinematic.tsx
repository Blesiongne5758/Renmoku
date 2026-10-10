import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronDown, Play, Shield, Clock, Star } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function HeroCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const { setCurrentPage } = useAppStore();

  // Particle animation variants
  const particleVariants = {
    initial: { opacity: 0, y: 100 },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      y: [100, -100],
      x: [0, Math.sin(i) * 50],
      transition: {
        duration: 3 + i * 0.5,
        repeat: Infinity,
        delay: i * 0.3,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-900 via-luxury-800 to-luxury-900" />
        
        {/* Radial gold glow */}
        <div className="absolute inset-0 bg-radial-gold" />
        
        {/* Animated grid pattern */}
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
            custom={i}
            variants={particleVariants}
            initial="initial"
            animate="animate"
            className="absolute w-1 h-1 rounded-full bg-gold-500/30"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-gold-500/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-xs sm:text-sm text-gold-300 font-medium tracking-wide">
            PREMIUM CAR RENTAL EXPERIENCE
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-[Playfair_Display] text-4xl sm:text-6xl lg:text-8xl font-bold leading-tight mb-6"
        >
          <span className="block text-white">Redefinisi</span>
          <span className="block text-gold-gradient">Kemewahan</span>
          <span className="block text-white">Bergerak</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
        >
          Nikmati koleksi kendaraan premium terbaik dengan layanan eksklusif.
          Dari sedan mewah hingga SUV flagship — semua dalam genggaman Anda.
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
            onClick={() => setCurrentPage('fleet')}
            className="btn-luxury text-base px-8 py-4 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Jelajahi Armada
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('booking')}
            className="px-8 py-4 rounded-lg border border-gold-500/30 text-gold-300 font-medium hover:bg-gold-500/5 transition-all"
          >
            Booking Sekarang
          </motion.button>
        </motion.div>

        {/* Hero car showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="perspective-container relative max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Car image with cinematic effects */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80"
                alt="Luxury Vehicle"
                className="w-full h-auto object-cover rounded-2xl shadow-2xl shadow-gold-500/10"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent rounded-2xl" />
              {/* Gold border glow */}
              <div className="absolute inset-0 rounded-2xl border border-gold-500/20" />
            </motion.div>

            {/* Floating info cards */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute top-4 left-4 glass rounded-xl p-3 sm:p-4 animate-float"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                <span className="text-white font-bold text-sm">4.9</span>
                <span className="text-gray-400 text-xs">(128 reviews)</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="absolute bottom-4 right-4 glass rounded-xl p-3 sm:p-4"
              style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
            >
              <div className="text-right">
                <p className="text-xs text-gray-400">Mulai dari</p>
                <p className="text-gold-gradient font-bold text-lg">Rp 1.1jt</p>
                <p className="text-xs text-gray-400">/hari</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { icon: Shield, label: 'Asuransi Full', value: '100%' },
            { icon: Clock, label: 'Response Time', value: '<5 min' },
            { icon: Star, label: 'Rating', value: '4.9/5' },
            { icon: Play, label: 'Armada Aktif', value: '500+' },
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
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 tracking-widest">SCROLL</span>
          <ChevronDown className="w-5 h-5 text-gold-500/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
