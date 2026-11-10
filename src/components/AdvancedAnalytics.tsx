import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Car, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

type Booking = { id: string; status: string; total_price: number; created_at: string; vehicle_id: string; vehicle: { brand: string; model: string } | null };
type Vehicle = { id: string; status: string; brand: string; model: string };
const colors = ['#D4AF37', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];
const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function AdvancedAnalytics() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    void (async () => {
      const { data: owner, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
      if (ownerError || !owner) { setLoading(false); setError('Profil pemilik rental belum ditemukan.'); return; }
      const [vehicleResult, bookingResult] = await Promise.all([
        supabase.from('vehicles').select('id,status,brand,model').eq('owner_id', owner.id),
        supabase.from('bookings').select('id,status,total_price,created_at,vehicle_id,vehicle:vehicles!inner(brand,model,owner_id)').eq('vehicle.owner_id', owner.id).order('created_at', { ascending: false }).limit(1000),
      ]);
      if (cancelled) return;
      setLoading(false);
      if (vehicleResult.error || bookingResult.error) { setError('Data analitik belum dapat dimuat.'); return; }
      setVehicles(vehicleResult.data ?? []);
      setBookings((bookingResult.data ?? []).map((row: any) => ({ ...row, vehicle: Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle })));
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const { revenueData, statusData, statusCounts, topVehicles } = useMemo(() => {
    const now = new Date();
    const revenueData = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const monthBookings = bookings.filter((booking) => { const created = new Date(booking.created_at); return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth(); });
      return { month: date.toLocaleDateString('id-ID', { month: 'short' }), revenue: monthBookings.filter((row) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(row.status)).reduce((sum, row) => sum + Number(row.total_price || 0), 0), bookings: monthBookings.length };
    });
    const statuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    const labels: Record<string, string> = { PENDING: 'Menunggu', CONFIRMED: 'Dikonfirmasi', ACTIVE: 'Berlangsung', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan' };
    const statusCounts = Object.fromEntries(statuses.map((status) => [status, bookings.filter((row) => row.status === status).length]));
    const statusData = statuses.map((status, index) => ({ status: labels[status], count: statusCounts[status], color: colors[index] }));
    const byVehicle = new Map<string, { name: string; bookings: number; revenue: number }>();
    for (const booking of bookings) {
      const name = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Kendaraan';
      const current = byVehicle.get(booking.vehicle_id) ?? { name, bookings: 0, revenue: 0 };
      current.bookings += 1;
      if (['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(booking.status)) current.revenue += Number(booking.total_price || 0);
      byVehicle.set(booking.vehicle_id, current);
    }
    const topVehicles = [...byVehicle.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5);
    return { revenueData, statusData, statusCounts, topVehicles };
  }, [bookings]);

  const totalRevenue = bookings.filter((row) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(row.status)).reduce((sum, row) => sum + Number(row.total_price || 0), 0);
  const avgRevenue = bookings.length ? totalRevenue / bookings.filter((row) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(row.status)).length || 0 : 0;
  const fleetStatusData = [{ label: 'Tersedia', key: 'AVAILABLE' }, { label: 'Disewa', key: 'RENTED' }, { label: 'Perawatan', key: 'MAINTENANCE' }, { label: 'Nonaktif', key: 'INACTIVE' }].map((item, index) => ({ name: item.label, value: vehicles.filter((vehicle) => vehicle.status === item.key).length, color: colors[index] }));

  return <div className="space-y-6 p-1 sm:p-2">
    <header><h2 className="font-serif text-2xl text-white">Analitik Armada</h2><p className="mt-1 text-sm text-gray-400">Ringkasan dihitung dari kendaraan dan pemesanan rental Anda.</p></header>
    {error && <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: 'Nilai booking', value: money(totalRevenue), icon: DollarSign },
      { label: 'Total booking', value: bookings.length.toLocaleString('id-ID'), icon: Calendar },
      { label: 'Rata-rata booking', value: money(avgRevenue), icon: BarChart3 },
      { label: 'Armada terdaftar', value: vehicles.length.toLocaleString('id-ID'), icon: Car },
    ].map((metric) => <motion.div key={metric.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-5"><metric.icon className="mb-4 h-5 w-5 text-yellow-300"/><p className="break-words text-xl font-bold text-white">{loading ? '…' : metric.value}</p><p className="mt-1 text-xs text-gray-400">{metric.label}</p></motion.div>)}</div>
    {!loading && bookings.length === 0 && <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-400">Grafik akan menampilkan data setelah ada pemesanan.</div>}
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="card-luxury p-4 sm:p-6 xl:col-span-2"><h3 className="mb-5 font-semibold text-white">Nilai booking dan volume bulanan</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData}><defs><linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/><XAxis dataKey="month" stroke="#737373" fontSize={11}/><YAxis yAxisId="left" stroke="#737373" fontSize={11} tickFormatter={(value) => `${Math.round(value / 1_000_000)}M`}/><YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={11}/><Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', borderRadius: 12, color: '#fff' }}/><Legend/><Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#analyticsRevenue)" name="Nilai booking (Rp)"/><Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#8B5CF6" fillOpacity={0} name="Jumlah booking"/></AreaChart></ResponsiveContainer></div></section>
      <section className="card-luxury p-4 sm:p-6"><h3 className="mb-5 font-semibold text-white">Status Armada</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={fleetStatusData} cx="50%" cy="48%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">{fleetStatusData.map((entry) => <Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div></section>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="card-luxury p-4 sm:p-6"><h3 className="mb-5 font-semibold text-white">Kendaraan dengan booking terbanyak</h3>{topVehicles.length ? <div className="space-y-3">{topVehicles.map((vehicle, index) => <div key={vehicle.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-sm text-yellow-200">{index + 1}</span><div className="min-w-0"><p className="truncate font-medium text-white">{vehicle.name}</p><p className="text-xs text-gray-400">{vehicle.bookings} booking</p></div></div><span className="text-sm text-yellow-200">{money(vehicle.revenue)}</span></div>)}</div> : <p className="text-sm text-gray-500">Belum ada data kendaraan.</p>}</section>
      <section className="card-luxury p-4 sm:p-6"><h3 className="mb-5 font-semibold text-white">Status Pemesanan</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/><XAxis dataKey="status" stroke="#737373" fontSize={10}/><YAxis stroke="#737373" fontSize={11} allowDecimals={false}/><Tooltip/><Bar dataKey="count" radius={[6,6,0,0]}>{statusData.map((item) => <Cell key={item.status} fill={item.color}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
    </div>
  </div>;
}
