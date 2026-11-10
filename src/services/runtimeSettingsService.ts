import { supabase } from '../lib/supabase';

export interface RuntimeSettings {
  map_provider: 'openstreetmap' | 'custom';
  map_tile_url: string;
  map_attribution: string;
  map_api_key: string;
  realtime_enabled: boolean;
  realtime_url: string;
  realtime_path: string;
  gps_tracking_enabled: boolean;
  gps_update_interval: number;
  gps_history_retention: number;
  gps_notifications: boolean;
  gps_geofencing: boolean;
  gps_behavior_monitoring: boolean;
  gps_engine_control: boolean;
  ai_spin_credits_enabled: boolean;
  spin360_studio_enabled: boolean;
}

export const defaultRuntimeSettings: RuntimeSettings = {
  map_provider: 'openstreetmap',
  map_tile_url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  map_attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  map_api_key: '',
  realtime_enabled: false,
  realtime_url: '',
  realtime_path: '/socket.io',
  gps_tracking_enabled: true,
  gps_update_interval: 10,
  gps_history_retention: 90,
  gps_notifications: true,
  gps_geofencing: true,
  gps_behavior_monitoring: true,
  gps_engine_control: true,
  ai_spin_credits_enabled: false,
  spin360_studio_enabled: false,
};

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  const { data, error } = await supabase.from('app_runtime_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return defaultRuntimeSettings;
  return { ...defaultRuntimeSettings, ...data } as RuntimeSettings;
}

export async function saveRuntimeSettings(settings: RuntimeSettings): Promise<void> {
  const { error } = await supabase.from('app_runtime_settings').update(settings).eq('id', 1);
  if (error) throw error;
}
