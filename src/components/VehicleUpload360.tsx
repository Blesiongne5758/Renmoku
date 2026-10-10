import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, CheckCircle2, X, Image as ImageIcon, RotateCw } from 'lucide-react';
import { Vehicle, useAppStore } from '../stores/useAppStore';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (sides: { front: string; back: string; left: string; right: string }) => void;
}

export default function VehicleUpload360({ vehicle, onClose, onSave }: Props) {
  const [sides, setSides] = useState({
    front: vehicle.sides?.front || '',
    back: vehicle.sides?.back || '',
    left: vehicle.sides?.left || '',
    right: vehicle.sides?.right || '',
  });
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'left' | 'right'>('front');

  const sideLabels = {
    front: 'Tampak Depan',
    back: 'Tampak Belakang',
    left: 'Tampak Kiri',
    right: 'Tampak Kanan',
  };

  const sideIcons = {
    front: '🚗',
    back: '🔙',
    left: '◀️',
    right: '▶️',
  };

  const handleFileUpload = (side: keyof typeof sides) => {
    // Simulate file upload - in real app, this would upload to cloud storage
    // For demo, we'll use the vehicle's main image with different angles
    const demoImages = {
      front: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      back: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      left: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
      right: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    };
    
    setSides(prev => ({ ...prev, [side]: demoImages[side] }));
  };

  const handleSave = () => {
    const allSidesUploaded = Object.values(sides).every(side => side !== '');
    if (allSidesUploaded) {
      onSave(sides);
    }
  };

  const uploadedCount = Object.values(sides).filter(side => side !== '').length;
  const isComplete = uploadedCount === 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl glass rounded-3xl overflow-hidden border border-gold-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/5 bg-luxury-900/80 backdrop-blur-md">
          <div>
            <h3 className="font-[Playfair_Display] text-xl font-bold text-white flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-gold-400" />
              Upload Foto 360° Virtual
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Upload 4 foto dari sisi berbeda untuk membuat tampilan 360° otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Vehicle Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
            <img src={vehicle.image} alt={vehicle.name} className="w-20 h-20 rounded-lg object-cover" />
            <div>
              <h4 className="text-white font-semibold">{vehicle.name}</h4>
              <p className="text-sm text-gray-400">{vehicle.brand} • {vehicle.year}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className={`w-4 h-4 ${isComplete ? 'text-emerald-400' : 'text-gray-500'}`} />
                  <span className="text-xs text-gray-400">
                    {uploadedCount}/4 foto terupload
                  </span>
                </div>
                {isComplete && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    Siap ditampilkan
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {(['front', 'back', 'left', 'right'] as const).map((side) => (
              <motion.div
                key={side}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                  activeSide === side
                    ? 'border-gold-500/50 bg-gold-500/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-gold-500/20'
                }`}
                onClick={() => setActiveSide(side)}
              >
                <div className="aspect-video relative">
                  {sides[side] ? (
                    <>
                      <img
                        src={sides[side]}
                        alt={sideLabels[side]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
                      <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mb-2">
                        <Camera className="w-6 h-6 text-gold-400" />
                      </div>
                      <span className="text-xs text-gray-500">Belum diupload</span>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sideIcons[side]}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{sideLabels[side]}</p>
                        <p className="text-xs text-gray-500">Sudut {side === 'front' ? '0°' : side === 'right' ? '90°' : side === 'back' ? '180°' : '270°'}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileUpload(side);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-medium hover:bg-gold-500/20 transition-colors"
                    >
                      {sides[side] ? 'Ganti' : 'Upload'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Preview Section */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gold-400" />
              Preview Tampilan 360°
            </h4>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
              {/* Background garasi */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1616422285623-13ff0899e974?w=1600&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.4) saturate(0.8)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <div className="absolute inset-0 bg-radial-gold opacity-50" />
              </div>

              {/* Preview image based on active side */}
              <div className="relative w-full h-full flex items-center justify-center">
                {sides[activeSide] ? (
                  <motion.img
                    key={activeSide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={sides[activeSide]}
                    alt={sideLabels[activeSide]}
                    className="max-w-[70%] max-h-[70%] object-contain"
                    style={{
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px rgba(212,168,83,0.2))',
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Upload foto untuk melihat preview</p>
                  </div>
                )}
              </div>

              {/* Side indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                <span className="text-xs text-white/80 font-medium">
                  Preview: {sideLabels[activeSide]}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Cara Kerja Virtual 360°</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Upload 4 foto dari sisi: Depan, Belakang, Kiri, Kanan</li>
                  <li>• Sistem akan otomatis membuat tampilan 3D berputar</li>
                  <li>• Background garasi mewah akan ditampilkan secara konsisten</li>
                  <li>• Tampilan 360° akan menjadi gambar utama di listing kendaraan</li>
                  <li>• Penyewa dapat melihat dari semua sudut sebelum booking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-medium hover:text-white hover:border-gold-500/20 transition-all"
            >
              Batal
            </button>
            <motion.button
              whileHover={{ scale: isComplete ? 1.02 : 1 }}
              whileTap={{ scale: isComplete ? 0.98 : 1 }}
              onClick={handleSave}
              disabled={!isComplete}
              className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isComplete
                  ? 'btn-luxury'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan & Aktifkan 360°
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {4 - uploadedCount} Foto Lagi
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
