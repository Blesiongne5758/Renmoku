import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, useAppStore } from '../stores/useAppStore';
import { vehicles } from '../data/mockData';
import VehicleCard from '../components/VehicleCard';
import VehicleShowcase360 from '../components/VehicleShowcase360';
import SearchFilter from '../components/SearchFilter';

export default function FleetPage() {
  const { setCurrentPage, setSelectedVehicle, setShowBookingModal } = useAppStore();
  const [showcase360, setShowcase360] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleBook = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
    setCurrentPage('booking');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-[Playfair_Display] text-3xl sm:text-5xl font-bold text-white mb-4">
            Armada <span className="text-gold-gradient">Premium</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Pilih dari koleksi kendaraan mewah terbaik kami. Setiap unit terawat sempurna
            dan siap menemani perjalanan Anda.
          </p>
        </motion.div>

        {/* Search Filter */}
        <div className="mb-10">
          <SearchFilter />
        </div>

        {/* View controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            Menampilkan <span className="text-gold-400 font-medium">{vehicles.length}</span> kendaraan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {vehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              index={index}
              onView360={setShowcase360}
              onBook={handleBook}
            />
          ))}
        </div>

        {/* Price calculator info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 glass rounded-2xl p-6 sm:p-8 border border-gold-500/10"
        >
          <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-4">
            💰 Kalkulator Harga Sewa
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Harian', discount: '0%', desc: 'Sewa 1-6 hari' },
              { label: 'Mingguan', discount: '10% OFF', desc: 'Sewa 7-29 hari' },
              { label: 'Bulanan', discount: '20% OFF', desc: 'Sewa 30+ hari' },
            ].map((plan, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-gold-400 font-bold text-lg">{plan.discount}</p>
                <p className="text-white font-medium">{plan.label}</p>
                <p className="text-gray-500 text-xs mt-1">{plan.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 360 Showcase Modal */}
      <AnimatePresence>
        {showcase360 && (
          <VehicleShowcase360
            vehicle={showcase360}
            onClose={() => setShowcase360(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
