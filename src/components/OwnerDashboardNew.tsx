import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  Calendar,
  DollarSign,
  CheckCircle,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';

type SidebarItem = {
  id: string;
  label: string;
  icon: any;
};

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet', icon: Car },
  { id: 'booking', label: 'Booking', icon: Calendar },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'checkin', label: 'Check-in', icon: CheckCircle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Mock data untuk demo
const recentBookings = [
  {
    id: '1',
    vehicle: 'Toyota Avanza',
    image: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=200&q=80',
    renter: 'Ahmad S.',
    type: 'individual',
    dates: '12-15 Okt',
    price: 1500000,
    rating: 5.0,
  },
  {
    id: '2',
    vehicle: 'Honda HR-V',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&q=80',
    renter: 'Budi P.',
    type: 'individual',
    dates: '13-17 Okt',
    price: 2200000,
    rating: 4.8,
  },
  {
    id: '3',
    vehicle: 'BMW X5',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80',
    renter: 'PT Maju',
    type: 'corporate',
    dates: '15-22 Okt',
    price: 17500000,
    rating: 0,
  },
];

const fleetStatus = {
  available: 12,
  rented: 8,
  maintenance: 3,
  inactive: 2,
  total: 25,
};

export default function OwnerDashboardNew() {
  const { currentUser, setCurrentPage, logout } = useAppStore();
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const ownerName = currentUser?.name || 'John';
  const businessName = currentUser?.name || "John's Rental";

  return (
    <div className="min-h-screen bg-luxury-950 pt-16">
      {/* Top Navigation Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 glass border-b border-white/5">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                <Car className="w-4 h-4 text-luxury-900" />
              </div>
              <h1 className="text-lg font-semibold text-white hidden sm:block">
                Dashboard Owner
              </h1>
            </div>
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </motion.button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-80 card-luxury p-4"
                >
                  <h3 className="text-white font-semibold mb-3">Notifikasi</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Booking baru dari Ahmad S.', time: '5 menit lalu', icon: Calendar },
                      { title: 'Pembayaran DP diterima', time: '1 jam lalu', icon: DollarSign },
                      { title: 'Review baru dari Budi P.', time: '2 jam lalu', icon: Star },
                    ].map((notif, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                          <notif.icon className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{notif.title}</p>
                          <p className="text-xs text-gray-500">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-luxury-900">
                    {ownerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-white hidden sm:block">{businessName}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-56 card-luxury p-2"
                >
                  <button
                    onClick={() => {
                      setCurrentPage('home');
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-32 left-0 h-[calc(100vh-8rem)] w-64 glass border-r border-white/5 z-30 transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeMenu === item.id
                    ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-8rem)]">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Selamat Pagi, {ownerName}! 👋
            </h2>
            <p className="text-gray-400">
              "Armada Anda siap menghasilkan hari ini"
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Pendapatan Bulan Ini',
                value: 'Rp 45.2M',
                change: '+12.5%',
                icon: DollarSign,
                color: 'gold',
              },
              {
                label: 'Booking Aktif',
                value: '24',
                change: '+8',
                icon: Calendar,
                color: 'blue',
              },
              {
                label: 'Armada Aktif',
                value: '12/15',
                change: '3 Maintenance',
                icon: Car,
                color: 'emerald',
              },
              {
                label: 'Rating',
                value: '4.9',
                change: '128 reviews',
                icon: Star,
                color: 'purple',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.color === 'gold'
                        ? 'bg-gold-500/10'
                        : stat.color === 'blue'
                        ? 'bg-blue-500/10'
                        : stat.color === 'emerald'
                        ? 'bg-emerald-500/10'
                        : 'bg-purple-500/10'
                    }`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${
                        stat.color === 'gold'
                          ? 'text-gold-400'
                          : stat.color === 'blue'
                          ? 'text-blue-400'
                          : stat.color === 'emerald'
                          ? 'text-emerald-400'
                          : 'text-purple-400'
                      }`}
                    />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 card-luxury p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">📈 Grafik Pendapatan</h3>
                <div className="flex gap-2">
                  {['Harian', 'Mingguan', 'Bulan'].map((period) => (
                    <button
                      key={period}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        period === 'Bulan'
                          ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="h-48 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-lg hover:opacity-80 cursor-pointer relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gold-300 whitespace-nowrap bg-luxury-900 px-2 py-1 rounded">
                        Rp {height * 500}k
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(
                  (month) => (
                    <span key={month} className="text-[10px] text-gray-600 flex-1 text-center">
                      {month}
                    </span>
                  )
                )}
              </div>
            </motion.div>

            {/* Fleet Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card-luxury p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-6">🚗 Status Armada</h3>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Okupansi</span>
                  <span className="text-sm text-gold-400 font-bold">80%</span>
                </div>
                <div className="h-3 rounded-full bg-luxury-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                  />
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-3">
                {[
                  { label: 'Available', count: fleetStatus.available, color: 'emerald' },
                  { label: 'Rented', count: fleetStatus.rented, color: 'blue' },
                  { label: 'Maintenance', count: fleetStatus.maintenance, color: 'yellow' },
                  { label: 'Inactive', count: fleetStatus.inactive, color: 'gray' },
                ].map((status, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status.color === 'emerald'
                            ? 'bg-emerald-400'
                            : status.color === 'blue'
                            ? 'bg-blue-400'
                            : status.color === 'yellow'
                            ? 'bg-yellow-400'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-300">{status.label}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-luxury p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">📋 Booking Terbaru</h3>
              <button className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300 transition-colors">
                Lihat Semua Booking
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl neu-soft hover:neu-gold transition-all"
                >
                  {/* Vehicle Image */}
                  <img
                    src={booking.image}
                    alt={booking.vehicle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Booking Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1">{booking.vehicle}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.renter}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {booking.dates}
                      </span>
                      {booking.type === 'corporate' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          🏢 Corp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Rating */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-gold-gradient font-bold text-lg">
                        {formatCurrency(booking.price)}
                      </p>
                      {booking.rating > 0 && (
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                          <span className="text-xs text-gray-400">{booking.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        Terima
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Tolak
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
