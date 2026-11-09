import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Clapperboard, Download, Film, Loader2, MoveHorizontal, Play, Rotate3D, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { cloudinaryHelpers } from '../lib/cloudinary';
import { useAppStore } from '../stores/useAppStore';

type SpinVehicle = { id: string; source: 'vehicle' | 'submission'; brand: string; model: string; year: number; images: string[] | null; photoPaths?: Record<string, string> | null; spin_frames: string[] | null; spin_video_url: string | null };
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
  const dragX = useRef<number | null>(null);
  const videoCanvas = useRef<HTMLCanvasElement | null>(null);
  const frameUrls = useRef<string[]>([]);
  const videoObjectUrl = useRef('');

  const selected = vehicles.find((vehicle) => vehicle.id === selectedId);

  const loadVehicles = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const { data: ownerRows, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id);
    if (ownerError) { setError('Data pemilik tidak dapat dimuat.'); setLoading(false); return; }
    const ownerIds = (ownerRows ?? []).map((owner: { id: string }) => owner.id);
    if (!ownerIds.length) { setVehicles([]); setLoading(false); return; }
    const [{ data, error: vehicleError }, { data: submissions, error: submissionError }] = await Promise.all([
      supabase.from('vehicles').select('id,brand,model,year,images,spin_frames,spin_video_url').in('owner_id', ownerIds).order('created_at', { ascending: false }),
      supabase.from('owner_vehicle_submissions').select('id,brand,model,year,vehicle_photos,spin_frames,spin_video_url').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]);
    if (vehicleError) { setError('Daftar kendaraan gagal dimuat.'); setLoading(false); return; }
    if (submissionError) { setError('Foto pengajuan kendaraan gagal dimuat. Pastikan migrasi owner_features.sql sudah diterapkan.'); setLoading(false); return; }
    const nextVehicles = ((data ?? []) as Omit<SpinVehicle, 'source'>[]).map((vehicle) => ({ ...vehicle, source: 'vehicle' as const }));
    const submissionsWithExteriorPhotos = ((submissions ?? []) as Array<Omit<SpinVehicle, 'source' | 'images'> & { vehicle_photos: Record<string, string> }>).filter((submission) => Object.keys(submission.vehicle_photos ?? {}).length > 0);
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
          const result = await cloudinaryHelpers.uploadImage(file, `vehicles/${selected.id}/spin360`);
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

  const onPointerDown = (event: React.PointerEvent) => { dragX.current = event.clientX; setPlaying(false); event.currentTarget.setPointerCapture(event.pointerId); };
  const onPointerMove = (event: React.PointerEvent) => {
    if (dragX.current === null || frames.length < 2) return;
    const delta = event.clientX - dragX.current;
    if (Math.abs(delta) > 12) { setFrameIndex((index) => (index + (delta > 0 ? frames.length - 1 : 1)) % frames.length); dragX.current = event.clientX; }
  };

  return <div className="space-y-5">
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
        <aside className="space-y-5 p-4 sm:p-6"><section><h3 className="flex items-center gap-2 font-medium text-white"><Film className="h-4 w-4 text-amber-300"/>Ekspor video putaran</h3><p className="mt-2 text-sm leading-6 text-gray-400">Buat video showroom WebM dari urutan foto. Setiap foto menjadi frame sudut kendaraan; hasilnya bukan model 3D volumetrik.</p>{videoUrl && <video src={videoUrl} controls className="mt-4 aspect-video w-full rounded-lg border border-white/10 bg-black"/>}{selected.spin_video_url && <a href={selected.spin_video_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-amber-200 underline">Buka video tersimpan</a>}<button disabled={generating || frames.length < 4} onClick={() => void createVideo()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-[#171614] disabled:cursor-not-allowed disabled:opacity-45">{generating ? <><Loader2 className="h-4 w-4 animate-spin"/>Membuat & menyimpan…</> : <><Clapperboard className="h-4 w-4"/>Buat video spin</>}</button>{videoUrl && <a href={videoUrl} download={`${selected.brand}-${selected.model}-spin360.webm`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-200"><Download className="h-4 w-4"/>Unduh WebM</a>}</section><div className="border-t border-white/10 pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-white">Simpan urutan foto</h3><p className="mt-1 text-xs text-gray-500">{saving ? savingProgress : 'Frame bisa dipakai lagi saat studio dibuka kembali.'}</p></div><button disabled={saving || frames.length < 4} onClick={() => void saveFrames()} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white disabled:opacity-40">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Simpan</button></div><p className="mt-4 text-[11px] leading-5 text-gray-500">Untuk hasil spin yang mulus, ambil foto pada ketinggian dan jarak yang sama sambil mengelilingi mobil dengan interval sudut yang konsisten.</p></div></aside>
      </div>}
    </section>
  </div>;
}
