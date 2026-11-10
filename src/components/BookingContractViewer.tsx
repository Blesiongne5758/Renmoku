import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ContractRecord = { contract_signer_name: string | null; contract_signed_at: string | null; contract_version: string | null; contract_content_snapshot: string | null; contract_sha256: string | null; contract_signature_path: string | null };
type Snapshot = { renter?: Record<string,string | number | null>; vehicle?: {name?:string}; rental?: {startDate?:string;endDate?:string;durationType?:string;withDriver?:boolean;totalPrice?:number;dpAmount?:number}; trip?: {origin?:string;destination?:string;purpose?:string}; guaranteeType?:string; bookingFee?:number; termsText?:string; acceptedTerms?:Array<{title:string;items:string[]}> };

export default function BookingContractViewer({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<ContractRecord | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [error, setError] = useState('');
  const show = async () => {
    setOpen(true); setLoading(true); setError('');
    const { data, error: queryError } = await supabase.from('bookings').select('contract_signer_name,contract_signed_at,contract_version,contract_content_snapshot,contract_sha256,contract_signature_path').eq('id', bookingId).maybeSingle();
    if (queryError || !data?.contract_content_snapshot) { setError('Kontrak belum tersedia. Terapkan migrasi kontrak digital terlebih dahulu.'); setLoading(false); return; }
    const value = data as ContractRecord; setRecord(value);
    try { setSnapshot(JSON.parse(value.contract_content_snapshot ?? '') as Snapshot); } catch { setError('Salinan kontrak tidak dapat dibaca.'); }
    if (value.contract_signature_path) {
      const { data: signed } = await supabase.storage.from('renter-kyc-private').createSignedUrl(value.contract_signature_path, 300);
      if (signed?.signedUrl) setSignatureUrl(signed.signedUrl);
    }
    setLoading(false);
  };
  return <>
    <button onClick={() => void show()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"><FileText className="h-4 w-4 text-yellow-300"/>Lihat kontrak digital</button>
    {open && <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Kontrak sewa digital"><section className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171717] p-5 shadow-2xl sm:p-7"><header className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-300">Renmoku · {record?.contract_version ?? 'Kontrak'}</p><h2 className="mt-2 font-[Playfair_Display] text-2xl font-bold text-white">Perjanjian Sewa Menyewa Kendaraan</h2></div><button onClick={() => setOpen(false)} aria-label="Tutup kontrak" className="rounded-lg p-2 text-gray-300 hover:bg-white/5"><X className="h-5 w-5"/></button></header>
      {loading ? <p className="text-sm text-gray-400">Memuat kontrak…</p> : error ? <p className="rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : snapshot && <div className="space-y-4 text-sm text-gray-300">
        <section className="grid gap-3 rounded-xl border border-white/5 bg-black/20 p-4 sm:grid-cols-2"><p><span className="block text-xs text-gray-500">Penyewa</span>{String(snapshot.renter?.name ?? record?.contract_signer_name ?? '—')} · {String(snapshot.renter?.email ?? '—')}</p><p><span className="block text-xs text-gray-500">Kontak</span>{String(snapshot.renter?.phone ?? '—')} · NIK ••••{String(snapshot.renter?.ktp ?? '').slice(-4)}</p><p><span className="block text-xs text-gray-500">Alamat domisili</span>{String(snapshot.renter?.address ?? '—')}</p><p><span className="block text-xs text-gray-500">Kendaraan</span>{snapshot.vehicle?.name ?? '—'}</p><p><span className="block text-xs text-gray-500">Periode sewa</span>{snapshot.rental?.startDate ?? '—'} – {snapshot.rental?.endDate ?? '—'} · {snapshot.rental?.withDriver ? 'Dengan driver' : 'Lepas kunci'}</p><p><span className="block text-xs text-gray-500">Nilai sewa</span>Rp {Number(snapshot.rental?.totalPrice ?? 0).toLocaleString('id-ID')} · biaya booking Rp {Number(snapshot.bookingFee ?? 25000).toLocaleString('id-ID')}</p><p><span className="block text-xs text-gray-500">Perjalanan</span>{snapshot.trip?.origin ?? '—'} → {snapshot.trip?.destination ?? '—'} · {snapshot.trip?.purpose ?? '—'}</p><p><span className="block text-xs text-gray-500">Jaminan</span>{snapshot.guaranteeType ?? '—'}</p></section>
        <section className="rounded-xl border border-white/5 bg-black/20 p-4"><h3 className="font-medium text-white">Ketentuan yang disetujui</h3><p className="mt-2 leading-6">{snapshot.termsText}</p>{snapshot.acceptedTerms?.map((section) => <div key={section.title} className="mt-3"><p className="font-medium text-gray-200">{section.title}</p><ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-gray-400">{section.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</section>
        <section className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-yellow-400/15 bg-yellow-400/[.03] p-4"><div><p className="text-xs text-gray-500">Diterima dan ditandatangani secara digital oleh</p><p className="mt-1 font-medium text-white">{record?.contract_signer_name}</p><p className="mt-1 text-xs text-gray-400">{record?.contract_signed_at ? new Date(record.contract_signed_at).toLocaleString('id-ID') : 'Waktu tanda tangan tidak tersedia'}</p><p className="mt-2 break-all font-mono text-[10px] text-gray-600">SHA-256 · {record?.contract_sha256}</p></div>{signatureUrl && <img src={signatureUrl} alt="Tanda tangan digital penyewa" className="max-h-20 max-w-52 rounded-lg bg-white p-2"/>}</section>
      </div>}
    </section></div>}
  </>;
}
