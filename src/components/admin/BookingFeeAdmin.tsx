import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

type FeeRow = { id: string; renter_id: string; amount: number; status: string; payment_proof_path: string | null; created_at: string; admin_note: string | null };

export default function BookingFeeAdmin() {
  const [rows, setRows] = useState<FeeRow[]>([]);
  const [qrisUrl, setQrisUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [settings, transactions] = await Promise.all([
      supabase.from('booking_fee_settings').select('qris_image_path').eq('id', true).maybeSingle(),
      supabase.from('booking_fee_transactions').select('id,renter_id,amount,status,payment_proof_path,created_at,admin_note').order('created_at', { ascending: false }).limit(100),
    ]);
    if (settings.error || transactions.error) setError('Data fee booking belum tersedia. Terapkan supabase/booking_fee_chat_setup.sql.');
    else {
      if (settings.data?.qris_image_path) setQrisUrl(supabase.storage.from('booking-fee-qris').getPublicUrl(settings.data.qris_image_path).data.publicUrl);
      setRows((transactions.data ?? []) as FeeRow[]);
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const uploadQris = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return toast.error('Gunakan PNG/JPG/WEBP maksimal 5 MB.');
    setUploading(true);
    const path = `qris/booking-fee-${Date.now()}.${file.type.split('/')[1]}`;
    const { error: uploadError } = await supabase.storage.from('booking-fee-qris').upload(path, file, { upsert: true, contentType: file.type });
    if (!uploadError) {
      const { error: saveError } = await supabase.from('booking_fee_settings').update({ qris_image_path: path, updated_at: new Date().toISOString() }).eq('id', true);
      if (saveError) toast.error('QRIS terunggah tetapi pengaturan gagal disimpan.'); else toast.success('QRIS biaya booking diperbarui.');
    } else toast.error('QRIS gagal diunggah. Periksa kebijakan storage.');
    setUploading(false); await load();
  };
  const proofUrl = async (path: string | null) => path ? (await supabase.storage.from('booking-fee-proofs').createSignedUrl(path, 300)).data?.signedUrl ?? null : null;
  const review = async (row: FeeRow, approve: boolean) => {
    setBusy(row.id);
    const { error: reviewError } = await supabase.rpc('review_booking_fee', { p_transaction_id: row.id, p_approve: approve, p_note: null });
    setBusy('');
    if (reviewError) return toast.error('Validasi pembayaran gagal.');
    toast.success(approve ? 'Pembayaran tervalidasi; booking menunggu pemilik.' : 'Pembayaran ditolak.'); await load();
  };

  return <section className="mb-6 rounded-2xl border border-white/10 bg-[#141414] p-5">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Biaya booking QRIS · Rp25.000</h2><p className="mt-1 text-sm text-gray-500">Kelola QRIS statis dan validasi bukti pembayaran penyewa.</p></div><button onClick={() => void load()} className="rounded-lg border border-white/10 p-2" aria-label="Muat ulang"><RefreshCw className="h-4 w-4"/></button></header>
    {error && <p className="mb-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
    <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-black/20 p-4"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-white/5">{qrisUrl ? <img src={qrisUrl} alt="QRIS biaya booking" className="h-full w-full object-contain"/> : <span className="text-xs text-gray-500">QRIS belum diatur</span>}</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black"><Upload className="h-4 w-4"/>{uploading ? 'Mengunggah…' : 'Unggah QRIS'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} className="hidden" onChange={(event) => void uploadQris(event.target.files?.[0])}/></label></div>
    <h3 className="mb-3 font-medium">Bukti menunggu validasi</h3>
    {loading ? <p className="text-sm text-gray-400">Memuat…</p> : rows.filter((row) => row.status === 'PENDING_REVIEW').length === 0 ? <p className="text-sm text-gray-500">Tidak ada pembayaran yang menunggu.</p> : <div className="space-y-3">{rows.filter((row) => row.status === 'PENDING_REVIEW').map((row) => <FeeReviewRow key={row.id} row={row} busy={busy === row.id} onReview={(approve) => void review(row, approve)} getProofUrl={proofUrl}/>)}</div>}
  </section>;
}

function FeeReviewRow({ row, busy, onReview, getProofUrl }: { row: FeeRow; busy: boolean; onReview: (approve: boolean) => void; getProofUrl: (path: string | null) => Promise<string | null> }) {
  const [url, setUrl] = useState('');
  useEffect(() => { let alive = true; void getProofUrl(row.payment_proof_path).then((value) => { if (alive && value) setUrl(value); }); return () => { alive = false; }; }, [getProofUrl, row.payment_proof_path]);
  return <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4"><div className="flex items-center gap-3">{url && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="Bukti pembayaran" className="h-20 w-20 rounded-lg object-cover"/></a>}<div><p className="text-sm font-medium">Penyewa · {row.renter_id.slice(0, 8)}</p><p className="text-xs text-gray-500">Rp25.000 · {new Date(row.created_at).toLocaleString('id-ID')}</p><p className="text-xs text-gray-600">Transaksi {row.id.slice(0, 8)}</p></div></div><div className="flex gap-2"><button disabled={busy} onClick={() => onReview(true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 disabled:opacity-50"><Check className="h-4 w-4"/>Validasi</button><button disabled={busy} onClick={() => onReview(false)} className="inline-flex items-center gap-1 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-200 disabled:opacity-50"><X className="h-4 w-4"/>Tolak</button></div></article>;
}
