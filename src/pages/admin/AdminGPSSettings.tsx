import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { 
  Settings, MapPin, Bell, Shield, Clock, 
  Save, RotateCcw, AlertCircle, CheckCircle2,
  ToggleLeft, ToggleRight, Globe, Radio
} from 'lucide-react';
import { useGPSTrackingStore } from '../../stores/useGPSTrackingStore';
import { toast } from 'sonner';
import { defaultRuntimeSettings, getRuntimeSettings, saveRuntimeSettings, RuntimeSettings } from '../../services/runtimeSettingsService';
import { useSocketContext } from '../../components/SocketProvider';

export default function AdminGPSSettings() {
  const { globalSettings, updateGlobalSettings } = useGPSTrackingStore();
  const { isConnected } = useSocketContext();
  const [hasChanges, setHasChanges] = useState(false);
  const [runtimeSettings, setRuntimeSettings] = useState<RuntimeSettings>(defaultRuntimeSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getRuntimeSettings().then((settings) => {
      setRuntimeSettings(settings);
      updateGlobalSettings({
        trackingEnabled: settings.gps_tracking_enabled,
        updateInterval: settings.gps_update_interval,
        historyRetention: settings.gps_history_retention,
        enableNotifications: settings.gps_notifications,
        enableGeofencing: settings.gps_geofencing,
        enableBehaviorMonitoring: settings.gps_behavior_monitoring,
        enableEngineControl: settings.gps_engine_control,
      });
    });
  }, [updateGlobalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveRuntimeSettings({
        ...runtimeSettings,
        gps_tracking_enabled: globalSettings.trackingEnabled,
        gps_update_interval: globalSettings.updateInterval,
        gps_history_retention: globalSettings.historyRetention,
        gps_notifications: globalSettings.enableNotifications,
        gps_geofencing: globalSettings.enableGeofencing,
        gps_behavior_monitoring: globalSettings.enableBehaviorMonitoring,
        gps_engine_control: globalSettings.enableEngineControl,
      });
      setHasChanges(false);
      toast.success('Pengaturan GPS, peta, dan realtime berhasil disimpan.');
    } catch {
      toast.error('Pengaturan gagal disimpan. Pastikan SQL owner_features.sql sudah diterapkan dan akun Anda memiliki akses admin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    updateGlobalSettings({
      trackingEnabled: true,
      updateInterval: 10,
      historyRetention: 90,
      enableNotifications: true,
      enableGeofencing: true,
      enableBehaviorMonitoring: true,
      enableEngineControl: true,
    });
    setRuntimeSettings(defaultRuntimeSettings);
    setHasChanges(true);
    toast.info('Nilai default disiapkan. Simpan perubahan untuk menerapkannya.');
  };

  const updateSetting = (key: keyof typeof globalSettings, value: any) => {
    updateGlobalSettings({ [key]: value });
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-luxury-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="w-8 h-8 text-gold-400" />
                Pengaturan GPS Tracking
              </h1>
              <p className="text-gray-400 mt-2">
                Konfigurasi global untuk sistem pemantauan kendaraan
              </p>
            </div>
            
            {hasChanges && (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-luxury-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-luxury p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gold-500/10">
                <Settings className="w-5 h-5 text-gold-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Pengaturan Umum</h2>
            </div>

            <div className="space-y-4">
              {/* Tracking Enabled */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white font-medium">Aktifkan Tracking</p>
                  <p className="text-sm text-gray-400">Pelacakan lokasi real-time</p>
                </div>
                <button
                  onClick={() => updateSetting('trackingEnabled', !globalSettings.trackingEnabled)}
                  className="transition"
                >
                  {globalSettings.trackingEnabled ? (
                    <ToggleRight className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Update Interval */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">Interval Update</p>
                    <p className="text-sm text-gray-400">Frekuensi pembaruan lokasi</p>
                  </div>
                  <span className="text-gold-400 font-bold">{globalSettings.updateInterval}s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={globalSettings.updateInterval}
                  onChange={(e) => updateSetting('updateInterval', parseInt(e.target.value))}
                  className="w-full accent-gold-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>

              {/* History Retention */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">Retensi Riwayat</p>
                    <p className="text-sm text-gray-400">Durasi penyimpanan data</p>
                  </div>
                  <span className="text-gold-400 font-bold">{globalSettings.historyRetention} hari</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="30"
                  value={globalSettings.historyRetention}
                  onChange={(e) => updateSetting('historyRetention', parseInt(e.target.value))}
                  className="w-full accent-gold-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30 hari</span>
                  <span>180 hari</span>
                  <span>365 hari</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-luxury p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Fitur Keamanan</h2>
            </div>

            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Notifikasi Cerdas</p>
                    <p className="text-sm text-gray-400">Alert otomatis untuk event penting</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('enableNotifications', !globalSettings.enableNotifications)}
                  className="transition"
                >
                  {globalSettings.enableNotifications ? (
                    <ToggleRight className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Geofencing */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">Geofencing</p>
                    <p className="text-sm text-gray-400">Batas area virtual</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('enableGeofencing', !globalSettings.enableGeofencing)}
                  className="transition"
                >
                  {globalSettings.enableGeofencing ? (
                    <ToggleRight className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Behavior Monitoring */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Monitoring Perilaku</p>
                    <p className="text-sm text-gray-400">Deteksi perilaku berkendara</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('enableBehaviorMonitoring', !globalSettings.enableBehaviorMonitoring)}
                  className="transition"
                >
                  {globalSettings.enableBehaviorMonitoring ? (
                    <ToggleRight className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Engine Control */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Kontrol Mesin</p>
                    <p className="text-sm text-gray-400">Remote engine start/stop</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('enableEngineControl', !globalSettings.enableEngineControl)}
                  className="transition"
                >
                  {globalSettings.enableEngineControl ? (
                    <ToggleRight className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-white/10 bg-[#141414] p-6">
          <div className="mb-5"><h2 className="flex items-center gap-2 text-xl font-semibold"><Globe className="h-5 w-5 text-gold-400" />Peta gratis untuk pemilik rental</h2><p className="mt-1 text-sm text-gray-400">Konfigurasi layer peta yang dipakai pada halaman GPS pemilik.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5"><span className="text-sm text-gray-300">Penyedia peta</span><select value={runtimeSettings.map_provider} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, map_provider: e.target.value as RuntimeSettings['map_provider'] }); setHasChanges(true); }} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white"><option value="openstreetmap">Leaflet + OpenStreetMap (gratis)</option><option value="custom">Server tile OSM-compatible</option></select></label>
            <label className="space-y-1.5"><span className="text-sm text-gray-300">Tile URL</span><input value={runtimeSettings.map_tile_url} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, map_tile_url: e.target.value }); setHasChanges(true); }} placeholder="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-1.5"><span className="text-sm text-gray-300">Attribution lisensi</span><input value={runtimeSettings.map_attribution} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, map_attribution: e.target.value }); setHasChanges(true); }} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-1.5"><span className="text-sm text-gray-300">API key publik (jika tile provider memerlukannya)</span><input type="password" autoComplete="off" value={runtimeSettings.map_api_key} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, map_api_key: e.target.value }); setHasChanges(true); }} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
          </div>
          <p className="mt-3 text-xs text-gray-500">OpenStreetMap tidak membutuhkan API key. Tile server publik bersifat best-effort; untuk trafik komersial tinggi, gunakan penyedia tile OSM yang memberi kuota/SLA. Attribution © OpenStreetMap contributors harus tetap terlihat.</p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-white/10 bg-[#141414] p-6">
          <div className="mb-5"><h2 className="flex items-center gap-2 text-xl font-semibold"><Radio className="h-5 w-5 text-gold-400" />Realtime pemilik melalui Socket.IO</h2><p className="mt-1 text-sm text-gray-400">Endpoint ini dipakai bersama oleh client admin dan pemilik untuk notifikasi booking serta pembaruan armada.</p></div>
          <p className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${isConnected ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-gray-400'}`}><span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />{isConnected ? 'Terhubung ke server realtime' : 'Belum terhubung'}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"><span><span className="block text-sm text-white">Aktifkan koneksi realtime</span><span className="text-xs text-gray-500">Membutuhkan Socket.IO server aktif</span></span><input type="checkbox" checked={runtimeSettings.realtime_enabled} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, realtime_enabled: e.target.checked }); setHasChanges(true); }} className="h-4 w-4 accent-yellow-400" /></label>
            <label className="space-y-1.5"><span className="text-sm text-gray-300">URL server Socket.IO</span><input value={runtimeSettings.realtime_url} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, realtime_url: e.target.value }); setHasChanges(true); }} placeholder="https://realtime.example.com" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
            <label className="space-y-1.5"><span className="text-sm text-gray-300">Socket path</span><input value={runtimeSettings.realtime_path} onChange={(e) => { setRuntimeSettings({ ...runtimeSettings, realtime_path: e.target.value }); setHasChanges(true); }} placeholder="/socket.io" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white" /></label>
          </div>
          <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100/80">InfinityFree hanya menyajikan file statis dan tidak menjalankan Socket.IO server. Isi endpoint dari server realtime yang di-host terpisah; koneksi pemilik tetap mati bila endpoint kosong atau server belum aktif.</p>
        </motion.section>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium mb-2">Informasi Penting</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Perubahan pengaturan akan diterapkan ke semua kendaraan</li>
                <li>• Interval update yang lebih pendek meningkatkan akurasi tetapi menggunakan lebih banyak bandwidth</li>
                <li>• Retensi riwayat yang lebih lama membutuhkan lebih banyak penyimpanan</li>
                <li>• Fitur kontrol mesin memerlukan perangkat GPS yang kompatibel</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
