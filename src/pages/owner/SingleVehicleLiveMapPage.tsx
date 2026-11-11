import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, Gauge, Power, AlertTriangle, Shield, MapPin, 
  Compass, Battery, Wifi, Activity, ArrowLeft, RefreshCw,
  Bell, CheckCircle2, XCircle, Sliders, Settings, Radio,
  Send, Users, PhoneCall, AlertOctagon, Share2, Eye, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useGPSTrackingStore } from '../../stores/useGPSTrackingStore';
import { defaultRuntimeSettings, getRuntimeSettings } from '../../services/runtimeSettingsService';
import gpsGatewayService, { GPSDeviceConfig, NearbyOwner, detectCityFromCoords } from '../../services/gpsGatewayService';
import { vehicles as mockVehicles } from '../../data/mockData';

declare global {
  interface Window {
    L?: any;
  }
}

interface SingleVehicleLiveMapPageProps {
  vehicleId: string;
  vehicleName?: string;
  onBack?: () => void;
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
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet gagal dimuat'));
    script.onerror = () => reject(new Error('Leaflet CDN tidak tersedia'));
    document.body.appendChild(script);
  });
}

export default function SingleVehicleLiveMapPage({
  vehicleId,
  vehicleName: initialName,
  onBack,
}: SingleVehicleLiveMapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const trailPolylineRef = useRef<any>(null);
  const geofenceCircleRef = useRef<any>(null);

  const [vehicleData, setVehicleData] = useState<{
    name: string;
    brand: string;
    model: string;
    license_plate: string;
    location: string;
    price_daily: number;
  }>({
    name: initialName || 'Kendaraan Armada',
    brand: 'Toyota',
    model: 'Innova Reborn',
    license_plate: 'B 1234 REN',
    location: 'DKI Jakarta',
    price_daily: 750000,
  });

  const [deviceConfig, setDeviceConfig] = useState<GPSDeviceConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [trailPositions, setTrailPositions] = useState<Array<[number, number]>>([]);

  // Telemetry state
  const [currentCoord, setCurrentCoord] = useState<{
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    timestamp: string;
  }>({
    lat: -6.2088,
    lng: 106.8456,
    speed: 0,
    heading: 0,
    timestamp: new Date().toISOString(),
  });

  const [isConnected, setIsConnected] = useState(false);
  const [mapError, setMapError] = useState('');
  const [activeTab, setActiveTab] = useState<'control' | 'panic' | 'settings'>('control');

  // Modals
  const [showCutOffModal, setShowCutOffModal] = useState(false);
  const [cutOffReason, setCutOffReason] = useState('Penyalahgunaan kendaraan / keluar batas aman');
  const [isProcessingCutOff, setIsProcessingCutOff] = useState(false);

  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicNotes, setPanicNotes] = useState('Kondisi darurat: Unit terindikasi dibawa tanpa izin.');
  const [isBroadcastingPanic, setIsBroadcastingPanic] = useState(false);
  const [panicResult, setPanicResult] = useState<{
    alertId: string;
    notifiedCount: number;
    nearbyOwners: NearbyOwner[];
  } | null>(null);

  // Settings form
  const [speedLimitInput, setSpeedLimitInput] = useState(100);
  const [pingIntervalInput, setPingIntervalInput] = useState(10);
  const [relaySupportedInput, setRelaySupportedInput] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // 1. Load vehicle details from Supabase / mockData
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('brand, model, location, price_daily')
          .eq('id', vehicleId)
          .maybeSingle();

        if (data && active) {
          setVehicleData({
            name: `${data.brand} ${data.model}`,
            brand: data.brand,
            model: data.model,
            license_plate: `B ${Math.floor(1000 + Math.random() * 8999)} ${data.brand.slice(0, 3).toUpperCase()}`,
            location: data.location || 'Jakarta',
            price_daily: Number(data.price_daily) || 750000,
          });
          return;
        }
      } catch {
        // ignore
      }

      // Fallback: mockData
      const found = mockVehicles.find((v) => v.id === vehicleId);
      if (found && active) {
        setVehicleData({
          name: found.name,
          brand: found.brand,
          model: found.name,
          license_plate: `B ${Math.floor(1000 + Math.random() * 8999)} RBO`,
          location: found.location || 'Jakarta',
          price_daily: found.pricePerDay || 750000,
        });
      }
    })();
    return () => { active = false; };
  }, [vehicleId]);

  // 2. Load GPS device configuration
  useEffect(() => {
    let active = true;
    void (async () => {
      setLoadingConfig(true);
      const cfg = await gpsGatewayService.getDeviceConfig(vehicleId);
      if (active) {
        setDeviceConfig(cfg);
        setSpeedLimitInput(cfg.speed_limit || 100);
        setPingIntervalInput(cfg.ping_interval || 10);
        setRelaySupportedInput(cfg.relay_supported ?? true);
        setLoadingConfig(false);
      }
    })();
    return () => { active = false; };
  }, [vehicleId]);

  // 3. Load latest GPS position & subscribe to Supabase Realtime
  useEffect(() => {
    let active = true;

    const fetchLatestPosition = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_gps_locations')
          .select('latitude, longitude, speed, heading, recorded_at')
          .eq('vehicle_id', vehicleId)
          .maybeSingle();

        if (!error && data && active) {
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);
          const speed = Number(data.speed) || 0;
          const heading = Number(data.heading) || 0;
          const timestamp = data.recorded_at || new Date().toISOString();

          setCurrentCoord({ lat, lng, speed, heading, timestamp });
          setTrailPositions((prev) => [[lat, lng], ...prev.slice(0, 20)]);
        }
      } catch {
        // ignore
      }
    };

    void fetchLatestPosition();

    // Subscribe to realtime updates on vehicle_gps_locations
    const channel = supabase
      .channel(`single-gps-${vehicleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_gps_locations',
          filter: `vehicle_id=eq.${vehicleId}`,
        },
        (payload: any) => {
          if (payload?.new) {
            const n = payload.new;
            const lat = Number(n.latitude);
            const lng = Number(n.longitude);
            const speed = Number(n.speed) || 0;
            const heading = Number(n.heading) || 0;
            const timestamp = n.recorded_at || new Date().toISOString();

            setCurrentCoord({ lat, lng, speed, heading, timestamp });
            setTrailPositions((prev) => [[lat, lng], ...prev.slice(0, 20)]);
          }
        }
      )
      .subscribe((status) => {
        if (active) setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  // 4. Initialize Leaflet Map
  useEffect(() => {
    let active = true;
    let resizeTimer: any;

    void Promise.all([loadLeaflet(), getRuntimeSettings().catch(() => defaultRuntimeSettings)]).then(([L, config]) => {
      if (!active || !mapContainerRef.current) return;

      const initLat = currentCoord.lat;
      const initLng = currentCoord.lng;

      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
        zoomControl: false,
      }).setView([initLat, initLng], 15);

      // Add Zoom control on bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer
      const tileUrl = config.map_tile_url.replace(/\{apiKey\}/g, encodeURIComponent(config.map_api_key));
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: config.map_attribution || '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Trail Polyline
      const polyline = L.polyline([[initLat, initLng]], {
        color: '#eab308',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8',
      }).addTo(map);
      trailPolylineRef.current = polyline;

      // Geofence circle
      const geofence = L.circle([initLat, initLng], {
        radius: 1200,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.08,
        weight: 1.5,
      }).addTo(map).bindTooltip('Virtual Geofence Guard (Radius 1.2 KM)');
      geofenceCircleRef.current = geofence;

      // Custom Car Marker Icon
      const carIconHtml = `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:50%; background:rgba(234,179,8,0.25); animation:pulse 2s infinite;"></div>
          <div style="width:36px; height:36px; border-radius:50%; background:#000; border:2px solid #eab308; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: carIconHtml,
        className: 'gps-vehicle-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([initLat, initLng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${vehicleData.name}</b><br/>${vehicleData.license_plate}`);
      markerRef.current = marker;

      mapRef.current = map;

      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);
      resizeTimer = window.setTimeout(handleResize, 150);
    }).catch(() => {
      setMapError('Peta gagal dimuat. Periksa koneksi internet Anda.');
    });

    return () => {
      active = false;
      if (resizeTimer) clearTimeout(resizeTimer);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      trailPolylineRef.current = null;
      geofenceCircleRef.current = null;
    };
  }, [vehicleId]);

  // 5. Update marker position & trail on coordinate change
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !markerRef.current) return;

    const latLng = [currentCoord.lat, currentCoord.lng];
    markerRef.current.setLatLng(latLng);
    markerRef.current.setPopupContent(`
      <div style="font-family:sans-serif; min-width:140px;">
        <strong style="color:#000; font-size:14px;">${vehicleData.name}</strong><br/>
        <span style="color:#666; font-size:12px;">${vehicleData.license_plate}</span><br/>
        <div style="margin-top:6px; padding:3px 8px; background:#eab308; color:#000; font-weight:bold; border-radius:6px; display:inline-block; font-size:11px;">
          ${currentCoord.speed.toFixed(0)} km/jam
        </div>
      </div>
    `);

    mapRef.current.panTo(latLng, { animate: true, duration: 0.8 });

    if (trailPolylineRef.current && trailPositions.length > 0) {
      trailPolylineRef.current.setLatLngs(trailPositions);
    }
  }, [currentCoord, trailPositions, vehicleData]);

  // Center to vehicle button
  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([currentCoord.lat, currentCoord.lng], 16, { animate: true });
    }
  };

  // Test simulation ping
  const handleTestSimulateMove = async () => {
    // Generate small random movement
    const latDelta = (Math.random() - 0.4) * 0.005;
    const lngDelta = (Math.random() - 0.4) * 0.005;
    const newLat = currentCoord.lat + latDelta;
    const newLng = currentCoord.lng + lngDelta;
    const newSpeed = Math.floor(20 + Math.random() * 65);
    const newHeading = Math.floor(Math.random() * 360);

    const res = await gpsGatewayService.sendTestPingCoordinates(vehicleId, newLat, newLng, newSpeed, newHeading);
    if (res.success) {
      setCurrentCoord({
        lat: newLat,
        lng: newLng,
        speed: newSpeed,
        heading: newHeading,
        timestamp: new Date().toISOString(),
      });
      setTrailPositions((prev) => [[newLat, newLng], ...prev]);
      toast.success('Koordinat live gateway berhasil disimulasikan & terkirim ke peta!');
    } else {
      toast.error('Gagal mengirim koordinat uji coba: ' + res.error);
    }
  };

  // Remote Engine Cut-off Action
  const handleToggleEngine = async (shouldCutOff: boolean) => {
    if (!deviceConfig?.relay_supported) {
      toast.error('Perangkat GPS ini tidak memiliki modul relay pemutus mesin.');
      return;
    }

    setIsProcessingCutOff(true);
    try {
      const result = await gpsGatewayService.toggleEngineRemote(vehicleId, shouldCutOff, cutOffReason);
      if (result.success) {
        setDeviceConfig((prev) => prev ? { ...prev, engine_cut_status: shouldCutOff } : null);
        setShowCutOffModal(false);
        if (shouldCutOff) {
          setCurrentCoord((prev) => ({ ...prev, speed: 0 }));
          toast.warning('⚠️ Mesin berhasil dimatikan secara remote! Relay cut-off aktif.');
        } else {
          toast.success('✅ Aliran mesin berhasil dipulihkan. Kendaraan siap dioperasikan.');
        }
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsProcessingCutOff(false);
    }
  };

  // Panic Button Action
  const handleTriggerPanic = async () => {
    setIsBroadcastingPanic(true);
    try {
      const result = await gpsGatewayService.triggerPanicAlert({
        vehicle_id: vehicleId,
        vehicle_name: vehicleData.name,
        license_plate: vehicleData.license_plate,
        latitude: currentCoord.lat,
        longitude: currentCoord.lng,
        speed: currentCoord.speed,
        notes: panicNotes,
      });

      if (result.success) {
        setPanicResult({
          alertId: result.alert_id,
          notifiedCount: result.notified_count,
          nearbyOwners: result.nearbyOwners,
        });
        toast.error(`🚨 PANIC BUTTON DIAKTIFKAN! Notifikasi darurat dikirim ke ${result.notified_count} pemilik rental di area ini.`);
      }
    } catch {
      toast.error('Gagal mengirim sinyal panic button.');
    } finally {
      setIsBroadcastingPanic(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!deviceConfig) return;
    setIsSavingSettings(true);
    try {
      const updated: GPSDeviceConfig = {
        ...deviceConfig,
        speed_limit: Number(speedLimitInput),
        ping_interval: Number(pingIntervalInput),
        relay_supported: Boolean(relaySupportedInput),
      };
      const res = await gpsGatewayService.saveDeviceConfig(updated);
      if (res.success) {
        setDeviceConfig(updated);
        toast.success('Konfigurasi perangkat GPS berhasil disimpan!');
      } else {
        toast.error('Gagal menyimpan: ' + res.error);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const detectedCity = useMemo(() => {
    return detectCityFromCoords(currentCoord.lat, currentCoord.lng);
  }, [currentCoord.lat, currentCoord.lng]);

  const isEngineKilled = Boolean(deviceConfig?.engine_cut_status);
  const isOverSpeed = currentCoord.speed > (deviceConfig?.speed_limit || 100);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0e1217]/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  window.location.href = '/?i=2';
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-yellow-400" />
                  {vehicleData.name}
                </h1>
                <span className="rounded-md bg-yellow-400/10 px-2 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-400/20">
                  {vehicleData.license_plate}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                <span>Kota: {detectedCity}</span>
                <span>•</span>
                <span>IMEI: {deviceConfig?.imei || 'Memuat...'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Relay Mesin */}
            <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
              isEngineKilled
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              <Power className="h-3.5 w-3.5" />
              <span>{isEngineKilled ? 'Mesin Dimatikan (Cut-off Aktif)' : 'Mesin Normal'}</span>
            </div>

            {/* Realtime Status */}
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border ${
              isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
              <span className="hidden sm:inline">{isConnected ? 'Live GPS Terhubung' : 'Standby'}</span>
            </div>

            {/* Test Simulation Ping */}
            <button
              onClick={handleTestSimulateMove}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-400/20 transition"
              title="Kirim koordinat uji coba untuk memperbarui peta seketika"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Simulasi Gerak</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Map & Telemetry Dashboard */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12161f] shadow-2xl min-h-[420px] sm:min-h-[520px]">
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#0f141c]" role="application" aria-label="Live Map" />

            {mapError && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-[#0a0c10]/95 p-6 text-center text-sm text-gray-300">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mb-2" />
                <p>{mapError}</p>
              </div>
            )}

            {/* Top Left Floating Pill: Vehicle & Speed */}
            <div className="pointer-events-auto absolute left-3 top-3 z-[400] flex items-center gap-2 rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 backdrop-blur-md text-xs">
              <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />
              <div>
                <div className="font-semibold text-white">{vehicleData.name}</div>
                <div className="text-[10px] text-gray-400 flex items-center gap-2">
                  <span>{currentCoord.speed.toFixed(0)} km/jam</span>
                  <span>•</span>
                  <span>Arah {currentCoord.heading.toFixed(0)}°</span>
                </div>
              </div>
            </div>

            {/* Center Map Control Button */}
            <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
              <button
                onClick={handleCenterMap}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-white/15 bg-black/80 text-white shadow-lg backdrop-blur-md hover:bg-white/10 transition"
                title="Pusatkan ke kendaraan"
              >
                <MapPin className="h-4 w-4 text-yellow-400" />
              </button>
            </div>

            {/* Bottom Status Bar on Map */}
            <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/85 px-4 py-2.5 backdrop-blur-md text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-yellow-400 font-mono">
                  <MapPin className="h-3.5 w-3.5" />
                  {currentCoord.lat.toFixed(5)}, {currentCoord.lng.toFixed(5)}
                </span>
                <span className="hidden sm:inline text-gray-500">|</span>
                <span className="hidden sm:inline text-gray-400">
                  Update: {new Date(currentCoord.timestamp).toLocaleTimeString('id-ID')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <Battery className="h-3.5 w-3.5 text-emerald-400" />
                  {deviceConfig?.battery_level || 98}%
                </span>
                <span className="flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5 text-blue-400" />
                  GSM {deviceConfig?.signal_strength || 92}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Panic Button Card */}
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-bold text-red-300">
                  <AlertOctagon className="h-5 w-5 text-red-400 animate-bounce" />
                  PANIC BUTTON (SOS)
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Darurat
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Broadcast sinyal darurat ke para pemilik rental terdekat di area {detectedCity} saat terjadi pembegalan, pencurian, atau hilang kontak.
              </p>
              <button
                onClick={() => setShowPanicModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition"
              >
                <AlertOctagon className="h-4 w-4" />
                AKTIFKAN PANIC BUTTON
              </button>
            </div>

            {/* Remote Engine Cut-off Card */}
            <div className={`rounded-2xl border p-4 ${
              isEngineKilled
                ? 'border-red-500/40 bg-red-950/30'
                : 'border-white/10 bg-[#12161f]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <Power className={`h-5 w-5 ${isEngineKilled ? 'text-red-400' : 'text-yellow-400'}`} />
                  KONTROL MESIN JARAK JAUH
                </span>
                {deviceConfig?.relay_supported ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Relay Didukung
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-white/10">
                    Tanpa Relay
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {deviceConfig?.relay_supported
                  ? 'Putus aliran relay pompa bahan bakar / starter untuk menghentikan kendaraan dari jarak jauh.'
                  : 'Perangkat GPS ini tidak memiliki kabel relay cut-off. Fitur remote stop dinonaktifkan.'}
              </p>

              {deviceConfig?.relay_supported ? (
                isEngineKilled ? (
                  <button
                    onClick={() => handleToggleEngine(false)}
                    disabled={isProcessingCutOff}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Power className="h-4 w-4" />
                    PULIHKAN ALIRAN MESIN (RESTORE)
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCutOffModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition"
                  >
                    <Power className="h-4 w-4" />
                    MATIKAN MESIN (ENGINE CUT-OFF)
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  Fitur Tidak Tersedia di Hardware Ini
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Speedometer, Telemetry & Settings Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Speedometer Gauge Card */}
          <div className="rounded-2xl border border-white/10 bg-[#12161f] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-yellow-400" />
                Speedometer Real-Time
              </span>
              {isOverSpeed && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  OVERSPEED
                </span>
              )}
            </div>

            {/* Circular Speed Gauge Display */}
            <div className="relative flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-dashed border-white/10 bg-black/40">
                <div
                  className="absolute inset-2 rounded-full border-4 transition-all duration-700"
                  style={{
                    borderColor: isOverSpeed ? '#ef4444' : currentCoord.speed > 60 ? '#f59e0b' : '#34d399',
                    clipPath: `polygon(50% 50%, -50% -50%, ${Math.min(100, (currentCoord.speed / 160) * 100)}% 0%, 100% 100%, 0% 100%)`,
                  }}
                />
                <div className="text-center z-10">
                  <div className={`text-5xl font-black tracking-tight ${
                    isOverSpeed ? 'text-red-400' : 'text-white'
                  }`}>
                    {currentCoord.speed.toFixed(0)}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                    km/jam
                  </div>
                </div>
              </div>

              {/* Speed zones indicators */}
              <div className="w-full mt-4 flex items-center justify-between text-[10px] text-gray-400 px-2">
                <span>0</span>
                <span>Batas: {deviceConfig?.speed_limit || 100} km/j</span>
                <span>160</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 text-xs">
              <div className="rounded-xl bg-black/20 p-2.5">
                <span className="text-[10px] text-gray-400 block mb-0.5">Status Kontak ACC</span>
                <span className={`font-semibold ${currentCoord.speed > 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {isEngineKilled ? 'CUT-OFF' : currentCoord.speed > 0 ? 'IGNITION ON' : 'IDLE / PARK'}
                </span>
              </div>
              <div className="rounded-xl bg-black/20 p-2.5">
                <span className="text-[10px] text-gray-400 block mb-0.5">Arah Heading</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-blue-400" />
                  {currentCoord.heading.toFixed(0)}° ({getHeadingDirection(currentCoord.heading)})
                </span>
              </div>
            </div>
          </div>

          {/* Device Tabs: Control, Panic, Settings */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-[#12161f] p-5 shadow-xl flex flex-col">
            {/* Tabs Header */}
            <div className="flex rounded-xl bg-black/40 p-1 mb-4 text-xs">
              <button
                onClick={() => setActiveTab('control')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'control' ? 'bg-yellow-400 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Spesifikasi
              </button>
              <button
                onClick={() => setActiveTab('panic')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'panic' ? 'bg-red-500 text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Radar Rental
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'settings' ? 'bg-yellow-400 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Konfigurasi
              </button>
            </div>

            {/* Tab 1: Hardware Specs */}
            {activeTab === 'control' && (
              <div className="space-y-3 text-xs flex-1">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Model Perangkat:</span>
                  <span className="font-medium text-white">{deviceConfig?.device_model || 'GT06N GPS'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Nomor IMEI:</span>
                  <span className="font-mono text-yellow-300">{deviceConfig?.imei || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Protokol Gateway:</span>
                  <span className="font-medium text-white">{deviceConfig?.protocol || 'GT06'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Gateway Server:</span>
                  <span className="font-mono text-gray-300">{deviceConfig?.server_host}:{deviceConfig?.server_port}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">SIM Tracker:</span>
                  <span className="font-medium text-white">{deviceConfig?.sim_number || '+62812xxxx'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Geofence Guard:</span>
                  <span className="text-emerald-400 font-medium">Aktif (Radius 1.2 KM)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Status Gateway:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Radar Rental Terdekat */}
            {activeTab === 'panic' && (
              <div className="space-y-3 text-xs flex-1">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] leading-relaxed">
                  <strong className="block mb-1 font-semibold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-red-400" />
                    Jaringan Pemilik Rental Sekitar
                  </strong>
                  Saat Panic Button ditekan, para pemilik rental di bawah ini akan menerima notifikasi darurat beserta koordinat langsung unit Anda.
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(panicResult?.nearbyOwners || [
                    { name: 'DKI Jakarta Auto Rent', distance: '2.4 km', phone: '+628128899001' },
                    { name: 'Garuda Prima Rentcar', distance: '4.8 km', phone: '+628131122334' },
                    { name: 'Bintang Nusantara Fleet', distance: '7.1 km', phone: '+628174455667' },
                    { name: 'Mitra Armada Tanggap', distance: '11.5 km', phone: '+628189900112' },
                  ]).map((owner: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <div>
                        <div className="font-semibold text-white">{owner.business_name || owner.name}</div>
                        <div className="text-[10px] text-gray-400">Jarak estimasi: {owner.distance_km ? `${owner.distance_km} km` : owner.distance}</div>
                      </div>
                      <a
                        href={`https://wa.me/${(owner.phone || '+628123456789').replace(/[^0-9]/g, '')}?text=Halo%20Mitra%20Rental%20Renmoku,%20mohon%20bantuan%20pantau%20unit%20${encodeURIComponent(vehicleData.name)}%20(${encodeURIComponent(vehicleData.license_plate)})%20terindikasi%20kondisi%20darurat%20di%20wilayah%20ini.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                        title="Kontak Pemilik Rental Terdekat"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Configuration & Tuning */}
            {activeTab === 'settings' && (
              <div className="space-y-3.5 text-xs flex-1">
                <div>
                  <label className="text-gray-400 block mb-1">Batas Overspeed (km/jam):</label>
                  <input
                    type="number"
                    value={speedLimitInput}
                    onChange={(e) => setSpeedLimitInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white font-medium focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Interval Kirim Koordinat (detik):</label>
                  <select
                    value={pingIntervalInput}
                    onChange={(e) => setPingIntervalInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-3 py-2 text-white font-medium focus:border-yellow-400 focus:outline-none"
                  >
                    <option value={5}>5 detik (Sangat Cepat)</option>
                    <option value={10}>10 detik (Rekomendasi)</option>
                    <option value={30}>30 detik (Standar)</option>
                    <option value={60}>60 detik (Hemat Kuota/Baterai)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-300">Modul Relay Terpasang:</span>
                  <input
                    type="checkbox"
                    checked={relaySupportedInput}
                    onChange={(e) => setRelaySupportedInput(e.target.checked)}
                    className="h-4 w-4 accent-yellow-400 rounded"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full mt-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs transition disabled:opacity-50"
                >
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan GPS'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Remote Engine Cut-off Confirmation */}
      <AnimatePresence>
        {showCutOffModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#141416] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="p-3 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Konfirmasi Mematikan Mesin</h3>
                  <p className="text-xs text-red-400 font-medium">Remote Engine Cut-off</p>
                </div>
              </div>

              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 mb-4 text-xs text-red-200 leading-relaxed">
                <p className="font-bold mb-1">⚠️ PERINGATAN KESELAMATAN:</p>
                Perintah ini akan memutus aliran relay pompa bahan bakar kendaraan <strong>{vehicleData.name} ({vehicleData.license_plate})</strong>.
                {currentCoord.speed > 20 ? (
                  <p className="mt-2 text-amber-300 font-semibold">
                    Kecepatan saat ini: {currentCoord.speed.toFixed(0)} km/jam. Disarankan memutus mesin saat kendaraan melambat atau berhenti untuk mencegah kecelakaan fatal!
                  </p>
                ) : (
                  <p className="mt-1 text-emerald-300">
                    Kecepatan saat ini aman ({currentCoord.speed.toFixed(0)} km/jam).
                  </p>
                )}
              </div>

              <div className="mb-5 text-xs">
                <label className="text-gray-400 block mb-1">Pilih Alasan Pemutusan Mesin:</label>
                <select
                  value={cutOffReason}
                  onChange={(e) => setCutOffReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1e232d] px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Penyalahgunaan kendaraan / keluar batas aman">Penyalahgunaan kendaraan / batas aman dilanggar</option>
                  <option value="Indikasi pencurian / penggelapan armada">Indikasi pencurian / penggelapan armada</option>
                  <option value="Penyewa habis masa kontrak & menolak kembali">Penyewa habis masa sewa & tidak kooperatif</option>
                  <option value="Instruksi kepolisian / pihak berwajib">Instruksi kepolisian / darurat hukum</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCutOffModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/5 transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleToggleEngine(true)}
                  disabled={isProcessingCutOff}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/50 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Power className="h-4 w-4" />
                  {isProcessingCutOff ? 'Mengirim Sinyal...' : 'Ya, Matikan Mesin Sekarang'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Panic Button Confirmation */}
      <AnimatePresence>
        {showPanicModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-red-500/50 bg-[#13161c] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="p-3 rounded-2xl bg-red-600/20 text-red-500 animate-bounce">
                  <AlertOctagon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Aktifkan Panic Button Darurat (SOS)</h3>
                  <p className="text-xs text-red-400">Broadcast ke Komunitas Rental Terdekat</p>
                </div>
              </div>

              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-4 text-xs text-red-200 leading-relaxed space-y-2">
                <p>
                  Sistem akan mengambil titik koordinat terakhir di area <strong>{detectedCity}</strong> ({currentCoord.lat.toFixed(4)}, {currentCoord.lng.toFixed(4)}) dan mengirimkan notifikasi SOS berprioritas tinggi kepada seluruh pemilik rental mitra Renmoku di area terdekat.
                </p>
                <p className="text-white/80">
                  Unit: <strong>{vehicleData.name} ({vehicleData.license_plate})</strong>
                </p>
              </div>

              <div className="mb-5 text-xs">
                <label className="text-gray-300 block mb-1">Catatan Darurat / Kronologi Singkat:</label>
                <textarea
                  rows={3}
                  value={panicNotes}
                  onChange={(e) => setPanicNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Misal: Unit tidak bisa dihubungi, GPS menunjukkan bergerak ke arah luar kota..."
                />
              </div>

              {panicResult && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  ✅ Sinyal Panic Button berhasil dikirim ke {panicResult.notifiedCount} pemilik rental terdekat di wilayah {detectedCity}!
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPanicModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/5 transition"
                >
                  Tutup
                </button>
                <button
                  onClick={handleTriggerPanic}
                  disabled={isBroadcastingPanic}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-900/50 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isBroadcastingPanic ? 'Menyebarkan Alert...' : 'Kirim Sinyal Darurat SOS'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getHeadingDirection(heading: number): string {
  const directions = ['U / N', 'TL / NE', 'T / E', 'TG / SE', 'S / S', 'BD / SW', 'B / W', 'BL / NW'];
  const index = Math.round(((heading % 360) / 45)) % 8;
  return directions[index];
}
