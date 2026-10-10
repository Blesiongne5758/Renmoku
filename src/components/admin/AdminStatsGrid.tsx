'use client';

import { motion } from 'framer-motion';
import { Users, Car, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

const stats = [
  {
    icon: Users,
    label: 'Total Pengguna',
    value: '2,847',
    change: '+234 bulan ini',
    color: 'purple',
    subtext: '1,245 Renter • 158 Owner',
  },
  {
    icon: Car,
    label: 'Total Armada',
    value: '458',
    change: '+42 bulan ini',
    color: 'blue',
    subtext: '89% tersedia',
  },
  {
    icon: DollarSign,
    label: 'GMV Bulan Ini',
    value: 'Rp 1.2M',
    change: '+18.5%',
    color: 'gold',
    subtext: 'Target: Rp 1.5M',
  },
  {
    icon: TrendingUp,
    label: 'Komisi Platform',
    value: 'Rp 150Jt',
    change: '12.5% dari GMV',
    color: 'green',
    subtext: '▲ +22% MoM',
  },
];

const alerts = [
  { icon: AlertTriangle, label: 'KYC Pending', value: 12, color: 'red' },
  { icon: Clock, label: 'Dispute Aktif', value: 5, color: 'yellow' },
  { icon: DollarSign, label: 'Payout Pending', value: 3, color: 'orange' },
];

const colorMap = {
  purple: 'from-purple-500/20 to-purple-700/5 border-purple-500/30',
  blue: 'from-blue-500/20 to-blue-700/5 border-blue-500/30',
  gold: 'from-yellow-400/20 to-yellow-600/5 border-yellow-400/30',
  green: 'from-green-500/20 to-green-700/5 border-green-500/30',
};

const alertColorMap = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function AdminStatsGrid() {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${colorMap[stat.color as keyof typeof colorMap]} border backdrop-blur-xl overflow-hidden group`}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-black/40">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.subtext}</p>
              <p className="text-xs text-green-400 mt-1">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${alertColorMap[alert.color as keyof typeof alertColorMap]}`}
          >
            <div className="p-2 rounded-lg bg-black/40">
              <alert.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{alert.label}</p>
              <p className="text-2xl font-bold font-mono">{alert.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
