'use client';

import { motion } from 'framer-motion';

const fleetData = [
  { status: 'Available', count: 12, color: '#10B981', percentage: 60 },
  { status: 'Rented', count: 8, color: '#D4AF37', percentage: 40 },
  { status: 'Maintenance', count: 3, color: '#F59E0B', percentage: 15 },
  { status: 'Inactive', count: 2, color: '#666', percentage: 10 },
];

export default function FleetStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-[#141414] border border-white/5 h-full"
    >
      <h3 className="font-serif text-xl mb-2">🚗 Status Armada</h3>
      <p className="text-sm text-gray-500 mb-6">Distribusi kondisi kendaraan</p>

      {/* Circular Progress */}
      <div className="relative w-40 h-40 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke="#1a1a1a"
            strokeWidth="16"
            fill="none"
          />
          {fleetData.map((item, idx) => {
            const totalPercentage = fleetData.slice(0, idx).reduce((sum, i) => sum + i.percentage, 0);
            const circumference = 2 * Math.PI * 60;
            const strokeLength = (item.percentage / 100) * circumference;
            const strokeOffset = (totalPercentage / 100) * circumference;

            return (
              <motion.circle
                key={item.status}
                cx="80"
                cy="80"
                r="60"
                stroke={item.color}
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-strokeOffset}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: strokeLength }}
                transition={{ duration: 1, delay: idx * 0.2 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono">20</span>
          <span className="text-xs text-gray-500">Total Armada</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {fleetData.map((item) => (
          <div key={item.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
              />
              <span className="text-sm text-gray-300">{item.status}</span>
            </div>
            <span className="text-sm font-mono font-semibold">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
