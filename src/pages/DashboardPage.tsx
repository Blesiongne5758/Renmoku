import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, Calendar, CreditCard, FileText,
  TrendingUp, Clock, CheckCircle2, AlertCircle, ChevronRight,
  DollarSign, Users, BarChart3
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { mockBookings, formatCurrency } from '../data/mockData';

type DashboardTab = 'overview' | 'bookings' | 'fleet' | 'revenue';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const { currentUser, setCurrentUser } = useAppStore();

  // Simulate login if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-md w-full border border-gold-500/10"
        >
          <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2 text-center">
            Masuk ke Dashboard
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Pilih role untuk melihat dashboard
          </p>
          <div className="space-y-3">
            {[
              { role: 'individual' as const, label: 'Penyewa Pribadi', icon: Users, desc: 'Lihat riwayat & status booking' },
              { role: 'corporate' as const, label: 'Penyewa Corporate', icon: FileText, desc: 'Manajemen booking perusahaan' },
              { role: 'owner' as const, label: 'Pemilik Armada', icon: Car, desc: 'Kelola fleet & pendapatan' },
              { role: 'admin' as const, label: 'Admin Platform', icon: LayoutDashboard, desc: 'Overview seluruh platform' },
            ].map((option) => (
              <motion.button
                key={option.role}
                whileHover={{ scale: 1.02, borderColor: 'rgba(212,168,83,0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentUser({
                  id: 'u1',
                  name: option.role === 'owner' ? 'Budi Santoso Fleet' : 'Ahmad Wijaya',
                  email: 'user@renmoku.id',
                  role: option.role,
                })}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <option.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const isOwner = currentUser.role === 'owner';
  const isAdmin = currentUser.role === 'admin';

  const tabs = isOwner || isAdmin
    ? [
        { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'bookings' as DashboardTab, label: 'Booking', icon: Calendar },
        { id: 'fleet' as DashboardTab, label: 'Armada', icon: Car },
        { id: 'revenue' as DashboardTab, label: 'Pendapatan', icon: DollarSign },
      ]
    : [
        { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'bookings' as DashboardTab, label: 'Booking Saya', icon: Calendar },
      ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-[Playfair_Display] text-2xl sm:text-3xl font-bold text-white">
              Selamat Datang, <span className="text-gold-gradient">{currentUser.name.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isOwner ? 'Kelola armada & pantau pendapatan Anda' : 'Pantau booking & riwayat sewa Anda'}
            </p>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="mt-4 sm:mt-0 px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white hover:border-gold-500/20 transition-all"
          >
            Ganti Role
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gold-500/10 text-gold-300 border border-gold-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: isOwner ? 'Total Armada' : 'Total Booking',
                  value: isOwner ? '12' : '5',
                  icon: isOwner ? Car : Calendar,
                  change: '+2 bulan ini',
                  color: 'gold',
                },
                {
                  label: isOwner ? 'Booking Aktif' : 'Sedang Berjalan',
                  value: isOwner ? '4' : '1',
                  icon: Clock,
                  change: 'Minggu ini',
                  color: 'emerald',
                },
                {
                  label: isOwner ? 'Pendapatan Bulan Ini' : 'Selesai',
                  value: isOwner ? 'Rp 45jt' : '3',
                  icon: isOwner ? TrendingUp : CheckCircle2,
                  change: isOwner ? '+15% dari bulan lalu' : 'Bulan ini',
                  color: 'blue',
                },
                {
                  label: isOwner ? 'Rating' : 'Dokumen',
                  value: isOwner ? '4.8 ★' : 'Lengkap',
                  icon: isOwner ? BarChart3 : FileText,
                  change: isOwner ? '128 review' : 'Terverifikasi',
                  color: 'purple',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-5 border border-white/5 hover:border-gold-500/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-5 h-5 ${
                      stat.color === 'gold' ? 'text-gold-400' :
                      stat.color === 'emerald' ? 'text-emerald-400' :
                      stat.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                    }`} />
                    <span className="text-xs text-gray-500">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="glass rounded-xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">
                  Booking Terbaru
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      booking.bookingStatus === 'active' ? 'bg-emerald-500/10' :
                      booking.bookingStatus === 'confirmed' ? 'bg-blue-500/10' :
                      booking.bookingStatus === 'completed' ? 'bg-gray-500/10' : 'bg-yellow-500/10'
                    }`}>
                      {booking.bookingStatus === 'active' ? <Clock className="w-5 h-5 text-emerald-400" /> :
                       booking.bookingStatus === 'confirmed' ? <CheckCircle2 className="w-5 h-5 text-blue-400" /> :
                       booking.bookingStatus === 'completed' ? <CheckCircle2 className="w-5 h-5 text-gray-400" /> :
                       <AlertCircle className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{booking.vehicleName}</p>
                      <p className="text-xs text-gray-500">{booking.startDate} → {booking.endDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">{formatCurrency(booking.totalPrice)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.bookingStatus === 'active' ? 'bg-emerald-500/10 text-emerald-300' :
                        booking.bookingStatus === 'confirmed' ? 'bg-blue-500/10 text-blue-300' :
                        booking.bookingStatus === 'completed' ? 'bg-gray-500/10 text-gray-300' :
                        'bg-yellow-500/10 text-yellow-300'
                      }`}>
                        {booking.bookingStatus === 'active' ? 'Aktif' :
                         booking.bookingStatus === 'confirmed' ? 'Dikonfirmasi' :
                         booking.bookingStatus === 'completed' ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {mockBookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 border border-white/5 hover:border-gold-500/10 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center">
                      <Car className="w-7 h-7 text-gold-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{booking.vehicleName}</h4>
                      <p className="text-xs text-gray-500">
                        {booking.pickupLocation} → {booking.dropoffLocation}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.startDate} — {booking.endDate} ({booking.duration} hari)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-gold-gradient font-bold">{formatCurrency(booking.totalPrice)}</p>
                      <p className="text-xs text-gray-500">
                        {booking.paymentStatus === 'dp_paid' ? 'DP Terbayar' :
                         booking.paymentStatus === 'fully_paid' ? 'Lunas' : 'Belum Bayar'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.bookingStatus === 'active' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                      booking.bookingStatus === 'confirmed' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                      booking.bookingStatus === 'completed' ? 'bg-gray-500/10 text-gray-300 border border-gray-500/20' :
                      'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                    }`}>
                      {booking.bookingStatus === 'active' ? 'Aktif' :
                       booking.bookingStatus === 'confirmed' ? 'Dikonfirmasi' :
                       booking.bookingStatus === 'completed' ? 'Selesai' : 'Pending'}
                    </span>
                  </div>
                </div>
                {booking.driverName && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gold-400/60" />
                    <span className="text-xs text-gray-400">Driver: {booking.driverName}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Fleet Tab (Owner only) */}
        {activeTab === 'fleet' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { name: 'Toyota Alphard', status: 'available', bookings: 28, revenue: 'Rp 70jt' },
              { name: 'Mercedes S-Class', status: 'rented', bookings: 15, revenue: 'Rp 75jt' },
              { name: 'BMW X7', status: 'maintenance', bookings: 22, revenue: 'Rp 88jt' },
            ].map((fleet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">{fleet.name}</h4>
                  <span className={`w-3 h-3 rounded-full ${
                    fleet.status === 'available' ? 'bg-emerald-400' :
                    fleet.status === 'rented' ? 'bg-blue-400' : 'bg-yellow-400'
                  }`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-gray-500">Total Booking</p>
                    <p className="text-white font-bold">{fleet.bookings}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-gray-500">Pendapatan</p>
                    <p className="text-gold-400 font-bold">{fleet.revenue}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Revenue Tab (Owner only) */}
        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="font-[Playfair_Display] text-lg font-semibold text-white mb-4">
                Pendapatan Bulanan
              </h3>
              {/* Simple bar chart */}
              <div className="flex items-end gap-3 h-48">
                {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 relative group cursor-pointer"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gold-300 whitespace-nowrap">Rp {val}jt</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                  <span key={m} className="text-[10px] text-gray-600 flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Tahun Ini', value: 'Rp 845jt', change: '+23%' },
                { label: 'Rata-rata/hari', value: 'Rp 2.3jt', change: '+8%' },
                { label: 'Okupansi', value: '78%', change: '+5%' },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl p-5 border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-400 mt-1">{stat.change} dari tahun lalu</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
