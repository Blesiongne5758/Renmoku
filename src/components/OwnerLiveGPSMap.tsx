import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, LocateFixed, MapPin, Navigation, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';
import { getRuntimeSettings } from '../services/runtimeSettingsService';

declare global { interface Window { L?: any } }

type LivePosition = { vehicle_id: string; latitude: number; longitude: number; speed: number | null; heading: number | null; recorded_at: string; vehicleName: string };

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise<any>((resolve, reject) => {
    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet tidak tersedia')), { once: true });
      existing.addEventListener('error', () => reject(new Error('Leaflet gagal dimuat')), { once: true });
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link'); css.id = 'leaflet-css'; css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
    }
    const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet tidak tersedia'));
    script.onerror = () => reject(new Error('Leaflet gagal dimuat'));
    document.body.appendChild(script);
  });
}

export default function OwnerLiveGPSMap() {
  const { currentUser } = useAppStore();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const boundsSignatureRef = useRef('');
  const [positions, setPositions] = useState<LivePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapError, setMapError] = useState('');
  const [connected, setConnected] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError('');
    const { data: ownerRows, error: ownerError } = await supabase.from('owners').select('id').eq('user_id', currentUser.id);
    if (ownerError) { setError('Data pemilik rental gagal dimuat.'); setLoading(false); return; }
    const ownerIds = (ownerRows ?? []).map((row: { id: string }) => row.id);
    if (ownerIds.length === 0) { setPositions([]); setLoading(false); return; }
    const { data: vehicleRows, error: vehicleError } = await supabase.from('vehicles').select('id,brand,model,owner_id').in('owner_id', ownerIds);
    if (vehicleError) { setError('Daftar kendaraan gagal dimuat.'); setLoading(false); return; }
    const vehicles = (vehicleRows ?? []) as Array<{ id: string; brand: string; model: string; owner_id: string }>;
    if (!vehicles.length) { setPositions([]); setLoading(false); return; }
    const { data: locationRows, error: locationError } = await supabase.from('vehicle_gps_locations').select('vehicle_id,latitude,longitude,speed,heading,recorded_at').in('vehicle_id', vehicles.map((vehicle) => vehicle.id));
    if (locationError) { setError('Lokasi GPS live belum tersedia. Jalankan migrasi GPS dan sambungkan perangkat GPS kendaraan.'); setPositions([]); setLoading(false); return; }
    const byVehicle = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    const latest = new Map<string, LivePosition>();
    for (const row of (locationRows ?? []) as Array<Omit<LivePosition, 'vehicleName'>>) {
      const vehicle = byVehicle.get(row.vehicle_id);
      if (!vehicle || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude))) continue;
      const previous = latest.get(row.vehicle_id);
      if (!previous || row.recorded_at > previous.recorded_at) latest.set(row.vehicle_id, { ...row, vehicleName: `${vehicle.brand} ${vehicle.model}` });
    }
    setPositions([...latest.values()].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at)));
    setLoading(false);
  }, [currentUser?.id]);

  useEffect(() => { void loadPositions(); }, [loadPositions]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase.channel(`owner-live-gps-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_gps_locations' }, () => { void loadPositions(); })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));
    return () => { void supabase.removeChannel(channel); setConnected(false); };
  }, [currentUser?.id, loadPositions]);

  useEffect(() => {
    let active = true;
    let resize: (() => void) | undefined;
    void Promise.all([loadLeaflet(), getRuntimeSettings()]).then(([L, config]) => {
      if (!active || !mapContainer.current) return;
      const map = L.map(mapContainer.current, { scrollWheelZoom: true }).setView([-2.5, 118], 5);
      const tileUrl = config.map_tile_url.replace(/\{apiKey\}/g, encodeURIComponent(config.map_api_key));
      L.tileLayer(tileUrl, { maxZoom: 19, attribution: config.map_attribution }).addTo(map);
      markersRef.current = L.featureGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
      resize = () => map.invalidateSize(); window.addEventListener('resize', resize); window.setTimeout(resize, 100);
    }).catch(() => setMapError('Layer peta tidak dapat dimuat. Periksa koneksi atau pengaturan peta admin.'));
    return () => { active = false; if (resize) window.removeEventListener('resize', resize); mapRef.current?.remove(); mapRef.current = null; markersRef.current = null; };
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !markersRef.current || !mapReady) return;
    markersRef.current.clearLayers();
    const bounds: [number, number][] = [];
    for (const position of positions) {
      const coordinate: [number, number] = [Number(position.latitude), Number(position.longitude)]; bounds.push(coordinate);
      const age = Date.now() - new Date(position.recorded_at).getTime();
      const fresh = age <= 5 * 60_000;
      const popup = document.createElement('div');
      const vehicleName = document.createElement('strong'); vehicleName.textContent = position.vehicleName;
      const speed = document.createElement('div'); speed.textContent = `${Number(position.speed ?? 0).toFixed(0)} km/jam`;
      const timestamp = document.createElement('div'); timestamp.textContent = new Date(position.recorded_at).toLocaleString('id-ID');
      popup.append(vehicleName, speed, timestamp);
      L.circleMarker(coordinate, { radius: selected === position.vehicle_id ? 10 : 7, color: fresh ? '#34d399' : '#fbbf24', fillColor: fresh ? '#34d399' : '#fbbf24', fillOpacity: .9, weight: 2 })
        .bindPopup(popup)
        .on('click', () => setSelected(position.vehicle_id)).addTo(markersRef.current);
    }
    const boundsSignature = bounds.map(([lat, lng]) => `${lat},${lng}`).join('|');
    if (bounds.length && boundsSignature !== boundsSignatureRef.current) {
      mapRef.current?.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
      boundsSignatureRef.current = boundsSignature;
    }
  }, [positions, selected, mapReady, now]);

  const onlineCount = useMemo(() => positions.filter((position) => now - new Date(position.recorded_at).getTime() <= 5 * 60_000).length, [positions, now]);
  const focusVehicle = (vehicleId: string) => {
    setSelected(vehicleId);
    const position = positions.find((item) => item.vehicle_id === vehicleId);
    if (position) mapRef.current?.setView([position.latitude, position.longitude], 15, { animate: true });
  };

  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111315]">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin className="h-5 w-5 text-emerald-300"/>Peta GPS armada</h2><p className="mt-1 text-sm text-gray-400">Semua kendaraan pemilik rental dengan koordinat terbaru</p></div><div className="flex items-center gap-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${connected ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-gray-400'}`}>{connected ? <Wifi className="h-3.5 w-3.5"/> : <WifiOff className="h-3.5 w-3.5"/>}{connected ? 'Live tersambung' : 'Realtime terputus'}</span><button onClick={() => void loadPositions()} className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5" aria-label="Muat ulang lokasi"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/></button></div></header>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="relative min-h-[360px] lg:min-h-[500px]"><div ref={mapContainer} className="absolute inset-0 z-0 bg-[#172127]" role="application" aria-label="Peta live lokasi armada rental"/>{mapError && <div className="absolute inset-0 z-10 grid place-items-center bg-[#141414] p-6 text-center text-sm text-gray-300">{mapError}</div>}<div className="absolute left-3 top-3 z-[400] flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a]/90 px-3 py-2 text-xs text-gray-200"><Activity className="h-4 w-4 text-emerald-300"/>{onlineCount} aktif · {positions.length} terlacak</div></div>
      <aside className="border-t border-white/10 lg:border-l lg:border-t-0"><div className="flex items-center justify-between px-4 py-3"><h3 className="text-sm font-semibold text-white">Kendaraan terlacak</h3><button onClick={() => { const all = positions.map((position) => [position.latitude, position.longitude]); if (all.length) mapRef.current?.fitBounds(all, { padding: [36, 36], maxZoom: 13 }); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"><LocateFixed className="h-3.5 w-3.5"/>Semua</button></div><div className="max-h-[440px] overflow-y-auto border-t border-white/5">
        {loading && positions.length === 0 && <p className="p-5 text-sm text-gray-400">Memuat data armada…</p>}{error && <p className="p-4 text-sm text-amber-200">{error}</p>}{!loading && !error && positions.length === 0 && <div className="p-5"><p className="text-sm text-gray-300">Belum ada titik GPS masuk.</p><p className="mt-2 text-xs leading-5 text-gray-500">Kendaraan akan muncul setelah perangkat mengirim koordinat ke tabel GPS. Lokasi contoh tidak ditampilkan.</p></div>}
        {positions.map((position) => { const fresh = now - new Date(position.recorded_at).getTime() <= 5 * 60_000; return <button key={position.vehicle_id} onClick={() => focusVehicle(position.vehicle_id)} className={`w-full border-b border-white/5 p-4 text-left transition hover:bg-white/[0.04] ${selected === position.vehicle_id ? 'bg-white/[0.05]' : ''}`}><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium text-white">{position.vehicleName}</span><span className={`h-2 w-2 shrink-0 rounded-full ${fresh ? 'bg-emerald-400' : 'bg-amber-400'}`}/></span><span className="mt-2 flex items-center gap-2 text-xs text-gray-400"><Navigation className="h-3.5 w-3.5 text-gray-500"/>{Number(position.speed ?? 0).toFixed(0)} km/jam · {fresh ? 'Baru saja' : new Date(position.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></button>; })}
      </div><p className="border-t border-white/5 p-3 text-[11px] leading-4 text-gray-500">Status aktif berdasarkan pembaruan dalam 5 menit terakhir.</p></aside>
    </div>
  </section>;
}
