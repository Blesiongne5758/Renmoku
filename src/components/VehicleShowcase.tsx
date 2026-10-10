import { motion } from 'framer-motion';
import { vehicles } from '../data/mockData';
import Vehicle360Viewer from './Vehicle360Viewer';

export default function VehicleShowcase() {
  // Filter kendaraan yang memiliki 360° view
  const showcaseVehicles = vehicles.filter(v => v.has360View).slice(0, 4);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-900 via-luxury-850 to-luxury-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-gold mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
            <span className="text-xs font-medium">VIRTUAL 360° SHOWCASE</span>
          </motion.div>
          
          <h2 className="font-[Playfair_Display] text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight-custom">
            Jelajahi Kendaraan <span className="text-gold-gradient">Premium</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Lihat setiap detail kendaraan dari semua sudut dengan teknologi virtual 360°.
            Setiap kendaraan ditampilkan dengan background garasi mewah yang konsisten.
          </p>
        </motion.div>

        {/* Vehicle Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showcaseVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group"
            >
              <div className="card-luxury overflow-hidden">
                {/* 360° Viewer - Main Display */}
                <div className="relative aspect-video overflow-hidden">
                  <Vehicle360Viewer
                    vehicle={vehicle}
                    autoRotate={true}
                    showControls={true}
                    className="w-full h-full"
                  />
                  
                  {/* Vehicle Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-luxury-950 via-luxury-950/80 to-transparent">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-[Playfair_Display] text-2xl font-bold text-white mb-1">
                          {vehicle.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {vehicle.brand} • {vehicle.year} • {vehicle.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Mulai dari</p>
                        <p className="text-gold-gradient font-bold text-2xl">
                          Rp {(vehicle.pricePerDay / 1000000).toFixed(1)}jt
                        </p>
                        <p className="text-xs text-gray-500">/hari</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="p-6">
                  {/* Specs */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Tipe', value: vehicle.type.toUpperCase() },
                      { label: 'Transmisi', value: vehicle.transmission === 'automatic' ? 'Otomatis' : 'Manual' },
                      { label: 'Kapasitas', value: `${vehicle.seats} Orang` },
                      { label: 'BBM', value: vehicle.fuel.charAt(0).toUpperCase() + vehicle.fuel.slice(1) },
                    ].map((spec, i) => (
                      <div key={i} className="neu-pressed rounded-lg p-3 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{spec.label}</p>
                        <p className="text-white font-semibold text-sm">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Fitur Unggulan</p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.slice(0, 4).map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg text-xs bg-white/[0.03] text-gray-400 border border-white/[0.05]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(vehicle.rating) ? 'text-gold-400' : 'text-gray-700'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-white font-medium">{vehicle.rating}</span>
                      <span className="text-xs text-gray-500">({vehicle.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                      <span className="text-xs text-emerald-400">Tersedia</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-gold rounded-2xl p-6 border border-gold-500/10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl neu-gold flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Teknologi Virtual 360°</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Setiap kendaraan yang diupload oleh pemilik rental akan secara otomatis menghasilkan visual 360° berputar 
                dengan background garasi mewah yang konsisten. Cukup upload 4 foto dari sisi berbeda (depan, belakang, kiri, kanan), 
                dan sistem akan membuat tampilan 3D interaktif yang dapat diputar oleh penyewa.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="text-xs text-gray-400">Auto-rotate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="text-xs text-gray-400">Interactive drag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="text-xs text-gray-400">Garasi mewah background</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span className="text-xs text-gray-400">Reflection effect</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
