import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, FileCheck2, ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';
import { applyDocumentWatermark } from '../services/documentWatermark';

const requiredPhotos = [
  { key: 'front', label: 'Tampak depan' },
  { key: 'left', label: 'Samping kiri' },
  { key: 'right', label: 'Samping kanan' },
  { key: 'rear', label: 'Tampak belakang' },
  { key: 'interior', label: 'Interior kendaraan' },
  { key: 'dashboard', label: 'Dashboard & odometer' },
] as const;

type PhotoKey = typeof requiredPhotos[number]['key'];
type VehicleForm = { brand: string; model: string; year: string; plate: string; transmission: 'MANUAL' | 'AUTOMATIC'; capacity: string; fuel: string; price: string; location: string; odometer: string };
const initialForm: VehicleForm = { brand: '', model: '', year: '', plate: '', transmission: 'AUTOMATIC', capacity: '5', fuel: 'Bensin', price: '', location: '', odometer: '' };

export default function AddVehicleForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted?: () => void }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, File>>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Partial<Record<PhotoKey, string>>>({});
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraPhoto, setCameraPhoto] = useState<PhotoKey | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const setPhoto = (key: PhotoKey, file: File) => {
    const preview = URL.createObjectURL(file);
    previewUrlsRef.current.push(preview);
    setPhotos((current) => ({ ...current, [key]: file }));
    setPhotoPreviews((current) => ({ ...current, [key]: preview }));
  };

  useEffect(() => () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    if (!cameraPhoto) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Browser atau perangkat ini tidak mendukung akses kamera.');
      setCameraPhoto(null);
      return;
    }
    void navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error('Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan HTTPS.');
        setCameraPhoto(null);
      });
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraPhoto]);

  const capturePhoto = () => {
    if (!cameraPhoto || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return toast.error('Foto gagal diambil. Coba lagi.');
      const file = new File([blob], `${cameraPhoto}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPhoto(cameraPhoto, file);
      setCameraPhoto(null);
    }, 'image/jpeg', 0.9);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return toast.error('Silakan masuk kembali sebelum mendaftarkan kendaraan.');
    if (!ownershipDocument || requiredPhotos.some(({ key }) => !photos[key])) {
      return toast.error('Lengkapi bukti dokumen kepemilikan dan keenam foto kendaraan.');
    }
    const submissionId = crypto.randomUUID();
    const folder = `${currentUser.id}/vehicle-submissions/${submissionId}`;
    setIsSaving(true);
    try {
      const upload = async (file: File, filename: string) => {
        const watermarked = await applyDocumentWatermark(file, currentUser.id);
        const baseName = filename.replace(/\.[^.]+$/, '');
        const extension = watermarked.name.split('.').pop() || 'bin';
        const { data, error } = await supabase.storage.from('owner-private').upload(`${folder}/${baseName}.${extension}`, watermarked, { upsert: false, contentType: watermarked.type });
        if (error) throw error;
        return data.path;
      };
      const documentPath = await upload(ownershipDocument, `ownership-${ownershipDocument.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      const photoPaths: Record<string, string> = {};
      for (const { key } of requiredPhotos) {
        const photo = photos[key];
        if (!photo) throw new Error('Foto wajib belum lengkap.');
        photoPaths[key] = await upload(photo, `${key}.jpg`);
      }

      const { error } = await supabase.from('owner_vehicle_submissions').insert({
        id: submissionId,
        user_id: currentUser.id,
        brand: form.brand.trim(), model: form.model.trim(), year: Number(form.year),
        license_plate: form.plate.trim().toUpperCase(), transmission: form.transmission,
        capacity: Number(form.capacity), fuel_type: form.fuel, price_daily: Number(form.price),
        location: form.location.trim(), odometer_km: Number(form.odometer),
        ownership_document_path: documentPath, vehicle_photos: photoPaths,
      });
      if (error) throw error;
      toast.success('Pengajuan kendaraan terkirim untuk pemeriksaan admin.');
      onSubmitted?.();
      onClose();
    } catch {
      toast.error('Pengajuan gagal disimpan. Pastikan skrip owner_features.sql sudah diterapkan dan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-yellow-400/60';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title">
      <form onSubmit={submit} className="mx-auto my-6 max-w-4xl rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between"><div><h2 id="add-vehicle-title" className="text-xl font-semibold">Tambah kendaraan</h2><p className="mt-1 text-sm text-gray-400">Isi spesifikasi, unggah dokumen, dan foto untuk verifikasi.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ['Merek', 'brand', 'text'], ['Model kendaraan', 'model', 'text'], ['Tahun', 'year', 'number'],
            ['Nomor polisi', 'plate', 'text'], ['Kapasitas penumpang', 'capacity', 'number'], ['Bahan bakar', 'fuel', 'text'],
            ['Harga sewa per hari (Rp)', 'price', 'number'], ['Lokasi kendaraan', 'location', 'text'], ['Odometer (km)', 'odometer', 'number'],
          ] as const).map(([label, key, type]) => <label className="space-y-1.5" key={key}><span className="text-sm text-gray-300">{label}</span><input required min={type === 'number' ? 0 : undefined} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass} /></label>)}
          <label className="space-y-1.5"><span className="text-sm text-gray-300">Transmisi</span><select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value as VehicleForm['transmission'] })} className={inputClass}><option value="AUTOMATIC">Otomatis</option><option value="MANUAL">Manual</option></select></label>
        </div>

        <section className="mt-7"><div className="mb-3 flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-yellow-400" /><h3 className="font-semibold">Dokumen kepemilikan</h3></div><label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-center hover:border-yellow-400/50"><ImagePlus className="mb-2 h-6 w-6 text-yellow-300" /><span className="text-sm">{ownershipDocument?.name ?? 'Pilih bukti kepemilikan (STNK/BPKB)'}</span><span className="mt-1 text-xs text-gray-500">PDF, JPG, PNG · maksimal 10 MB</span><input type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setOwnershipDocument(e.target.files?.[0] ?? null)} /></label></section>

        <section className="mt-7"><div className="mb-3 flex items-center gap-2"><Camera className="h-5 w-5 text-yellow-400" /><div><h3 className="font-semibold">Foto kendaraan</h3><p className="text-xs text-gray-500">Enam foto wajib. Pastikan nomor polisi dan kondisi kendaraan terlihat jelas.</p></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {requiredPhotos.map(({ key, label }) => <div key={key} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-white/5">{photos[key] ? <img src={photoPreviews[key]} alt={label} className="h-full w-full object-cover" /> : <span className="text-sm text-gray-500">{label}</span>}</div>
            <p className="mb-2 text-sm">{label} {photos[key] && <CheckCircle2 className="inline h-4 w-4 text-emerald-400" />}</p>
            <div className="flex gap-2"><label className="flex-1 cursor-pointer rounded-lg border border-white/10 px-2 py-2 text-center text-xs hover:border-yellow-400/40">Pilih foto<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) setPhoto(key, file); }} /></label><button type="button" onClick={() => setCameraPhoto(key)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-yellow-400/10 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-400/20"><Camera className="h-3.5 w-3.5" />Kamera</button></div>
          </div>)}
        </div></section>

        <div className="mt-7 flex flex-col-reverse justify-end gap-2 border-t border-white/10 pt-5 sm:flex-row"><button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5">Batal</button><button disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{isSaving ? 'Mengirim…' : 'Kirim untuk verifikasi'}</button></div>
      </form>

      {cameraPhoto && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"><div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-medium">Ambil foto: {requiredPhotos.find((photo) => photo.key === cameraPhoto)?.label}</h3><button type="button" onClick={() => setCameraPhoto(null)} aria-label="Tutup kamera"><X className="h-5 w-5" /></button></div><video ref={videoRef} autoPlay playsInline className="max-h-[65vh] w-full rounded-xl bg-black object-contain"/><button type="button" onClick={capturePhoto} className="mt-3 w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-black"><Camera className="mr-2 inline h-4 w-4"/>Ambil foto</button></div></div>}
    </div>
  );
}
