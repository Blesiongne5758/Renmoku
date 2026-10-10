'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function RevenueChart() {
  const [activePeriod, setActivePeriod] = useState('monthly');
  
  const monthlyData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];
  const weeklyData = [60, 75, 50, 85, 70, 90, 80];
  const dailyData = [70, 85, 60, 90, 75, 95, 80];
  
  const dataMap = {
    monthly: monthlyData,
    weekly: weeklyData,
    daily: dailyData,
  };
  
  const labelsMap = {
    monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    weekly: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    daily: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'],
  };

  const data = dataMap[activePeriod as keyof typeof dataMap];
  const labels = labelsMap[activePeriod as keyof typeof labelsMap];
  const max = Math.max(...data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-yellow-400/5 to-purple-500/5 border border-white/5 backdrop-blur-xl overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/10 to-purple-500/10 blur-3xl opacity-50" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">📈 Grafik Pendapatan</h3>
            <p className="text-sm text-gray-500 mt-1">Performa pendapatan periode ini</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-black/40">
            {[
              { id: 'daily', label: 'Harian' },
              { id: 'weekly', label: 'Mingguan' },
              { id: 'monthly', label: 'Bulanan' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setActivePeriod(period.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePeriod === period.id
                    ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/5 border border-yellow-400/30 text-yellow-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 flex items-end gap-2">
          {data.map((value, i) => {
            const height = (value / max) * 100;
            return (
              <motion.div
                key={`${activePeriod}-${i}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t-lg hover:opacity-80 cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-xs text-yellow-400 whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-yellow-400/30">
                    Rp {value * 500}k
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {labels.map((label) => (
            <span key={label} className="text-[10px] text-gray-600 flex-1 text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
