'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'gold' | 'purple' | 'blue' | 'green';
}

const colorMap = {
  gold: {
    bg: 'from-yellow-400/20 to-yellow-600/5',
    border: 'border-yellow-400/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-400/20',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-700/5',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-700/5',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  green: {
    bg: 'from-green-500/20 to-green-700/5',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
};

export default function StatsCard({ icon: Icon, label, value, change, trend, color }: StatsCardProps) {
  const colors = colorMap[color];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-xl overflow-hidden group`}
    >
      {/* Animated Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-black/40 ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
