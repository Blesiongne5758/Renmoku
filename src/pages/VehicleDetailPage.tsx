import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  Settings,
  Fuel,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  Navigation,
  Bluetooth,
  Camera,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { vehicles, formatCurrency } from '../data/mockData';

export default function VehicleDetailPage() {
  const { selectedVehicle, setCurrentPage } = useAppStore();
  const vehicle = selectedVehicle || vehicles[0];

  const [rentalType, setRentalType] = useState<'with_driver' | 'self_drive'>('with_driver');
  const [duration, setDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'exterior' | 'interior'>('exterior');

  // Calculate days
  const days = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  // Price calculation
  const priceCalculation = useMemo(() => {
    let basePrice = 0;
    let discount = 0;

    if (duration === 'daily') {
      basePrice = days * vehicle.pricePerDay;
    } else if (duration === 'weekly') {
      basePrice = Math.ceil(days / 7) * vehicle.pricePerWeek;
      discount = 10;
    } else {
      basePrice = Math.ceil(days / 30) * vehicle.pricePerMonth;
      discount = 25;
    }

    // Add driver fee if selected
    const driverFee = rentalType === 'with_driver' ? days * 500000 : 0;
    const subtotal = basePrice + driverFee;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    const dp = total * 0.5;

    return {
      basePrice,
      driverFee,
      discount,
      discountAmount,
      total,
      dp,
    };
  }, [duration, days, vehicle, rentalType]);

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation((prev) => (direction === 'left' ? prev - 45 : prev + 45));
  };

  const handleBookNow = () => {
    setCurrentPage('booking');
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <button onClick={() => setCurrentPage('home')} className="hover:text-gold-400">
            Beranda
          </button>
          <span>/</span>
          <button onClick={() => setCurrentPage('fleet')} className="hover:text-gold-400">
            Armada
          </button>
          <span>/</span>
          <span className="text-gold-400">{vehicle.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - 360° Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* 360° Viewer */}
            <div className="card-luxury p-6">
              <div className="relative aspect-video rounded-xl overflow-hidden neu-pressed mb-4">
                {/* 360° View */}
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `rotateY(${rotation}deg) scale(${zoom})`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <img
                    src={viewMode === 'exterior' ? vehicle.image : vehicle.images[1] || vehicle.image}
                    alt={vehicle.name}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                  />
                </div>

                {/* 360° Badge */}
                <div className="absolute top-4 left-4 badge-gold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                  <span className="text-xs font-medium">360° VIEW</span>
                </div>

                {/* View Mode Toggle */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setViewMode('exterior')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === 'exterior'
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                        : 'glass text-gray-400'
                    }`}
                  >
                    Exterior
                  </button>
                  <button
                    onClick={() => setViewMode('interior')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === 'interior'
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                        : 'glass text-gray-400'
                    }`}
                  >
                    Interior
                  </button>
                </div>

                {/* Rotation Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-gray-300">
                    {Math.round(((rotation % 360) + 360) % 360)}°
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Arrow Navigation */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRotate('left')}
                    className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRotate('right')}
                    className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Zoom Controls */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                    className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))}
                    className="w-10 h-10 rounded-xl neu-soft flex items-center justify-center text-gold-400"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Drag Instruction */}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  <span>Drag untuk putar</span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="card-luxury p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-[Playfair_Display] text-3xl font-bold text-white mb-2">
                    {vehicle.name} {vehicle.year}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(vehicle.rating)
                              ? 'text-gold-400 fill-gold-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white font-medium">{vehicle.rating}</span>
                    <span className="text-sm text-gray-500">({vehicle.reviews} review)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Mulai dari</p>
                  <p className="text-gold-gradient font-bold text-2xl">
                    {formatCurrency(vehicle.pricePerDay)}
                  </p>
                  <p className="text-xs text-gray-500">/hari</p>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="neu-soft rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-gold-400" />
                    <span className="text-xs text-gray-500">Transmisi</span>
                  </div>
                  <p className="text-white font-medium">
                    {vehicle.transmission === 'automatic' ? 'Automatic' : 'Manual'}
                  </p>
                </div>
                <div className="neu-soft rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-gold-400" />
                    <span className="text-xs text-gray-500">Kapasitas</span>
                  </div>
                  <p className="text-white font-medium">{vehicle.seats} penumpang</p>
                </div>
                <div className="neu-soft rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="w-4 h-4 text-gold-400" />
                    <span className="text-xs text-gray-500">Bahan Bakar</span>
                  </div>
                  <p className="text-white font-medium capitalize">{vehicle.fuel}</p>
                </div>
                <div className="neu-soft rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <span className="text-xs text-gray-500">Lokasi</span>
                  </div>
                  <p className="text-white font-medium">{vehicle.location}</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-white font-semibold mb-3">Fitur Unggulan</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.slice(0, 6).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Booking Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Rental Type Selection */}
            <div className="card-luxury p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Pilih Opsi Sewa</h2>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRentalType('with_driver')}
                  className={`p-4 rounded-xl text-left transition-all ${
                    rentalType === 'with_driver' ? 'neu-gold' : 'neu-soft'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={`w-5 h-5 ${rentalType === 'with_driver' ? 'text-gold-400' : 'text-gray-400'}`} />
                    <span className={`font-medium ${rentalType === 'with_driver' ? 'text-gold-300' : 'text-gray-300'}`}>
                      Dengan Driver
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Termasuk driver profesional</p>
                  <p className="text-gold-gradient font-bold">
                    {formatCurrency(vehicle.pricePerDay + 500000)}/hr
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRentalType('self_drive')}
                  className={`p-4 rounded-xl text-left transition-all ${
                    rentalType === 'self_drive' ? 'neu-gold' : 'neu-soft'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className={`w-5 h-5 ${rentalType === 'self_drive' ? 'text-gold-400' : 'text-gray-400'}`} />
                    <span className={`font-medium ${rentalType === 'self_drive' ? 'text-gold-300' : 'text-gray-300'}`}>
                      Lepas Kunci
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Self drive, bebas kemana saja</p>
                  <p className="text-gold-gradient font-bold">
                    {formatCurrency(vehicle.pricePerDay)}/hr
                  </p>
                </motion.button>
              </div>
            </div>

            {/* Rental Calculator */}
            <div className="card-luxury p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Kalkulator Sewa</h2>

              {/* Duration Selection */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                  Durasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'Harian', discount: 0 },
                    { id: 'weekly', label: 'Mingguan', discount: 10 },
                    { id: 'monthly', label: 'Bulanan', discount: 25 },
                  ].map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDuration(opt.id as any)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        duration === opt.id ? 'neu-gold' : 'neu-soft'
                      }`}
                    >
                      <p className={`text-sm font-medium ${duration === opt.id ? 'text-gold-300' : 'text-gray-300'}`}>
                        {opt.label}
                      </p>
                      {opt.discount > 0 && (
                        <p className="text-xs text-emerald-400 mt-1">-{opt.discount}%</p>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tanggal Mulai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-luxury pl-10 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tanggal Selesai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-luxury pl-10 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="neu-pressed rounded-xl p-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durasi</span>
                  <span className="text-white">{days} hari</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Harga Dasar</span>
                  <span className="text-white">{formatCurrency(priceCalculation.basePrice)}</span>
                </div>
                {priceCalculation.driverFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jasa Driver</span>
                    <span className="text-white">{formatCurrency(priceCalculation.driverFee)}</span>
                  </div>
                )}
                {priceCalculation.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Diskon ({priceCalculation.discount}%)</span>
                    <span className="text-emerald-400">-{formatCurrency(priceCalculation.discountAmount)}</span>
                  </div>
                )}
                <div className="divider-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-gold-gradient font-bold text-xl">
                    {formatCurrency(priceCalculation.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-400">DP (50%)</span>
                  <span className="text-gold-400 font-medium">
                    {formatCurrency(priceCalculation.dp)}
                  </span>
                </div>
              </div>

              {/* Book Now Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full btn-luxury py-4 text-base font-semibold flex items-center justify-center gap-2"
              >
                BOOK NOW
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Asuransi Full</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
