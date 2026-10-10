import { motion } from 'framer-motion';

interface FleetStatusProps {
  available?: number;
  rented?: number;
  maintenance?: number;
  inactive?: number;
}

export default function FleetStatus({ 
  available = 12, 
  rented = 8, 
  maintenance = 3, 
  inactive = 2 
}: FleetStatusProps) {
  const total = available + rented + maintenance + inactive;
  const occupancyRate = Math.round(((rented + maintenance) / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-luxury p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">🚗 Status Armada</h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Okupansi</span>
          <span className="text-sm text-gold-400 font-bold">{occupancyRate}%</span>
        </div>
        <div className="h-3 rounded-full bg-bg-primary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${occupancyRate}%` }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
          />
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-3">
        {[
          { label: 'Available', count: available, color: 'emerald' },
          { label: 'Rented', count: rented, color: 'blue' },
          { label: 'Maintenance', count: maintenance, color: 'yellow' },
          { label: 'Inactive', count: inactive, color: 'gray' },
        ].map((status, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status.color === 'emerald'
                    ? 'bg-emerald-400'
                    : status.color === 'blue'
                    ? 'bg-blue-400'
                    : status.color === 'yellow'
                    ? 'bg-yellow-400'
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-sm text-gray-300">{status.label}</span>
            </div>
            <span className="text-sm text-white font-medium">{status.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
