import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, Calendar, CreditCard, FileText,
  TrendingUp, Clock, CheckCircle2, AlertCircle, ChevronRight,
  DollarSign, Users, BarChart3, Settings, LogOut, Shield,
  Percent, Sliders, Save, Info
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { mockBookings, formatCurrency } from '../data/mockData';

type DashboardTab = 'overview' | 'bookings' | 'fleet' | 'revenue' | 'settings';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const { currentUser, setCurrentUser, logout, ownerSettings, setOwnerSettings, setCurrentPage } = useAppStore();

  // If not logged in, redirect to auth
  if (!currentUser) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-md w-full border border-gold-500/10 text-center"
        >
          <Shield className="w-16 h-16 text-gold-400 mx-auto mb-4" />
          <h2 className="font-[Playfair_Display] text-2xl text-white mb-2">Akses Terbatas</h2>
          <p className="text-gray-400 mb-6">Silakan login terlebih dahulu untuk mengakses dashboard</p>
          <button
            onClick={() => setCurrentPage('auth')}
            className="btn-luxury"
          >
            Login Sekarang
          </button>
        </motion.div>
      </div>
    );
  }

  const isOwner = currentUser.role === 'owner';
  const isAdmin = currentUser.role === 'admin';
  const isRenter = currentUser.role === 'individual' || currentUser.role === 'corporate';

  const tabs = isOwner || isAdmin
    ? [
        { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'bookings' as DashboardTab, label: 'Booking', icon: Calendar },
        { id: 'fleet' as DashboardTab, label: 'Armada', icon: Car },
        { id: 'revenue' as DashboardTab, label: 'Pendapatan', icon: DollarSign },
        { id: 'settings' as DashboardTab, label: 'Pengaturan', icon: Settings },
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
              {isOwner ? 'Kelola armada & pantau pendapatan Anda' :
               isAdmin ? 'Overview seluruh platform' :
               'Pantau booking & riwayat sewa Anda'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <div className="px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
              <span className="text-xs text-gold-300 font-medium capitalize">
                {currentUser.role === 'individual' ? 'Penyewa Pribadi' :
                 currentUser.role === 'corporate' ? 'Penyewa Corporate' :
                 currentUser.role === 'owner' ? 'Pemilik Rental' : 'Admin'}
              </span>
            </div>
            <button
              onClick={() => { logout(); setCurrentPage('home'); }}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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

        {/* Settings Tab (Owner only) */}
        {activeTab === 'settings' && isOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* DP Settings */}
            <div className="glass rounded-2xl p-6 border border-gold-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">
                    Pengaturan DP Booking
                  </h3>
                  <p className="text-xs text-gray-500">
                    Atur persentase Down Payment yang harus dibayar penyewa saat booking
                  </p>
                </div>
              </div>

              {/* Current DP Setting */}
              <div className="mb-6 p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-400">Default DP saat ini</p>
                    <p className="text-3xl font-bold text-gold-gradient">{ownerSettings.defaultDpPercentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Range yang diizinkan</p>
                    <p className="text-sm text-white font-medium">
                      {ownerSettings.minDpPercentage}% - {ownerSettings.maxDpPercentage}%
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ownerSettings.defaultDpPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                  />
                </div>
              </div>

              {/* DP Slider */}
              <div className="mb-6">
                <label className="text-sm text-gray-300 mb-3 block">
                  Atur Persentase DP Default
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min={ownerSettings.minDpPercentage}
                    max={ownerSettings.maxDpPercentage}
                    value={ownerSettings.defaultDpPercentage}
                    onChange={(e) => setOwnerSettings({ defaultDpPercentage: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/5 accent-gold-500"
                    style={{
                      background: `linear-gradient(to right, #d4a853 0%, #d4a853 ${
                        ((ownerSettings.defaultDpPercentage - ownerSettings.minDpPercentage) / 
                         (ownerSettings.maxDpPercentage - ownerSettings.minDpPercentage)) * 100
                      }%, rgba(255,255,255,0.05) ${
                        ((ownerSettings.defaultDpPercentage - ownerSettings.minDpPercentage) / 
                         (ownerSettings.maxDpPercentage - ownerSettings.minDpPercentage)) * 100
                      }%, rgba(255,255,255,0.05) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{ownerSettings.minDpPercentage}%</span>
                    <span>{ownerSettings.maxDpPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Quick DP Options */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">Pilihan Cepat:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 40, 50].map((pct) => (
                    <motion.button
                      key={pct}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOwnerSettings({ defaultDpPercentage: pct })}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        ownerSettings.defaultDpPercentage === pct
                          ? 'bg-gold-500/20 border-gold-500/30 text-gold-300'
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-gold-500/20'
                      }`}
                    >
                      {pct}%
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Min/Max Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Minimum DP (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={ownerSettings.maxDpPercentage}
                      value={ownerSettings.minDpPercentage}
                      onChange={(e) => setOwnerSettings({ minDpPercentage: parseInt(e.target.value) || 20 })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Batas minimum DP yang bisa diatur</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Maksimum DP (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={ownerSettings.minDpPercentage}
                      max={100}
                      value={ownerSettings.maxDpPercentage}
                      onChange={(e) => setOwnerSettings({ maxDpPercentage: parseInt(e.target.value) || 50 })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Batas maksimum DP yang bisa diatur</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium mb-1">Informasi Penting</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• DP akan otomatis diterapkan ke semua booking baru</li>
                      <li>• Penyewa dapat memilih DP dalam range yang Anda tentukan</li>
                      <li>• Sisa pembayaran dilunasi saat pick-up kendaraan</li>
                      <li>• Perubahan setting tidak mempengaruhi booking yang sudah berjalan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                <p className="text-sm text-gray-300 font-medium mb-3">Contoh Perhitungan:</p>
                <div className="space-y-2">
                  {[
                    { vehicle: 'Toyota Alphard', price: 7500000, days: 3 },
                    { vehicle: 'Mercedes S-Class', price: 5000000, days: 1 },
                  ].map((item, i) => {
                    const total = item.price * item.days;
                    const dp = total * (ownerSettings.defaultDpPercentage / 100);
                    const remaining = total - dp;
                    return (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white text-sm">{item.vehicle}</p>
                          <p className="text-xs text-gray-500">{item.days} hari × {formatCurrency(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold-400 text-sm font-medium">DP: {formatCurrency(dp)}</p>
                          <p className="text-xs text-gray-500">Sisa: {formatCurrency(remaining)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-luxury py-3 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </motion.button>
            </div>

            {/* Additional Settings */}
            <div className="glass rounded-2xl p-6 border border-gold-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-[Playfair_Display] text-lg font-semibold text-white">
                    Pengaturan Lainnya
                  </h3>
                  <p className="text-xs text-gray-500">Konfigurasi tambahan untuk armada Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Notifikasi Email', desc: 'Terima notifikasi booking baru via email', enabled: true },
                  { label: 'Auto-Confirm Booking', desc: 'Otomatis konfirmasi booking jika dokumen lengkap', enabled: false },
                  { label: 'Minimum Durasi Sewa', desc: 'Batas minimum hari sewa (default: 1 hari)', enabled: true },
                  { label: 'Asuransi Wajib', desc: 'Wajibkan penyewa mengambil asuransi', enabled: true },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500/30 peer-checked:after:bg-gold-400"></div>
                    </label>
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
                        DP {booking.dpPercentage}%: {formatCurrency(booking.dpAmount)}
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
