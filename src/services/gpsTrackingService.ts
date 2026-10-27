import { useGPSTrackingStore } from '../stores/useGPSTrackingStore';
import type { VehicleLocation, DriveBehavior, SmartNotification, TripHistory } from '../stores/useGPSTrackingStore';

// ============================================================================
// GPS TRACKING SERVICE
// ============================================================================
// Service untuk simulasi GPS tracking dan monitoring kendaraan
// Di production, ini akan terintegrasi dengan GPS hardware dan backend API
// ============================================================================

class GPSTrackingService {
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  // ============================================================================
  // REAL-TIME LOCATION TRACKING
  // ============================================================================

  /**
   * Start tracking a vehicle
   */
  startTracking(vehicleId: string, initialLocation: VehicleLocation) {
    const store = useGPSTrackingStore.getState();
    
    // Set initial location
    store.updateVehicleLocation(vehicleId, initialLocation);

    // Start periodic updates (simulate GPS movement)
    const interval = setInterval(() => {
      const currentLocation = store.vehicleLocations[vehicleId];
      if (!currentLocation) return;

      // Simulate movement (random direction and speed)
      const newLocation = this.simulateMovement(currentLocation);
      store.updateVehicleLocation(vehicleId, newLocation);

      // Check for events
      this.checkGeofenceEvents(vehicleId, newLocation);
      this.checkBehaviorEvents(vehicleId, newLocation);
    }, store.globalSettings.updateInterval * 1000);

    this.updateIntervals.set(vehicleId, interval);
  }

  /**
   * Stop tracking a vehicle
   */
  stopTracking(vehicleId: string) {
    const interval = this.updateIntervals.get(vehicleId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(vehicleId);
    }
  }

  /**
   * Simulate GPS movement
   */
  private simulateMovement(current: VehicleLocation): VehicleLocation {
    // Random speed between 0-120 km/h
    const speed = Math.random() * 120;
    
    // Random heading change
    const headingChange = (Math.random() - 0.5) * 30;
    const newHeading = (current.heading + headingChange + 360) % 360;
    
    // Calculate new position (simplified)
    const distance = (speed / 3600) * 0.001; // Convert to degrees
    const latChange = distance * Math.cos(newHeading * Math.PI / 180);
    const lngChange = distance * Math.sin(newHeading * Math.PI / 180);
    
    return {
      lat: current.lat + latChange,
      lng: current.lng + lngChange,
      speed,
      heading: newHeading,
      timestamp: new Date().toISOString(),
      address: this.reverseGeocode(current.lat + latChange, current.lng + lngChange),
    };
  }

  /**
   * Reverse geocode (mock)
   */
  private reverseGeocode(lat: number, lng: number): string {
    // Mock addresses based on coordinates
    const addresses = [
      'Jl. Sudirman No. 123, Jakarta',
      'Jl. Thamrin No. 45, Jakarta',
      'Jl. Gatot Subroto No. 78, Jakarta',
      'Jl. Kuningan No. 12, Jakarta',
      'Jl. Rasuna Said No. 56, Jakarta',
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  // ============================================================================
  // GEOFENCING
  // ============================================================================

  /**
   * Check if vehicle entered/exited geofence
   */
  private checkGeofenceEvents(vehicleId: string, location: VehicleLocation) {
    const store = useGPSTrackingStore.getState();
    const geofences = store.geofences.filter((g) => g.isActive);

    geofences.forEach((geofence) => {
      const isInside = this.isPointInGeofence(location, geofence);
      const previousLocation = store.vehicleLocations[vehicleId];
      const wasInside = previousLocation ? this.isPointInGeofence(previousLocation, geofence) : false;

      // Entered geofence
      if (isInside && !wasInside && geofence.alertOnEnter) {
        this.createGeofenceNotification(vehicleId, geofence, 'enter', location);
      }

      // Exited geofence
      if (!isInside && wasInside && geofence.alertOnExit) {
        this.createGeofenceNotification(vehicleId, geofence, 'exit', location);
      }
    });
  }

  /**
   * Check if point is inside geofence
   */
  private isPointInGeofence(location: VehicleLocation, geofence: any): boolean {
    if (geofence.type === 'circle' && geofence.center && geofence.radius) {
      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        geofence.center.lat,
        geofence.center.lng
      );
      return distance <= geofence.radius;
    }

    if (geofence.type === 'polygon' && geofence.points) {
      return this.isPointInPolygon(location.lat, location.lng, geofence.points);
    }

    return false;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Point in polygon algorithm
   */
  private isPointInPolygon(lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = ((yi > lng) !== (yj > lng)) &&
        (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Create geofence notification
   */
  private createGeofenceNotification(vehicleId: string, geofence: any, event: 'enter' | 'exit', location: VehicleLocation) {
    const store = useGPSTrackingStore.getState();
    
    const notification: SmartNotification = {
      id: `notif-${Date.now()}`,
      vehicleId,
      type: 'geofence',
      title: event === 'enter' ? 'Kendaraan Masuk Area' : 'Kendaraan Keluar Area',
      message: `Kendaraan ${event === 'enter' ? 'masuk' : 'keluar'} dari area ${geofence.name}`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    store.addNotification(notification);
  }

  // ============================================================================
  // DRIVE BEHAVIOR MONITORING
  // ============================================================================

  /**
   * Check for driving behavior events
   */
  private checkBehaviorEvents(vehicleId: string, location: VehicleLocation) {
    const store = useGPSTrackingStore.getState();

    // Overspeed detection
    if (location.speed > 100) {
      const behavior: DriveBehavior = {
        id: `behavior-${Date.now()}`,
        vehicleId,
        type: 'overspeed',
        severity: location.speed > 120 ? 'high' : 'medium',
        location,
        timestamp: new Date().toISOString(),
        value: location.speed,
      };
      store.addDriveBehavior(behavior);

      this.createBehaviorNotification(vehicleId, behavior);
    }

    // Harsh braking detection (simulate)
    if (Math.random() < 0.01) { // 1% chance
      const behavior: DriveBehavior = {
        id: `behavior-${Date.now()}`,
        vehicleId,
        type: 'harsh_braking',
        severity: 'medium',
        location,
        timestamp: new Date().toISOString(),
        value: 0.8, // g-force
      };
      store.addDriveBehavior(behavior);
    }

    // Rapid acceleration detection (simulate)
    if (Math.random() < 0.01) { // 1% chance
      const behavior: DriveBehavior = {
        id: `behavior-${Date.now()}`,
        vehicleId,
        type: 'rapid_acceleration',
        severity: 'low',
        location,
        timestamp: new Date().toISOString(),
        value: 0.6, // g-force
      };
      store.addDriveBehavior(behavior);
    }
  }

  /**
   * Create behavior notification
   */
  private createBehaviorNotification(vehicleId: string, behavior: DriveBehavior) {
    const store = useGPSTrackingStore.getState();

    const notification: SmartNotification = {
      id: `notif-${Date.now()}`,
      vehicleId,
      type: 'behavior',
      title: 'Perilaku Berkendara',
      message: `Terdeteksi ${this.getBehaviorDescription(behavior.type)} (${behavior.value.toFixed(1)})`,
      severity: behavior.severity === 'high' ? 'critical' : 'warning',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    store.addNotification(notification);
  }

  /**
   * Get behavior description
   */
  getBehaviorDescription(type: string): string {
    const descriptions: Record<string, string> = {
      harsh_braking: 'pengereman keras',
      rapid_acceleration: 'akselerasi cepat',
      overspeed: 'kecepatan berlebih',
      sharp_turn: 'belokan tajam',
      idle: 'kendaraan idle',
    };
    return descriptions[type] || type;
  }

  // ============================================================================
  // TRIP HISTORY
  // ============================================================================

  /**
   * Record trip start
   */
  startTrip(vehicleId: string, startLocation: VehicleLocation): string {
    const tripId = `trip-${Date.now()}`;
    // In production, this would be saved to database
    return tripId;
  }

  /**
   * Record trip end
   */
  endTrip(
    vehicleId: string,
    tripId: string,
    startTime: string,
    startLocation: VehicleLocation,
    endLocation: VehicleLocation,
    route: VehicleLocation[]
  ) {
    const store = useGPSTrackingStore.getState();

    const distance = this.calculateDistance(
      startLocation.lat,
      startLocation.lng,
      endLocation.lat,
      endLocation.lng
    ) / 1000; // Convert to km

    const duration = (new Date(endLocation.timestamp).getTime() - new Date(startTime).getTime()) / 60000; // minutes

    const avgSpeed = distance / (duration / 60); // km/h
    const maxSpeed = Math.max(...route.map((loc) => loc.speed));

    const trip: TripHistory = {
      id: tripId,
      vehicleId,
      startTime,
      endTime: endLocation.timestamp,
      startLocation,
      endLocation,
      distance,
      duration,
      avgSpeed,
      maxSpeed,
      route,
    };

    store.addTripHistory(trip);
  }

  // ============================================================================
  // SMART NOTIFICATIONS
  // ============================================================================

  /**
   * Create maintenance reminder notification
   */
  createMaintenanceNotification(vehicleId: string, reminder: any) {
    const store = useGPSTrackingStore.getState();

    const notification: SmartNotification = {
      id: `notif-${Date.now()}`,
      vehicleId,
      type: 'maintenance',
      title: 'Pengingat Servis',
      message: reminder.isOverdue
        ? `Servis ${reminder.type} sudah terlambat! Segera jadwalkan servis.`
        : `Servis ${reminder.type} akan segera jatuh tempo pada ${new Date(reminder.dueDate).toLocaleDateString('id-ID')}`,
      severity: reminder.isOverdue ? 'critical' : 'warning',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    store.addNotification(notification);
  }

  /**
   * Create emergency notification
   */
  createEmergencyNotification(vehicleId: string, message: string, location: VehicleLocation) {
    const store = useGPSTrackingStore.getState();

    const notification: SmartNotification = {
      id: `notif-${Date.now()}`,
      vehicleId,
      type: 'emergency',
      title: '⚠️ DARURAT',
      message,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    store.addNotification(notification);
  }

  // ============================================================================
  // ENGINE CONTROL
  // ============================================================================

  /**
   * Send engine start command
   */
  async startEngine(vehicleId: string): Promise<boolean> {
    const store = useGPSTrackingStore.getState();
    
    try {
      store.sendEngineCommand(vehicleId, 'start');
      
      // Simulate API call to GPS hardware
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Failed to start engine:', error);
      return false;
    }
  }

  /**
   * Send engine stop command
   */
  async stopEngine(vehicleId: string): Promise<boolean> {
    const store = useGPSTrackingStore.getState();
    
    try {
      store.sendEngineCommand(vehicleId, 'stop');
      
      // Simulate API call to GPS hardware
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Failed to stop engine:', error);
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get all active vehicles
   */
  getActiveVehicles(): string[] {
    return Array.from(this.updateIntervals.keys());
  }

  /**
   * Check if vehicle is being tracked
   */
  isTracking(vehicleId: string): boolean {
    return this.updateIntervals.has(vehicleId);
  }

  /**
   * Get distance formatted
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }

  /**
   * Get speed formatted
   */
  formatSpeed(kmh: number): string {
    return `${kmh.toFixed(0)} km/h`;
  }

  /**
   * Get duration formatted
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins} menit`;
  }
}

export default new GPSTrackingService();
