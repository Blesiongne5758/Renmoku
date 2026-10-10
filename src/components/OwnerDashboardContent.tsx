import { motion } from 'framer-motion';
import { 
  Bell, Plus, DollarSign, Calendar, Car, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { StatsCard, RevenueChart, FleetStatus, RecentBookings } from './dashboard';
import Sidebar from './Sidebar';

export default function OwnerDashboardContent() {
  const { currentUser } = useAppStore();

  const ownerName = currentUser?.name || 'John';

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 overflow-y-auto">
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
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-[10px] flex items-center justify-center font-bold">
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
