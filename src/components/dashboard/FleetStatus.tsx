'use client';

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

  const statusItems = [
    { label: 'Available', count: available, color: 'from-green-400 to-green-600', dot: 'bg-green-400' },
    { label: 'Rented', count: rented, color: 'from-blue-400 to-blue-600', dot: 'bg-blue-400' },
    { label: 'Maintenance', count: maintenance, color: 'from-yellow-400 to-yellow-600', dot: 'bg-yellow-400' },
    { label: 'Inactive', count: inactive, color: 'from-gray-400 to-gray-600', dot: 'bg-gray-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-700/5 border border-purple-500/30 backdrop-blur-xl overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/5 blur-3xl opacity-50" />
      
      <div className="relative">
        <h3 className="text-lg font-semibold text-white mb-6">🚗 Status Armada</h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Okupansi</span>
            <span className="text-sm text-purple-400 font-bold">{occupancyRate}%</span>
          </div>
          <div className="h-3 rounded-full bg-black/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyRate}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* Status List */}
        <div className="space-y-3">
          {statusItems.map((status, i) => (
            <motion.div
              key={status.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className="text-sm text-gray-300">{status.label}</span>
              </div>
              <span className="text-sm text-white font-medium">{status.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
