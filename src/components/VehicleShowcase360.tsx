import { motion, useTransform, useSpring } from 'framer-motion';
import { useState, useRef } from 'react';
import { RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Vehicle } from '../stores/useAppStore';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleShowcase360({ vehicle, onClose }: Props) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const springRotation = useSpring(rotation, { stiffness: 100, damping: 30 });
  const scale = useTransform(() => zoom);

  const handleDrag = (_: any, info: any) => {
    const newRotation = rotation + info.offset.x * 0.5;
    setRotation(newRotation);
  };

  // Simulated 3D rotation angles for car views
  const getCarAngle = () => {
    const normalizedAngle = ((rotation % 360) + 360) % 360;
    if (normalizedAngle < 45 || normalizedAngle >= 315) return 'front';
    if (normalizedAngle >= 45 && normalizedAngle < 135) return 'right';
    if (normalizedAngle >= 135 && normalizedAngle < 225) return 'rear';
    return 'left';
  };

  const currentAngle = getCarAngle();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-5xl glass rounded-3xl overflow-hidden border border-gold-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="font-[Playfair_Display] text-2xl font-bold text-white">{vehicle.name}</h3>
            <p className="text-gold-400 text-sm">{vehicle.brand} • {vehicle.year}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs">
              360° VIEW
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 360 Viewer */}
        <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden" ref={containerRef}>
          {/* Background radial */}
          <div className="absolute inset-0 bg-radial-gold" />
          
          {/* Floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gold-500/5 to-transparent" />
          
          {/* Car display with rotation effect */}
          <motion.div
            style={{ scale }}
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.1}
            onDrag={handleDrag}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-[80%] h-[80%] perspective-container"
            >
              {/* Car image with 3D transform */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `perspective(1200px) rotateY(${rotation}deg)`,
                }}
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 20px 40px rgba(212,168,83,0.2))',
                  }}
                  draggable={false}
                />
              </motion.div>

              {/* Reflection */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-30"
                style={{
                  transform: `perspective(1200px) rotateY(${rotation}deg) scaleY(-1) translateY(100%)`,
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                }}
              >
                <img
                  src={vehicle.image}
                  alt=""
                  className="max-w-full max-h-full object-contain blur-sm"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Rotation indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <RotateCw className={`w-4 h-4 text-gold-400 ${isDragging ? 'animate-spin' : ''}`} />
              <span className="text-xs text-gray-300">
                {isDragging ? 'Memutar...' : `Tampak ${currentAngle === 'front' ? 'Depan' : currentAngle === 'right' ? 'Kanan' : currentAngle === 'rear' ? 'Belakang' : 'Kiri'}`}
              </span>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              className="p-2 glass rounded-lg hover:bg-gold-500/10 transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-gold-400" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))}
              className="p-2 glass rounded-lg hover:bg-gold-500/10 transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-gold-400" />
            </button>
          </div>

          {/* Rotation arrows */}
          <button
            onClick={() => setRotation(rotation - 45)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full hover:bg-gold-500/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gold-400" />
          </button>
          <button
            onClick={() => setRotation(rotation + 45)}
            className="absolute right-4 bottom-16 p-3 glass rounded-full hover:bg-gold-500/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gold-400" />
          </button>
        </div>

        {/* Vehicle specs */}
        <div className="p-6 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tipe', value: vehicle.type.toUpperCase() },
              { label: 'Transmisi', value: vehicle.transmission === 'automatic' ? 'Otomatis' : 'Manual' },
              { label: 'Kapasitas', value: `${vehicle.seats} Orang` },
              { label: 'Bahan Bakar', value: vehicle.fuel.charAt(0).toUpperCase() + vehicle.fuel.slice(1) },
            ].map((spec, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                <p className="text-white font-semibold text-sm">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {vehicle.features.map((feature, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs bg-gold-500/5 border border-gold-500/15 text-gold-300"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
