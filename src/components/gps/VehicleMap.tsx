import { useEffect, useRef, useState } from 'react';
import { Activity, MapPin, Navigation } from 'lucide-react';
import { useGPSTrackingStore } from '../../stores/useGPSTrackingStore';
import type { Geofence } from '../../stores/useGPSTrackingStore';
import { defaultRuntimeSettings, getRuntimeSettings } from '../../services/runtimeSettingsService';

declare global { interface Window { L?: any } }

interface VehicleMapProps { vehicleId: string; vehicleName: string; showGeofences?: boolean; height?: string; }

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
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet gagal dimuat'));
    script.onerror = () => reject(new Error('Leaflet CDN tidak tersedia'));
    document.body.appendChild(script);
  });
}

export default function VehicleMap({ vehicleId, vehicleName, showGeofences = true, height = '400px' }: VehicleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const fenceLayerRef = useRef<any>(null);
  const location = useGPSTrackingStore((state) => state.vehicleLocations[vehicleId]);
  const geofences = useGPSTrackingStore((state) => state.geofences);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    let active = true;
    let resizeListener: (() => void) | undefined;
    void Promise.all([loadLeaflet(), getRuntimeSettings().catch(() => defaultRuntimeSettings)]).then(([L, config]) => {
      if (!active || !containerRef.current) return;
      const initial = location ?? { lat: -6.2088, lng: 106.8456 };
      const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView([initial.lat, initial.lng], 14);
      const tileUrl = config.map_tile_url.replace(/\{apiKey\}/g, encodeURIComponent(config.map_api_key));
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: config.map_attribution || defaultRuntimeSettings.map_attribution,
      }).addTo(map);
      markerRef.current = L.circleMarker([initial.lat, initial.lng], { radius: 9, color: '#facc15', fillColor: '#facc15', fillOpacity: 1, weight: 3 }).addTo(map).bindPopup(vehicleName);
      fenceLayerRef.current = L.featureGroup().addTo(map);
      mapRef.current = map;
      resizeListener = () => map.invalidateSize();
      window.addEventListener('resize', resizeListener);
      window.setTimeout(resizeListener, 100);
    }).catch(() => setMapError('Peta belum bisa dimuat. Periksa koneksi internet dan konfigurasi tile peta di menu admin.'));
    return () => {
      active = false;
      if (resizeListener) window.removeEventListener('resize', resizeListener);
      mapRef.current?.remove();
      mapRef.current = null; markerRef.current = null; fenceLayerRef.current = null;
    };
  }, [vehicleId, vehicleName]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !location || !markerRef.current) return;
    markerRef.current.setLatLng([location.lat, location.lng]);
    markerRef.current.setPopupContent(`${vehicleName}<br/>${location.speed.toFixed(0)} km/jam`);
    mapRef.current.panTo([location.lat, location.lng], { animate: true, duration: 0.5 });
    const layer = fenceLayerRef.current;
    layer?.clearLayers();
    if (!showGeofences) return;
    geofences.filter((fence) => fence.isActive && fence.type === 'circle' && fence.center).forEach((fence: Geofence) => {
      L.circle([fence.center!.lat, fence.center!.lng], { radius: fence.radius ?? 100, color: fence.alertOnEnter ? '#f59e0b' : '#38bdf8', fillOpacity: 0.08 }).bindTooltip(fence.name).addTo(layer);
    });
  }, [location, geofences, showGeofences, vehicleName]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10">
      <div ref={containerRef} style={{ height }} className="z-0 w-full bg-[#18212a]" role="application" aria-label={`Peta lokasi ${vehicleName}`} />
      {mapError && <div className="absolute inset-0 z-[500] flex items-center justify-center bg-[#141414] p-6 text-center text-sm text-gray-300">{mapError}</div>}
      {!mapError && <><div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full border border-amber-300/20 bg-black/75 px-3 py-1.5 text-xs text-amber-100"><Activity className="h-3.5 w-3.5"/>SIMULASI · {vehicleName}</div>
        {location && <div className="pointer-events-none absolute bottom-3 right-3 z-[500] rounded-xl border border-white/10 bg-black/75 px-3 py-2"><div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-yellow-300"/><span className="font-semibold text-white">{location.speed.toFixed(0)}</span><span className="text-xs text-gray-300">km/jam</span></div><span className="mt-1 block text-[10px] text-gray-400"><MapPin className="mr-1 inline h-3 w-3"/>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span></div>}</>}
    </div>
  );
}
