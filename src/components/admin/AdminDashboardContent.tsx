'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Crown,
  LogOut,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../../stores/useAppStore';
import AdminVerificationPanel from './VerificationPanel';
import AdminStatsGrid from './AdminStatsGrid';
import AdminSidebar from './AdminSidebar';

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

export default function AdminDashboardContent() {
  const { currentUser, logout, setCurrentPage } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const adminName = currentUser?.name || 'Super Admin';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-0 overflow-y-auto min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
          <AdminStatsGrid />

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
              {/* KYC Verification Panel */}
              <AdminVerificationPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
