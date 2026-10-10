import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Calendar, DollarSign, TrendingUp, Plus, Edit2, Eye,
  CheckCircle2, XCircle, Clock, AlertCircle, Upload, Camera,
  Fuel, Gauge, MapPin, Users, Star, Filter, Download,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { vehicles, mockBookings, formatCurrency } from '../data/mockData';
import Vehicle360Viewer from './Vehicle360Viewer';

type OwnerTab = 'fleet' | 'bookings' | 'inspection' | 'revenue';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<OwnerTab>('fleet');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');
  const { currentUser } = useAppStore();

  const tabs = [
    { id: 'fleet' as OwnerTab, label: 'Fleet Management', icon: Car },
    { id: 'bookings' as OwnerTab, label: 'Booking Management', icon: Calendar },
    { id: 'inspection' as OwnerTab, label: 'Check-in/Check-out', icon: CheckCircle2 },
    { id: 'revenue' as OwnerTab, label: 'Pendapatan', icon: DollarSign },
  ];

  // Stats
  const stats = [
    { label: 'Pendapatan Bulan Ini', value: 'Rp 45.5jt', change: '+15%', icon: DollarSign, color: 'gold' },
    { label: 'Armada Aktif', value: '12', change: '+2', icon: Car, color: 'emerald' },
    { label: 'Booking Aktif', value: '4', change: '+1', icon: Calendar, color: 'blue' },
    { label: 'Rating', value: '4.8/5', change: '+0.2', icon: Star, color: 'purple' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-[Playfair_Display] text-3xl font-bold text-white mb-2">
            Owner Dashboard
          </h1>
          <p className="text-gray-400">
            Kelola armada dan pantau performa bisnis rental Anda
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-luxury p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'gold' ? 'bg-gold-500/10' :
                  stat.color === 'emerald' ? 'bg-emerald-500/10' :
                  stat.color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'gold' ? 'text-gold-400' :
                    stat.color === 'emerald' ? 'text-emerald-400' :
                    stat.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.change.startsWith('+') ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl neu-soft mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'neu-raised text-gold-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab 1: Fleet Management */}
            {activeTab === 'fleet' && <FleetManagement />}

            {/* Tab 2: Booking Management */}
            {activeTab === 'bookings' && (
              <BookingManagement filter={bookingFilter} setFilter={setBookingFilter} />
            )}

            {/* Tab 3: Check-in/Check-out */}
            {activeTab === 'inspection' && <InspectionManagement />}

            {/* Tab 4: Revenue */}
            {activeTab === 'revenue' && <RevenueDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 1: FLEET MANAGEMENT
// ============================================================================

function FleetManagement() {
  return (
    <div className="space-y-6">
      {/* Add Vehicle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-luxury flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Kendaraan Baru
      </motion.button>

      {/* Vehicle List */}
      <div className="space-y-4">
        {vehicles.slice(0, 6).map((vehicle, i) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-luxury p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Vehicle Image */}
              <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden neu-pressed">
                {vehicle.has360View ? (
                  <Vehicle360Viewer
                    vehicle={vehicle}
                    autoRotate={true}
                    showControls={false}
                    className="w-full h-full"
                  />
                ) : (
                  <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{vehicle.name}</h3>
                    <p className="text-sm text-gray-400">{vehicle.brand} • {vehicle.year}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    vehicle.available
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-300 border border-red-500/20'
                  }`}>
                    {vehicle.available ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Harga/hari</p>
                    <p className="text-sm text-gold-400 font-semibold">{formatCurrency(vehicle.pricePerDay)}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Total Booking</p>
                    <p className="text-sm text-white font-semibold">{vehicle.reviews}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm text-white font-semibold">{vehicle.rating}/5</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300 hover:text-gold-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300 hover:text-red-300 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Nonaktifkan
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300 hover:text-blue-300 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Kalender
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: BOOKING MANAGEMENT
// ============================================================================

function BookingManagement({ filter, setFilter }: { filter: string; setFilter: (f: any) => void }) {
  const filters = [
    { id: 'all', label: 'Semua', count: mockBookings.length },
    { id: 'pending', label: 'Pending', count: 1 },
    { id: 'active', label: 'Aktif', count: 1 },
    { id: 'completed', label: 'Selesai', count: 1 },
    { id: 'cancelled', label: 'Dibatalkan', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'neu-gold text-gold-300'
                : 'neu-soft text-gray-400 hover:text-gray-200'
            }`}
          >
            {f.label}
            <span className="px-1.5 py-0.5 rounded text-xs bg-white/5">
              {f.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {mockBookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-luxury p-5"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Booking Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{booking.vehicleName}</h3>
                    <p className="text-sm text-gray-400">
                      Penyewa: {booking.renterName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="text-sm text-white font-medium">{booking.startDate}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Durasi</p>
                    <p className="text-sm text-white font-medium">{booking.duration} hari</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm text-gold-400 font-medium">{formatCurrency(booking.totalPrice)}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">DP</p>
                    <p className="text-sm text-white font-medium">{formatCurrency(booking.dpAmount)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {booking.bookingStatus === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terima
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300 hover:text-gold-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Detail
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB 3: CHECK-IN/CHECK-OUT
// ============================================================================

function InspectionManagement() {
  const [inspectionType, setInspectionType] = useState<'checkin' | 'checkout'>('checkin');

  return (
    <div className="space-y-6">
      {/* Inspection Type */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'checkin', label: 'Check-in', icon: ArrowUpRight, desc: 'Saat ambil kendaraan' },
          { id: 'checkout', label: 'Check-out', icon: ArrowDownRight, desc: 'Saat kembalikan' },
        ].map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInspectionType(type.id as any)}
            className={`p-4 rounded-xl text-left transition-all ${
              inspectionType === type.id
                ? 'neu-gold'
                : 'neu-soft'
            }`}
          >
            <type.icon className={`w-6 h-6 mb-2 ${
              inspectionType === type.id ? 'text-gold-400' : 'text-gray-400'
            }`} />
            <p className={`font-medium ${
              inspectionType === type.id ? 'text-gold-300' : 'text-gray-300'
            }`}>
              {type.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Inspection Checklist */}
      <div className="card-luxury p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Checklist Kondisi Kendaraan</h3>
        
        <div className="space-y-4">
          {/* Eksterior */}
          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-400" />
                <span className="text-white font-medium">Eksterior</span>
              </div>
              <span className="text-xs text-gray-500">Foto 4 sisi</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['Depan', 'Belakang', 'Kiri', 'Kanan'].map((side, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg neu-pressed flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gold-400 mb-1" />
                  <span className="text-xs text-gray-400">{side}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interior */}
          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-400" />
                <span className="text-white font-medium">Interior</span>
              </div>
              <span className="text-xs text-gray-500">Dashboard, jok, bagasi</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Dashboard', 'Jok', 'Bagasi'].map((area, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-video rounded-lg neu-pressed flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gold-400 mb-1" />
                  <span className="text-xs text-gray-400">{area}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Kilometer */}
          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-5 h-5 text-gold-400" />
              <span className="text-white font-medium">Kilometer</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  {inspectionType === 'checkin' ? 'KM Awal' : 'KM Akhir'}
                </label>
                <input
                  type="number"
                  className="input-luxury"
                  placeholder="Contoh: 45230"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Selisih KM</label>
                <div className="input-luxury bg-luxury-900 text-gray-500">
                  Otomatis
                </div>
              </div>
            </div>
          </div>

          {/* Bahan Bakar */}
          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-5 h-5 text-gold-400" />
              <span className="text-white font-medium">Bahan Bakar</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Level BBM</label>
              <div className="grid grid-cols-5 gap-2">
                {['Empty', '1/4', '1/2', '3/4', 'Full'].map((level, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 rounded-lg neu-soft text-xs text-gray-300 hover:text-gold-300 transition-colors"
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-luxury py-3 mt-6 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Konfirmasi {inspectionType === 'checkin' ? 'Check-in' : 'Check-out'}
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 4: REVENUE DASHBOARD
// ============================================================================

function RevenueDashboard() {
  const monthlyData = [65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Pendapatan Bulanan</h3>
            <p className="text-sm text-gray-400">Grafik pendapatan 12 bulan terakhir</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300"
            >
              Harian
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 rounded-lg neu-gold text-xs text-gold-300"
            >
              Bulanan
            </motion.button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 flex items-end gap-3 mb-4">
          {monthlyData.map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 relative group cursor-pointer"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gold-300 whitespace-nowrap bg-luxury-900 px-2 py-1 rounded">
                  Rp {val}jt
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between">
          {months.map((m) => (
            <span key={m} className="text-[10px] text-gray-600 flex-1 text-center">{m}</span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tahun Ini', value: 'Rp 845jt', change: '+23%', icon: TrendingUp },
          { label: 'Rata-rata/hari', value: 'Rp 2.3jt', change: '+8%', icon: BarChart3 },
          { label: 'Okupansi', value: '78%', change: '+5%', icon: PieChart },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-luxury p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Riwayat Transaksi</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </motion.button>
        </div>

        <div className="space-y-3">
          {[
            { date: '2025-01-15', booking: 'Toyota Alphard', amount: 7500000, commission: 750000 },
            { date: '2025-01-12', booking: 'Mercedes S-Class', amount: 5000000, commission: 500000 },
            { date: '2025-01-10', booking: 'BMW X7', amount: 12000000, commission: 1200000 },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl neu-soft">
              <div>
                <p className="text-white font-medium text-sm">{tx.booking}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-gold-400 font-semibold">{formatCurrency(tx.amount)}</p>
                <p className="text-xs text-gray-500">Komisi: {formatCurrency(tx.commission)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
