import { useEffect, useRef } from 'react';
import { Box, ExternalLink } from 'lucide-react';

type Props = { src: string; title: string; className?: string };

export default function VehicleModelViewer({ src, title, className = '' }: Props) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    if (!customElements.get('model-viewer') && !document.querySelector('script[data-renmoku-model-viewer]')) {
      const viewerScript = document.createElement('script');
      viewerScript.type = 'module';
      viewerScript.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      viewerScript.dataset.renmokuModelViewer = 'true';
      document.head.appendChild(viewerScript);
    }
    const model = document.createElement('model-viewer');
    model.setAttribute('src', src);
    model.setAttribute('alt', `Model 3D ${title}`);
    model.setAttribute('camera-controls', '');
    model.setAttribute('auto-rotate', '');
    model.setAttribute('rotation-per-second', '18deg');
    model.setAttribute('shadow-intensity', '0.9');
    model.setAttribute('environment-image', 'neutral');
    model.style.width = '100%';
    model.style.height = '100%';
    model.style.backgroundColor = 'transparent';
    host.current.replaceChildren(model);
    return () => model.remove();
  }, [src, title]);

  return <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-stone-200 via-stone-100 to-stone-300 ${className}`}>
    <div ref={host} className="h-full min-h-64 w-full" aria-label={`Pratinjau model 3D ${title}`} />
    <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-stone-700 shadow"><Box className="h-3.5 w-3.5"/>Model 3D · seret untuk memutar</div>
    <a href={src} target="_blank" rel="noreferrer" className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/85 px-2.5 py-1.5 text-xs text-stone-700 shadow hover:bg-white"><ExternalLink className="h-3.5 w-3.5"/>Buka GLB</a>
  </div>;
}
