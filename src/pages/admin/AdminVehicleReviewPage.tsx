import { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

type Submission = {
  id: string; user_id: string; brand: string; model: string; year: number; license_plate: string;
  transmission: string; capacity: number; fuel_type: string; price_daily: number; location: string;
  odometer_km: number; ownership_document_path: string; vehicle_photos: Record<string, string>;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'; created_at: string;
};

export default function AdminVehicleReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [signedLinks, setSignedLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('owner_vehicle_submissions').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Pengajuan kendaraan belum dapat dimuat. Terapkan SQL owner_features.sql dan pastikan sesi admin aktif.');
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Submission[];
    setSubmissions(rows);
    const paths = rows.flatMap((row) => [row.ownership_document_path, ...Object.values(row.vehicle_photos ?? {})]);
    const links = await Promise.all(paths.map(async (path) => {
      const { data: signed } = await supabase.storage.from('owner-private').createSignedUrl(path, 300);
      return signed?.signedUrl ? [path, signed.signedUrl] as const : null;
    }));
    setSignedLinks(Object.fromEntries(links.filter((item): item is readonly [string, string] => item !== null)));
    setLoading(false);
  }, []);

  useEffect(() => { void loadSubmissions(); }, [loadSubmissions]);

  const review = async (submission: Submission, status: 'APPROVED' | 'REJECTED') => {
    setWorkingId(submission.id);
    const { error } = await supabase.from('owner_vehicle_submissions').update({ status }).eq('id', submission.id);
    if (error) toast.error('Perubahan status gagal disimpan.');
    else {
      toast.success(status === 'APPROVED' ? 'Kendaraan ditandai disetujui.' : 'Pengajuan ditandai perlu perbaikan.');
      setSubmissions((current) => current.map((row) => row.id === submission.id ? { ...row, status } : row));
    }
    setWorkingId('');
  };

  return <main className="min-h-screen bg-luxury-950 p-5 text-white sm:p-8"><div className="mx-auto max-w-6xl">
    <header className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Verifikasi kendaraan</h1><p className="mt-1 text-sm text-gray-400">Periksa dokumen kepemilikan dan enam foto sebelum menyetujui pengajuan.</p></div><button onClick={() => void loadSubmissions()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"><RefreshCw className="h-4 w-4"/>Muat ulang</button></header>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-yellow-300"/></div> : submissions.length === 0 ? <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 text-center text-gray-400">Belum ada pengajuan kendaraan.</div> : <div className="space-y-5">{submissions.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{item.brand} {item.model} · {item.year}</h2><p className="text-sm text-gray-400">{item.license_plate} · {item.capacity} penumpang · {item.fuel_type}</p><p className="mt-1 text-xs text-gray-500">Odometer {item.odometer_km.toLocaleString('id-ID')} km · {item.location} · {new Date(item.created_at).toLocaleDateString('id-ID')}</p></div><span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-100">{item.status === 'PENDING_REVIEW' ? 'Menunggu verifikasi' : item.status === 'APPROVED' ? 'Disetujui' : 'Perlu perbaikan'}</span></div>
      <div className="mt-4"><a href={signedLinks[item.ownership_document_path]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-yellow-200"><ExternalLink className="h-4 w-4"/>Buka dokumen kepemilikan</a></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(item.vehicle_photos ?? {}).map(([key, path]) => <figure key={key}><a href={signedLinks[path]} target="_blank" rel="noreferrer"><img src={signedLinks[path]} alt={key} className="aspect-video w-full rounded-lg object-cover"/></a><figcaption className="mt-1 text-xs capitalize text-gray-400">{key === 'front' ? 'Tampak depan' : key === 'left' ? 'Samping kiri' : key === 'right' ? 'Samping kanan' : key === 'rear' ? 'Tampak belakang' : key === 'interior' ? 'Interior' : 'Dashboard & odometer'}</figcaption></figure>)}</div>
      {item.status === 'PENDING_REVIEW' && <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4"><button disabled={workingId === item.id} onClick={() => void review(item, 'REJECTED')} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-200 disabled:opacity-50"><X className="h-4 w-4"/>Perlu perbaikan</button><button disabled={workingId === item.id} onClick={() => void review(item, 'APPROVED')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"><Check className="h-4 w-4"/>Setujui</button></div>}
    </article>)}</div>}
  </div></main>;
}
