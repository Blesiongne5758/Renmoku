import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Bell, Shield, Clock, 
  AlertTriangle, Play, Pause, Power, History,
  TrendingUp, Fuel, Gauge, Route, CheckCircle2
} from 'lucide-react';
import { useGPSTrackingStore } from '../../stores/useGPSTrackingStore';
import gpsTrackingService from '../../services/gpsTrackingService';
import VehicleMap from '../../components/gps/VehicleMap';
import { formatCurrency } from '../../data/mockData';

interface VehicleMonitoringProps {
  vehicleId: string;
  vehicleName: string;
}

export default function VehicleMonitoring({ vehicleId, vehicleName }: VehicleMonitoringProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'behavior' | 'geofence' | 'maintenance'>('live');
  
  const location = useGPSTrackingStore((state) => state.vehicleLocations[vehicleId]);
  const geofences = useGPSTrackingStore((state) => state.geofences);
  const behaviors = useGPSTrackingStore((state) => 
    state.driveBehaviors.filter((b) => b.vehicleId === vehicleId)
  );
  const notifications = useGPSTrackingStore((state) => 
    state.notifications.filter((n) => n.vehicleId === vehicleId)
  );
  const maintenanceReminders = useGPSTrackingStore((state) => 
    state.maintenanceReminders.filter((r) => r.vehicleId === vehicleId)
  );
  const engineControl = useGPSTrackingStore((state) => state.engineControls[vehicleId]);

  // Start tracking on mount
  useEffect(() => {
    if (!gpsTrackingService.isTracking(vehicleId)) {
      const initialLocation = {
        lat: -6.2088 + (Math.random() - 0.5) * 0.1,
        lng: 106.8456 + (Math.random() - 0.5) * 0.1,
        speed: 0,
        heading: 0,
        timestamp: new Date().toISOString(),
        address: 'Jl. Sudirman No. 123, Jakarta',
      };
      gpsTrackingService.startTracking(vehicleId, initialLocation);
    }

    return () => {
      // Don't stop tracking on unmount (keep tracking in background)
    };
  }, [vehicleId]);

  const handleEngineCommand = async (command: 'start' | 'stop') => {
    if (command === 'start') {
      await gpsTrackingService.startEngine(vehicleId);
    } else {
      await gpsTrackingService.stopEngine(vehicleId);
    }
  };

  const tabs = [
    { id: 'live', label: 'Live Tracking', icon: Navigation },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'behavior', label: 'Perilaku', icon: AlertTriangle },
    { id: 'geofence', label: 'Geofence', icon: MapPin },
    { id: 'maintenance', label: 'Servis', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-luxury-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Navigation className="w-8 h-8 text-gold-400" />
                {vehicleName}
              </h1>
              <p className="text-gray-400 mt-1">
                Pemantauan kendaraan real-time
              </p>
            </div>

            {/* Engine Control */}
            {engineControl && (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEngineCommand('start')}
                  disabled={engineControl.isEngineOn || engineControl.commandStatus === 'pending'}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Start Engine
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEngineCommand('stop')}
                  disabled={!engineControl.isEngineOn || engineControl.commandStatus === 'pending'}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Power className="w-4 h-4" />
                  Stop Engine
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-luxury p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-gray-400">Kecepatan</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {location?.speed.toFixed(0) || 0} <span className="text-sm text-gray-400">km/h</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-luxury p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Route className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Heading</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {location?.heading.toFixed(0) || 0}°
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-luxury p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Notifikasi</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {notifications.filter((n) => !n.isRead).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-luxury p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-400">Alert Aktif</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {behaviors.length}
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Live Tracking */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <VehicleMap
                vehicleId={vehicleId}
                vehicleName={vehicleName}
                showGeofences={true}
                height="500px"
              />

              {location && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-luxury p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gold-400" />
                      Lokasi Saat Ini
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Koordinat</p>
                        <p className="text-white font-mono">
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Alamat</p>
                        <p className="text-white">{location.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Terakhir Update</p>
                        <p className="text-white">
                          {new Date(location.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-luxury p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Status Kendaraan
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Mesin</span>
                        <span className={`font-medium ${engineControl?.isEngineOn ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {engineControl?.isEngineOn ? 'Aktif' : 'Mati'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Kecepatan</span>
                        <span className="text-white font-medium">{location.speed.toFixed(0)} km/h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Arah</span>
                        <span className="text-white font-medium">{location.heading.toFixed(0)}°</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tracking</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Riwayat Perjalanan</h3>
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Fitur playback history akan segera tersedia</p>
              </div>
            </div>
          )}

          {/* Behavior */}
          {activeTab === 'behavior' && (
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Analisis Perilaku Berkendara</h3>
              
              {behaviors.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <p className="text-gray-400">Tidak ada event perilaku berkendara</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {behaviors.slice(0, 10).map((behavior) => (
                    <div
                      key={behavior.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                    >
                      <div className={`p-2 rounded-lg ${
                        behavior.severity === 'high' ? 'bg-red-500/20' :
                        behavior.severity === 'medium' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                          behavior.severity === 'high' ? 'text-red-400' :
                          behavior.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {gpsTrackingService.getBehaviorDescription(behavior.type)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(behavior.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{behavior.value.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">
                          {behavior.type === 'overspeed' ? 'km/h' : 'g-force'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Geofence */}
          {activeTab === 'geofence' && (
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Geofence Aktif</h3>
              
              {geofences.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Belum ada geofence yang dibuat</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {geofences.map((geofence) => (
                    <div
                      key={geofence.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                    >
                      <div className={`p-2 rounded-lg ${
                        geofence.isActive ? 'bg-emerald-500/20' : 'bg-gray-500/20'
                      }`}>
                        <MapPin className={`w-5 h-5 ${
                          geofence.isActive ? 'text-emerald-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{geofence.name}</p>
                        <p className="text-sm text-gray-400">
                          {geofence.type === 'circle' 
                            ? `Radius: ${geofence.radius}m`
                            : `Polygon: ${geofence.points?.length || 0} titik`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {geofence.alertOnEnter && (
                          <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
                            Alert Masuk
                          </span>
                        )}
                        {geofence.alertOnExit && (
                          <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs">
                            Alert Keluar
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Maintenance */}
          {activeTab === 'maintenance' && (
            <div className="card-luxury p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pengingat Servis</h3>
              
              {maintenanceReminders.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Belum ada pengingat servis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        reminder.isOverdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        reminder.isOverdue ? 'bg-red-500/20' : 'bg-emerald-500/20'
                      }`}>
                        {reminder.isOverdue ? (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{reminder.type}</p>
                        <p className="text-sm text-gray-400">
                          Jatuh tempo: {new Date(reminder.dueDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {reminder.isOverdue && (
                        <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">
                          TERLAMBAT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
