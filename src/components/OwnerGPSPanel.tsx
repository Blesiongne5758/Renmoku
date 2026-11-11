import { useEffect, useState, useCallback } from 'react';
import { 
  Activity, MapPin, Navigation, Settings2, Radio, Server,
  Sliders, ShieldAlert, AlertOctagon, CheckCircle2, RefreshCw, 
  ExternalLink, Power, Battery, Wifi, Edit3, Save, X, PhoneCall,
  Send, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { vehicles as fallbackVehicles } from '../data/mockData';
import { useGPSTrackingStore } from '../stores/useGPSTrackingStore';
import { useAppStore } from '../stores/useAppStore';
import { supabase } from '../lib/supabase';
import { getRuntimeSettings } from '../services/runtimeSettingsService';
import { useSocketContext } from './SocketProvider';
import OwnerLiveGPSMap from './OwnerLiveGPSMap';
import SingleVehicleLiveMapPage from '../pages/owner/SingleVehicleLiveMapPage';
import gpsGatewayService, { GPSDeviceConfig, NearbyOwner, detectCityFromCoords } from '../services/gpsGatewayService';

interface OwnerVehicleItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  year?: number;
  license_plate: string;
  location?: string;
  deviceConfig?: GPSDeviceConfig;
  hasLiveGps?: boolean;
  lastSpeed?: number;
}

export default function OwnerGPSPanel() {
  const { currentUser } = useAppStore();
  const settings = useGPSTrackingStore((state) => state.globalSettings);
  const updateSettings = useGPSTrackingStore((state) => state.updateGlobalSettings);
  const { isConnected } = useSocketContext();

  const [activeTab, setActiveTab] = useState<'map' | 'gateway' | 'settings'>('map');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleList, setVehicleList] = useState<OwnerVehicleItem[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Edit Device Modal
  const [editingDevice, setEditingDevice] = useState<GPSDeviceConfig | null>(null);
  const [isSavingDevice, setIsSavingDevice] = useState(false);

  // Panic SOS Modal
  const [panicModalVehicle, setPanicModalVehicle] = useState<OwnerVehicleItem | null>(null);
  const [panicNotes, setPanicNotes] = useState('Peringatan darurat: Sinyal SOS diaktifkan dari dashboard.');
  const [isBroadcastingPanic, setIsBroadcastingPanic] = useState(false);
  const [panicBroadcastSuccess, setPanicBroadcastSuccess] = useState<{
    count: number;
    owners: NearbyOwner[];
  } | null>(null);

  // Load vehicles and their GPS configs
  const loadVehiclesData = useCallback(async () => {
    setLoadingVehicles(true);
    let items: OwnerVehicleItem[] = [];

    try {
      if (currentUser?.id) {
        const { data: ownerRows } = await supabase
          .from('owners')
          .select('id')
          .eq('user_id', currentUser.id);

        const ownerIds = (ownerRows ?? []).map((o: any) => o.id);

        if (ownerIds.length > 0) {
          const { data: vehicleRows } = await supabase
            .from('vehicles')
            .select('id, brand, model, year, location')
            .in('owner_id', ownerIds);

          if (vehicleRows && vehicleRows.length > 0) {
            items = vehicleRows.map((v: any) => ({
              id: v.id,
              name: `${v.brand} ${v.model}`,
              brand: v.brand,
              model: v.model,
              year: v.year,
              license_plate: `B ${Math.floor(1000 + Math.random() * 8999)} ${v.brand.slice(0, 3).toUpperCase()}`,
              location: v.location || 'DKI Jakarta',
            }));
          }
        }
      }
    } catch {
      // ignore
    }

    // Fallback: mockData vehicles if owner has no vehicles registered yet
    if (items.length === 0) {
      items = fallbackVehicles.map((v) => ({
        id: v.id,
        name: v.name,
        brand: v.brand,
        model: v.name,
        year: v.year,
        license_plate: `B ${Math.floor(1000 + Math.random() * 8999)} RNM`,
        location: v.location || 'Jakarta',
      }));
    }

    // Check GPS live status & load device configs
    try {
      const { data: locations } = await supabase
        .from('vehicle_gps_locations')
        .select('vehicle_id, speed, recorded_at')
        .in('vehicle_id', items.map((i) => i.id));

      const locMap = new Map((locations ?? []).map((l: any) => [l.vehicle_id, l]));

      const populated = await Promise.all(
        items.map(async (v) => {
          const cfg = await gpsGatewayService.getDeviceConfig(v.id);
          const loc = locMap.get(v.id);
          return {
            ...v,
            deviceConfig: cfg,
            hasLiveGps: Boolean(loc),
            lastSpeed: loc ? Number(loc.speed || 0) : undefined,
          };
        })
      );
      setVehicleList(populated);
    } catch {
      setVehicleList(items);
    } finally {
      setLoadingVehicles(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    void loadVehiclesData();
  }, [loadVehiclesData]);

  // Load runtime GPS settings
  useEffect(() => {
    void getRuntimeSettings().then((config) =>
      updateSettings({
        trackingEnabled: config.gps_tracking_enabled,
        updateInterval: config.gps_update_interval,
        historyRetention: config.gps_history_retention,
        enableNotifications: config.gps_notifications,
        enableGeofencing: config.gps_geofencing,
        enableBehaviorMonitoring: config.gps_behavior_monitoring,
        enableEngineControl: config.gps_engine_control,
      })
    );
  }, [updateSettings]);

  // Open Live Map in New Window / Dedicated Page
  const handleOpenSingleLiveMap = (vehicle: OwnerVehicleItem, inNewTab = true) => {
    if (inNewTab) {
      const url = `${window.location.origin}${window.location.pathname}?page=vehicle-live-map&id=${vehicle.id}`;
      const newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked, open in same view
        setSelectedVehicle(vehicle.id);
      }
    } else {
      setSelectedVehicle(vehicle.id);
    }
  };

  // Quick Test Ping for a vehicle to immediately show on Live Map
  const handleQuickTestPing = async (vehicle: OwnerVehicleItem) => {
    // City coords
    const lat = -6.2088 + (Math.random() - 0.5) * 0.08;
    const lng = 106.8456 + (Math.random() - 0.5) * 0.08;
    const speed = Math.floor(20 + Math.random() * 60);
    const heading = Math.floor(Math.random() * 360);

    const res = await gpsGatewayService.sendTestPingCoordinates(vehicle.id, lat, lng, speed, heading);
    if (res.success) {
      toast.success(`Koordinat gateway untuk ${vehicle.name} berhasil disinkronkan ke Live Map!`);
      void loadVehiclesData();
    } else {
      toast.error('Gagal mengirim koordinat: ' + res.error);
    }
  };

  // Save Edited Device Configuration
  const handleSaveDeviceModal = async () => {
    if (!editingDevice) return;
    setIsSavingDevice(true);
    try {
      const res = await gpsGatewayService.saveDeviceConfig(editingDevice);
      if (res.success) {
        toast.success(`Konfigurasi GPS untuk perangkat berhasil disimpan.`);
        setEditingDevice(null);
        void loadVehiclesData();
      } else {
        toast.error('Gagal menyimpan: ' + res.error);
      }
    } finally {
      setIsSavingDevice(false);
    }
  };

  // Trigger Panic Broadcast
  const handleSendPanicBroadcast = async () => {
    if (!panicModalVehicle) return;
    setIsBroadcastingPanic(true);
    try {
      const res = await gpsGatewayService.triggerPanicAlert({
        vehicle_id: panicModalVehicle.id,
        vehicle_name: panicModalVehicle.name,
        license_plate: panicModalVehicle.license_plate,
        latitude: -6.2088,
        longitude: 106.8456,
        speed: 0,
        notes: panicNotes,
      });

      if (res.success) {
        setPanicBroadcastSuccess({
          count: res.notified_count,
          owners: res.nearbyOwners,
        });
        toast.error(`🚨 Sinyal Panic Button berhasil disebarkan ke ${res.notified_count} pemilik rental terdekat!`);
      }
    } catch {
      toast.error('Gagal mengirim sinyal panic button.');
    } finally {
      setIsBroadcastingPanic(false);
    }
  };

  // If a single vehicle is selected in current view (fallback mode)
  if (selectedVehicle) {
    const selected = vehicleList.find((v) => v.id === selectedVehicle);
    return (
      <SingleVehicleLiveMapPage
        vehicleId={selectedVehicle}
        vehicleName={selected?.name || 'Kendaraan'}
        onBack={() => setSelectedVehicle(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 sm:p-5 text-sm text-amber-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong className="flex items-center gap-2 text-amber-300 font-semibold">
            <Activity className="h-4 w-4" />
            Pusat Monitoring GPS & Gateway Armada Terpadu
          </strong>
          <p className="mt-1 text-xs text-amber-100/70 max-w-3xl leading-relaxed">
            Pantau posisi live armada, konfigurasikan gateway GPS (GT06/Concox/Teltonika), kendalikan pemutus mesin jarak jauh (Remote Cut-off Relay), dan aktifkan Panic Button darurat untuk perlindungan armada bersama mitra rental terdekat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
            isConnected ? 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/20' : 'bg-white/5 text-gray-400 border border-white/10'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
            {isConnected ? 'Realtime Aktif' : 'Realtime Standby'}
          </div>

          <button
            onClick={() => void loadVehiclesData()}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition"
            title="Segarkan data kendaraan"
          >
            <RefreshCw className={`h-4 w-4 ${loadingVehicles ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-black/40 p-1.5 border border-white/10 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'map'
                ? 'bg-yellow-400 text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Peta Live Armada
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'gateway'
                ? 'bg-yellow-400 text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Server className="h-4 w-4" />
            Konfigurasi Gateway GPS
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'settings'
                ? 'bg-yellow-400 text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Pengaturan Sistem
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE MAP TAB */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          {/* Global Armada Map */}
          <OwnerLiveGPSMap />

          {/* Individual Vehicle Monitoring Cards Grid */}
          <section className="rounded-2xl border border-white/10 bg-[#12161f] p-5 sm:p-7 shadow-xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-yellow-400" />
                  Pilih Kendaraan untuk Live Tracking Individual
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Klik &quot;Pantau Kendaraan&quot; untuk membuka halaman baru khusus live map tiap kendaraan dengan speedometer real-time, remote relay mesin, dan panic button.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vehicleList.map((vehicle) => {
                const isEngineKilled = Boolean(vehicle.deviceConfig?.engine_cut_status);
                const hasRelay = Boolean(vehicle.deviceConfig?.relay_supported);

                return (
                  <article
                    key={vehicle.id}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-yellow-400/40 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base">{vehicle.name}</h3>
                          <span className="text-xs font-mono text-yellow-400 font-semibold">
                            {vehicle.license_plate}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            vehicle.hasLiveGps
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                          }`}>
                            {vehicle.hasLiveGps ? 'GPS Aktif' : 'Standby'}
                          </span>

                          {hasRelay && (
                            <span className={`text-[10px] font-medium ${isEngineKilled ? 'text-red-400' : 'text-emerald-400'}`}>
                              {isEngineKilled ? 'Mesin Dimatikan' : 'Relay Normal'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Device Specs Preview */}
                      <div className="space-y-1.5 py-3 border-y border-white/5 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>IMEI:</span>
                          <span className="font-mono text-gray-300">{vehicle.deviceConfig?.imei || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protokol:</span>
                          <span className="text-white">{vehicle.deviceConfig?.protocol || 'GT06'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wilayah Terkini:</span>
                          <span className="text-gray-300">{vehicle.location || 'DKI Jakarta'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      {/* Main Button: Open Dedicated Live Map in New Window */}
                      <button
                        onClick={() => handleOpenSingleLiveMap(vehicle, true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-yellow-500/20 transition hover:scale-[1.02]"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Pantau Kendaraan (Buka di Tab Baru)</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      {/* Secondary Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleQuickTestPing(vehicle)}
                          className="py-2 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                          title="Simulasikan koordinat live seketika ke peta"
                        >
                          <RefreshCw className="h-3 w-3 text-yellow-400" />
                          <span>Tes Ping GPS</span>
                        </button>

                        <button
                          onClick={() => {
                            setPanicModalVehicle(vehicle);
                            setPanicBroadcastSuccess(null);
                          }}
                          className="py-2 px-2.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                          title="Aktifkan Panic Button Darurat"
                        >
                          <AlertOctagon className="h-3 w-3 text-red-400" />
                          <span>Panic SOS</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: GATEWAY CONFIGURATION TAB */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          {/* Gateway Endpoint Documentation Card */}
          <section className="rounded-2xl border border-white/10 bg-[#12161f] p-5 sm:p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Konfigurasi Gateway GPS Hardware</h2>
                <p className="text-xs text-gray-400">Hubungkan tracker fisik GPS kendaraan ke server gateway Renmoku</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <span className="text-xs text-gray-400 block mb-1">Server Host IP / Domain:</span>
                <span className="font-mono text-sm font-semibold text-yellow-400">gps.renmoku.biz.id</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <span className="text-xs text-gray-400 block mb-1">Port Protokol Hardware:</span>
                <span className="font-mono text-sm font-semibold text-white">5023 (GT06) / 5001 (Traccar)</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <span className="text-xs text-gray-400 block mb-1">Webhook Ingestion Endpoint:</span>
                <span className="font-mono text-xs text-emerald-400 truncate block">/functions/v1/gps-gateway</span>
              </div>
            </div>

            {/* Instruction / Supported Protocols */}
            <div className="rounded-xl bg-black/20 border border-white/5 p-4 text-xs text-gray-300 leading-relaxed">
              <strong className="text-white block mb-2">📋 Protokol GPS Tracker yang Didukung:</strong>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['Concox / Jimi GT06N', 'Coban / TK103', 'Sinotrack ST-901', 'Teltonika FMB920', 'Queclink', 'Traccar Client', 'HTTP/JSON Webhook'].map((proto, idx) => (
                  <span key={idx} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-gray-300">
                    {proto}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Vehicle Device Configurations List */}
          <section className="rounded-2xl border border-white/10 bg-[#12161f] p-5 sm:p-7 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Pengaturan Perangkat Tiap Kendaraan</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Kendaraan</th>
                    <th className="py-3 px-4">IMEI Tracker</th>
                    <th className="py-3 px-4">Model & Protokol</th>
                    <th className="py-3 px-4">Remote Cut-off</th>
                    <th className="py-3 px-4">Batas Kecepatan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicleList.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{v.name}</div>
                        <div className="text-[10px] text-yellow-400 font-mono">{v.license_plate}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-200">
                        {v.deviceConfig?.imei || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{v.deviceConfig?.device_model || 'GT06N'}</span>
                        <div className="text-[10px] text-gray-400">{v.deviceConfig?.protocol || 'GT06'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {v.deviceConfig?.relay_supported ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Didukung
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                            <XCircle className="h-3.5 w-3.5" /> Tanpa Relay
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {v.deviceConfig?.speed_limit || 100} km/jam
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          ONLINE
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickTestPing(v)}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-yellow-400 transition"
                            title="Kirim koordinat uji coba ke live map"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingDevice(v.deviceConfig || null)}
                            className="p-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 transition"
                            title="Edit Konfigurasi GPS"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: GLOBAL SYSTEM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <section className="rounded-2xl border border-white/10 bg-[#12161f] p-5 sm:p-7 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-yellow-400" />
            <div>
              <h2 className="font-bold text-white text-lg">Pengaturan Sistem Pemantauan</h2>
              <p className="text-xs text-gray-400">Atur preferensi monitoring real-time dan notifikasi armada</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ['trackingEnabled', 'Pelacakan kendaraan'],
              ['enableNotifications', 'Notifikasi GPS'],
              ['enableGeofencing', 'Geofence Guard'],
              ['enableBehaviorMonitoring', 'Pemantauan perilaku berkendara'],
              ['enableEngineControl', 'Kontrol mesin remote relay'],
            ] as const).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-black/30 transition"
              >
                <span className="text-xs text-gray-200">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSettings({ [key]: e.target.checked })}
                  className="h-4 w-4 accent-yellow-400 rounded"
                />
              </label>
            ))}

            <label className="space-y-1.5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs">
              <span className="text-gray-300">Interval pembaruan GPS</span>
              <select
                value={settings.updateInterval}
                onChange={(e) => updateSettings({ updateInterval: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={5}>5 detik (Real-time Presisi)</option>
                <option value={10}>10 detik (Rekomendasi)</option>
                <option value={30}>30 detik</option>
                <option value={60}>1 menit</option>
              </select>
            </label>

            <label className="space-y-1.5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs">
              <span className="text-gray-300">Penyimpanan riwayat rute</span>
              <select
                value={settings.historyRetention}
                onChange={(e) => updateSettings({ historyRetention: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={7}>7 hari</option>
                <option value={30}>30 hari</option>
                <option value={90}>90 hari</option>
                <option value={180}>180 hari</option>
              </select>
            </label>
          </div>
        </section>
      )}

      {/* Modal: Edit Device Config */}
      {editingDevice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13161c] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-yellow-400" />
                Konfigurasi Perangkat GPS
              </h3>
              <button onClick={() => setEditingDevice(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Nomor IMEI Perangkat GPS:</label>
                <input
                  type="text"
                  value={editingDevice.imei}
                  onChange={(e) => setEditingDevice({ ...editingDevice, imei: e.target.value })}
                  placeholder="Contoh: 868214050123456"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-white font-mono focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Model Hardware:</label>
                  <input
                    type="text"
                    value={editingDevice.device_model}
                    onChange={(e) => setEditingDevice({ ...editingDevice, device_model: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Protokol Gateway:</label>
                  <select
                    value={editingDevice.protocol}
                    onChange={(e) => setEditingDevice({ ...editingDevice, protocol: e.target.value as any })}
                    className="w-full rounded-xl border border-white/10 bg-[#1e232d] px-3.5 py-2 text-white focus:outline-none"
                  >
                    <option value="GT06">GT06 / Concox</option>
                    <option value="TK103">TK103 / Coban</option>
                    <option value="Sinotrack">Sinotrack</option>
                    <option value="Teltonika">Teltonika</option>
                    <option value="Traccar">Traccar</option>
                    <option value="Webhook">HTTP Webhook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Nomor SIM Card Tracker:</label>
                  <input
                    type="text"
                    value={editingDevice.sim_number}
                    onChange={(e) => setEditingDevice({ ...editingDevice, sim_number: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Batas Overspeed (km/jam):</label>
                  <input
                    type="number"
                    value={editingDevice.speed_limit}
                    onChange={(e) => setEditingDevice({ ...editingDevice, speed_limit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                <div>
                  <span className="font-semibold text-white block">Dukungan Relay Remote Cut-off</span>
                  <span className="text-[11px] text-gray-400">Aktifkan jika tracker dipasang kabel relay pemutus mesin</span>
                </div>
                <input
                  type="checkbox"
                  checked={editingDevice.relay_supported}
                  onChange={(e) => setEditingDevice({ ...editingDevice, relay_supported: e.target.checked })}
                  className="h-4 w-4 accent-yellow-400 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-white/10">
              <button
                onClick={() => setEditingDevice(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/5 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDeviceModal}
                disabled={isSavingDevice}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs transition disabled:opacity-50"
              >
                {isSavingDevice ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Panic Button Broadcast */}
      {panicModalVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/50 bg-[#13161c] p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-500 animate-bounce">
                <AlertOctagon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Broadcast Panic Button (SOS Darurat)</h3>
                <p className="text-xs text-red-400">
                  Unit: {panicModalVehicle.name} ({panicModalVehicle.license_plate})
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-4 text-xs text-red-200 leading-relaxed space-y-2">
              <p>
                Sinyal darurat ini akan langsung dikirimkan ke <strong>seluruh pemilik rental mitra Renmoku</strong> yang terdaftar di wilayah koordinat terakhir kendaraan untuk meminta bantuan respon lapangan.
              </p>
            </div>

            <div className="mb-4 text-xs">
              <label className="text-gray-300 block mb-1">Keterangan Kondisi Darurat:</label>
              <textarea
                rows={3}
                value={panicNotes}
                onChange={(e) => setPanicNotes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {panicBroadcastSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                ✅ Sinyal Panic Button berhasil dikirim ke {panicBroadcastSuccess.count} pemilik rental terdekat!
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setPanicModalVehicle(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/5 transition"
              >
                Tutup
              </button>
              <button
                onClick={handleSendPanicBroadcast}
                disabled={isBroadcastingPanic}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-900/50 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isBroadcastingPanic ? 'Menyebarkan Sinyal...' : 'Sebarkan Alert SOS Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
