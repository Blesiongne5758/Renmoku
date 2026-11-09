import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, CircleDollarSign, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import AdminVehicleReviewPage from '../../pages/admin/AdminVehicleReviewPage';
import AdminConfigPanel from './AdminConfigPanel';
import AdminGPSSettings from '../../pages/admin/AdminGPSSettings';

type Section = 'users' | 'vehicles' | 'bookings' | 'verification' | 'payout' | 'dispute' | 'settings' | 'gps';
type UserRow = { id: string; email: string; full_name: string | null; role: string; status: string; created_at: string };
type BookingRow = { id: string; status: string; start_date: string; end_date: string; total_price: number; created_at: string; vehicle: { brand: string; model: string } | null; renter: { full_name: string | null; email: string } | null };
type PaymentRow = { id: string; booking_id: string; user_id: string; amount: number; method: string; type: string; status: string; created_at: string };
type DisputeRow = { id: string; booking_id: string | null; title: string; details: string; status: string; created_at: string };

const panel = 'rounded-2xl border border-white/10 bg-[#141414]';
const formatMoney = (amount: number) => `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;

export default function AdminWorkspaceSection({ section }: { section: Section }) {
  if (section === 'vehicles') return <AdminVehicleReviewPage />;
  if (section === 'verification') return <VerificationWorkspace />;
  if (section === 'settings') return <AdminConfigPanel />;
  if (section === 'gps') return <AdminGPSSettings />;
  if (section === 'users') return <UsersWorkspace />;
  if (section === 'bookings') return <BookingsWorkspace />;
  if (section === 'payout') return <PaymentsWorkspace />;
  return <DisputesWorkspace />;
}

function VerificationWorkspace() {
  return <UsersWorkspace pendingOnly />;
}

function UsersWorkspace({ pendingOnly = false }: { pendingOnly?: boolean }) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: requestError } = await supabase.from('users').select('id,email,full_name,role,status,created_at').order('created_at', { ascending: false });
    if (requestError) setError('Daftar pengguna tidak dapat dimuat. Pastikan kebijakan admin pada owner_features.sql sudah diterapkan.');
    else { setRows((data ?? []) as UserRow[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const updateStatus = async (user: UserRow, status: 'VERIFIED' | 'REJECTED') => {
    const { error: updateError } = await supabase.from('users').update({ status }).eq('id', user.id);
    if (updateError) return toast.error('Status akun gagal diperbarui.');
    setRows((current) => current.map((row) => row.id === user.id ? { ...row, status } : row));
    toast.success(status === 'VERIFIED' ? 'Akun berhasil diverifikasi.' : 'Akun ditolak.');
  };
  const visible = rows.filter((row) => (!pendingOnly || row.status === 'PENDING') && `${row.full_name ?? ''} ${row.email} ${row.role} ${row.status}`.toLowerCase().includes(query.toLowerCase()));
  return <section className={`${panel} p-5`}>
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{pendingOnly ? 'Verifikasi akun' : 'Pengguna'}</h2><p className="mt-1 text-sm text-gray-500">{pendingOnly ? 'Tinjau akun yang menunggu pemeriksaan.' : 'Kelola status akun dan verifikasi pengguna terdaftar.'}</p></div><button onClick={() => void load()} className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5" aria-label="Muat ulang"><RefreshCw className="h-4 w-4"/></button></header>
    <label className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3"><Search className="h-4 w-4 text-gray-500"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, email, status…" className="w-full bg-transparent py-2.5 text-sm outline-none"/></label>
    {error && <p className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
    {loading ? <LoadingRows/> : visible.length === 0 ? <EmptyState text="Pengguna tidak ditemukan."/> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-3">Pengguna</th><th className="p-3">Peran</th><th className="p-3">Status</th><th className="p-3">Terdaftar</th><th className="p-3">Aksi</th></tr></thead><tbody className="divide-y divide-white/5">{visible.map((user) => <tr key={user.id}><td className="p-3"><p className="font-medium text-white">{user.full_name || 'Belum mengisi nama'}</p><p className="text-xs text-gray-500">{user.email}</p></td><td className="p-3">{user.role}</td><td className="p-3"><StatusBadge value={user.status}/></td><td className="p-3 text-gray-400">{new Date(user.created_at).toLocaleDateString('id-ID')}</td><td className="p-3"><div className="flex gap-2"><button disabled={user.status === 'VERIFIED'} onClick={() => void updateStatus(user, 'VERIFIED')} className="rounded-lg bg-emerald-400/10 p-2 text-emerald-200 disabled:opacity-40" title="Verifikasi"><Check className="h-4 w-4"/></button><button disabled={user.status === 'REJECTED'} onClick={() => void updateStatus(user, 'REJECTED')} className="rounded-lg bg-red-400/10 p-2 text-red-200 disabled:opacity-40" title="Tolak"><X className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>}
  </section>;
}

function BookingsWorkspace() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: requestError } = await supabase.from('bookings').select('id,status,start_date,end_date,total_price,created_at,vehicle:vehicles(brand,model),renter:users(full_name,email)').order('created_at', { ascending: false });
    if (requestError) setError('Daftar booking gagal dimuat. Terapkan kebijakan admin untuk tabel bookings.');
    else { setRows((data ?? []) as unknown as BookingRow[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className={`${panel} p-5`}><header className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Booking platform</h2><p className="mt-1 text-sm text-gray-500">Semua pemesanan dan statusnya.</p></div><button onClick={() => void load()} className="rounded-lg border border-white/10 p-2" aria-label="Muat ulang"><RefreshCw className="h-4 w-4"/></button></header>
    {error && <p className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}{loading ? <LoadingRows/> : rows.length === 0 ? <EmptyState text="Belum ada booking."/> : <div className="space-y-2">{rows.map((booking) => <article key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-4"><div><p className="font-medium">{booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Kendaraan'} · #{booking.id.slice(0, 8)}</p><p className="mt-1 text-xs text-gray-500">{booking.renter?.full_name || booking.renter?.email || 'Penyewa'} · {booking.start_date} – {booking.end_date}</p></div><div className="flex items-center gap-3"><span className="font-medium text-yellow-200">{formatMoney(booking.total_price)}</span><StatusBadge value={booking.status}/></div></article>)}</div>}
  </section>;
}

function PaymentsWorkspace() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: requestError } = await supabase.from('payments').select('id,booking_id,user_id,amount,method,type,status,created_at').order('created_at', { ascending: false });
    if (requestError) setError('Data pembayaran gagal dimuat. Pastikan policy admin tabel payments sudah diterapkan.');
    else { setRows((data ?? []) as PaymentRow[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className={`${panel} p-5`}><header className="mb-5 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><CircleDollarSign className="h-5 w-5 text-yellow-300"/>Pembayaran & payout</h2><p className="mt-1 text-sm text-gray-500">Pantau transaksi pembayaran booking.</p></div><button onClick={() => void load()} className="rounded-lg border border-white/10 p-2" aria-label="Muat ulang"><RefreshCw className="h-4 w-4"/></button></header>
    {error && <p className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}{loading ? <LoadingRows/> : rows.length === 0 ? <EmptyState text="Belum ada transaksi pembayaran."/> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase text-gray-500"><tr><th className="p-3">Transaksi</th><th className="p-3">Booking</th><th className="p-3">Metode</th><th className="p-3">Jumlah</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y divide-white/5">{rows.map((row) => <tr key={row.id}><td className="p-3"><p>{row.type}</p><p className="text-xs text-gray-500">{new Date(row.created_at).toLocaleString('id-ID')}</p></td><td className="p-3 font-mono text-xs">{row.booking_id.slice(0, 8)}</td><td className="p-3">{row.method}</td><td className="p-3 font-medium">{formatMoney(row.amount)}</td><td className="p-3"><StatusBadge value={row.status}/></td></tr>)}</tbody></table></div>}
  </section>;
}

function DisputesWorkspace() {
  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [title, setTitle] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: requestError } = await supabase.from('admin_disputes').select('id,booking_id,title,details,status,created_at').order('created_at', { ascending: false });
    if (requestError) setError('Dispute belum tersedia. Terapkan bagian admin_disputes dari owner_features.sql.');
    else { setRows((data ?? []) as DisputeRow[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const createCase = async (event: FormEvent) => {
    event.preventDefault();
    const { error: insertError } = await supabase.from('admin_disputes').insert({ booking_id: bookingId || null, title: title.trim(), details: details.trim() });
    if (insertError) return toast.error('Kasus dispute gagal dibuat. Pastikan migrasi database sudah dijalankan.');
    setTitle(''); setBookingId(''); setDetails(''); toast.success('Kasus dispute dibuat.'); void load();
  };
  const closeCase = async (id: string) => {
    const { error: updateError } = await supabase.from('admin_disputes').update({ status: 'RESOLVED', resolved_at: new Date().toISOString() }).eq('id', id);
    if (updateError) return toast.error('Status dispute gagal diperbarui.');
    setRows((current) => current.map((row) => row.id === id ? { ...row, status: 'RESOLVED' } : row));
    toast.success('Dispute ditandai selesai.');
  };
  return <div className="space-y-5"><section className={`${panel} p-5`}><h2 className="text-xl font-semibold">Pusat dispute</h2><p className="mt-1 text-sm text-gray-500">Catat pengaduan terkait booking, tindak lanjuti, lalu tandai selesai.</p><form onSubmit={(e) => void createCase(e)} className="mt-4 grid gap-3 md:grid-cols-2"><input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="Judul / ringkasan masalah" className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="ID booking (opsional)" className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/><textarea value={details} onChange={(e) => setDetails(e.target.value)} required maxLength={3000} placeholder="Detail pengaduan dan tindak lanjut" className="min-h-24 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm md:col-span-2"/><button className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black md:col-span-2 md:justify-self-end">Buat kasus</button></form></section>
    <section className={`${panel} p-5`}>{error && <p className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}{loading ? <LoadingRows/> : rows.length === 0 ? <EmptyState text="Belum ada kasus dispute."/> : <div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-xl border border-white/5 bg-black/20 p-4"><header className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{row.title}</h3><p className="mt-1 text-xs text-gray-500">{row.booking_id ? `Booking ${row.booking_id.slice(0, 8)} · ` : ''}{new Date(row.created_at).toLocaleString('id-ID')}</p></div><div className="flex items-center gap-3"><StatusBadge value={row.status}/>{row.status !== 'RESOLVED' && <button onClick={() => void closeCase(row.id)} className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">Tandai selesai</button>}</div></header><p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">{row.details}</p></article>)}</div>}</section></div>;
}

function StatusBadge({ value }: { value: string }) {
  const isGood = ['VERIFIED', 'APPROVED', 'PAID', 'RESOLVED', 'COMPLETED'].includes(value.toUpperCase());
  const isBad = ['REJECTED', 'FAILED', 'CANCELLED'].includes(value.toUpperCase());
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${isGood ? 'bg-emerald-400/10 text-emerald-200' : isBad ? 'bg-red-400/10 text-red-200' : 'bg-amber-400/10 text-amber-100'}`}>{value.replace(/_/g, ' ')}</span>;
}

function LoadingRows() { return <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin"/>Memuat data…</div>; }
function EmptyState({ text }: { text: string }) { return <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-gray-400"><AlertCircle className="h-5 w-5 text-gray-500"/>{text}</div>; }
