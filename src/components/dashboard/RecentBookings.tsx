import { motion } from 'framer-motion';
import { Building2, Check, Eye, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../stores/useAppStore';

type RecentBooking = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  renter: { full_name: string | null; email: string } | null;
  vehicle: { brand: string; model: string } | null;
};

export default function RecentBookings() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setOwnerSection = useAppStore((state) => state.setOwnerSection);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!currentUser?.id) { setLoading(false); return; }
    const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
    if (!owner) { setLoading(false); return; }
    const { data, error } = await supabase.from('bookings')
      .select('id,start_date,end_date,total_price,status,renter:users!renter_id(full_name,email),vehicle:vehicles!inner(brand,model,owner_id)')
      .eq('vehicle.owner_id', owner.id).order('created_at', { ascending: false }).limit(5);
    setLoading(false);
    if (error) { toast.error('Pemesanan terbaru gagal dimuat.'); return; }
    setBookings((data ?? []).map((item: any) => ({
      ...item,
      renter: Array.isArray(item.renter) ? item.renter[0] : item.renter,
      vehicle: Array.isArray(item.vehicle) ? item.vehicle[0] : item.vehicle,
    })));
  };

  useEffect(() => { void load(); }, [currentUser?.id]);

  const updateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    const { error } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('status', 'PENDING');
    if (error) { toast.error('Status pemesanan gagal diperbarui.'); return; }
    toast.success(status === 'CONFIRMED' ? 'Pemesanan diterima.' : 'Pemesanan ditolak.');
    await load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-[#141414] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-serif text-xl">Booking Terbaru</h3><p className="mt-1 text-sm text-gray-500">Pemesanan armada terbaru</p></div>
        <button onClick={() => { setOwnerSection('bookings'); setCurrentPage('dashboard'); }} className="text-sm text-yellow-400 hover:text-yellow-300">Lihat Semua →</button>
      </div>
      <div className="space-y-3">
        {loading && <p className="py-6 text-center text-sm text-gray-400">Memuat pemesanan…</p>}
        {!loading && bookings.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Belum ada pemesanan.</p>}
        {bookings.map((booking) => {
          const renterName = booking.renter?.full_name || booking.renter?.email || 'Penyewa';
          const isCorporate = /pt\.?|cv\.?|corporate/i.test(renterName);
          return <div key={booking.id} className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/30 p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">🚗</div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold">{booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Kendaraan'}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">{isCorporate ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}{renterName}</span>
                  <span>{new Date(booking.start_date).toLocaleDateString('id-ID')} – {new Date(booking.end_date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <span className="text-sm font-semibold text-yellow-400">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span>
              {booking.status === 'PENDING' ? <div className="flex items-center gap-2">
                <button onClick={() => void updateStatus(booking.id, 'CANCELLED')} className="rounded-lg bg-red-500/15 p-2 text-red-300 hover:bg-red-500/25" aria-label="Tolak pemesanan"><X className="h-4 w-4" /></button>
                <button onClick={() => void updateStatus(booking.id, 'CONFIRMED')} className="rounded-lg bg-emerald-500/15 p-2 text-emerald-300 hover:bg-emerald-500/25" aria-label="Terima pemesanan"><Check className="h-4 w-4" /></button>
              </div> : <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-300">{booking.status === 'CONFIRMED' ? 'Dikonfirmasi' : booking.status === 'ACTIVE' ? 'Berlangsung' : booking.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}</span>}
              <button onClick={() => { setOwnerSection('bookings'); setCurrentPage('dashboard'); }} className="rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10" aria-label="Lihat detail pemesanan"><Eye className="h-4 w-4" /></button>
            </div>
          </div>;
        })}
      </div>
    </motion.div>
  );
}
