import { useEffect, useState } from 'react';
import { Activity, MapPin, Navigation, Settings2 } from 'lucide-react';
import { vehicles } from '../data/mockData';
import { useGPSTrackingStore } from '../stores/useGPSTrackingStore';
import gpsTrackingService from '../services/gpsTrackingService';
import VehicleMonitoring from '../pages/owner/VehicleMonitoring';
import { getRuntimeSettings } from '../services/runtimeSettingsService';
import { useSocketContext } from './SocketProvider';
import OwnerLiveGPSMap from './OwnerLiveGPSMap';

export default function OwnerGPSPanel() {
  const settings = useGPSTrackingStore((state) => state.globalSettings);
  const updateSettings = useGPSTrackingStore((state) => state.updateGlobalSettings);
  const { isConnected } = useSocketContext();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const selected = vehicles.find((vehicle) => vehicle.id === selectedVehicle);

  useEffect(() => {
    void getRuntimeSettings().then((config) => updateSettings({
      trackingEnabled: config.gps_tracking_enabled,
      updateInterval: config.gps_update_interval,
      historyRetention: config.gps_history_retention,
      enableNotifications: config.gps_notifications,
      enableGeofencing: config.gps_geofencing,
      enableBehaviorMonitoring: config.gps_behavior_monitoring,
      enableEngineControl: config.gps_engine_control,
    }));
  }, [updateSettings]);

  if (selected) return <div className="space-y-4"><button onClick={() => setSelectedVehicle(null)} className="text-sm text-yellow-300 hover:text-yellow-200">← Kembali ke daftar GPS</button><VehicleMonitoring vehicleId={selected.id} vehicleName={selected.name} /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
        <strong className="flex items-center gap-2"><Activity className="h-4 w-4" />Peta armada memakai koordinat perangkat GPS</strong>
        <p className="mt-1 text-amber-100/70">Panel peta di atas menampilkan data live dari perangkat yang terhubung. Detail kendaraan di bagian bawah masih berupa simulasi browser untuk pratinjau; pelacakan perangkat memerlukan gateway GPS yang mengirim koordinat ke backend.</p>
      </div>
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${isConnected ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-gray-400'}`}><span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />{isConnected ? 'Realtime tersambung' : 'Realtime belum tersambung'}</div>

      <OwnerLiveGPSMap />

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3"><Settings2 className="h-5 w-5 text-yellow-400" /><div><h2 className="font-semibold">Pengaturan GPS</h2><p className="text-sm text-gray-500">Atur fitur monitoring dan interval pembaruan simulasi</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ['trackingEnabled', 'Pelacakan kendaraan'], ['enableNotifications', 'Notifikasi GPS'],
            ['enableGeofencing', 'Geofence'], ['enableBehaviorMonitoring', 'Pemantauan perilaku berkendara'],
            ['enableEngineControl', 'Kontrol mesin simulasi'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-gray-200">{label}</span><input type="checkbox" checked={settings[key]} onChange={(e) => updateSettings({ [key]: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            </label>
          ))}
          <label className="space-y-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><span className="text-sm text-gray-200">Interval pembaruan</span><select value={settings.updateInterval} onChange={(e) => updateSettings({ updateInterval: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm text-white"><option value={5}>5 detik</option><option value={10}>10 detik</option><option value={30}>30 detik</option><option value={60}>1 menit</option></select></label>
          <label className="space-y-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><span className="text-sm text-gray-200">Penyimpanan riwayat</span><select value={settings.historyRetention} onChange={(e) => updateSettings({ historyRetention: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm text-white"><option value={7}>7 hari</option><option value={30}>30 hari</option><option value={90}>90 hari</option><option value={180}>180 hari</option></select></label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <div className="mb-5"><h2 className="font-semibold">Kendaraan untuk dipantau</h2><p className="text-sm text-gray-500">Pilih kendaraan untuk membuka live tracking, riwayat, geofence, perilaku, dan pengingat servis.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => {
            const isTracking = gpsTrackingService.isTracking(vehicle.id);
            return <article key={vehicle.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{vehicle.name}</h3><p className="mt-1 text-sm text-gray-500">{vehicle.brand} · {vehicle.year}</p></div><span className={`rounded-full px-2.5 py-1 text-xs ${isTracking ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>{isTracking ? 'Tracking aktif' : 'Siap dipantau'}</span></div>
              <button onClick={() => setSelectedVehicle(vehicle.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-3 py-2.5 text-sm font-semibold text-black"><MapPin className="h-4 w-4" />Pantau kendaraan <Navigation className="h-4 w-4" /></button>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
