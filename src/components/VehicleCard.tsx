import { motion } from 'framer-motion';
import { Star, Fuel, Users, Settings } from 'lucide-react';
import { Vehicle, useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';

interface Props {
  vehicle: Vehicle;
  index: number;
  onBook: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, index, onBook }: Props) {
  const { setCurrentPage, setSelectedVehicle } = useAppStore();

  const handleCardClick = () => {
    setSelectedVehicle(vehicle);
    setCurrentPage('vehicle-detail');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      onClick={handleCardClick}
      className="group relative card-luxury cursor-pointer"
    >
      {/* Vehicle image */}
      <div className="relative h-56 sm:h-60 overflow-hidden rounded-t-[20px]">
        <motion.img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-900/70 via-transparent to-transparent" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="badge-gold backdrop-blur-md"
          >
            {vehicle.type.toUpperCase()}
          </motion.span>
        </div>

        {/* Rating - Top Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg glass-light backdrop-blur-md z-10"
        >
          <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
          <span className="text-xs text-white font-medium">{vehicle.rating}</span>
        </motion.div>

      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-4">
          <h3 className="font-[Playfair_Display] text-lg font-bold text-white group-hover:text-gold-300 transition-colors mb-2">
            {vehicle.name}
          </h3>
          <p className="text-xs text-gray-500">
            {vehicle.brand} • {vehicle.year} • {vehicle.location}
          </p>
        </div>

        {/* Specs - Neumorphic Pills */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { icon: Users, value: `${vehicle.seats} kursi`, label: 'Kapasitas' },
            { icon: Settings, value: vehicle.transmission === 'automatic' ? 'Otomatis' : 'Manual', label: 'Transmisi' },
            { icon: Fuel, value: ({ bensin: 'Bensin', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Listrik' } as Record<string,string>)[vehicle.fuel] ?? vehicle.fuel, label: 'Bahan bakar' },
          ].map((spec, i) => (
            <div key={i} className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
              <div className="flex items-center gap-1.5 text-gray-300">
                <spec.icon className="h-3.5 w-3.5 shrink-0 text-gold-400/70" />
                <span className="truncate text-[11px] font-medium">{spec.value}</span>
              </div>
              <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.08em] text-gray-500">{spec.label}</span>
            </div>
          ))}
        </div>

        {/* Features - Minimal Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.features.slice(0, 3).map((f, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px] text-gray-500 bg-white/[0.02] border border-white/[0.03]">
              {f}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="px-2 py-0.5 rounded text-[10px] text-gold-400/60">
              +{vehicle.features.length - 3}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="divider-subtle mb-4" />

        {/* Price & CTA */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Mulai dari</p>
            <p className="text-gold-gradient font-bold text-xl">{formatCurrency(vehicle.pricePerDay)}</p>
            <p className="text-[10px] text-gray-600">/hari</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onBook(vehicle);
            }}
            className="btn-luxury px-5 py-2.5 text-sm"
          >
            Sewa
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
