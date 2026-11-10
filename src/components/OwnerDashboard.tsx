import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Calendar, DollarSign, TrendingUp, Plus, Eye,
  CheckCircle2, XCircle, Upload, Camera,
  Fuel, Gauge, Star, Download,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import BookingChat from './BookingChat';
import BookingContractViewer from './BookingContractViewer';

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
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
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

export function FleetManagement({ onAddVehicle, refreshKey = 0 }: { onAddVehicle?: () => void; refreshKey?: number } = {}) {
  const currentUser = useAppStore((state) => state.currentUser);
  const [ownerId, setOwnerId] = useState('');
  const [ownerVehicles, setOwnerVehicles] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Array<{ id: string; brand: string; model: string; year: number; license_plate: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const loadFleet = async () => {
    if (!currentUser?.id) return;
    setLoading(true); setError('');
    const { data: owner, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
    if (ownerError || !owner) { setLoading(false); setError(ownerError?.message || 'Profil pemilik rental belum ditemukan.'); return; }
    setOwnerId(owner.id);
    const [fleetResult, submissionsResult] = await Promise.all([
      supabase.from('vehicles').select('id,brand,model,year,price_daily,status,location,images,rating,total_reviews,total_bookings').eq('owner_id', owner.id).order('created_at', { ascending: false }),
      supabase.from('owner_vehicle_submissions').select('id,brand,model,year,license_plate,status').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]);
    setLoading(false);
    if (fleetResult.error) setError(fleetResult.error.message); else setOwnerVehicles(fleetResult.data ?? []);
    if (!submissionsResult.error) setSubmissions(submissionsResult.data ?? []);
  };
  useEffect(() => {
    void loadFleet();
  }, [currentUser?.id, refreshKey]);

  const toggleVehicle = async (vehicle: any) => {
    if (vehicle.status === 'RENTED') return toast.error('Kendaraan sedang disewa dan tidak dapat dinonaktifkan.');
    setBusyId(vehicle.id);
    const nextStatus = vehicle.status === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE';
    const { error: updateError } = await supabase.from('vehicles').update({ status: nextStatus }).eq('id', vehicle.id).eq('owner_id', ownerId);
    setBusyId('');
    if (updateError) return toast.error('Status kendaraan gagal diperbarui.');
    toast.success(nextStatus === 'AVAILABLE' ? 'Kendaraan diaktifkan.' : 'Kendaraan dinonaktifkan.');
    await loadFleet();
  };
  const deleteVehicle = async (vehicle: any) => {
    const { count, error: bookingError } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('vehicle_id', vehicle.id);
    if (bookingError) return toast.error('Riwayat pemesanan tidak dapat diperiksa. Kendaraan tidak dihapus.');
    if ((count ?? 0) > 0) return toast.error('Kendaraan memiliki riwayat pemesanan. Nonaktifkan kendaraan untuk mempertahankan riwayat.');
    const { count: inspectionCount, error: inspectionError } = await supabase.from('owner_vehicle_inspections').select('id', { count: 'exact', head: true }).eq('vehicle_id', vehicle.id);
    if (inspectionError) return toast.error('Riwayat inspeksi tidak dapat diperiksa. Kendaraan tidak dihapus.');
    if ((inspectionCount ?? 0) > 0) return toast.error('Kendaraan memiliki riwayat inspeksi. Nonaktifkan kendaraan agar bukti inspeksi tetap tersimpan.');
    if (!window.confirm(`Hapus ${vehicle.brand} ${vehicle.model} dari armada? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(vehicle.id);
    const { error: deleteError } = await supabase.rpc('owner_delete_vehicle_if_unbooked', { p_vehicle_id: vehicle.id });
    setBusyId('');
    if (deleteError) return toast.error('Kendaraan gagal dihapus.');
    toast.success('Kendaraan berhasil dihapus.');
    await loadFleet();
  };

  return (
    <div className="space-y-6">
      {/* Add Vehicle Button */}
      <motion.button
        onClick={onAddVehicle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-luxury flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Kendaraan Baru
      </motion.button>

      {submissions.length > 0 && <section className="rounded-2xl border border-white/10 bg-[#141414] p-5"><h3 className="mb-3 font-semibold">Pengajuan kendaraan saya</h3><div className="space-y-2">{submissions.map((submission) => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3"><div><p className="font-medium">{submission.brand} {submission.model} · {submission.year}</p><p className="text-sm text-gray-500">{submission.license_plate}</p></div><span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{submission.status === 'PENDING_REVIEW' ? 'Menunggu verifikasi' : submission.status === 'APPROVED' ? 'Disetujui' : 'Perlu perbaikan'}</span></div>)}</div></section>}

      {/* Vehicle List */}
      <div className="space-y-4">
        {loading && <p className="p-6 text-center text-sm text-gray-400">Memuat armada…</p>}
        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">{error} <button onClick={() => void loadFleet()} className="ml-2 underline">Coba lagi</button></div>}
        {!loading && !error && ownerVehicles.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">Belum ada kendaraan terverifikasi pada armada Anda.</div>}
        {ownerVehicles.map((vehicle, i) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-luxury p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Vehicle Image */}
              <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-white/5">
                {vehicle.images?.[0] ? <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><Car /></div>}
              </div>

              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-400">{vehicle.year} · {vehicle.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    vehicle.status === 'RENTED' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                    vehicle.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20' :
                    'bg-red-500/10 text-red-300 border border-red-500/20'
                  }`}>
                    {vehicle.status === 'AVAILABLE' ? 'Aktif' : vehicle.status === 'RENTED' ? 'Sedang disewa' : vehicle.status === 'MAINTENANCE' ? 'Perawatan' : 'Nonaktif'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Harga/hari</p>
                    <p className="text-sm text-gold-400 font-semibold">{formatCurrency(Number(vehicle.price_daily))}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Total Booking</p>
                    <p className="text-sm text-white font-semibold">{vehicle.total_bookings ?? 0}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm text-white font-semibold">{Number(vehicle.rating ?? 0).toFixed(1)}/5 ({vehicle.total_reviews ?? 0})</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button disabled={busyId === vehicle.id} onClick={() => void toggleVehicle(vehicle)} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />{vehicle.status === 'INACTIVE' ? 'Aktifkan' : 'Nonaktifkan'}</button>
                  <button disabled={busyId === vehicle.id} onClick={() => void deleteVehicle(vehicle)} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />Hapus kendaraan</button>
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

export function BookingManagement({ filter, setFilter }: { filter: string; setFilter: (f: any) => void }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [detailsId, setDetailsId] = useState('');
  const loadBookings = async () => {
    if (!currentUser?.id) return;
    setLoading(true); setError('');
    const { data: owner, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
    if (ownerError || !owner) { setLoading(false); setError('Profil pemilik rental belum ditemukan.'); return; }
    const { data, error: queryError } = await supabase.from('bookings').select('id,start_date,end_date,total_price,dp_amount,status,trip_origin,trip_destination,created_at,renter:users!renter_id(full_name,email),vehicle:vehicles!inner(id,brand,model,owner_id)').eq('vehicle.owner_id', owner.id).order('created_at', { ascending: false });
    setLoading(false);
    if (queryError) setError('Data pemesanan gagal dimuat.'); else setBookings((data ?? []).map((item: any) => ({ ...item, renter: Array.isArray(item.renter) ? item.renter[0] : item.renter, vehicle: Array.isArray(item.vehicle) ? item.vehicle[0] : item.vehicle })));
  };
  useEffect(() => { void loadBookings(); }, [currentUser?.id]);
  const updateStatus = async (bookingId: string, status: 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED') => {
    setBusyId(bookingId);
    const result = status === 'CONFIRMED' || status === 'UNAVAILABLE'
      ? await supabase.rpc('resolve_booking_availability', { p_booking_id: bookingId, p_available: status === 'CONFIRMED' })
      : await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', bookingId).eq('status', 'PENDING');
    setBusyId('');
    if (result.error) return toast.error('Status gagal diperbarui. Pastikan bukti bayar sudah divalidasi admin dan migrasi booking fee telah diterapkan.');
    toast.success(status === 'CONFIRMED' ? 'Ketersediaan dikonfirmasi. Biaya booking digunakan.' : status === 'UNAVAILABLE' ? 'Kendaraan ditandai tidak tersedia. Penyewa dapat memilih kendaraan lain tanpa membayar lagi.' : 'Pemesanan ditolak.');
    await loadBookings();
  };
  const filters = [
    { id: 'all', label: 'Semua', count: bookings.length },
    { id: 'pending', label: 'Menunggu', count: bookings.filter((b) => b.status === 'PENDING').length },
    { id: 'active', label: 'Aktif', count: bookings.filter((b) => ['CONFIRMED', 'ACTIVE'].includes(b.status)).length },
    { id: 'completed', label: 'Selesai', count: bookings.filter((b) => b.status === 'COMPLETED').length },
    { id: 'cancelled', label: 'Dibatalkan', count: bookings.filter((b) => b.status === 'CANCELLED').length },
  ];
  const visibleBookings = bookings.filter((booking) => filter === 'all' || (filter === 'pending' ? booking.status === 'PENDING' : filter === 'active' ? ['CONFIRMED', 'ACTIVE'].includes(booking.status) : filter === 'completed' ? booking.status === 'COMPLETED' : booking.status === 'CANCELLED'));

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
        {loading && <p className="p-6 text-center text-sm text-gray-400">Memuat pemesanan…</p>}
        {error && <div className="rounded-xl border border-red-500/20 p-4 text-sm text-red-300">{error} <button onClick={() => void loadBookings()} className="ml-2 underline">Coba lagi</button></div>}
        {!loading && !error && visibleBookings.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">Tidak ada pemesanan pada kategori ini.</div>}
        {visibleBookings.map((booking, i) => (
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
                    <h3 className="text-white font-semibold text-lg">{booking.vehicle?.brand} {booking.vehicle?.model}</h3>
                    <p className="text-sm text-gray-400">
                      Penyewa: {booking.renter?.full_name || booking.renter?.email || 'Pengguna'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    ['ACTIVE', 'CONFIRMED'].includes(booking.status) ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    booking.status === 'COMPLETED' ? 'bg-gray-500/10 text-gray-300 border border-gray-500/20' :
                    'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                  }`}>
                    {booking.status === 'ACTIVE' ? 'Berlangsung' : booking.status === 'CONFIRMED' ? 'Dikonfirmasi' : booking.status === 'COMPLETED' ? 'Selesai' : booking.status === 'CANCELLED' ? 'Dibatalkan' : 'Menunggu'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="text-sm text-white font-medium">{new Date(booking.start_date).toLocaleDateString('id-ID')} – {new Date(booking.end_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Durasi</p>
                    <p className="text-sm text-white font-medium">{Math.max(1, Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000))} hari</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm text-gold-400 font-medium">{formatCurrency(Number(booking.total_price))}</p>
                  </div>
                  <div className="neu-soft rounded-lg p-2">
                    <p className="text-xs text-gray-500">DP</p>
                    <p className="text-sm text-white font-medium">{formatCurrency(Number(booking.dp_amount))}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {booking.status === 'PENDING' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={busyId === booking.id} onClick={() => void updateStatus(booking.id, 'CONFIRMED')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terima
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={busyId === booking.id} onClick={() => void updateStatus(booking.id, 'UNAVAILABLE')} className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 disabled:opacity-50">
                        Kendaraan tidak tersedia
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={busyId === booking.id} onClick={() => void updateStatus(booking.id, 'CANCELLED')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDetailsId(detailsId === booking.id ? '' : booking.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300 hover:text-gold-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Detail
                  </motion.button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2"><BookingChat bookingId={booking.id} status={booking.status}/><BookingContractViewer bookingId={booking.id}/></div>
                {detailsId === booking.id && <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-300"><p>Lokasi jemput: {booking.trip_origin || '—'}</p><p>Tujuan: {booking.trip_destination || '—'}</p><p className="mt-1 text-xs text-gray-500">Booking dibuat {new Date(booking.created_at).toLocaleString('id-ID')}</p></div>}
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

export function InspectionManagement() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [inspectionType, setInspectionType] = useState<'checkin' | 'checkout'>('checkin');
  const [inspectionVehicles, setInspectionVehicles] = useState<any[]>([]);
  const [inspectionBookings, setInspectionBookings] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [odometer, setOdometer] = useState('');
  const [previousOdometer, setPreviousOdometer] = useState<number | null>(null);
  const [fuelLevel, setFuelLevel] = useState<number | null>(null);
  const [inspectionPhotos, setInspectionPhotos] = useState<Record<string, File>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const photoFields = [{ key: 'front', label: 'Depan' }, { key: 'rear', label: 'Belakang' }, { key: 'left', label: 'Kiri' }, { key: 'right', label: 'Kanan' }, { key: 'dashboard', label: 'Odometer' }];

  useEffect(() => {
    if (!currentUser?.id) return;
    void (async () => {
      const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
      if (!owner) return;
      const [{ data: vehiclesData }, { data: bookingsData }] = await Promise.all([
        supabase.from('vehicles').select('id,brand,model,status').eq('owner_id', owner.id).order('brand'),
        supabase.from('bookings').select('id,vehicle_id,status,renter:users!renter_id(full_name,email)').eq('status', inspectionType === 'checkin' ? 'CONFIRMED' : 'ACTIVE').order('created_at', { ascending: false }),
      ]);
      setInspectionVehicles(vehiclesData ?? []);
      setInspectionBookings((bookingsData ?? []).map((booking: any) => ({ ...booking, renter: Array.isArray(booking.renter) ? booking.renter[0] : booking.renter })));
    })();
  }, [currentUser?.id, inspectionType]);

  useEffect(() => {
    setBookingId(''); setPreviousOdometer(null);
  }, [vehicleId, inspectionType]);

  useEffect(() => {
    if (!bookingId || inspectionType !== 'checkout') return;
    void supabase.from('owner_vehicle_inspections').select('odometer_km').eq('booking_id', bookingId).eq('inspection_type', 'checkin').maybeSingle()
      .then(({ data }) => setPreviousOdometer(data?.odometer_km ?? null));
  }, [bookingId, inspectionType]);

  const saveInspection = async (event: React.FormEvent) => {
    event.preventDefault();
    const reading = Number(odometer);
    if (!currentUser || !bookingId || !vehicleId || !Number.isInteger(reading) || reading < 0 || fuelLevel === null) return toast.error('Pilih pemesanan, isi odometer, dan pilih level BBM.');
    if (photoFields.some((photo) => !inspectionPhotos[photo.key])) return toast.error('Unggah lima foto kondisi kendaraan yang diminta.');
    if (inspectionType === 'checkout' && previousOdometer !== null && reading < previousOdometer) return toast.error('Odometer akhir tidak boleh lebih kecil dari odometer awal.');
    setSaving(true);
    const inspectionId = crypto.randomUUID();
    const uploaded: Record<string, string> = {};
    try {
      for (const photo of photoFields) {
        const file = inspectionPhotos[photo.key];
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error(`Foto ${photo.label} harus JPG, PNG, atau WebP dengan ukuran maksimal 10 MB.`);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${currentUser.id}/inspections/${inspectionId}/${photo.key}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('owner-private').upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        uploaded[photo.key] = path;
      }
      const { error: insertError } = await supabase.from('owner_vehicle_inspections').insert({ id: inspectionId, user_id: currentUser.id, vehicle_id: vehicleId, booking_id: bookingId, inspection_type: inspectionType, odometer_km: reading, fuel_level: fuelLevel, photos: uploaded, notes: notes.trim() });
      if (insertError) throw insertError;
      const { error: statusError } = await supabase.from('bookings').update({ status: inspectionType === 'checkin' ? 'ACTIVE' : 'COMPLETED', updated_at: new Date().toISOString() }).eq('id', bookingId);
      if (statusError) toast.warning('Inspeksi tersimpan, tetapi status booking gagal diperbarui. Muat ulang dan hubungi admin jika tetap belum berubah.');
      else toast.success(inspectionType === 'checkin' ? 'Check-in tersimpan; booking dimulai.' : 'Check-out tersimpan; booking selesai.');
      setBookingId(''); setOdometer(''); setFuelLevel(null); setInspectionPhotos({}); setNotes('');
    } catch (error) {
      if (Object.keys(uploaded).length) await supabase.storage.from('owner-private').remove(Object.values(uploaded));
      toast.error(error instanceof Error ? error.message : 'Inspeksi gagal disimpan.');
    } finally { setSaving(false); }
  };

  const availableBookings = inspectionBookings.filter((booking) => booking.vehicle_id === vehicleId);

  return (
    <form onSubmit={(event) => void saveInspection(event)} className="space-y-6">
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

      <div className="card-luxury p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Checklist Kondisi Kendaraan</h3>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-gray-400">Kendaraan<select required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="input-luxury mt-1"><option value="">Pilih kendaraan</option>{inspectionVehicles.filter((vehicle) => vehicle.status !== 'INACTIVE').map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model}</option>)}</select></label>
            <label className="text-xs text-gray-400">Pemesanan<select required value={bookingId} onChange={(event) => setBookingId(event.target.value)} disabled={!vehicleId} className="input-luxury mt-1"><option value="">Pilih pemesanan {inspectionType === 'checkin' ? 'terkonfirmasi' : 'aktif'}</option>{availableBookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.renter?.full_name || booking.renter?.email || 'Penyewa'} · {booking.id.slice(0, 8)}</option>)}</select></label>
          </div>
          {vehicleId && availableBookings.length === 0 && <p className="rounded-lg bg-amber-400/10 p-3 text-xs text-amber-200">Tidak ada booking {inspectionType === 'checkin' ? 'terkonfirmasi' : 'aktif'} untuk kendaraan ini.</p>}
          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-400" />
                <span className="text-white font-medium">Eksterior</span>
              </div>
              <span className="text-xs text-gray-500">Foto 4 sisi</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {photoFields.map(({ key, label }) => <label key={key} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-center text-xs text-gray-300 hover:border-yellow-400/40"><Upload className="h-5 w-5 text-gold-400" />{label}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setInspectionPhotos((files) => ({ ...files, [key]: file })); }} />{inspectionPhotos[key] && <span className="max-w-full truncate text-[10px] text-emerald-300">Tersimpan: {inspectionPhotos[key].name}</span>}</label>)}
            </div>
          </div>
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
                  required min="0" step="1" value={odometer} onChange={(event) => setOdometer(event.target.value)} placeholder="Contoh: 45230"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Selisih KM</label>
                <div className="input-luxury bg-luxury-900 text-gray-500">
                  {inspectionType === 'checkout' && previousOdometer !== null && odometer ? `${Math.max(0, Number(odometer) - previousOdometer).toLocaleString('id-ID')} km` : 'Tersedia setelah check-in'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl neu-soft">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-5 h-5 text-gold-400" />
              <span className="text-white font-medium">Bahan Bakar</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Level BBM</label>
              <div className="grid grid-cols-5 gap-2">
                {[['Empty', 0], ['1/4', 25], ['1/2', 50], ['3/4', 75], ['Full', 100]].map(([level, value]) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFuelLevel(Number(value))}
                    className={`py-2 rounded-lg text-xs transition-colors ${fuelLevel === value ? 'neu-gold text-gold-300' : 'neu-soft text-gray-300 hover:text-gold-300'}`}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <label className="block text-xs text-gray-400">Catatan kondisi<textarea maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} className="input-luxury mt-1 min-h-20" placeholder="Catat goresan, kerusakan, atau kondisi khusus (opsional)." /></label>
        </div>

        <motion.button
          type="submit"
          disabled={saving || !bookingId}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex w-full items-center justify-center gap-2 btn-luxury py-3 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          {saving ? 'Menyimpan inspeksi…' : `Konfirmasi ${inspectionType === 'checkin' ? 'Check-in' : 'Check-out'}`}
        </motion.button>
      </div>
    </form>
  );
}

// ============================================================================
// TAB 4: REVENUE DASHBOARD
// ============================================================================

export function RevenueDashboard() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    void (async () => {
      const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
      if (!owner) { setLoading(false); setError('Profil pemilik rental belum ditemukan.'); return; }
      const { data, error: queryError } = await supabase.from('bookings').select('id,start_date,end_date,total_price,status,created_at,vehicle:vehicles!inner(brand,model,owner_id)')
        .eq('vehicle.owner_id', owner.id).in('status', ['CONFIRMED', 'ACTIVE', 'COMPLETED']).order('created_at', { ascending: false }).limit(1000);
      if (cancelled) return;
      setLoading(false);
      if (queryError) setError('Ringkasan pendapatan gagal dimuat.');
      else setRows((data ?? []).map((item: any) => ({ ...item, vehicle: Array.isArray(item.vehicle) ? item.vehicle[0] : item.vehicle })));
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const now = new Date();
  const buckets = period === 'monthly'
    ? Array.from({ length: 12 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 11 + index, 1))
    : Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setDate(now.getDate() - 6 + index); date.setHours(0, 0, 0, 0); return date; });
  const chartData = buckets.map((date) => {
    const label = period === 'monthly' ? date.toLocaleDateString('id-ID', { month: 'short' }) : date.toLocaleDateString('id-ID', { weekday: 'short' });
    const value = rows.filter((row) => {
      const created = new Date(row.created_at);
      return period === 'monthly' ? created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth() : created.toDateString() === date.toDateString();
    }).reduce((sum, row) => sum + Number(row.total_price || 0), 0);
    return { label, value };
  });
  const maxValue = Math.max(1, ...chartData.map((item) => item.value));
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.total_price || 0), 0);
  const nowMonthRevenue = rows.filter((row) => { const date = new Date(row.created_at); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }).reduce((sum, row) => sum + Number(row.total_price || 0), 0);
  const exportCsv = () => {
    const csvRows = [['ID Booking', 'Kendaraan', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Nilai (IDR)'], ...rows.map((row) => [row.id, `${row.vehicle?.brand ?? ''} ${row.vehicle?.model ?? ''}`, row.start_date, row.end_date, row.status, row.total_price])];
    const csv = csvRows.map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pendapatan-renmoku.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Nilai Booking</h3>
            <p className="text-sm text-gray-400">Dihitung dari booking yang dikonfirmasi, aktif, atau selesai.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPeriod('daily')} className={`px-3 py-1.5 rounded-lg text-xs ${period === 'daily' ? 'neu-gold text-gold-300' : 'neu-soft text-gray-300'}`}>
              7 hari
            </button>
            <button type="button" onClick={() => setPeriod('monthly')} className={`px-3 py-1.5 rounded-lg text-xs ${period === 'monthly' ? 'neu-gold text-gold-300' : 'neu-soft text-gray-300'}`}>
              12 bulan
            </button>
          </div>
        </div>
        {loading && <p className="py-6 text-center text-sm text-gray-400">Memuat data booking…</p>}
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Belum ada booking terkonfirmasi untuk ditampilkan.</p>}
        {!loading && !error && rows.length > 0 && <><div className="mb-4 flex h-56 items-end gap-2 sm:gap-3">
          {chartData.map((item, i) => (
            <motion.div
              key={`${item.label}-${i}`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(item.value ? 5 : 0, item.value / maxValue * 100)}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              title={`${item.label}: ${formatCurrency(item.value)}`}
              className="group relative flex-1 rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="whitespace-nowrap rounded bg-luxury-900 px-2 py-1 text-xs text-gold-300">{formatCurrency(item.value)}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between">{chartData.map((item, index) => <span key={`${item.label}-${index}`} className="flex-1 text-center text-[10px] text-gray-500">{item.label}</span>)}</div></>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Nilai Booking Tahun Ini', value: formatCurrency(rows.filter((row) => new Date(row.created_at).getFullYear() === now.getFullYear()).reduce((sum, row) => sum + Number(row.total_price || 0), 0)), icon: TrendingUp },
          { label: 'Nilai Booking Bulan Ini', value: formatCurrency(nowMonthRevenue), icon: BarChart3 },
          { label: 'Booking Tercatat', value: String(rows.length), icon: PieChart },
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
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Riwayat Transaksi</h3>
          <button type="button" onClick={exportCsv} disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neu-soft text-xs text-gray-300"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>

        <div className="space-y-3">
          {!loading && rows.length === 0 && <p className="py-5 text-center text-sm text-gray-500">Belum ada transaksi.</p>}
          {rows.slice(0, 20).map((tx) => (
            <div key={tx.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl neu-soft">
              <div>
                <p className="text-white font-medium text-sm">{tx.vehicle?.brand} {tx.vehicle?.model}</p>
                <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString('id-ID')} · {tx.status}</p>
              </div>
              <div className="text-right">
                <p className="text-gold-400 font-semibold">{formatCurrency(Number(tx.total_price))}</p>
                <p className="text-xs text-gray-500">ID {tx.id.slice(0, 8)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
