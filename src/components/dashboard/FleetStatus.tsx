import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../stores/useAppStore';

const statusStyles = [
  { key: 'AVAILABLE', label: 'Tersedia', color: '#10B981' },
  { key: 'RENTED', label: 'Disewa', color: '#D4AF37' },
  { key: 'MAINTENANCE', label: 'Perawatan', color: '#F59E0B' },
  { key: 'INACTIVE', label: 'Nonaktif', color: '#737373' },
];

export default function FleetStatus() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [statuses, setStatuses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    void (async () => {
      const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
      if (!owner) { setLoading(false); return; }
      const { data, error } = await supabase.from('vehicles').select('status').eq('owner_id', owner.id);
      if (!cancelled) {
        setStatuses(error ? {} : (data ?? []).reduce((counts: Record<string, number>, item) => { counts[item.status] = (counts[item.status] ?? 0) + 1; return counts; }, {}));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);
  const total = statusStyles.reduce((sum, item) => sum + (statuses[item.key] ?? 0), 0);
  const chartBackground = total ? `conic-gradient(${statusStyles.map((item, index) => { const before = statusStyles.slice(0, index).reduce((sum, style) => sum + (statuses[style.key] ?? 0), 0); const start = before / total * 100; const end = (before + (statuses[item.key] ?? 0)) / total * 100; return `${item.color} ${start}% ${end}%`; }).join(', ')})` : '#262626';
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full rounded-2xl border border-white/5 bg-[#141414] p-5 sm:p-6">
    <h3 className="mb-1 font-serif text-xl">Status Armada</h3><p className="mb-6 text-sm text-gray-500">Kondisi kendaraan terdaftar</p>
    <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full" style={{ background: chartBackground }}>
      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#141414]"><span className="font-mono text-3xl font-bold">{loading ? '…' : total}</span><span className="text-xs text-gray-500">Total Armada</span></div>
    </div>
    <div className="space-y-3">{statusStyles.map((item) => <div key={item.key} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}/><span className="text-sm text-gray-300">{item.label}</span></div><span className="font-mono text-sm font-semibold">{loading ? '—' : statuses[item.key] ?? 0}</span></div>)}</div>
  </motion.div>;
}
