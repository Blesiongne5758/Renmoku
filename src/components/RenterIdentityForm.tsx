import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, FileImage, LocateFixed, MapPin, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';

export type IdentityDocumentKey = 'ktp' | 'simA' | 'familyCard' | 'selfieKtp';
export type RenterIdentity = {
  fullName: string; email: string; phone: string; ktpNumber: string; simNumber: string; address: string;
  latitude: number | null; longitude: number | null;
  files: Partial<Record<IdentityDocumentKey, File>>;
  paths: Partial<Record<IdentityDocumentKey, string>>;
};

const documentFields: Array<{ key: IdentityDocumentKey; label: string; hint: string; facing: 'environment' | 'user' }> = [
  { key: 'ktp', label: 'KTP', hint: 'Foto seluruh bagian KTP dengan jelas.', facing: 'environment' },
  { key: 'simA', label: 'SIM A', hint: 'Pastikan SIM A masih berlaku.', facing: 'environment' },
  { key: 'familyCard', label: 'Kartu Keluarga', hint: 'Foto seluruh halaman Kartu Keluarga.', facing: 'environment' },
  { key: 'selfieKtp', label: 'Selfie memegang KTP', hint: 'Wajah dan KTP harus terlihat jelas.', facing: 'user' },
];

export default function RenterIdentityForm({ value, onChange }: { value: RenterIdentity; onChange: (value: RenterIdentity) => void }) {
  const user = useAppStore((state) => state.currentUser);
  const [cameraKey, setCameraKey] = useState<IdentityDocumentKey | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const editedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    void Promise.all([
      supabase.from('users').select('full_name,email,phone').eq('id', user.id).maybeSingle(),
      supabase.from('kyc_documents_individual').select('ktp_number,sim_number,address,ktp_scan_url,sim_scan_url,kk_scan_url,selfie_ktp_url,residential_latitude,residential_longitude').eq('user_id', user.id).maybeSingle(),
    ]).then(([profile, kyc]) => {
      if (!alive) return;
      if (editedRef.current) return;
      const p = profile.data; const k = kyc.data;
      onChange({
        ...value,
        fullName: p?.full_name ?? user.name ?? '', email: p?.email ?? user.email ?? '', phone: p?.phone ?? user.phone ?? '',
        ktpNumber: k?.ktp_number ?? value.ktpNumber, simNumber: k?.sim_number ?? value.simNumber, address: k?.address ?? value.address,
        latitude: k?.residential_latitude ?? value.latitude, longitude: k?.residential_longitude ?? value.longitude,
        paths: { ...value.paths, ...(k?.ktp_scan_url ? { ktp: k.ktp_scan_url } : {}), ...(k?.sim_scan_url ? { simA: k.sim_scan_url } : {}), ...(k?.kk_scan_url ? { familyCard: k.kk_scan_url } : {}), ...(k?.selfie_ktp_url ? { selfieKtp: k.selfie_ktp_url } : {}) },
      });
    });
    return () => { alive = false; };
  }, [user?.id]); // Load persisted profile once per signed-in user.

  useEffect(() => {
    if (!cameraKey) return;
    if (!navigator.mediaDevices?.getUserMedia) { toast.error('Perangkat atau browser tidak mendukung kamera.'); setCameraKey(null); return; }
    void navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: documentFields.find((item) => item.key === cameraKey)?.facing } }, audio: false })
      .then((stream) => { streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => { toast.error('Kamera tidak dapat dibuka. Periksa izin kamera dan gunakan koneksi HTTPS.'); setCameraKey(null); });
    return () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  }, [cameraKey]);

  const patchValue = (patch: Partial<RenterIdentity>) => { editedRef.current = true; onChange({ ...value, ...patch }); };
  const updateText = (field: 'fullName' | 'phone' | 'ktpNumber' | 'simNumber' | 'address', text: string) => patchValue({ [field]: text } as Pick<RenterIdentity, typeof field>);
  const pickFile = (key: IdentityDocumentKey, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type) || file.size > 8 * 1024 * 1024) return toast.error('Pilih JPG, PNG, WEBP, atau PDF maksimal 8 MB.');
    patchValue({ files: { ...value.files, [key]: file } });
  };
  const capture = () => {
    if (!videoRef.current || !cameraKey) return;
    const video = videoRef.current;
    if (!video.videoWidth) return toast.error('Kamera belum siap. Coba kembali.');
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob || !cameraKey) return toast.error('Foto gagal diambil.');
      const file = new File([blob], `${cameraKey}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      patchValue({ files: { ...value.files, [cameraKey]: file } }); setCameraKey(null);
    }, 'image/jpeg', 0.9);
  };
  const locate = () => {
    if (!navigator.geolocation) return toast.error('Perangkat tidak menyediakan GPS/browser geolocation.');
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      patchValue({ latitude: Number(position.coords.latitude.toFixed(7)), longitude: Number(position.coords.longitude.toFixed(7)) });
      setLocationLoading(false); toast.success('Koordinat domisili berhasil diambil.');
    }, (error) => {
      setLocationLoading(false);
      toast.error(error.code === error.PERMISSION_DENIED ? 'Izin lokasi ditolak. Izinkan lokasi pada browser untuk mengisi koordinat.' : 'Lokasi tidak berhasil diperoleh. Coba lagi di tempat terbuka.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  return <div className="space-y-5">
    <section className="space-y-4 rounded-xl border border-white/10 bg-black/10 p-4">
      <div><h3 className="font-semibold text-white">Profil penyewa</h3><p className="mt-1 text-xs text-gray-500">Data ini dipakai untuk verifikasi dan kontrak sewa.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-gray-400">Nama lengkap<input required minLength={3} maxLength={150} value={value.fullName} onChange={(e) => updateText('fullName', e.target.value)} className="input-luxury mt-1 w-full" autoComplete="name" placeholder="Nama sesuai KTP"/></label>
        <label className="text-xs text-gray-400">Email akun<input readOnly value={value.email} className="input-luxury mt-1 w-full cursor-not-allowed opacity-70" autoComplete="email"/><span className="mt-1 block text-[10px] text-gray-600">Email mengikuti akun yang sedang digunakan.</span></label>
        <label className="text-xs text-gray-400">Nomor telepon<input required type="tel" maxLength={20} value={value.phone} onChange={(e) => updateText('phone', e.target.value)} className="input-luxury mt-1 w-full" autoComplete="tel" placeholder="08xxxxxxxxxx"/></label>
        <label className="text-xs text-gray-400">Nomor KTP / NIK<input required inputMode="numeric" minLength={16} maxLength={16} value={value.ktpNumber} onChange={(e) => updateText('ktpNumber', e.target.value.replace(/\D/g,'').slice(0,16))} className="input-luxury mt-1 w-full" placeholder="16 digit"/></label>
        <label className="text-xs text-gray-400">Nomor SIM A<input required maxLength={20} value={value.simNumber} onChange={(e) => updateText('simNumber', e.target.value)} className="input-luxury mt-1 w-full" placeholder="Nomor SIM A"/></label>
        <label className="text-xs text-gray-400 sm:col-span-2">Alamat domisili lengkap<textarea required minLength={10} maxLength={600} value={value.address} onChange={(e) => updateText('address', e.target.value)} className="input-luxury mt-1 min-h-20 w-full resize-y" autoComplete="street-address" placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi, kode pos"/></label>
      </div>
      <div className="rounded-xl border border-blue-400/15 bg-blue-400/5 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-blue-300"/><div><p className="text-sm font-medium text-blue-100">Koordinat GPS domisili</p><p className="text-xs text-gray-400">Izin lokasi perangkat diperlukan. Koordinat hanya dipakai untuk verifikasi domisili.</p></div></div><button type="button" disabled={locationLoading} onClick={locate} className="inline-flex items-center gap-2 rounded-lg border border-blue-300/20 px-3 py-2 text-xs text-blue-100 disabled:opacity-50"><LocateFixed className="h-4 w-4"/>{locationLoading ? 'Mencari lokasi…' : 'Ambil lokasi perangkat'}</button></div>{value.latitude !== null && value.longitude !== null && <p className="mt-2 font-mono text-xs text-emerald-200">{value.latitude}, {value.longitude}</p>}</div>
    </section>
    <section className="space-y-3 rounded-xl border border-white/10 bg-black/10 p-4"><div><h3 className="font-semibold text-white">Dokumen penyewa</h3><p className="mt-1 text-xs text-gray-500">Dokumen diunggah ke penyimpanan privat, maksimal 8 MB per berkas.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{documentFields.map((item) => {
        const file = value.files[item.key]; const exists = Boolean(file || value.paths[item.key]);
        return <article key={item.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-gray-200">{item.label}</p><p className="mt-1 text-[11px] leading-4 text-gray-500">{item.hint}</p></div>{exists && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300"/>}</div><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-gray-300 hover:bg-white/5"><FileImage className="h-3.5 w-3.5"/>Pilih berkas<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(event) => pickFile(item.key,event)}/></label><button type="button" onClick={() => setCameraKey(item.key)} className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/20 px-2.5 py-2 text-xs text-yellow-100 hover:bg-yellow-400/5"><Camera className="h-3.5 w-3.5"/>Buka kamera</button><label className="sr-only">Ambil {item.label} dengan kamera perangkat<input type="file" accept="image/*" capture={item.facing} className="sr-only" onChange={(event) => pickFile(item.key,event)}/></label></div><p className="mt-2 truncate text-[10px] text-gray-500">{file ? `Siap diunggah: ${file.name}` : value.paths[item.key] ? 'Dokumen tersimpan' : 'Belum ada dokumen'}</p></article>;
      })}</div>
    </section>
    {cameraKey && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={`Kamera ${cameraKey}`}><section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#171717] p-4"><header className="mb-3 flex items-center justify-between"><div><h3 className="font-medium text-white">Kamera · {documentFields.find((item) => item.key === cameraKey)?.label}</h3><p className="text-xs text-gray-500">Izinkan browser mengakses kamera perangkat.</p></div><button onClick={() => setCameraKey(null)} aria-label="Tutup kamera" className="rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4"/></button></header><video ref={videoRef} autoPlay playsInline className="max-h-[60vh] w-full rounded-xl bg-black object-contain"/><div className="mt-3 flex justify-end gap-2"><button onClick={() => setCameraKey(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300">Batal</button><button onClick={capture} className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"><Camera className="h-4 w-4"/>Ambil foto</button></div></section></div>}
  </div>;
}
