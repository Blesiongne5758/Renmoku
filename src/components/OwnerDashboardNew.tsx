import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  LayoutDashboard, Car, Calendar, DollarSign, 
  CheckCircle, TrendingUp, Settings, Bell, LogOut, Plus, Navigation
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { StatsCard, RevenueChart, FleetStatus, RecentBookings } from './dashboard';

const sidebarMenu = [
  { icon: LayoutDashboard, label: 'Overview', href: '#', active: true },
  { icon: Car, label: 'Fleet', href: '#' },
  { icon: Navigation, label: 'GPS Tracking', href: '#', page: 'vehicle-monitoring' },
  { icon: Calendar, label: 'Bookings', href: '#' },
  { icon: DollarSign, label: 'Revenue', href: '#' },
  { icon: CheckCircle, label: 'Check-in/out', href: '#' },
  { icon: TrendingUp, label: 'Analytics', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export default function OwnerDashboardNew() {
  const { currentUser, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ownerName = currentUser?.name || 'John';
  const businessName = currentUser?.name || "John's Rental";

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h1 className="font-serif text-2xl bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            RENMOKU
          </h1>
          <p className="text-xs text-gray-500 mt-1">Owner Portal</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarMenu.map((item, idx) => (
            <motion.button
              key={item.label}
              onClick={() => item.page && useAppStore.getState().setCurrentPage(item.page)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                item.active
                  ? 'bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center font-bold text-black">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{businessName}</p>
              <p className="text-xs text-gray-500">Verified Partner</p>
            </div>
            <button onClick={logout}>
              <LogOut className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-3xl"
              >
                Selamat Pagi, <span className="text-yellow-400">{ownerName}</span> 👋
              </motion.h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentDate} • Armada Anda siap menghasilkan
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:scale-105 transition flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kendaraan
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={DollarSign}
              label="Pendapatan Bulan Ini"
              value="Rp 45.2M"
              change="+12.5%"
              trend="up"
              color="gold"
            />
            <StatsCard
              icon={Calendar}
              label="Booking Aktif"
              value="24"
              change="+8"
              trend="up"
              color="purple"
            />
            <StatsCard
              icon={Car}
              label="Armada Aktif"
              value="12/15"
              change="3 maintenance"
              trend="neutral"
              color="blue"
            />
            <StatsCard
              icon={TrendingUp}
              label="Rating Rata-rata"
              value="4.9"
              change="120 reviews"
              trend="up"
              color="green"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <FleetStatus />
            </div>
          </div>

          {/* Recent Bookings */}
          <RecentBookings />
        </div>
      </main>
    </div>
  );
}
