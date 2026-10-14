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
      <div className="card-luxury p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg neu-gold flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-gold-400" />
          </div>
          <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">
            Cari Kendaraan
          </h3>
        </div>

        {/* Search grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
            <select
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ location: e.target.value })}
              className="input-luxury pl-10 appearance-none cursor-pointer"
            >
              <option value="" className="bg-luxury-800">Lokasi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-luxury-800">{loc}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
            <input
              type="date"
              value={searchFilters.startDate}
              onChange={(e) => setSearchFilters({ startDate: e.target.value })}
              className="input-luxury pl-10 [color-scheme:dark]"
              placeholder="Tanggal Mulai"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
            <input
              type="date"
              value={searchFilters.endDate}
              onChange={(e) => setSearchFilters({ endDate: e.target.value })}
              className="input-luxury pl-10 [color-scheme:dark]"
              placeholder="Tanggal Selesai"
            />
          </div>

          {/* Vehicle Type */}
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
            <select
              value={searchFilters.vehicleType}
              onChange={(e) => setSearchFilters({ vehicleType: e.target.value })}
              className="input-luxury pl-10 appearance-none cursor-pointer"
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

        {/* Additional filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Transmission */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Transmisi:</span>
            <div className="flex gap-1.5">
              {['automatic', 'manual'].map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchFilters({ transmission: searchFilters.transmission === t ? '' : t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    searchFilters.transmission === t
                      ? 'neu-gold text-gold-300'
                      : 'neu-soft text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t === 'automatic' ? 'Auto' : 'Manual'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Rental Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Opsi:</span>
            <div className="flex gap-1.5">
              {[
                { value: 'with_driver', label: 'Driver' },
                { value: 'self_drive', label: 'Lepas Kunci' },
              ].map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchFilters({ rentalType: searchFilters.rentalType === opt.value ? '' : opt.value as any })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    searchFilters.rentalType === opt.value
                      ? 'neu-gold text-gold-300'
                      : 'neu-soft text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-luxury flex items-center justify-center gap-2 text-sm"
          >
            <Search className="w-4 h-4" />
            Cari
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
