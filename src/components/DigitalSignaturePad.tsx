import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Eraser, Maximize2, PenTool, Save, X } from 'lucide-react';
import { toast } from 'sonner';

function requestLandscapeLock() {
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
    const request = orientation?.lock?.('landscape');
    if (request) void request.catch(() => undefined);
  } catch { /* CSS landscape fallback covers browsers that reject orientation locking. */ }
}

export default function DigitalSignaturePad({ value, onChange }: { value: string; onChange: (signatureDataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [open, setOpen] = useState(false);
  const [hasInk, setHasInk] = useState(Boolean(value));

  useEffect(() => {
    if (!open) return;
    requestLandscapeLock();
    return () => { try { (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.(); } catch { /* Optional browser API. */ } };
  }, [open]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!; const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (!canvas || !context) return;
    event.currentTarget.setPointerCapture(event.pointerId); drawing.current = true;
    const p = point(event); context.beginPath(); context.moveTo(p.x,p.y); context.lineWidth=4; context.lineCap='round'; context.lineJoin='round'; context.strokeStyle='#cda34f';
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas=canvasRef.current; const context=canvas?.getContext('2d'); if (!canvas || !context) return;
    const p=point(event); context.lineTo(p.x,p.y); context.stroke(); setHasInk(true);
  };
  const reset = () => { const canvas=canvasRef.current; if (canvas) canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height); setHasInk(false); };
  const save = () => {
    if (!hasInk || !canvasRef.current) return toast.error('Bubuhkan tanda tangan terlebih dahulu.');
    onChange(canvasRef.current.toDataURL('image/png')); setOpen(false); toast.success('Tanda tangan disimpan. Anda kembali ke halaman kontrak penyewa.');
  };
  const beginSigning = () => {
    reset();
    requestLandscapeLock();
    setOpen(true);
  };

  return <>
    <div className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><PenTool className="h-4 w-4 text-yellow-300"/><div><p className="text-sm font-medium text-white">Tanda tangan digital penyewa</p><p className="text-xs text-gray-500">{value ? 'Tersimpan dan siap dilampirkan ke perjanjian.' : 'Tanda tangani dengan jari atau stylus pada layar landscape.'}</p></div></div><button type="button" onClick={beginSigning} className="inline-flex items-center gap-2 rounded-lg border border-yellow-400/25 px-3 py-2 text-sm text-yellow-100 hover:bg-yellow-400/5"><Maximize2 className="h-4 w-4"/>{value ? 'Ubah tanda tangan' : 'Mulai tanda tangan'}</button></div>{value && <div className="mt-3 rounded-lg border border-white/5 bg-white p-2"><img src={value} alt="Pratinjau tanda tangan digital" className="h-16 max-w-full object-contain"/></div>}</div>
    {open && <div className="digital-signature-screen fixed inset-0 z-[120] flex min-h-screen flex-col bg-[#11100e] p-3 sm:p-5" role="dialog" aria-modal="true" aria-label="Tanda tangan digital dalam mode landscape">
      <header className="flex shrink-0 items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-base font-semibold text-white sm:text-lg"><PenTool className="h-5 w-5 text-yellow-300"/>Tanda tangan perjanjian sewa</h2><p className="text-xs text-gray-500">Putar perangkat ke posisi horizontal, lalu tanda tangani di area berikut.</p></div><button onClick={() => setOpen(false)} aria-label="Tutup tanda tangan" className="rounded-lg border border-white/10 p-2 text-gray-300"><X className="h-4 w-4"/></button></header>
      <div className="my-3 flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-yellow-400/30 bg-[#191815] p-2 sm:p-4"><canvas ref={canvasRef} width={1600} height={650} onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current=false; }} onPointerCancel={() => { drawing.current=false; }} className="h-full max-h-full w-full touch-none rounded-lg bg-white/[0.015]" aria-label="Area tanda tangan digital"/></div>
      <footer className="flex shrink-0 items-center justify-between gap-3"><p className="text-xs text-gray-500">{hasInk ? 'Tanda tangan sudah digambar.' : 'Area masih kosong.'}</p><div className="flex gap-2"><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-gray-200"><Eraser className="h-4 w-4"/>Reset</button><button type="button" onClick={save} disabled={!hasInk} className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40"><Save className="h-4 w-4"/>Simpan & kembali</button></div></footer>
    </div>}
  </>;
}
