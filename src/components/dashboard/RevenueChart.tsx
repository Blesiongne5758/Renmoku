import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../stores/useAppStore';

type Period = 'daily' | 'weekly' | 'monthly';
type BookingRow = { total_price: number; status: string; created_at: string };

export default function RevenueChart() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [period, setPeriod] = useState<Period>('daily');
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    void (async () => {
      const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
      if (!owner) { setLoading(false); return; }
      const { data } = await supabase.from('bookings').select('total_price,status,created_at,vehicle:vehicles!inner(owner_id)').eq('vehicle.owner_id', owner.id).in('status', ['CONFIRMED', 'ACTIVE', 'COMPLETED']).order('created_at', { ascending: false }).limit(1000);
      if (!cancelled) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const now = new Date();
  const bucketCount = period === 'monthly' ? 12 : period === 'weekly' ? 8 : 7;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const date = new Date(now);
    if (period === 'monthly') date.setMonth(now.getMonth() - bucketCount + 1 + index, 1);
    else if (period === 'weekly') date.setDate(now.getDate() - 7 * (bucketCount - 1 - index));
    else date.setDate(now.getDate() - bucketCount + 1 + index);
    if (period === 'weekly') date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    date.setHours(0, 0, 0, 0);
    const value = rows.filter((row) => {
      const created = new Date(row.created_at);
      if (period === 'monthly') return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
      if (period === 'weekly') { const end = new Date(date); end.setDate(date.getDate() + 7); return created >= date && created < end; }
      return created.toDateString() === date.toDateString();
    }).reduce((total, row) => total + Number(row.total_price || 0), 0);
    return { name: date.toLocaleDateString('id-ID', period === 'monthly' ? { month: 'short' } : period === 'weekly' ? { day: '2-digit', month: 'short' } : { weekday: 'short' }), revenue: value };
  });
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-[#141414] p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-serif text-xl">Grafik Nilai Booking</h3><p className="mt-1 text-sm text-gray-500">Booking terkonfirmasi, aktif, dan selesai</p></div><div className="flex gap-1 rounded-xl bg-black/40 p-1">{(['daily', 'weekly', 'monthly'] as const).map((item) => <button key={item} type="button" onClick={() => setPeriod(item)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${period === item ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>{item === 'daily' ? '7 hari' : item === 'weekly' ? '8 minggu' : '12 bulan'}</button>)}</div></div>
    {loading ? <div className="flex h-64 items-center justify-center text-sm text-gray-500">Memuat grafik…</div> : rows.length === 0 ? <div className="flex h-64 items-center justify-center text-center text-sm text-gray-500">Belum ada booking terkonfirmasi.</div> : <ResponsiveContainer width="100%" height={256}><AreaChart data={buckets}><defs><linearGradient id="ownerRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#eab308" stopOpacity={0.35}/><stop offset="95%" stopColor="#eab308" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/><XAxis dataKey="name" stroke="#737373" fontSize={11}/><YAxis stroke="#737373" fontSize={11} tickFormatter={(value) => `${Math.round(value / 1_000_000)}M`}/><Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', borderRadius: 12, color: '#fff' }} formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Nilai booking']}/><Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#ownerRevenue)"/></AreaChart></ResponsiveContainer>}
  </motion.div>;
}
