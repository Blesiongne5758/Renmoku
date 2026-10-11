import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Car, DollarSign, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

// Mock data for analytics
const revenueData = [
  { month: 'Jan', revenue: 45000000, bookings: 120 },
  { month: 'Feb', revenue: 52000000, bookings: 145 },
  { month: 'Mar', revenue: 48000000, bookings: 132 },
  { month: 'Apr', revenue: 61000000, bookings: 168 },
  { month: 'May', revenue: 55000000, bookings: 152 },
  { month: 'Jun', revenue: 67000000, bookings: 185 },
  { month: 'Jul', revenue: 72000000, bookings: 198 },
  { month: 'Aug', revenue: 78000000, bookings: 215 },
  { month: 'Sep', revenue: 85000000, bookings: 234 },
  { month: 'Oct', revenue: 92000000, bookings: 253 },
  { month: 'Nov', revenue: 88000000, bookings: 242 },
  { month: 'Dec', revenue: 95000000, bookings: 261 },
];

const vehicleTypeData = [
  { name: 'SUV', value: 35, color: '#D4AF37' },
  { name: 'Sedan', value: 25, color: '#8B5CF6' },
  { name: 'MPV', value: 20, color: '#3B82F6' },
  { name: 'Luxury', value: 15, color: '#10B981' },
  { name: 'Sport', value: 5, color: '#F59E0B' },
];

const bookingStatusData = [
  { status: 'Completed', count: 1850, color: '#10B981' },
  { status: 'Active', count: 245, color: '#3B82F6' },
  { status: 'Pending', count: 89, color: '#F59E0B' },
  { status: 'Cancelled', count: 34, color: '#EF4444' },
];

const topVehicles = [
  { name: 'Toyota Alphard', bookings: 156, revenue: 45000000, rating: 4.9 },
  { name: 'Mercedes S-Class', bookings: 98, revenue: 38000000, rating: 4.8 },
  { name: 'BMW X5', bookings: 87, revenue: 32000000, rating: 4.7 },
  { name: 'Honda HR-V', bookings: 134, revenue: 28000000, rating: 4.6 },
  { name: 'Range Rover', bookings: 76, revenue: 25000000, rating: 4.8 },
];

const aiInsights = [
  {
    type: 'trend',
    icon: TrendingUp,
    title: 'Permintaan SUV Meningkat',
    description: 'Permintaan SUV meningkat 23% bulan ini. Pertimbangkan untuk menambah armada SUV.',
    impact: 'high',
    action: 'Tambah Armada'
  },
  {
    type: 'warning',
    icon: TrendingDown,
    title: 'Penurunan Booking Sedan',
    description: 'Booking sedan turun 15% dalam 3 bulan terakhir. Evaluasi harga atau promosi.',
    impact: 'medium',
    action: 'Evaluasi Strategi'
  },
  {
    type: 'opportunity',
    icon: DollarSign,
    title: 'Peak Season Terdeteksi',
    description: 'Data menunjukkan peningkatan 40% booking pada akhir bulan. Siapkan armada tambahan.',
    impact: 'high',
    action: 'Siapkan Armada'
  },
  {
    type: 'info',
    icon: Users,
    title: 'Customer Retention Tinggi',
    description: '78% pelanggan melakukan booking ulang. Program loyalitas berjalan efektif.',
    impact: 'low',
    action: 'Lihat Detail'
  }
];

export default function AdvancedAnalytics() {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
  const avgRevenuePerBooking = totalRevenue / totalBookings;
  const growthRate = ((revenueData[11].revenue - revenueData[0].revenue) / revenueData[0].revenue * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-luxury-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
          <p className="text-gray-400">AI-powered insights untuk optimasi bisnis Anda</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Pendapatan', value: `Rp ${(totalRevenue / 1000000000).toFixed(2)}B`, change: '+18.5%', icon: DollarSign, color: 'gold' },
            { label: 'Total Booking', value: totalBookings.toLocaleString(), change: '+12.3%', icon: Calendar, color: 'purple' },
            { label: 'Rata-rata per Booking', value: `Rp ${(avgRevenuePerBooking / 1000000).toFixed(1)}M`, change: '+5.2%', icon: BarChart3, color: 'blue' },
            { label: 'Pertumbuhan YoY', value: `${growthRate}%`, change: '+3.1%', icon: TrendingUp, color: 'green' },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-luxury p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">{metric.change}</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-sm text-gray-400">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-luxury p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Insights</h2>
              <p className="text-sm text-gray-400">Rekomendasi berbasis data untuk bisnis Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className={`p-4 rounded-xl border ${
                  insight.impact === 'high' ? 'bg-gold-500/5 border-gold-500/20' :
                  insight.impact === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 flex-shrink-0 ${
                    insight.impact === 'high' ? 'text-gold-400' :
                    insight.impact === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{insight.description}</p>
                    <button className="text-xs text-gold-400 hover:text-gold-300 font-medium">
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 card-luxury p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Trend Pendapatan & Booking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #D4AF37',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" name="Pendapatan (Rp)" />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorBookings)" name="Booking" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Vehicle Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card-luxury p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Distribusi Tipe Kendaraan</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #D4AF37',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card-luxury p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Kendaraan Terpopuler</h3>
            <div className="space-y-4">
              {topVehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-luxury-900">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{vehicle.name}</p>
                    <p className="text-sm text-gray-400">{vehicle.bookings} bookings • ⭐ {vehicle.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-semibold">Rp {(vehicle.revenue / 1000000).toFixed(0)}M</p>
                    <p className="text-xs text-gray-500">pendapatan</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Booking Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card-luxury p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Status Booking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="status" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #D4AF37',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
