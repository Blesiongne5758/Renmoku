import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Car, Search } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function HeroCinematic() {
  const { setCurrentPage } = useAppStore();
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

  const [searchParams, setSearchParams] = useState({
    location: '',
    date: '',
    type: '',
  });

  const handleSearch = () => {
    setCurrentPage('fleet');
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-dark-purple">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {/* Dynamic Particles */}
        {[...Array(50)].map((_, i) => (
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-[Playfair_Display] text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 mb-6 tracking-tight-custom">
            Rasakan Kemewahan
          </h1>
          <h2 className="font-[Playfair_Display] text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight-custom">
            di Setiap Perjalanan
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Sewa mobil premium dengan pengalaman booking yang tak terlupakan
          </p>
        </motion.div>

        {/* Car Showcase with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: mousePosition.x * 0.5,
          }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative mb-16"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gold-500/20 blur-3xl opacity-30 animate-pulse-soft" />
            
            {/* Car Image */}
            <div className="relative bg-gradient-to-t from-transparent to-purple-900/20 rounded-3xl p-12">
              <motion.img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80"
                alt="Luxury Car"
                className="w-full h-auto drop-shadow-2xl"
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
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass border border-gold-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-gold-400 text-sm mb-2 font-medium">
                  <MapPin className="w-4 h-4" />
                  Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Jakarta"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 transition-all"
                  value={searchParams.location}
                  onChange={(e) => 
                    setSearchParams({ ...searchParams, location: e.target.value })
                  }
                />
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-gold-400 text-sm mb-2 font-medium">
                  <Calendar className="w-4 h-4" />
                  Tanggal
                </label>
                <input
                  type="date"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 transition-all [color-scheme:dark]"
                  value={searchParams.date}
                  onChange={(e) => 
                    setSearchParams({ ...searchParams, date: e.target.value })
                  }
                />
              </div>

              {/* Car Type */}
              <div>
                <label className="flex items-center gap-2 text-gold-400 text-sm mb-2 font-medium">
                  <Car className="w-4 h-4" />
                  Tipe Mobil
                </label>
                <select
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 transition-all appearance-none cursor-pointer"
                  value={searchParams.type}
                  onChange={(e) => 
                    setSearchParams({ ...searchParams, type: e.target.value })
                  }
                >
                  <option value="">Semua Tipe</option>
                  <option value="mpv">MPV</option>
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-luxury-900 font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-gold-400/50 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Cari
                </motion.button>
              </div>
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
  );
}
