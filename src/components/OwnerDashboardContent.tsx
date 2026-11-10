import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Calendar, Car, TrendingUp } from 'lucide-react';
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
import NotificationBell from './NotificationBell';
import { defaultRuntimeSettings, getRuntimeSettings } from '../services/runtimeSettingsService';
import { supabase } from '../lib/supabase';

export default function OwnerDashboardContent() {
  const { currentUser, ownerSection, setOwnerSection } = useAppStore();
  const [bookingFilter, setBookingFilter] = useState('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [submissionRefresh, setSubmissionRefresh] = useState(0);
  const [spinStudioEnabled, setSpinStudioEnabled] = useState(defaultRuntimeSettings.spin360_studio_enabled);
  const [overview, setOverview] = useState({ vehicles: 0, bookings: 0, income: 0, rating: 0 });
  useEffect(() => { void getRuntimeSettings().then((settings) => setSpinStudioEnabled(settings.spin360_studio_enabled)); }, []);
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    void (async () => {
      const { data: owner } = await supabase.from('owners').select('id,rating').eq('user_id', currentUser.id).maybeSingle();
      if (!owner) return;
      const [vehiclesResult, bookingsResult] = await Promise.all([
        supabase.from('vehicles').select('id,status', { count: 'exact' }).eq('owner_id', owner.id),
        supabase.from('bookings').select('status,total_price,created_at,vehicle:vehicles!inner(owner_id)').eq('vehicle.owner_id', owner.id),
      ]);
      if (cancelled) return;
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const ownerBookings = bookingsResult.data ?? [];
      setOverview({
        vehicles: vehiclesResult.count ?? 0,
        bookings: ownerBookings.filter((item: any) => ['CONFIRMED', 'ACTIVE'].includes(item.status)).length,
        income: ownerBookings.filter((item: any) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(item.status) && new Date(item.created_at) >= monthStart).reduce((sum: number, item: any) => sum + Number(item.total_price || 0), 0),
        rating: Number(owner.rating || 0),
      });
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

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
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a] px-5 py-4 sm:px-8">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-2xl sm:text-3xl"
              >
                {ownerSection === 'overview' ? <>Selamat Pagi, <span className="text-yellow-400">{ownerName}</span> 👋</> : sectionTitle}
              </motion.h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentDate} • Armada Anda siap menghasilkan
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <NotificationBell />
              {ownerSection === 'fleet' && <button aria-label="Tambah kendaraan" onClick={() => setShowAddVehicle(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-2 text-sm font-semibold text-black transition hover:scale-105 sm:px-4 sm:text-base">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Kendaraan</span>
              </button>}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-6 p-5 pb-24 sm:p-8 lg:pb-8">
          {ownerSection === 'overview' && <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={DollarSign}
              label="Pendapatan Bulan Ini"
              value={`Rp ${overview.income.toLocaleString('id-ID')}`}
              change="Bulan ini"
              trend="up"
              color="gold"
            />
            <StatsCard
              icon={Calendar}
              label="Booking Aktif"
              value={String(overview.bookings)}
              change="Aktif"
              trend="up"
              color="purple"
            />
            <StatsCard
              icon={Car}
              label="Armada Aktif"
              value={String(overview.vehicles)}
              change="Terdaftar"
              trend="neutral"
              color="blue"
            />
            <StatsCard
              icon={TrendingUp}
              label="Rating Rata-rata"
              value={overview.rating.toFixed(1)}
              change="Rating pemilik"
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
          {ownerSection === 'spin360' && (spinStudioEnabled ? <OwnerSpinStudio /> : <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#141414] p-8 text-center"><h2 className="font-serif text-2xl">Studio Spin 360° sedang dinonaktifkan</h2><p className="mt-2 text-sm text-gray-400">Fitur ini sementara tidak tersedia. Silakan kembali ke armada.</p><button onClick={() => setOwnerSection('fleet')} className="mt-5 rounded-xl bg-yellow-500 px-4 py-2 font-medium text-black">Kembali ke Armada</button></div>)}
          {ownerSection === 'settings' && <OwnerSettingsPanel />}
        </div>
        {showAddVehicle && <AddVehicleForm onClose={() => setShowAddVehicle(false)} onSubmitted={() => setSubmissionRefresh((value) => value + 1)} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
