import { motion } from 'framer-motion';
import { Search, MapPin, CalendarDays, Car, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { locations, vehicleTypes } from '../data/mockData';

export default function SearchFilter() {
  const { searchFilters, setSearchFilters } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mx-auto w-full max-w-5xl"
    >
      <div className="card-luxury rounded-2xl p-5 sm:p-6 lg:p-7">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl neu-gold">
            <SlidersHorizontal className="h-4 w-4 text-gold-400" />
          </div>
          <div>
            <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">Cari kendaraan</h3>
            <p className="mt-0.5 text-xs text-gray-500">Atur lokasi, tanggal, dan tipe untuk menyaring pilihan.</p>
          </div>
        </div>

        {/* Search grid */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Location */}
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400"><MapPin className="h-3.5 w-3.5 text-gold-400"/>Lokasi</span>
            <select
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ location: e.target.value })}
              className="input-luxury cursor-pointer rounded-xl"
              style={{ padding: '12px 14px', borderRadius: '0.75rem' }}
            >
              <option value="" className="bg-luxury-800">Semua lokasi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-luxury-800">{loc}</option>
              ))}
            </select>
          </label>

          {/* Start Date */}
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400"><CalendarDays className="h-3.5 w-3.5 text-gold-400"/>Tanggal mulai</span>
            <input
              type="date"
              value={searchFilters.startDate}
              onChange={(e) => setSearchFilters({ startDate: e.target.value })}
              className="input-luxury w-full rounded-xl [color-scheme:dark]"
              style={{ padding: '12px 14px', borderRadius: '0.75rem' }}
            />
          </label>

          {/* End Date */}
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400"><CalendarDays className="h-3.5 w-3.5 text-gold-400"/>Tanggal selesai</span>
            <input
              type="date"
              value={searchFilters.endDate}
              onChange={(e) => setSearchFilters({ endDate: e.target.value })}
              className="input-luxury w-full rounded-xl [color-scheme:dark]"
              style={{ padding: '12px 14px', borderRadius: '0.75rem' }}
            />
          </label>

          {/* Vehicle Type */}
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400"><Car className="h-3.5 w-3.5 text-gold-400"/>Tipe kendaraan</span>
            <select
              value={searchFilters.vehicleType}
              onChange={(e) => setSearchFilters({ vehicleType: e.target.value })}
              className="input-luxury cursor-pointer rounded-xl"
              style={{ padding: '12px 14px', borderRadius: '0.75rem' }}
            >
              <option value="" className="bg-luxury-800">Semua tipe</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-luxury-800">
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Additional filters */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {/* Transmission */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-400">Transmisi</span>
            <div className="flex gap-2">
              {['automatic', 'manual'].map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchFilters({ transmission: searchFilters.transmission === t ? '' : t })}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                    searchFilters.transmission === t
                      ? 'neu-gold text-gold-300'
                      : 'border border-white/[0.08] bg-white/[0.025] text-gray-400 hover:border-white/15 hover:text-gray-200'
                  }`}
                >
                  {t === 'automatic' ? 'Auto' : 'Manual'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Rental Type */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-400">Opsi sewa</span>
            <div className="flex gap-2">
              {[
                { value: 'with_driver', label: 'Driver' },
                { value: 'self_drive', label: 'Lepas Kunci' },
              ].map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchFilters({ rentalType: searchFilters.rentalType === opt.value ? '' : opt.value as any })}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                    searchFilters.rentalType === opt.value
                      ? 'neu-gold text-gold-300'
                      : 'border border-white/[0.08] bg-white/[0.025] text-gray-400 hover:border-white/15 hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
          </div>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="btn-luxury flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm md:w-auto md:min-w-40"
          >
            <Search className="h-4 w-4" />
            Cari
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
