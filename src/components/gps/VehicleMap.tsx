import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { useGPSTrackingStore } from '../../stores/useGPSTrackingStore';
import type { VehicleLocation } from '../../stores/useGPSTrackingStore';

interface VehicleMapProps {
  vehicleId: string;
  vehicleName: string;
  showGeofences?: boolean;
  height?: string;
}

export default function VehicleMap({ 
  vehicleId, 
  vehicleName, 
  showGeofences = true,
  height = '400px' 
}: VehicleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useGPSTrackingStore((state) => state.vehicleLocations[vehicleId]);
  const geofences = useGPSTrackingStore((state) => state.geofences);

  useEffect(() => {
    if (!canvasRef.current || !location) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw geofences
    if (showGeofences) {
      geofences.forEach((geofence) => {
        if (!geofence.isActive) return;

        if (geofence.type === 'circle' && geofence.center) {
          // Convert lat/lng to canvas coordinates (simplified)
          const x = canvas.width / 2 + (geofence.center.lng - location.lng) * 10000;
          const y = canvas.height / 2 - (geofence.center.lat - location.lat) * 10000;
          const radius = (geofence.radius || 100) / 10; // Scale down for display

          ctx.strokeStyle = geofence.alertOnEnter ? '#f59e0b' : '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);

          // Fill with transparency
          ctx.fillStyle = geofence.alertOnEnter ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
          ctx.fill();

          // Label
          ctx.fillStyle = '#fff';
          ctx.font = '12px Inter';
          ctx.fillText(geofence.name, x + radius + 5, y);
        }
      });
    }

    // Draw vehicle marker
    const vehicleX = canvas.width / 2;
    const vehicleY = canvas.height / 2;

    // Outer circle (pulse effect)
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(vehicleX, vehicleY, 20, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner circle
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(vehicleX, vehicleY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Direction indicator
    const angle = (location.heading - 90) * Math.PI / 180;
    const arrowLength = 15;
    const arrowX = vehicleX + arrowLength * Math.cos(angle);
    const arrowY = vehicleY + arrowLength * Math.sin(angle);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(vehicleX, vehicleY);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();

    // Speed indicator
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`${location.speed.toFixed(0)} km/h`, vehicleX + 25, vehicleY - 10);

    // Vehicle name
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 16px Inter';
    ctx.fillText(vehicleName, 10, 25);

    // Coordinates
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter';
    ctx.fillText(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`, 10, canvas.height - 10);

    // Timestamp
    const time = new Date(location.timestamp).toLocaleTimeString('id-ID');
    ctx.fillText(`Update: ${time}`, canvas.width - 150, canvas.height - 10);

  }, [location, geofences, vehicleName, showGeofences]);

  if (!location) {
    return (
      <div 
        className="rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Menunggu data GPS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/5">
      <canvas 
        ref={canvasRef} 
        className="w-full"
        style={{ height }}
      />
      
      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30"
      >
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-xs text-red-400 font-medium">LIVE</span>
      </motion.div>

      {/* Speed badge */}
      <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-gold-400" />
          <span className="text-lg font-bold text-white">{location.speed.toFixed(0)}</span>
          <span className="text-xs text-gray-400">km/h</span>
        </div>
      </div>
    </div>
  );
}
