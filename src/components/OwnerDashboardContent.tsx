import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Plus, DollarSign, Calendar, Car, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { StatsCard, RevenueChart, FleetStatus, RecentBookings } from './dashboard';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { BookingManagement, FleetManagement, InspectionManagement, RevenueDashboard } from './OwnerDashboard';
import OwnerSettingsPanel from './OwnerSettingsPanel';
import OwnerGPSPanel from './OwnerGPSPanel';
import AdvancedAnalytics from './AdvancedAnalytics';
import AddVehicleForm from './AddVehicleForm';
import OwnerSpinStudio from './OwnerSpinStudio';

export default function OwnerDashboardContent() {
  const { currentUser, ownerSection, setOwnerSection } = useAppStore();
  const [bookingFilter, setBookingFilter] = useState('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [submissionRefresh, setSubmissionRefresh] = useState(0);

  const ownerName = currentUser?.name || 'John';

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const sectionTitle = {
    overview: 'Ringkasan', fleet: 'Armada Kendaraan', bookings: 'Pemesanan', revenue: 'Pendapatan',
    check: 'Check-in / Check-out', analytics: 'Analitik', gps: 'GPS Kendaraan', spin360: 'Studio Spin 360°', settings: 'Pengaturan Pengguna',
  }[ownerSection];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 overflow-y-auto pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-3xl"
              >
                {ownerSection === 'overview' ? <>Selamat Pagi, <span className="text-yellow-400">{ownerName}</span> 👋</> : sectionTitle}
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
              {ownerSection === 'fleet' && <button onClick={() => setShowAddVehicle(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:scale-105 transition flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kendaraan
              </button>}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-6">
          {ownerSection !== 'overview' && <div className="mb-2"><h2 className="text-2xl font-semibold">{sectionTitle}</h2><p className="mt-1 text-sm text-gray-500">Kelola dan pantau {sectionTitle.toLowerCase()} rental Anda.</p></div>}
          {ownerSection === 'overview' && <>
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
          </>}
          {ownerSection === 'fleet' && <FleetManagement onAddVehicle={() => setShowAddVehicle(true)} refreshKey={submissionRefresh} />}
          {ownerSection === 'bookings' && <BookingManagement filter={bookingFilter} setFilter={setBookingFilter} />}
          {ownerSection === 'check' && <InspectionManagement />}
          {ownerSection === 'revenue' && <RevenueDashboard />}
          {ownerSection === 'analytics' && <AdvancedAnalytics />}
          {ownerSection === 'gps' && <OwnerGPSPanel />}
          {ownerSection === 'spin360' && <OwnerSpinStudio />}
          {ownerSection === 'settings' && <OwnerSettingsPanel />}
        </div>
        {showAddVehicle && <AddVehicleForm onClose={() => setShowAddVehicle(false)} onSubmitted={() => setSubmissionRefresh((value) => value + 1)} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
