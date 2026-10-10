import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: any;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'gold' | 'purple' | 'blue' | 'green';
}

export default function StatsCard({ icon: Icon, label, value, change, trend, color }: StatsCardProps) {
  const colorClasses = {
    gold: {
      bg: 'bg-gold-500/10',
      icon: 'text-gold-400',
      border: 'border-gold-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    green: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
  };

  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-luxury p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorClasses[color].bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].icon}`} />
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          <span className="text-xs font-medium">{change}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}
