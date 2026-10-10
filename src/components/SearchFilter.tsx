import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Car, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { locations, vehicleTypes } from '../data/mockData';

export default function SearchFilter() {
  const { searchFilters, setSearchFilters } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="glass rounded-2xl p-4 sm:p-6 border border-gold-500/10 border-glow">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-gold-400" />
          <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">
            Cari Kendaraan Impian Anda
          </h3>
        </div>

        {/* Search grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
            <select
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ location: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm appearance-none focus:outline-none focus:border-gold-500/50 transition-colors"
            >
              <option value="" className="bg-luxury-800">Lokasi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-luxury-800">{loc}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
            <input
              type="date"
              value={searchFilters.startDate}
              onChange={(e) => setSearchFilters({ startDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors [color-scheme:dark]"
              placeholder="Tanggal Mulai"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
            <input
              type="date"
              value={searchFilters.endDate}
              onChange={(e) => setSearchFilters({ endDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors [color-scheme:dark]"
              placeholder="Tanggal Selesai"
            />
          </div>

          {/* Vehicle Type */}
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
            <select
              value={searchFilters.vehicleType}
              onChange={(e) => setSearchFilters({ vehicleType: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm appearance-none focus:outline-none focus:border-gold-500/50 transition-colors"
            >
              <option value="" className="bg-luxury-800">Tipe Kendaraan</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-luxury-800">
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {/* Transmission */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Transmisi:</span>
            {['automatic', 'manual'].map((t) => (
              <button
                key={t}
                onClick={() => setSearchFilters({ transmission: searchFilters.transmission === t ? '' : t })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  searchFilters.transmission === t
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                    : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-gold-500/20'
                }`}
              >
                {t === 'automatic' ? 'Otomatis' : 'Manual'}
              </button>
            ))}
          </div>

          {/* Rental Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Opsi:</span>
            {[
              { value: 'with_driver', label: 'Dengan Driver' },
              { value: 'self_drive', label: 'Lepas Kunci' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSearchFilters({ rentalType: searchFilters.rentalType === opt.value ? '' : opt.value as any })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  searchFilters.rentalType === opt.value
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                    : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-gold-500/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-luxury flex items-center justify-center gap-2 text-sm py-3"
          >
            <Search className="w-4 h-4" />
            Cari Kendaraan
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
