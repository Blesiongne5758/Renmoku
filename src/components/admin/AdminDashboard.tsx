'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  Settings,
  Bell,
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Shield,
  Eye,
  XCircle,
  ArrowRight,
  Building2,
  User,
  FileText,
  Gavel,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useAppStore } from '../../stores/useAppStore';
import AdminVerificationPanel from './VerificationPanel';

// ============================================================================
// DATA
// ============================================================================

const sidebarMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: Users, label: 'Users', href: '#' },
  { icon: Car, label: 'Vehicles', href: '#' },
  { icon: Calendar, label: 'Bookings', href: '#' },
  { icon: CheckCircle, label: 'Verifikasi', href: '#', badge: 12 },
  { icon: DollarSign, label: 'Payout', href: '#', badge: 3 },
  { icon: AlertTriangle, label: 'Dispute', href: '#', badge: 5 },
  { icon: Settings, label: 'Settings', href: '#' },
];

const platformGrowthData = [
  { month: 'Jul', users: 1800, bookings: 420, revenue: 680 },
  { month: 'Agu', users: 2000, bookings: 510, revenue: 780 },
  { month: 'Sep', users: 2200, bookings: 580, revenue: 890 },
  { month: 'Okt', users: 2400, bookings: 650, revenue: 980 },
  { month: 'Nov', users: 2600, bookings: 720, revenue: 1080 },
  { month: 'Des', users: 2847, bookings: 810, revenue: 1200 },
];

const topOwners = [
  { rank: 1, name: "John's Rental", revenue: 45000000, vehicles: 15, rating: 4.9 },
  { rank: 2, name: 'Premium Cars', revenue: 38000000, vehicles: 12, rating: 4.8 },
  { rank: 3, name: 'Luxury Drive', revenue: 32000000, vehicles: 10, rating: 4.7 },
];

const actionItems = [
  {
    id: 1,
    type: 'kyc',
    severity: 'red',
    title: 'KYC Pending',
    count: 12,
    description: 'Menunggu verifikasi dokumen',
  },
  {
    id: 2,
    type: 'dispute',
    severity: 'yellow',
    title: 'Dispute Aktif',
    count: 5,
    description: 'Perlu mediasi dan resolusi',
  },
  {
    id: 3,
    type: 'payout',
    severity: 'orange',
    title: 'Payout Pending',
    count: 3,
    description: 'Menunggu proses pencairan',
  },
  {
    id: 4,
    type: 'review',
    severity: 'blue',
    title: 'Kendaraan Review',
    count: 8,
    description: 'Menunggu approval listing',
  },
];

const activeDisputes = [
  {
    id: 'D045',
    vehicle: 'Toyota Avanza',
    renter: 'Budi P.',
    issue: 'Kerusakan interior',
    amount: 2500000,
    status: 'active',
  },
  {
    id: 'D044',
    vehicle: 'Honda HR-V',
    renter: 'Siti R.',
    issue: 'Keterlambatan pengembalian',
    amount: 800000,
    status: 'active',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboard() {
  const { currentUser, logout, setCurrentPage } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const adminName = currentUser?.name || 'Super Admin';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-black" />
              </div>
              <div>
                <h1 className="font-serif text-lg bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  RENMOKU
                </h1>
                <p className="text-[10px] text-gray-500">Admin Control Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarMenu.map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                item.active
                  ? 'bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  {item.badge}
                </span>
              )}
              {item.active && (
                <motion.div
                  layoutId="adminActiveIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                />
              )}
            </motion.a>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminName}</p>
              <p className="text-xs text-yellow-400">Super Admin</p>
            </div>
            <button onClick={() => { logout(); setCurrentPage('home'); }}>
              <LogOut className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-0 overflow-y-auto min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-serif text-xl lg:text-2xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Platform Overview
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification */}
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                  28
                </span>
              </button>
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm hidden sm:block">{adminName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 shadow-xl"
                  >
                    <button
                      onClick={() => { logout(); setCurrentPage('home'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gray-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatsCard
              icon={Users}
              label="Total Users"
              value="2,847"
              change="+234"
              trend="up"
              color="blue"
            />
            <AdminStatsCard
              icon={Car}
              label="Total Armada"
              value="458"
              change="+45"
              trend="up"
              color="gold"
            />
            <AdminStatsCard
              icon={DollarSign}
              label="GMV Bulan Ini"
              value="Rp 1.2B"
              change="+18%"
              trend="up"
              color="green"
            />
            <AdminStatsCard
              icon={TrendingUp}
              label="Komisi Platform"
              value="Rp 150M"
              change="12.5%"
              trend="neutral"
              color="purple"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts & Top Owners */}
            <div className="lg:col-span-2 space-y-6">
              {/* Platform Growth Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-[#141414] border border-white/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-xl">📈 Pertumbuhan Platform</h3>
                    <p className="text-sm text-gray-500 mt-1">Performa 6 bulan terakhir</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="text-xs text-gray-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-xs text-gray-400">Users</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs text-gray-400">Bookings</span>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={platformGrowthData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #D4AF37',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fill="url(#colorUsers)"
                      />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#colorBookings)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Top Performing Owners */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-[#141414] border border-white/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-xl">🏆 Top Performing Owners</h3>
                    <p className="text-sm text-gray-500 mt-1">Pemilik dengan pendapatan tertinggi</p>
                  </div>
                  <a href="#" className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                    Lihat Semua <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-3">
                  {topOwners.map((owner, idx) => (
                    <motion.div
                      key={owner.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-yellow-400/30 transition group"
                    >
                      {/* Rank */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          owner.rank === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                            : owner.rank === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                            : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                        }`}
                      >
                        {owner.rank}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{owner.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            ⭐ {owner.rating}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{owner.vehicles} kendaraan</p>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <p className="font-mono font-semibold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                          Rp {(owner.revenue / 1000000).toFixed(0)}M
                        </p>
                        <p className="text-xs text-gray-500">pendapatan</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Action Items */}
            <div className="space-y-6">
              {/* Perlu Tindakan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-[#141414] border border-white/5"
              >
                <h3 className="font-serif text-xl mb-2">⚠️ Perlu Tindakan</h3>
                <p className="text-sm text-gray-500 mb-6">Item yang memerlukan perhatian Anda</p>

                <div className="space-y-3">
                  {actionItems.map((item, idx) => {
                    const severityColors = {
                      red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
                      yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
                      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
                      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
                    };
                    const colors = severityColors[item.severity as keyof typeof severityColors];

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className={`p-3 rounded-xl ${colors.bg} border ${colors.border} flex items-center gap-3 hover:scale-[1.02] transition cursor-pointer`}
                      >
                        <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${colors.text}`}>
                              {item.count} {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 ${colors.text}`} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* KYC Verification Panel */}
              <AdminVerificationPanel />

              {/* Active Disputes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-2xl bg-[#141414] border border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Dispute Aktif
                  </h3>
                  <span className="text-xs text-gray-500">5 total</span>
                </div>

                <div className="space-y-3">
                  {activeDisputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-yellow-400/20 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-yellow-400">#{dispute.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {dispute.vehicle} vs {dispute.renter}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">{dispute.issue}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Klaim: <span className="text-white font-medium">Rp {dispute.amount.toLocaleString('id-ID')}</span>
                        </span>
                        <button className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// ADMIN STATS CARD
// ============================================================================

interface AdminStatsCardProps {
  icon: any;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'gold' | 'purple' | 'blue' | 'green';
}

const adminColorMap = {
  gold: {
    bg: 'from-yellow-400/20 to-yellow-600/5',
    border: 'border-yellow-400/30',
    icon: 'text-yellow-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-700/5',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-700/5',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
  },
  green: {
    bg: 'from-green-500/20 to-green-700/5',
    border: 'border-green-500/30',
    icon: 'text-green-400',
  },
};

function AdminStatsCard({ icon: Icon, label, value, change, trend, color }: AdminStatsCardProps) {
  const colors = adminColorMap[color];
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-xl overflow-hidden group`}
    >
      {/* Animated Glow */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`}
      />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-black/40 ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold font-mono tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
