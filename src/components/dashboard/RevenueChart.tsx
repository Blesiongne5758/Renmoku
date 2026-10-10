'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dataDaily = [
  { name: 'Sen', revenue: 4200000, bookings: 3 },
  { name: 'Sel', revenue: 5800000, bookings: 4 },
  { name: 'Rab', revenue: 3900000, bookings: 2 },
  { name: 'Kam', revenue: 7200000, bookings: 5 },
  { name: 'Jum', revenue: 8500000, bookings: 6 },
  { name: 'Sab', revenue: 12400000, bookings: 8 },
  { name: 'Min', revenue: 9800000, bookings: 7 },
];

const dataMonthly = [
  { name: 'Jan', revenue: 32000000 },
  { name: 'Feb', revenue: 38000000 },
  { name: 'Mar', revenue: 41000000 },
  { name: 'Apr', revenue: 35000000 },
  { name: 'Mei', revenue: 45000000 },
  { name: 'Jun', revenue: 52000000 },
];

export default function RevenueChart() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const data = period === 'monthly' ? dataMonthly : dataDaily;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-[#141414] border border-white/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl">📈 Grafik Pendapatan</h3>
          <p className="text-sm text-gray-500 mt-1">Performa pendapatan armada Anda</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-black/40">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === p
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis 
              stroke="#666" 
              fontSize={12}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #D4AF37',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
