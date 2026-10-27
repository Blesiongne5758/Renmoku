import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface VehicleLocation {
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  timestamp: string;
  address?: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number; // meters
  points?: Array<{ lat: number; lng: number }>;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  isActive: boolean;
}

export interface DriveBehavior {
  id: string;
  vehicleId: string;
  type: 'harsh_braking' | 'rapid_acceleration' | 'overspeed' | 'sharp_turn' | 'idle';
  severity: 'low' | 'medium' | 'high';
  location: VehicleLocation;
  timestamp: string;
  value: number; // speed, g-force, etc.
}

export interface TripHistory {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  startLocation: VehicleLocation;
  endLocation: VehicleLocation;
  distance: number; // km
  duration: number; // minutes
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  fuelConsumption?: number; // liters
  route: VehicleLocation[];
}

export interface SmartNotification {
  id: string;
  vehicleId: string;
  type: 'geofence' | 'overspeed' | 'maintenance' | 'emergency' | 'idle' | 'behavior';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_check' | 'general_service' | 'inspection';
  dueDate: string;
  dueMileage?: number;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  isOverdue: boolean;
  notes?: string;
}

export interface EngineControl {
  vehicleId: string;
  isEngineOn: boolean;
  lastCommand?: 'start' | 'stop';
  lastCommandTime?: string;
  commandStatus: 'success' | 'failed' | 'pending';
}

// ============================================================================
// GPS TRACKING STORE
// ============================================================================

interface GPSTrackingState {
  // Global Settings
  globalSettings: {
    trackingEnabled: boolean;
    updateInterval: number; // seconds
    historyRetention: number; // days
    enableNotifications: boolean;
    enableGeofencing: boolean;
    enableBehaviorMonitoring: boolean;
    enableEngineControl: boolean;
  };

  // Vehicle Locations (real-time)
  vehicleLocations: Record<string, VehicleLocation>;

  // Geofences
  geofences: Geofence[];

  // Drive Behavior Events
  driveBehaviors: DriveBehavior[];

  // Trip History
  tripHistory: TripHistory[];

  // Smart Notifications
  notifications: SmartNotification[];

  // Maintenance Reminders
  maintenanceReminders: MaintenanceReminder[];

  // Engine Control
  engineControls: Record<string, EngineControl>;

  // Actions
  updateGlobalSettings: (settings: Partial<GPSTrackingState['globalSettings']>) => void;
  updateVehicleLocation: (vehicleId: string, location: VehicleLocation) => void;
  addGeofence: (geofence: Geofence) => void;
  updateGeofence: (id: string, updates: Partial<Geofence>) => void;
  deleteGeofence: (id: string) => void;
  addDriveBehavior: (behavior: DriveBehavior) => void;
  addTripHistory: (trip: TripHistory) => void;
  addNotification: (notification: SmartNotification) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addMaintenanceReminder: (reminder: MaintenanceReminder) => void;
  updateMaintenanceReminder: (id: string, updates: Partial<MaintenanceReminder>) => void;
  deleteMaintenanceReminder: (id: string) => void;
  sendEngineCommand: (vehicleId: string, command: 'start' | 'stop') => void;
  updateEngineControl: (vehicleId: string, control: Partial<EngineControl>) => void;
}

export const useGPSTrackingStore = create<GPSTrackingState>()(
  persist(
    (set, get) => ({
      // Initial State
      globalSettings: {
        trackingEnabled: true,
        updateInterval: 10,
        historyRetention: 90,
        enableNotifications: true,
        enableGeofencing: true,
        enableBehaviorMonitoring: true,
        enableEngineControl: true,
      },

      vehicleLocations: {},
      geofences: [],
      driveBehaviors: [],
      tripHistory: [],
      notifications: [],
      maintenanceReminders: [],
      engineControls: {},

      // Actions
      updateGlobalSettings: (settings) =>
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...settings },
        })),

      updateVehicleLocation: (vehicleId, location) =>
        set((state) => ({
          vehicleLocations: {
            ...state.vehicleLocations,
            [vehicleId]: location,
          },
        })),

      addGeofence: (geofence) =>
        set((state) => ({
          geofences: [...state.geofences, geofence],
        })),

      updateGeofence: (id, updates) =>
        set((state) => ({
          geofences: state.geofences.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGeofence: (id) =>
        set((state) => ({
          geofences: state.geofences.filter((g) => g.id !== id),
        })),

      addDriveBehavior: (behavior) =>
        set((state) => ({
          driveBehaviors: [behavior, ...state.driveBehaviors].slice(0, 1000), // Keep last 1000
        })),

      addTripHistory: (trip) =>
        set((state) => ({
          tripHistory: [trip, ...state.tripHistory],
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 500), // Keep last 500
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      clearAllNotifications: () =>
        set({ notifications: [] }),

      addMaintenanceReminder: (reminder) =>
        set((state) => ({
          maintenanceReminders: [...state.maintenanceReminders, reminder],
        })),

      updateMaintenanceReminder: (id, updates) =>
        set((state) => ({
          maintenanceReminders: state.maintenanceReminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteMaintenanceReminder: (id) =>
        set((state) => ({
          maintenanceReminders: state.maintenanceReminders.filter((r) => r.id !== id),
        })),

      sendEngineCommand: (vehicleId, command) => {
        const currentControl = get().engineControls[vehicleId] || {
          vehicleId,
          isEngineOn: false,
          commandStatus: 'pending',
        };

        set((state) => ({
          engineControls: {
            ...state.engineControls,
            [vehicleId]: {
              ...currentControl,
              lastCommand: command,
              lastCommandTime: new Date().toISOString(),
              commandStatus: 'pending',
            },
          },
        }));

        // Simulate command execution (in production, this would be an API call)
        setTimeout(() => {
          set((state) => ({
            engineControls: {
              ...state.engineControls,
              [vehicleId]: {
                ...state.engineControls[vehicleId],
                isEngineOn: command === 'start',
                commandStatus: 'success',
              },
            },
          }));
        }, 2000);
      },

      updateEngineControl: (vehicleId, control) =>
        set((state) => ({
          engineControls: {
            ...state.engineControls,
            [vehicleId]: { ...state.engineControls[vehicleId], ...control },
          },
        })),
    }),
    {
      name: 'renmoku-gps-tracking',
    }
  )
);
