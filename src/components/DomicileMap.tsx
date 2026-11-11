import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Layers, MapPin, ZoomIn, ZoomOut } from 'lucide-react';

declare global {
  interface Window {
    L?: any;
  }
}

interface DomicileMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  className?: string;
  readOnly?: boolean;
}

function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet gagal dimuat')), { once: true });
      existing.addEventListener('error', () => reject(new Error('Leaflet CDN tidak tersedia')), { once: true });
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet gagal dimuat')));
    script.onerror = () => reject(new Error('Leaflet CDN tidak tersedia'));
    document.body.appendChild(script);
  });
}

export default function DomicileMap({ latitude, longitude, onChange, className = '', readOnly = false }: DomicileMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Default coordinate if none provided (Jakarta Center)
  const defaultLat = -6.2088;
  const defaultLng = 106.8456;
  const currentLat = latitude ?? defaultLat;
  const currentLng = longitude ?? defaultLng;
  const hasCoordinates = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  useEffect(() => {
    let active = true;
    let resizeTimer: number;

    loadLeaflet()
      .then((L) => {
        if (!active || !containerRef.current) return;

        // Clean up previous instance if container was reused
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
          zoomControl: false,
        }).setView([currentLat, currentLng], hasCoordinates ? 15 : 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map);

        // Custom Gold Domicile Marker
        const domicileIcon = L.divIcon({
          className: 'custom-domicile-pin',
          html: `
            <div style="position: relative; width: 32px; height: 42px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
              <div style="width: 28px; height: 28px; background: #eab308; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
                <div style="width: 10px; height: 10px; background: #111827; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
              <div style="width: 8px; height: 8px; background: #ca8a04; border-radius: 50%; margin-top: 3px; opacity: 0.8;"></div>
            </div>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 40],
          popupAnchor: [0, -36],
        });

        if (hasCoordinates) {
          const marker = L.marker([latitude, longitude], {
            icon: domicileIcon,
            draggable: !readOnly,
          }).addTo(map);

          marker.bindPopup('<b>Lokasi Domisili Penyewa</b><br/><span style="font-size:11px;color:#666;">Titik koordinat verifikasi</span>');

          if (!readOnly && onChange) {
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onChange(Number(pos.lat.toFixed(7)), Number(pos.lng.toFixed(7)));
            });
          }

          markerRef.current = marker;
        }

        // Map Click to Set/Move Pin
        if (!readOnly && onChange) {
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            const fixedLat = Number(lat.toFixed(7));
            const fixedLng = Number(lng.toFixed(7));

            if (markerRef.current) {
              markerRef.current.setLatLng([fixedLat, fixedLng]);
            } else {
              const newMarker = L.marker([fixedLat, fixedLng], {
                icon: domicileIcon,
                draggable: !readOnly,
              }).addTo(map);

              newMarker.bindPopup('<b>Lokasi Domisili Penyewa</b><br/><span style="font-size:11px;color:#666;">Titik koordinat verifikasi</span>');

              newMarker.on('dragend', () => {
                const pos = newMarker.getLatLng();
                onChange(Number(pos.lat.toFixed(7)), Number(pos.lng.toFixed(7)));
              });

              markerRef.current = newMarker;
            }

            onChange(fixedLat, fixedLng);
          });
        }

        mapRef.current = map;
        setLoading(false);

        resizeTimer = window.setTimeout(() => {
          if (active && mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError('Peta OpenStreetMap belum dapat dimuat.');
        setLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(resizeTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker & view when props change
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    if (hasCoordinates) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        const domicileIcon = L.divIcon({
          className: 'custom-domicile-pin',
          html: `
            <div style="position: relative; width: 32px; height: 42px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
              <div style="width: 28px; height: 28px; background: #eab308; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
                <div style="width: 10px; height: 10px; background: #111827; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
              <div style="width: 8px; height: 8px; background: #ca8a04; border-radius: 50%; margin-top: 3px; opacity: 0.8;"></div>
            </div>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 40],
          popupAnchor: [0, -36],
        });

        const newMarker = L.marker([latitude, longitude], {
          icon: domicileIcon,
          draggable: !readOnly,
        }).addTo(mapRef.current);

        newMarker.bindPopup('<b>Lokasi Domisili Penyewa</b><br/><span style="font-size:11px;color:#666;">Titik koordinat verifikasi</span>');

        if (!readOnly && onChange) {
          newMarker.on('dragend', () => {
            const pos = newMarker.getLatLng();
            onChange(Number(pos.lat.toFixed(7)), Number(pos.lng.toFixed(7)));
          });
        }
        markerRef.current = newMarker;
      }

      mapRef.current.panTo([latitude, longitude], { animate: true, duration: 0.8 });
    }
  }, [latitude, longitude, hasCoordinates, readOnly, onChange]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const osmUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
    : `https://www.openstreetmap.org/#map=12/${currentLat}/${currentLng}`;

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#161a20] ${className}`}>
      {/* Map Canvas Container */}
      <div
        ref={containerRef}
        style={{ height: '250px', width: '100%' }}
        className="z-0 bg-[#141920]"
        role="application"
        aria-label="Peta koordinat domisili penyewa OpenStreetMap"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs text-xs text-gold-300">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-400 border-t-transparent"></span>
            Memuat peta OpenStreetMap…
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-4 text-center text-xs text-gray-300">
          <MapPin className="w-6 h-6 text-yellow-400 mb-1.5" />
          <p>{loadError}</p>
          {hasCoordinates && (
            <a
              href={osmUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-gold-400 hover:underline"
            >
              Buka titik koordinat di OpenStreetMap <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Controls Overlay */}
      {!loading && !loadError && (
        <>
          {/* Top Info Bar */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-wrap items-center gap-2">
            <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/80 px-2.5 py-1 text-[11px] font-medium text-gray-200 shadow-sm backdrop-blur-xs">
              <Layers className="h-3 w-3 text-gold-400" />
              OpenStreetMap
            </span>
            {hasCoordinates ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-950/70 px-2 py-0.5 text-[11px] font-mono text-emerald-300 backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {latitude}, {longitude}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-black/80 px-2 py-0.5 text-[11px] text-amber-300 backdrop-blur-xs">
                Klik pada peta untuk menentukan titik
              </span>
            )}
          </div>

          {/* Right Zoom Controls */}
          <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Perbesar peta"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-black/80 text-gray-200 hover:bg-black hover:text-white transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Perkecil peta"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-black/80 text-gray-200 hover:bg-black hover:text-white transition-colors"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom OpenStreetMap link */}
          <div className="absolute bottom-2 right-2.5 z-10">
            <a
              href={osmUrl}
              target="_blank"
              rel="noreferrer"
              title="Buka lokasi di OpenStreetMap"
              className="inline-flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] text-gray-400 hover:text-gold-300 transition-colors"
            >
              <span>OSM</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
