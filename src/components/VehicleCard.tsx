import { motion } from 'framer-motion';
import { Star, Fuel, Users, Settings, Eye } from 'lucide-react';
import { Vehicle } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';
import Vehicle360Viewer from './Vehicle360Viewer';

interface Props {
  vehicle: Vehicle;
  index: number;
  onView360: (vehicle: Vehicle) => void;
  onBook: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, index, onView360, onBook }: Props) {
  const has360 = vehicle.has360View || (vehicle.sides?.front && vehicle.sides?.back && vehicle.sides?.left && vehicle.sides?.right);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative card-luxury"
    >
      {/* Image / 360 Viewer */}
      <div className="relative h-56 sm:h-60 overflow-hidden rounded-t-[20px]">
        {has360 ? (
          <Vehicle360Viewer
            vehicle={vehicle}
            autoRotate={true}
            showControls={true}
            className="w-full h-full"
          />
        ) : (
          <>
            <motion.img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent" />
          </>
        )}

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
          {has360 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-medium backdrop-blur-md flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse-soft" />
              360°
            </motion.span>
          )}
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

        {/* 360 view button */}
        {has360 && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-3 right-3 p-2.5 rounded-xl glass backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              onView360(vehicle);
            }}
          >
            <Eye className="w-4 h-4 text-gold-300" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <div className="mb-4">
          <h3 className="font-[Playfair_Display] text-lg font-bold text-white group-hover:text-gold-300 transition-colors mb-1">
            {vehicle.name}
          </h3>
          <p className="text-xs text-gray-500">
            {vehicle.brand} • {vehicle.year} • {vehicle.location}
          </p>
        </div>

        {/* Specs - Neumorphic Pills */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { icon: Users, value: vehicle.seats, label: 'seats' },
            { icon: Settings, value: vehicle.transmission === 'automatic' ? 'Auto' : 'Manual', label: 'transmission' },
            { icon: Fuel, value: vehicle.fuel, label: 'fuel' },
          ].map((spec, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg neu-soft">
              <spec.icon className="w-3 h-3 text-gold-400/60" />
              <span className="text-[11px] text-gray-400 capitalize">{spec.value}</span>
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
            onClick={() => onBook(vehicle)}
            className="btn-luxury px-5 py-2.5 text-sm"
          >
            Sewa
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
