import { motion } from 'framer-motion';
import { Star, Fuel, Users, Settings, Eye } from 'lucide-react';
import { Vehicle, useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';

interface Props {
  vehicle: Vehicle;
  index: number;
  onView360: (vehicle: Vehicle) => void;
  onBook: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, index, onView360, onBook }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative glass rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <motion.img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 rounded-md bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-medium backdrop-blur-sm">
            {vehicle.type.toUpperCase()}
          </span>
          {vehicle.transmission === 'automatic' && (
            <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-sm">
              AUTO
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md glass">
          <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
          <span className="text-xs text-white font-medium">{vehicle.rating}</span>
        </div>

        {/* 360 view button */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-gold-500/20 border border-gold-500/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onView360(vehicle);
          }}
        >
          <Eye className="w-4 h-4 text-gold-300" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <div className="mb-3">
          <h3 className="font-[Playfair_Display] text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-sm text-gray-400">{vehicle.brand} • {vehicle.year} • {vehicle.location}</p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gold-400/60" />
            <span className="text-xs text-gray-400">{vehicle.seats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-gold-400/60" />
            <span className="text-xs text-gray-400">{vehicle.transmission === 'automatic' ? 'Otomatis' : 'Manual'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-gold-400/60" />
            <span className="text-xs text-gray-400">{vehicle.fuel}</span>
          </div>
        </div>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1 mb-4">
          {vehicle.features.slice(0, 3).map((f, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] text-gray-500 border border-white/5">
              {f}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="px-2 py-0.5 rounded text-[10px] text-gold-400/60">
              +{vehicle.features.length - 3}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-xs text-gray-500">Mulai dari</p>
            <p className="text-gold-gradient font-bold text-lg">{formatCurrency(vehicle.pricePerDay)}</p>
            <p className="text-xs text-gray-500">/hari</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(vehicle)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-luxury-900 text-sm font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
          >
            Sewa
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
