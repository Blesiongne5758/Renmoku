import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Eye, FileImage, Loader2, LocateFixed, MapPin, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';
import { toast } from 'sonner';
import DomicileMap from './DomicileMap';
import { applyDocumentWatermark } from '../services/documentWatermark';

export type IdentityDocumentKey = 'ktp' | 'simA' | 'familyCard' | 'selfieKtp';
export type RenterIdentity = {
  fullName: string;
  email: string;
  phone: string;
  ktpNumber: string;
  simNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
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
  const [uploadingKeys, setUploadingKeys] = useState<Partial<Record<IdentityDocumentKey, boolean>>>({});
  const [viewingKey, setViewingKey] = useState<IdentityDocumentKey | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load persisted profile and documents once per signed-in user
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;

    void Promise.all([
      supabase.from('users').select('full_name,email,phone').eq('id', user.id).maybeSingle(),
      supabase
        .from('kyc_documents_individual')
        .select('ktp_number,sim_number,address,ktp_scan_url,sim_scan_url,kk_scan_url,selfie_ktp_url,residential_latitude,residential_longitude')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]).then(([profile, kyc]) => {
      if (!alive) return;
      const p = profile.data;
      const k = kyc.data;

      // Extract existing document paths from profile
      const profilePaths: Partial<Record<IdentityDocumentKey, string>> = {};
      if (k?.ktp_scan_url) profilePaths.ktp = k.ktp_scan_url;
      if (k?.sim_scan_url) profilePaths.simA = k.sim_scan_url;
      if (k?.kk_scan_url) profilePaths.familyCard = k.kk_scan_url;
      if (k?.selfie_ktp_url) profilePaths.selfieKtp = k.selfie_ktp_url;

      onChange({
        ...value,
        fullName: value.fullName || p?.full_name || user.name || '',
        email: value.email || p?.email || user.email || '',
        phone: value.phone || p?.phone || user.phone || '',
        ktpNumber: value.ktpNumber || k?.ktp_number || '',
        simNumber: value.simNumber || k?.sim_number || '',
        address: value.address || k?.address || '',
        latitude: value.latitude ?? k?.residential_latitude ?? null,
        longitude: value.longitude ?? k?.residential_longitude ?? null,
        paths: { ...profilePaths, ...value.paths },
      });
    });

    return () => {
      alive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!cameraKey) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Perangkat atau browser tidak mendukung kamera.');
      setCameraKey(null);
      return;
    }
    void navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: documentFields.find((item) => item.key === cameraKey)?.facing } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error('Kamera tidak dapat dibuka. Periksa izin kamera dan gunakan koneksi HTTPS.');
        setCameraKey(null);
      });
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraKey]);

  const patchValue = (patch: Partial<RenterIdentity>) => {
    onChange({ ...value, ...patch });
  };

  const updateText = (field: 'fullName' | 'phone' | 'ktpNumber' | 'simNumber' | 'address', text: string) => {
    patchValue({ [field]: text } as Pick<RenterIdentity, typeof field>);
  };

  // Upload and immediately sync document to user profile
  const syncDocumentToProfile = async (key: IdentityDocumentKey, file: File) => {
    patchValue({ files: { ...value.files, [key]: file } });
    if (!user?.id) return;

    setUploadingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const marked = await applyDocumentWatermark(file, user.id);
      const extension = marked.name.split('.').pop() || 'jpg';
      const storagePath = `${user.id}/kyc/${key}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('renter-kyc-private')
        .upload(storagePath, marked, { contentType: marked.type, upsert: false });
      if (uploadError) throw uploadError;

      const columnMap: Record<IdentityDocumentKey, string> = {
        ktp: 'ktp_scan_url',
        simA: 'sim_scan_url',
        familyCard: 'kk_scan_url',
        selfieKtp: 'selfie_ktp_url',
      };

      // Automatically update/fill renter profile in kyc_documents_individual
      const { error: kycError } = await supabase.from('kyc_documents_individual').upsert(
        {
          user_id: user.id,
          [columnMap[key]]: storagePath,
          ...(value.ktpNumber ? { ktp_number: value.ktpNumber } : {}),
          ...(value.simNumber ? { sim_number: value.simNumber, sim_class: 'A' } : {}),
          ...(value.address ? { address: value.address.trim() } : {}),
          ...(value.latitude !== null ? { residential_latitude: value.latitude } : {}),
          ...(value.longitude !== null ? { residential_longitude: value.longitude } : {}),
        },
        { onConflict: 'user_id' }
      );
      if (kycError) throw kycError;

      // Update paths in value so it reflects immediately as persisted
      const nextPaths = { ...value.paths, [key]: storagePath };
      const nextFiles = { ...value.files };
      delete nextFiles[key];

      patchValue({
        paths: nextPaths,
        files: nextFiles,
      });

      const fieldLabel = documentFields.find((item) => item.key === key)?.label || key;
      toast.success(`${fieldLabel} berhasil tersimpan ke profil Anda.`);
    } catch (err: any) {
      console.error('Gagal sinkronisasi dokumen ke profil:', err);
      toast.warning('Dokumen dipilih, namun penyimpanan instan ke profil gagal: ' + (err.message || ''));
    } finally {
      setUploadingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const pickFile = (key: IdentityDocumentKey, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      return toast.error('Pilih format JPG, PNG, WEBP, atau PDF maksimal 8 MB.');
    }
    void syncDocumentToProfile(key, file);
  };

  const capture = () => {
    if (!videoRef.current || !cameraKey) return;
    const video = videoRef.current;
    if (!video.videoWidth) return toast.error('Kamera belum siap. Coba kembali.');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob || !cameraKey) return toast.error('Foto gagal diambil.');
        const file = new File([blob], `${cameraKey}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const key = cameraKey;
        setCameraKey(null);
        void syncDocumentToProfile(key, file);
      },
      'image/jpeg',
      0.9
    );
  };

  const locate = () => {
    if (!navigator.geolocation) return toast.error('Perangkat tidak menyediakan GPS/browser geolocation.');
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(7));
        const lng = Number(position.coords.longitude.toFixed(7));
        patchValue({ latitude: lat, longitude: lng });
        setLocationLoading(false);
        toast.success('Koordinat domisili berhasil diambil.');
      },
      (error) => {
        setLocationLoading(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Izinkan lokasi pada browser untuk mengisi koordinat.'
            : 'Lokasi tidak berhasil diperoleh. Coba lagi di tempat terbuka.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const viewDocument = async (key: IdentityDocumentKey) => {
    const path = value.paths[key];
    if (!path) return;
    setViewingKey(key);
    try {
      const { data, error } = await supabase.storage.from('renter-kyc-private').createSignedUrl(path, 300);
      if (error || !data?.signedUrl) throw error || new Error('Gagal membuka URL dokumen');
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      toast.error('Gagal membuka dokumen: ' + (err.message || ''));
    } finally {
      setViewingKey(null);
    }
  };

  // Count existing documents from profile
  const existingDocsCount = documentFields.filter((item) => Boolean(value.paths[item.key])).length;

  return (
    <div className="space-y-5">
      {/* Profil Penyewa Section */}
      <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="font-semibold text-white">Profil Penyewa</h3>
            <p className="mt-0.5 text-xs text-gray-400">Data identitas dan domisili untuk verifikasi kontrak sewa.</p>
          </div>
          {existingDocsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {existingDocsCount}/4 Dokumen terhubung dari profil
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-gray-400">
            Nama lengkap
            <input
              required
              minLength={3}
              maxLength={150}
              value={value.fullName}
              onChange={(e) => updateText('fullName', e.target.value)}
              className="input-luxury mt-1 w-full rounded-xl"
              autoComplete="name"
              placeholder="Nama sesuai KTP"
            />
          </label>
          <label className="text-xs text-gray-400">
            Email akun
            <input
              readOnly
              value={value.email}
              className="input-luxury mt-1 w-full rounded-xl cursor-not-allowed opacity-70"
              autoComplete="email"
            />
            <span className="mt-1 block text-[10px] text-gray-500">Email mengikuti akun yang sedang digunakan.</span>
          </label>
          <label className="text-xs text-gray-400">
            Nomor telepon
            <input
              required
              type="tel"
              maxLength={20}
              value={value.phone}
              onChange={(e) => updateText('phone', e.target.value)}
              className="input-luxury mt-1 w-full rounded-xl"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <label className="text-xs text-gray-400">
            Nomor KTP / NIK
            <input
              required
              inputMode="numeric"
              minLength={16}
              maxLength={16}
              value={value.ktpNumber}
              onChange={(e) => updateText('ktpNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
              className="input-luxury mt-1 w-full rounded-xl"
              placeholder="16 digit NIK"
            />
          </label>
          <label className="text-xs text-gray-400">
            Nomor SIM A
            <input
              required
              maxLength={20}
              value={value.simNumber}
              onChange={(e) => updateText('simNumber', e.target.value)}
              className="input-luxury mt-1 w-full rounded-xl"
              placeholder="Nomor SIM A"
            />
          </label>
          <label className="text-xs text-gray-400 sm:col-span-2">
            Alamat domisili lengkap
            <textarea
              required
              minLength={10}
              maxLength={600}
              value={value.address}
              onChange={(e) => updateText('address', e.target.value)}
              className="input-luxury mt-1 min-h-20 w-full rounded-xl resize-y"
              autoComplete="street-address"
              placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi, kode pos"
            />
          </label>
        </div>

        {/* Koordinat GPS Domisili Frame */}
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 text-blue-300 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-100">Koordinat GPS domisili</p>
                <p className="text-xs text-gray-400">Izin lokasi perangkat diperlukan. Koordinat hanya dipakai untuk verifikasi domisili.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={locationLoading}
              onClick={locate}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300/30 bg-blue-500/10 px-3.5 py-2 text-xs font-medium text-blue-100 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
            >
              <LocateFixed className="h-4 w-4" />
              {locationLoading ? 'Mencari lokasi…' : 'Ambil lokasi perangkat'}
            </button>
          </div>

          {value.latitude !== null && value.longitude !== null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="font-mono text-xs font-semibold text-emerald-200">
                {value.latitude}, {value.longitude}
              </p>
            </div>
          )}

          {/* FITUR MAP OPEN SOURCE (OPENSTREETMAP) DITEMPATKAN DI BAWAH FRAME KOORDINAT GPS */}
          <div className="mt-4 pt-3 border-t border-blue-400/10">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-400" />
                Peta Titik Domisili (OpenStreetMap)
              </label>
              <span className="text-[11px] text-gray-400">
                Klik peta atau geser pin untuk menyesuaikan titik
              </span>
            </div>
            <DomicileMap
              latitude={value.latitude}
              longitude={value.longitude}
              onChange={(lat, lng) => patchValue({ latitude: lat, longitude: lng })}
            />
          </div>
        </div>
      </section>

      {/* Dokumen Penyewa Section */}
      <section className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="font-semibold text-white">Dokumen Persyaratan Penyewa</h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Dokumen tersimpan privat dengan watermark permanen. Tersinkronisasi otomatis ke profil Anda.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {documentFields.map((item) => {
            const file = value.files[item.key];
            const hasSavedPath = Boolean(value.paths[item.key]);
            const isUploading = Boolean(uploadingKeys[item.key]);

            return (
              <article
                key={item.key}
                className={`rounded-xl border p-3.5 transition-all ${
                  hasSavedPath
                    ? 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40'
                    : file
                    ? 'border-gold-500/20 bg-gold-950/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-200">{item.label}</p>
                      {hasSavedPath && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          Tersimpan di Profil
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-gray-400">{item.hint}</p>
                  </div>
                  {hasSavedPath && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-gray-200 hover:bg-white/10 transition-colors">
                    <FileImage className="h-3.5 w-3.5 text-gold-400" />
                    {hasSavedPath ? 'Ganti berkas' : 'Pilih berkas'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(event) => pickFile(item.key, event)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setCameraKey(item.key)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-2.5 py-1.5 text-xs text-yellow-100 hover:bg-yellow-400/10 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5 text-yellow-400" />
                    {hasSavedPath ? 'Foto ulang' : 'Buka kamera'}
                  </button>

                  {hasSavedPath && (
                    <button
                      type="button"
                      disabled={viewingKey === item.key}
                      onClick={() => void viewDocument(item.key)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {viewingKey === item.key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-400" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-gold-400" />
                      )}
                      Lihat
                    </button>
                  )}
                </div>

                {/* Status indicator */}
                <div className="mt-2 text-[11px]">
                  {isUploading ? (
                    <span className="inline-flex items-center gap-1.5 text-gold-300">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Menyimpan dokumen dengan watermark ke profil…
                    </span>
                  ) : file ? (
                    <span className="text-emerald-300 font-medium">Siap diunggah: {file.name}</span>
                  ) : hasSavedPath ? (
                    <span className="text-emerald-400/90 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Dokumen profil sudah terverifikasi
                    </span>
                  ) : (
                    <span className="text-gray-500">Belum ada dokumen</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Camera Capture Dialog */}
      {cameraKey && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Kamera ${cameraKey}`}
        >
          <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#171717] p-4 shadow-2xl">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Kamera · {documentFields.find((item) => item.key === cameraKey)?.label}</h3>
                <p className="text-xs text-gray-400">Posisikan dokumen dalam bingkai kamera dengan jelas.</p>
              </div>
              <button
                onClick={() => setCameraKey(null)}
                aria-label="Tutup kamera"
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <video ref={videoRef} autoPlay playsInline className="max-h-[60vh] w-full rounded-xl bg-black object-contain" />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCameraKey(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={capture}
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Ambil foto
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
