import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Clapperboard, Download, Film, Loader2, MoveHorizontal, Play, Rotate3D, Save, Upload, X, QrCode, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { applyDocumentWatermark } from '../services/documentWatermark';
import { cloudinaryHelpers } from '../lib/cloudinary';
import { useAppStore } from '../stores/useAppStore';
import VehicleModelViewer from './VehicleModelViewer';

type SpinVehicle = { id: string; source: 'vehicle' | 'submission'; brand: string; model: string; year: number; images: string[] | null; photoPaths?: Record<string, string> | null; spin_frames: string[] | null; spin_video_url: string | null; submissionStatus?: string; spin_model_url?: string | null };
type SpinCatalog = { packages: Array<{id:string;name:string;package_type:'monthly'|'top_up';generations:number;price_idr:number|null;provider_cost_idr:number|null;renmoku_share_idr:number|null;purchasable:boolean}>; wallet:{monthly_credits:number;topup_credits:number;package_id?:string;subscription_status:string;period_end?:string|null;payment_type?:string|null}; jobs:Array<{id:string;submission_id:string;status:string;provider_task_id:string|null;model_path:string|null;error_message:string|null;created_at:string}>; orders:Array<{id:string;package_id:string;status:string;subscription_creation_uncertain:boolean;midtrans_order_id:string;payment_type:string|null;payment_proof_path:string|null;payment_review_note:string|null;amount_idr:number;created_at:string}>; creditRateReady:boolean;qrisImageUrl:string|null;qrisInstructions:string };
type Frame = { key: string; src: string; file?: File; sourcePath?: string };
const MAX_FRAMES = 36;
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_TOTAL_BYTES = 120 * 1024 * 1024;

export default function OwnerSpinStudio() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [vehicles, setVehicles] = useState<SpinVehicle[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState('');
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState<SpinCatalog | null>(null);
  const [catalogError, setCatalogError] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState('');
  const [manualPackageId, setManualPackageId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const dragX = useRef<number | null>(null);
  const videoCanvas = useRef<HTMLCanvasElement | null>(null);
  const frameUrls = useRef<string[]>([]);
  const videoObjectUrl = useRef('');

  const selected = vehicles.find((vehicle) => vehicle.id === selectedId);

  const loadCatalog = useCallback(async () => {
    const { data, error: catalogLoadError } = await supabase.functions.invoke('spin-catalog');
    if (catalogLoadError) { setCatalogError('Paket AI Spin belum tersedia. Jalankan migrasi dan Edge Functions Supabase.'); return; }
    setCatalog(data as SpinCatalog);
    setCatalogError('');
  }, []);
  useEffect(() => { if (currentUser?.id) void loadCatalog(); }, [currentUser?.id, loadCatalog]);

  const loadVehicles = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const { data: ownerRows, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id);
    if (ownerError) { setError('Data pemilik tidak dapat dimuat.'); setLoading(false); return; }
    const ownerIds = (ownerRows ?? []).map((owner: { id: string }) => owner.id);
    if (!ownerIds.length) { setVehicles([]); setLoading(false); return; }
    const [{ data, error: vehicleError }, { data: submissions, error: submissionError }] = await Promise.all([
      supabase.from('vehicles').select('id,brand,model,year,images,spin_frames,spin_video_url').in('owner_id', ownerIds).order('created_at', { ascending: false }),
      supabase.from('owner_vehicle_submissions').select('id,brand,model,year,status,vehicle_photos,spin_frames,spin_video_url,spin_model_url').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]);
    if (vehicleError) { setError('Daftar kendaraan gagal dimuat.'); setLoading(false); return; }
    if (submissionError) { setError('Foto pengajuan kendaraan gagal dimuat. Pastikan migrasi owner_features.sql sudah diterapkan.'); setLoading(false); return; }
    const nextVehicles = ((data ?? []) as Omit<SpinVehicle, 'source'>[]).map((vehicle) => ({ ...vehicle, source: 'vehicle' as const }));
    const submissionsWithExteriorPhotos = ((submissions ?? []) as Array<Omit<SpinVehicle, 'source' | 'images'> & { vehicle_photos: Record<string, string>; status:string }>).filter((submission) => Object.keys(submission.vehicle_photos ?? {}).length > 0);
    const submissionFrames = await Promise.all(submissionsWithExteriorPhotos.map(async (submission) => {
      const { data: signed } = await supabase.storage.from('owner-private').createSignedUrls(Object.values(submission.vehicle_photos), 3600);
      const urlByPath = new Map((signed ?? []).map((item: { path: string | null; signedUrl: string | null }) => [item.path ?? '', item.signedUrl ?? '']));
      const orderedPaths = ['front', 'right', 'rear', 'left'].map((side) => submission.vehicle_photos[side]).filter(Boolean);
      const images = orderedPaths.map((path) => urlByPath.get(path) ?? '').filter(Boolean);
      const frames = Array.isArray(submission.spin_frames) && submission.spin_frames.length ? submission.spin_frames : null;
      return {
        ...submission, source: 'submission' as const, images,
        photoPaths: submission.vehicle_photos,
        spin_frames: frames,
        submissionStatus: submission.status,
        spin_model_url: submission.spin_model_url,
      } as SpinVehicle;
    }));
    const next = [...nextVehicles, ...submissionFrames];
    setVehicles(next);
    setSelectedId((id) => next.some((vehicle) => vehicle.id === id) ? id : next[0]?.id ?? '');
    setLoading(false);
  }, [currentUser?.id]);

  useEffect(() => { void loadVehicles(); }, [loadVehicles]);
  useEffect(() => () => {
    frameUrls.current.forEach((url) => URL.revokeObjectURL(url));
    if (videoObjectUrl.current) URL.revokeObjectURL(videoObjectUrl.current);
  }, []);

  useEffect(() => {
    if (!selected) { setFrames([]); return; }
    if (videoObjectUrl.current) { URL.revokeObjectURL(videoObjectUrl.current); videoObjectUrl.current = ''; }
    const savedFrames = Array.isArray(selected.spin_frames) ? selected.spin_frames : [];
    const fallbacks = savedFrames.length ? savedFrames : (selected.images ?? []);
    const isSubmission = selected.source === 'submission';
    const orderedPaths = ['front', 'right', 'rear', 'left'].map((side) => selected.photoPaths?.[side]).filter((path): path is string => Boolean(path));
    setFrames(fallbacks.map((src, index) => ({ key: `saved-${index}-${src}`, src, sourcePath: isSubmission && !selected.spin_frames?.length ? orderedPaths[index] : undefined })));
    setFrameIndex(0);
    setVideoUrl(selected.spin_video_url ?? '');
  }, [selectedId]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const timer = window.setInterval(() => setFrameIndex((index) => (index + 1) % frames.length), 110);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const files = selectedFiles.filter((file) => file.type.startsWith('image/') && file.size <= MAX_FILE_BYTES);
    if (selectedFiles.some((file) => !file.type.startsWith('image/'))) toast.error('Pilih berkas gambar saja.');
    if (selectedFiles.some((file) => file.size > MAX_FILE_BYTES)) toast.error('Ukuran maksimal satu foto adalah 12 MB.');
    if (frames.length + files.length > MAX_FRAMES) { toast.error(`Maksimal ${MAX_FRAMES} frame per kendaraan.`); event.target.value = ''; return; }
    const currentBytes = frames.reduce((total, frame) => total + (frame.file?.size ?? 0), 0);
    if (currentBytes + files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) { toast.error('Total ukuran foto maksimal 120 MB.'); event.target.value = ''; return; }
    const additions = files.map((file) => {
      const src = URL.createObjectURL(file); frameUrls.current.push(src);
      return { key: crypto.randomUUID(), src, file };
    });
    setFrames((current) => [...current, ...additions]);
    setPlaying(false);
    event.target.value = '';
  };

  const moveFrame = (index: number, direction: -1 | 1) => setFrames((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current]; [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  const removeFrame = (index: number) => {
    const frame = frames[index];
    if (frame?.file) {
      URL.revokeObjectURL(frame.src);
      frameUrls.current = frameUrls.current.filter((url) => url !== frame.src);
    }
    setFrames((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setFrameIndex((current) => Math.max(0, Math.min(current, frames.length - 2)));
  };

  const saveFrames = async () => {
    if (!selected) return;
    if (frames.length < 4) return toast.error('Tambahkan minimal 4 foto dengan sudut berbeda.');
    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (let index = 0; index < frames.length; index += 1) {
        setSavingProgress(`Mengunggah foto ${index + 1} dari ${frames.length}…`);
        const frame = frames[index];
        if (frame.file || frame.sourcePath) {
          const file = frame.file ?? new File([await (await fetch(frame.src)).blob()], `frame-${index + 1}.jpg`, { type: 'image/jpeg' });
          const watermarkedFrame = await applyDocumentWatermark(file, currentUser?.id ?? selected.id);
          const result = await cloudinaryHelpers.uploadImage(watermarkedFrame, `vehicles/${selected.id}/spin360`);
          uploaded.push(result.url);
        } else uploaded.push(frame.src);
      }
      const target = selected.source === 'vehicle' ? supabase.from('vehicles') : supabase.from('owner_vehicle_submissions');
      setSavingProgress('Menyimpan urutan foto…');
      let updateQuery = target.update({ spin_frames: uploaded }).eq('id', selected.id);
      if (selected.source === 'submission') updateQuery = updateQuery.eq('user_id', currentUser!.id);
      const { error: updateError } = await updateQuery;
      if (updateError) throw updateError;
      const saved = vehicles.map((vehicle) => vehicle.id === selected.id ? { ...vehicle, spin_frames: uploaded } : vehicle);
      setVehicles(saved);
      frames.forEach((frame) => {
        if (frame.file) { URL.revokeObjectURL(frame.src); frameUrls.current = frameUrls.current.filter((url) => url !== frame.src); }
      });
      setFrames(uploaded.map((src, index) => ({ key: `saved-${index}-${src}`, src })));
      toast.success(`${uploaded.length} frame spin tersimpan.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Foto spin gagal disimpan. Periksa konfigurasi Cloudinary dan database.');
    } finally { setSaving(false); setSavingProgress(''); }
  };

  const createVideo = async () => {
    if (!selected || frames.length < 4) return toast.error('Tambahkan minimal 4 foto sebelum membuat video.');
    if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) return toast.error('Browser ini belum mendukung ekspor video.');
    setGenerating(true);
    try {
      const canvas = videoCanvas.current ?? document.createElement('canvas');
      videoCanvas.current = canvas;
      canvas.width = 1280; canvas.height = 720;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas video tidak tersedia.');
      const images = await Promise.all(frames.map((frame) => new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve(image); image.onerror = () => reject(new Error('Ada foto yang tidak dapat dimuat untuk ekspor video.')); image.src = frame.src;
      })));
      const supportedType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
      if (!supportedType) throw new Error('Format WebM tidak didukung browser ini.');
      const recorder = new MediaRecorder(canvas.captureStream(24), { mimeType: supportedType, videoBitsPerSecond: 5_000_000 });
      const chunks: BlobPart[] = [];
      const finished = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
        recorder.onerror = () => reject(new Error('Perekaman video gagal.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: supportedType }));
      });
      const start = performance.now();
      const duration = Math.max(5000, images.length * 180);
      let raf = 0;
      const draw = (time: number) => {
        const elapsed = time - start;
        const progress = Math.min(1, elapsed / duration);
        const imageIndex = Math.floor(progress * images.length) % images.length;
        context.fillStyle = '#141619'; context.fillRect(0, 0, canvas.width, canvas.height);
        const floor = context.createLinearGradient(0, 430, 0, 720); floor.addColorStop(0, '#292b2e'); floor.addColorStop(1, '#101112'); context.fillStyle = floor; context.fillRect(0, 430, canvas.width, 290);
        context.fillStyle = 'rgba(205,166,91,.08)'; context.beginPath(); context.ellipse(640, 570, 470, 88, 0, 0, Math.PI * 2); context.fill();
        const image = images[imageIndex];
        const scale = Math.min(920 / image.width, 510 / image.height);
        const width = image.width * scale; const height = image.height * scale;
        context.shadowColor = 'rgba(0,0,0,.65)'; context.shadowBlur = 32; context.drawImage(image, (canvas.width - width) / 2, 405 - height / 2, width, height); context.shadowBlur = 0;
        context.fillStyle = 'rgba(245,240,226,.9)'; context.font = '600 22px Arial'; context.fillText(`${selected.brand} ${selected.model} · 360° SHOWROOM`, 54, 64);
        if (elapsed < duration) raf = requestAnimationFrame(draw); else recorder.stop();
      };
      recorder.start(); raf = requestAnimationFrame(draw);
      const blob = await finished;
      cancelAnimationFrame(raf);
      const localUrl = URL.createObjectURL(blob);
      if (videoObjectUrl.current) URL.revokeObjectURL(videoObjectUrl.current);
      videoObjectUrl.current = localUrl;
      setVideoUrl(localUrl);
      const file = new File([blob], `${selected.brand}-${selected.model}-spin360.webm`, { type: blob.type });
      const upload = await cloudinaryHelpers.uploadVideo(file, `vehicles/${selected.id}/spin360`);
      const target = selected.source === 'vehicle' ? supabase.from('vehicles') : supabase.from('owner_vehicle_submissions');
      let updateQuery = target.update({ spin_video_url: upload.url }).eq('id', selected.id);
      if (selected.source === 'submission') updateQuery = updateQuery.eq('user_id', currentUser!.id);
      const { error: saveError } = await updateQuery;
      if (saveError) throw saveError;
      setVehicles((current) => current.map((vehicle) => vehicle.id === selected.id ? { ...vehicle, spin_video_url: upload.url } : vehicle));
      toast.success('Video spin berhasil dibuat dan disimpan.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Video gagal dibuat.');
    } finally { setGenerating(false); }
  };

  const generateModel = async () => {
    if (!selected || selected.source !== 'submission') return toast.error('Model 3D AI dibuat dari foto pengajuan kendaraan.');
    if ((selected.images?.length ?? 0) < 2) return toast.error('Unggah sedikitnya dua foto eksterior dari sudut berbeda.');
    setGenerating(true);
    const { data, error: functionError } = await supabase.functions.invoke('spin-model-generate', { body: { submissionId: selected.id } });
    setGenerating(false);
    if (functionError || data?.error) { toast.error(data?.error ?? functionError?.message ?? 'Pembuatan model gagal.'); return; }
    toast.success('Generasi model dimulai. Hasil akan muncul untuk ditinjau setelah selesai.');
    await loadCatalog();
  };

  const syncModelJob = async (jobId: string) => {
    const { data, error: syncError } = await supabase.functions.invoke('spin-model-sync', { body: { jobId } });
    if (syncError || data?.error) { toast.error(data?.error ?? 'Status pembuatan model gagal diperiksa.'); return; }
    if (data.status === 'review') toast.success('Model GLB siap ditinjau.');
    if (data.status === 'failed') toast.error(data.error ?? 'Generasi gagal; kredit sudah dikembalikan.');
    await loadCatalog();
  };

  const saveModelReview = async (jobId: string, makePublic: boolean) => {
    const { data, error: reviewError } = await supabase.functions.invoke('spin-model-publish', { body: { jobId, makePublic } });
    if (reviewError || data?.error) { toast.error(data?.error ?? 'Model gagal disimpan.'); return; }
    toast.success(makePublic ? (data.listingApproved ? 'Model disimpan dan ditayangkan di halaman armada.' : 'Model disimpan. Tayang otomatis setelah admin menyetujui kendaraan.') : 'Model 3D disimpan pribadi.');
    await loadCatalog();
  };

  const submitManualPayment = async () => {
    const pkg = catalog?.packages.find((item) => item.id === manualPackageId);
    if (!currentUser?.id || !pkg || !proofFile) return toast.error('Pilih paket dan unggah bukti pembayaran.');
    if (!catalog?.qrisImageUrl) return toast.error('QRIS belum disiapkan admin.');
    if (!['image/jpeg','image/png','image/webp'].includes(proofFile.type) || proofFile.size > 5 * 1024 * 1024) return toast.error('Bukti harus JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.');
    setCheckoutBusy(pkg.id);
    const orderUuid = crypto.randomUUID();
    const extension = proofFile.type === 'image/jpeg' ? 'jpg' : proofFile.type === 'image/png' ? 'png' : 'webp';
    const proofPath = `${currentUser.id}/${orderUuid}.${extension}`;
    let watermarkedProof: File;
    try { watermarkedProof = await applyDocumentWatermark(proofFile, currentUser.id); }
    catch (error) { setCheckoutBusy(''); return toast.error(error instanceof Error ? error.message : 'Watermark bukti pembayaran gagal diproses.'); }
    const proofBasePath = proofPath.replace(/\.[^.]+$/, '');
    const proofExtension = watermarkedProof.name.split('.').pop() || extension;
    const finalProofPath = `${proofBasePath}.${proofExtension}`;
    const { error: uploadError } = await supabase.storage.from('ai-spin-payment-proofs').upload(finalProofPath, watermarkedProof, { contentType: watermarkedProof.type, upsert: false });
    if (uploadError) { setCheckoutBusy(''); return toast.error('Bukti pembayaran gagal diunggah.'); }
    const { data, error: orderError } = await supabase.functions.invoke('spin-manual-order', { body: { packageId: pkg.id, orderUuid, proofPath: finalProofPath } });
    setCheckoutBusy('');
    if (orderError || data?.error) {
      await supabase.storage.from('ai-spin-payment-proofs').remove([finalProofPath]);
      return toast.error(data?.error ?? orderError?.message ?? 'Pesanan pembayaran gagal dibuat.');
    }
    setManualPackageId(''); setProofFile(null);
    toast.success('Bukti pembayaran terkirim. Kredit aktif setelah admin memverifikasi pembayaran.');
    await loadCatalog();
  };

  useEffect(() => {
    const processingJobs = catalog?.jobs.filter((job) => job.status === 'processing' && job.provider_task_id) ?? [];
    if (!processingJobs.length) return;
    const timer = window.setInterval(() => {
      for (const job of processingJobs) void supabase.functions.invoke('spin-model-sync', { body: { jobId: job.id } }).then(() => void loadCatalog());
    }, 12000);
    return () => window.clearInterval(timer);
  }, [catalog?.jobs, loadCatalog]);

  const onPointerDown = (event: React.PointerEvent) => { dragX.current = event.clientX; setPlaying(false); event.currentTarget.setPointerCapture(event.pointerId); };
  const onPointerMove = (event: React.PointerEvent) => {
    if (dragX.current === null || frames.length < 2) return;
    const delta = event.clientX - dragX.current;
    if (Math.abs(delta) > 12) { setFrameIndex((index) => (index + (delta > 0 ? frames.length - 1 : 1)) % frames.length); dragX.current = event.clientX; }
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-white/10 bg-[#111315] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-lg font-semibold text-white">Kredit AI Spin</h2><p className="mt-1 max-w-2xl text-sm text-gray-400">Pilih paket bulanan atau refill, bayar dengan QRIS, lalu unggah bukti. Admin akan memverifikasi pembayaran sebelum kredit ditambahkan. Perpanjangan paket bulanan dilakukan manual.</p></div>
        <div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl border border-white/10 px-4 py-2"><strong className="block text-xl text-amber-200">{catalog?.wallet.monthly_credits ?? 0}</strong><span className="text-[11px] text-gray-400">kredit bulanan</span></div><div className="rounded-xl border border-white/10 px-4 py-2"><strong className="block text-xl text-amber-200">{catalog?.wallet.topup_credits ?? 0}</strong><span className="text-[11px] text-gray-400">kredit refill</span></div></div>
      </div>
      {catalog?.wallet.subscription_status === 'active' && <p className="mt-3 text-xs text-emerald-300">Paket bulanan aktif sampai {catalog.wallet.period_end ? new Date(catalog.wallet.period_end).toLocaleDateString('id-ID') : 'akhir periode'} · perpanjangan manual melalui QRIS.</p>}
      {catalog?.orders.length ? <div className="mt-4 space-y-2">{catalog.orders.filter((order)=>order.payment_type==='manual_qris'&&(order.status==='pending'||order.status==='rejected')).map((order)=><div key={order.id} className={`rounded-lg border p-3 text-xs ${order.status==='rejected'?'border-red-300/30 bg-red-300/[.06] text-red-100':'border-amber-300/30 bg-amber-300/[.05] text-amber-100'}`}><strong>{order.status==='rejected'?'Pembayaran ditolak':'Bukti pembayaran menunggu verifikasi'}</strong><p className="mt-1">Referensi {order.midtrans_order_id} · Rp {Number(order.amount_idr).toLocaleString('id-ID')}. {order.payment_review_note||'Kredit akan ditambahkan setelah admin menyetujui bukti transfer.'}</p></div>)}</div>:null}
      {catalogError && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs text-amber-200">{catalogError}</p>}
      {catalog && !catalog.creditRateReady && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs text-amber-200">Harga belum tersedia. Admin perlu mengatur secret MESHY_CREDIT_COST_IDR berdasarkan biaya aktual kredit Meshy.</p>}
      {catalog && !catalog.qrisImageUrl && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs text-amber-200">QRIS belum tersedia. Admin perlu mengunggah QRIS aktif melalui menu QRIS AI Spin.</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{catalog?.packages.map((pkg) => <article key={pkg.id} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
        <div className="flex items-start justify-between gap-2"><div><h3 className="font-medium text-white">{pkg.name}</h3><p className="mt-1 text-xs text-gray-400">{pkg.generations} model 3D {pkg.package_type==='monthly'?'per bulan':'sekali isi'}</p></div><span className="rounded-full bg-amber-300/10 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-200">{pkg.package_type==='monthly'?'bulanan':'refill'}</span></div>
        <p className="mt-3 text-lg font-semibold text-amber-200">{pkg.price_idr ? `Rp ${pkg.price_idr.toLocaleString('id-ID')}` : 'Harga belum diatur'}</p>
        {pkg.price_idr && <p className="mt-1 text-[11px] text-gray-500">Termasuk biaya AI Rp {pkg.provider_cost_idr?.toLocaleString('id-ID')} + bagian Renmoku Rp {pkg.renmoku_share_idr?.toLocaleString('id-ID')}</p>}
        <button disabled={Boolean(checkoutBusy)||!catalog?.qrisImageUrl||!pkg.price_idr} onClick={() => { setManualPackageId(pkg.id); setProofFile(null); }} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300/30 px-3 py-2.5 text-sm text-amber-100 hover:bg-amber-300/10 disabled:opacity-40"><QrCode className="h-4 w-4"/>Bayar via QRIS</button>
      </article>)}</div>
      {manualPackageId && catalog?.qrisImageUrl && <div className="mt-5 rounded-xl border border-amber-300/20 bg-black/20 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-white">Pembayaran QRIS · {catalog.packages.find((pkg)=>pkg.id===manualPackageId)?.name}</h3><p className="mt-1 text-sm text-amber-100">Total Rp {catalog.packages.find((pkg)=>pkg.id===manualPackageId)?.price_idr?.toLocaleString('id-ID')}</p></div><button onClick={()=>setManualPackageId('')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300">Tutup</button></div><div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-center"><img src={catalog.qrisImageUrl} alt="QRIS pembayaran AI Spin Renmoku" className="mx-auto max-h-56 w-full max-w-56 rounded-lg bg-white object-contain p-2"/><div><p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">{catalog.qrisInstructions}</p><label className="mt-4 block text-sm font-medium text-gray-200">Bukti pembayaran <span className="font-normal text-gray-500">(JPG, PNG, WebP · maksimal 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event)=>setProofFile(event.target.files?.[0]??null)} className="mt-2 block w-full rounded-lg border border-white/10 bg-white/[.03] p-2 text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-300 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-stone-900"/></label><button disabled={!proofFile||Boolean(checkoutBusy)} onClick={()=>void submitManualPayment()} className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-semibold text-stone-900 disabled:opacity-45">{checkoutBusy?<><Loader2 className="h-4 w-4 animate-spin"/>Mengirim bukti…</>:<><Upload className="h-4 w-4"/>Kirim bukti pembayaran</>}</button></div></div></div>}
    </section>
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111315]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><Rotate3D className="h-5 w-5 text-amber-300"/>Studio Spin 360°</h2><p className="mt-1 text-sm text-gray-400">Susun foto mengelilingi kendaraan, pratinjau showroom, dan ekspor video spin.</p></div>{selected && <label className="text-sm text-gray-400">Kendaraan<select disabled={generating || saving} value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="ml-2 max-w-[240px] rounded-lg border border-white/10 bg-[#1a1c1e] px-3 py-2 text-white disabled:opacity-50">{vehicles.map((vehicle) => <option key={`${vehicle.source}-${vehicle.id}`} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.year}){vehicle.source === 'submission' ? ' · Pengajuan' : ''}</option>)}</select></label>}</header>
      {loading ? <div className="p-12 text-center text-sm text-gray-400">Memuat kendaraan…</div> : error ? <div className="p-6 text-sm text-amber-200">{error}</div> : !selected ? <div className="p-10 text-center"><Clapperboard className="mx-auto mb-3 h-9 w-9 text-gray-500"/><p className="font-medium text-white">Belum ada foto kendaraan</p><p className="mt-1 text-sm text-gray-400">Unggah foto kendaraan saat mengajukan kendaraan rental; foto eksteriornya akan muncul di sini.</p></div> : <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-white/10 p-4 sm:p-6 xl:border-b-0 xl:border-r">
          <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { dragX.current = null; }} className="relative isolate flex aspect-video min-h-[280px] touch-pan-y select-none items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#17191b]" aria-label="Pratinjau spin kendaraan; geser ke kiri atau kanan untuk memutar">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_32%,rgba(230,230,223,.35),transparent_50%),linear-gradient(180deg,#292c30_0%,#17191c_64%,#323538_65%,#151719_100%)]"/><div className="absolute bottom-[16%] left-[10%] right-[10%] h-[12%] rounded-[50%] border border-white/10 bg-black/15 shadow-[0_15px_30px_rgba(0,0,0,.35)]"/>
            {frames[frameIndex] ? <img src={frames[frameIndex].src} alt={`${selected.brand} ${selected.model}, frame ${frameIndex + 1}`} draggable={false} className="relative z-10 max-h-[84%] max-w-[86%] object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,.7)]"/> : <div className="z-10 text-center text-gray-400"><Upload className="mx-auto mb-2 h-8 w-8"/><p className="text-sm">Unggah beberapa sudut kendaraan untuk memulai</p></div>}
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-white/80"><MoveHorizontal className="h-3.5 w-3.5 text-amber-300"/>GESER UNTUK MEMUTAR</div>
            {frames.length > 0 && <span className="absolute bottom-3 right-3 z-20 rounded-md bg-black/60 px-2 py-1 text-xs text-white/70">{frameIndex + 1} / {frames.length}</span>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={() => setPlaying((value) => !value)} disabled={frames.length < 2} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white disabled:opacity-40"><Play className="h-4 w-4 text-amber-300"/>{playing ? 'Jeda putaran' : 'Putar otomatis'}</button><input type="range" min={0} max={Math.max(0, frames.length - 1)} value={frameIndex} onChange={(event) => { setPlaying(false); setFrameIndex(Number(event.target.value)); }} aria-label="Sudut putaran kendaraan" className="min-w-[120px] flex-1 accent-amber-400"/><span className="min-w-12 text-right text-xs tabular-nums text-gray-400">{frames.length ? Math.round(frameIndex / frames.length * 360) : 0}°</span></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium text-white">Urutan foto</h3><p className="mt-1 text-xs text-gray-500">Unggah setidaknya 4 sudut berurutan. Lebih banyak frame membuat putaran lebih halus.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"><Upload className="h-4 w-4 text-amber-300"/>Tambah foto<input type="file" accept="image/*" multiple onChange={addFiles} className="sr-only"/></label></div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">{frames.map((frame, index) => <div key={frame.key} className={`group relative overflow-hidden rounded-lg border ${index === frameIndex ? 'border-amber-300' : 'border-white/10'}`}><button onClick={() => { setPlaying(false); setFrameIndex(index); }} className="block w-full"><img src={frame.src} alt={`Frame ${index + 1}`} className="aspect-[4/3] w-full object-cover"/><span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">{index + 1}</span></button><div className="absolute right-1 top-1 flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"><button onClick={() => moveFrame(index, -1)} disabled={index === 0} aria-label="Geser frame ke kiri" className="rounded bg-black/75 px-1.5 text-xs text-white disabled:opacity-30">‹</button><button onClick={() => moveFrame(index, 1)} disabled={index === frames.length - 1} aria-label="Geser frame ke kanan" className="rounded bg-black/75 px-1.5 text-xs text-white disabled:opacity-30">›</button><button onClick={() => removeFrame(index)} aria-label="Hapus frame" className="rounded bg-black/75 p-1 text-white"><X className="h-3 w-3"/></button></div></div>)}</div>
        </div>
        <aside className="space-y-5 p-4 sm:p-6"><AiSpinJobPanel selected={selected} jobs={catalog?.jobs ?? []} credits={(catalog?.wallet.monthly_credits ?? 0) + (catalog?.wallet.topup_credits ?? 0)} generating={generating} onGenerate={() => void generateModel()} onSync={(jobId) => void syncModelJob(jobId)} onSave={(jobId,makePublic) => void saveModelReview(jobId,makePublic)} vehicles={vehicles}/><section><h3 className="flex items-center gap-2 font-medium text-white"><Film className="h-4 w-4 text-amber-300"/>Ekspor video putaran</h3><p className="mt-2 text-sm leading-6 text-gray-400">Buat video showroom WebM dari urutan foto. Setiap foto menjadi frame sudut kendaraan; hasilnya bukan model 3D volumetrik.</p>{videoUrl && <video src={videoUrl} controls className="mt-4 aspect-video w-full rounded-lg border border-white/10 bg-black"/>}{selected.spin_video_url && <a href={selected.spin_video_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-amber-200 underline">Buka video tersimpan</a>}<button disabled={generating || frames.length < 4} onClick={() => void createVideo()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-[#171614] disabled:cursor-not-allowed disabled:opacity-45">{generating ? <><Loader2 className="h-4 w-4 animate-spin"/>Membuat & menyimpan…</> : <><Clapperboard className="h-4 w-4"/>Buat video spin</>}</button>{videoUrl && <a href={videoUrl} download={`${selected.brand}-${selected.model}-spin360.webm`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-200"><Download className="h-4 w-4"/>Unduh WebM</a>}</section><div className="border-t border-white/10 pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-white">Simpan urutan foto</h3><p className="mt-1 text-xs text-gray-500">{saving ? savingProgress : 'Frame bisa dipakai lagi saat studio dibuka kembali.'}</p></div><button disabled={saving || frames.length < 4} onClick={() => void saveFrames()} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white disabled:opacity-40">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Simpan</button></div><p className="mt-4 text-[11px] leading-5 text-gray-500">Untuk hasil spin yang mulus, ambil foto pada ketinggian dan jarak yang sama sambil mengelilingi mobil dengan interval sudut yang konsisten.</p></div></aside>
      </div>}
    </section>
  </div>;
}

function AiSpinJobPanel({ selected, jobs, credits, generating, onGenerate, onSync, onSave, vehicles }: {
  selected: SpinVehicle | undefined;
  jobs: SpinCatalog['jobs'];
  credits: number;
  generating: boolean;
  onGenerate: () => void;
  onSync: (jobId: string) => void;
  onSave: (jobId: string, makePublic: boolean) => void;
  vehicles: SpinVehicle[];
}) {
  return <div className="space-y-4">
    <section className="rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4">
      <h3 className="flex items-center gap-2 font-medium text-white"><Sparkles className="h-4 w-4 text-amber-300"/>Buat model 3D AI (GLB)</h3>
      <p className="mt-2 text-xs leading-5 text-gray-400">AI membentuk model 3D perkiraan dari foto tampak depan, samping, dan belakang. Tinjau model sebelum disimpan atau ditayangkan.</p>
      <button disabled={generating || !selected || selected.source!=='submission' || (selected.images?.length??0)<2 || credits<1} onClick={onGenerate} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-300 px-3 py-2.5 text-sm font-semibold text-stone-900 disabled:opacity-40">
        {generating?<><Loader2 className="h-4 w-4 animate-spin"/>Mengirim ke AI…</>:<><Sparkles className="h-4 w-4"/>Hasilkan model · 1 kredit</>}
      </button>
      {selected?.source!=='submission'&&<p className="mt-2 text-[11px] text-amber-200">Pilih pengajuan kendaraan untuk membuat model.</p>}
      {credits<1&&<p className="mt-2 text-[11px] text-amber-200">Kredit habis. Pilih paket bulanan atau refill di atas.</p>}
    </section>
    {jobs.length>0&&<section className="space-y-3"><h3 className="font-medium text-white">Model AI & tinjauan</h3>{jobs.map((job)=>{
      const vehicle=vehicles.find((item)=>item.id===job.submission_id&&item.source==='submission');
      return <article key={job.id} className="rounded-xl border border-white/10 p-3">
        <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-white">{vehicle?`${vehicle.brand} ${vehicle.model}`:'Kendaraan'}</p><p className="mt-1 text-xs text-gray-400">{job.status==='processing'?'Sedang dibuat':job.status==='review'?'Siap ditinjau':job.status==='published'?'Disimpan untuk tayang':job.status==='failed'?'Gagal':'Menunggu'}{job.error_message?` · ${job.error_message}`:''}</p></div>{job.status==='processing'&&<button onClick={()=>onSync(job.id)} className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300">Periksa</button>}</div>
        {(job.status==='review'||job.status==='published')&&job.model_path&&<><VehicleModelViewer src={job.model_path} title={vehicle?`${vehicle.brand} ${vehicle.model}`:'Model kendaraan'} className="mt-3 h-52"/><p className="mt-2 text-[11px] text-gray-400">Kendaraan perlu disetujui admin agar model tampil di publik.</p><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={()=>onSave(job.id,false)} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-gray-200">Simpan pribadi</button><button disabled={vehicle?.submissionStatus!=='APPROVED'} onClick={()=>onSave(job.id,true)} className="rounded-lg bg-amber-300 px-2 py-2 text-xs font-semibold text-stone-900 disabled:cursor-not-allowed disabled:opacity-40">Simpan & tayangkan</button></div></>}
      </article>;
    })}</section>}
  </div>;
}
