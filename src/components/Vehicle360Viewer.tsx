import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { RotateCw, Pause, Play, Maximize2 } from 'lucide-react';
import { Vehicle } from '../stores/useAppStore';

interface Props {
  vehicle: Vehicle;
  autoRotate?: boolean;
  showControls?: boolean;
  className?: string;
}

// Background garasi mewah - menggunakan URL dari generated image
const GARAGE_BG = 'https://images.unsplash.com/photo-1616422285623-13ff0899e974?w=1600&q=80';

export default function Vehicle360Viewer({ vehicle, autoRotate = true, showControls = true, className = '' }: Props) {
  const [rotation, setRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const rotationValue = useMotionValue(rotation);
  const smoothRotation = useSpring(rotationValue, { stiffness: 100, damping: 30 });

  // Auto-rotate animation
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 30);
    
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  // Update motion value
  useEffect(() => {
    rotationValue.set(rotation);
  }, [rotation]);

  const handleDrag = (_: any, info: any) => {
    const newRotation = rotation + info.delta.x * 0.5;
    setRotation(newRotation);
  };

  // Get current face based on rotation
  const getCurrentFace = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    if (normalizedRotation >= 315 || normalizedRotation < 45) return 'front';
    if (normalizedRotation >= 45 && normalizedRotation < 135) return 'right';
    if (normalizedRotation >= 135 && normalizedRotation < 225) return 'back';
    return 'left';
  };

  const currentFace = getCurrentFace();

  // Check if vehicle has 360 view
  const has360 = vehicle.has360View || (vehicle.sides?.front && vehicle.sides?.back && vehicle.sides?.left && vehicle.sides?.right);
  
  // Fallback to main image if no 360 view
  const sides = vehicle.sides || {
    front: vehicle.image,
    back: vehicle.image,
    left: vehicle.image,
    right: vehicle.image,
  };

  if (!has360) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Garasi Mewah */}
      <div className="absolute inset-0">
        <img
          src={GARAGE_BG}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4) saturate(0.8)' }}
        />
        {/* Overlay gradient untuk depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        {/* Gold ambient glow */}
        <div className="absolute inset-0 bg-radial-gold opacity-50" />
      </div>

      {/* Lantai reflektif */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Reflection effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(212, 168, 83, 0.1))',
          }}
        />
      </div>

      {/* 3D Cube Container */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px' }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <motion.div
          className="relative w-[70%] h-[70%]"
          style={{
            transformStyle: 'preserve-3d',
            rotateY: smoothRotation,
          }}
          drag="x"
          dragConstraints={{ left: -500, right: 500 }}
          dragElastic={0.1}
          onDrag={handleDrag}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'translateZ(200px)',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={sides.front}
              alt={`${vehicle.name} - Tampak Depan`}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              draggable={false}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(212,168,83,0.2))',
              }}
            />
          </div>

          {/* Right Face */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'rotateY(90deg) translateZ(200px)',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={sides.right}
              alt={`${vehicle.name} - Tampak Kanan`}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              draggable={false}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(212,168,83,0.2))',
              }}
            />
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'rotateY(180deg) translateZ(200px)',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={sides.back}
              alt={`${vehicle.name} - Tampak Belakang`}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              draggable={false}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(212,168,83,0.2))',
              }}
            />
          </div>

          {/* Left Face */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'rotateY(270deg) translateZ(200px)',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={sides.left}
              alt={`${vehicle.name} - Tampak Kiri`}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              draggable={false}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(212,168,83,0.2))',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Reflection di lantai */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] opacity-30"
        style={{
          transform: 'translateX(-50%) scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          filter: 'blur(4px)',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          <img
            src={sides[currentFace as keyof typeof sides]}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Top badge */}
          <div className="absolute top-3 left-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-gold-500/20">
              <RotateCw className={`w-3 h-3 text-gold-400 ${isAutoRotating && !isDragging ? 'animate-spin' : ''}`} />
              <span className="text-[10px] text-gold-300 font-medium">360° VIEW</span>
            </div>
          </div>

          {/* Current face indicator */}
          <div className="absolute top-3 right-3 pointer-events-auto">
            <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-white/80 font-medium">
                {currentFace === 'front' ? 'Depan' :
                 currentFace === 'right' ? 'Kanan' :
                 currentFace === 'back' ? 'Belakang' : 'Kiri'}
              </span>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-gold-500/30 transition-colors"
            >
              {isAutoRotating ? (
                <Pause className="w-3.5 h-3.5 text-gold-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-gold-400" />
              )}
            </button>
            <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-gray-300">
                {isDragging ? '↔ Drag untuk putar' : 'Auto-rotate aktif'}
              </span>
            </div>
          </div>

          {/* Rotation progress indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24">
            <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                style={{ width: `${((rotation % 360) / 360) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Corner ambient lights */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
    </div>
  );
}
