import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Car, CalendarDays, CircleDollarSign, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../stores/useAppStore';

type Metrics = { users: number; vehicles: number; bookings: number; paid: number; pendingUsers: number; openDisputes: number };
const initialMetrics: Metrics = { users: 0, vehicles: 0, bookings: 0, paid: 0, pendingUsers: 0, openDisputes: 0 };
const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function AdminStatsGrid() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setAdminSection, setCurrentPage } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'PAID'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('admin_disputes').select('id', { count: 'exact', head: true }).neq('status', 'RESOLVED'),
    ]).then(([users, vehicles, bookings, payments, pendingUsers, disputes]) => {
      if (cancelled) return;
      const hasError = [users, vehicles, bookings, payments, pendingUsers, disputes].some((result) => result.error);
      setError(hasError);
      setMetrics({
        users: users.count ?? 0,
        vehicles: vehicles.count ?? 0,
        bookings: bookings.count ?? 0,
        paid: (payments.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
        pendingUsers: pendingUsers.count ?? 0,
        openDisputes: disputes.count ?? 0,
      });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { icon: Users, label: 'Total pengguna', value: metrics.users.toLocaleString('id-ID'), style: 'from-purple-500/20 to-purple-700/5 border-purple-500/30' },
    { icon: Car, label: 'Total kendaraan', value: metrics.vehicles.toLocaleString('id-ID'), style: 'from-blue-500/20 to-blue-700/5 border-blue-500/30' },
    { icon: CalendarDays, label: 'Total booking', value: metrics.bookings.toLocaleString('id-ID'), style: 'from-yellow-400/20 to-yellow-600/5 border-yellow-400/30' },
    { icon: CircleDollarSign, label: 'Pembayaran diterima', value: money(metrics.paid), style: 'from-green-500/20 to-green-700/5 border-green-500/30' },
  ];
  const alerts = [
    { icon: AlertTriangle, label: 'Akun menunggu verifikasi', value: metrics.pendingUsers, section: 'verification' as const, style: 'border-red-500/30 bg-red-500/10 text-red-300' },
    { icon: Clock, label: 'Dispute belum selesai', value: metrics.openDisputes, section: 'dispute' as const, style: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200' },
  ];

  return <div className="space-y-5">
    {error && <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-100">Sebagian ringkasan belum dapat dimuat. Pastikan migrasi admin dan izin database sudah diterapkan.</p>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => <motion.article key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className={`rounded-2xl border bg-gradient-to-br p-5 ${card.style}`}>
        <div className="mb-4 flex items-center justify-between"><span className="text-sm text-gray-400">{card.label}</span><card.icon className="h-5 w-5 text-white/70"/></div>
        <p className="break-words text-2xl font-semibold text-white">{loading ? <Loader2 className="h-6 w-6 animate-spin"/> : card.value}</p>
        <p className="mt-2 text-xs text-gray-500">Data langsung dari database</p>
      </motion.article>)}
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {alerts.map((alert) => <button key={alert.label} onClick={() => { setAdminSection(alert.section); setCurrentPage('dashboard'); }} className={`flex items-center gap-4 rounded-xl border p-4 text-left transition hover:brightness-125 ${alert.style}`}>
        <alert.icon className="h-5 w-5"/><span className="flex-1 text-sm">{alert.label}</span><span className="text-xl font-semibold">{loading ? '…' : alert.value}</span>
      </button>)}
    </div>
  </div>;
}
