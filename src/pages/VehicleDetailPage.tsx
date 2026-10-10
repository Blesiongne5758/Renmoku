import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Fuel, Users, Settings, Calendar, MapPin,
  ChevronRight, Heart, Share2, Shield, Clock, Award,
  CheckCircle2, Info
} from 'lucide-react';
import { Vehicle, useAppStore } from '../stores/useAppStore';
import { formatCurrency, calculatePrice, getDurationDiscount } from '../data/mockData';
import Vehicle360Viewer from '../components/Vehicle360Viewer';
import { vehicles } from '../data/mockData';

interface Props {
  vehicleId?: string;
}

export default function VehicleDetailPage({ vehicleId }: Props) {
  const { setCurrentPage, setSelectedVehicle } = useAppStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'interior' | 'specs'>('overview');
  const [rentalType, setRentalType] = useState<'with_driver' | 'self_drive'>('with_driver');
  const [duration, setDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Find vehicle
  const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  // Calculate days
  const days = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  // Price calculation
  const priceCalculation = useMemo(() => {
    let basePrice = 0;
    if (duration === 'daily') basePrice = days * vehicle.pricePerDay;
    else if (duration === 'weekly') basePrice = Math.ceil(days / 7) * vehicle.pricePerWeek;
    else basePrice = Math.ceil(days / 30) * vehicle.pricePerMonth;

    const discount = getDurationDiscount(days);
    const subtotal = basePrice * (1 - discount / 100);
    const driverFee = rentalType === 'with_driver' ? days * 300000 : 0;
    const total = subtotal + driverFee;
    const dp = total * 0.3;

    return { basePrice, discount, subtotal, driverFee, total, dp };
  }, [duration, days, vehicle, rentalType]);

  const handleBookNow = () => {
    setSelectedVehicle(vehicle);
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
          <button onClick={() => setCurrentPage('home')} className="hover:text-gold-400 transition-colors">Beranda</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => setCurrentPage('fleet')} className="hover:text-gold-400 transition-colors">Armada</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gold-400">{vehicle.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Visual */}
          <div className="lg:col-span-2 space-y-6">
            {/* 360° Showcase - Main Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxury overflow-hidden"
            >
              <div className="relative aspect-video">
                <Vehicle360Viewer
                  vehicle={vehicle}
                  autoRotate={true}
                  showControls={true}
                  className="w-full h-full"
                />

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2.5 rounded-xl glass backdrop-blur-md"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl glass backdrop-blur-md"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* 360° badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-gold backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
                    <span className="text-xs font-medium">360° LIVE</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 rounded-2xl neu-soft">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'interior', label: 'Interior' },
                { id: 'specs', label: 'Spesifikasi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedTab === tab.id
                      ? 'neu-raised text-gold-300'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-luxury p-6"
              >
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        {vehicle.name}
                      </h2>
                      <p className="text-gray-400">
                        {vehicle.brand} • {vehicle.year} • {vehicle.location}
                      </p>
                    </div>

                    <p className="text-gray-300 leading-relaxed">
                      {vehicle.name} adalah pilihan sempurna untuk perjalanan mewah Anda. 
                      Dilengkapi dengan fitur-fitur premium dan teknologi terkini, kendaraan ini 
                      menawarkan kenyamanan dan performa terbaik di kelasnya.
                    </p>

                    {/* Features */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Fitur Unggulan</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {vehicle.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-xl neu-soft">
                            <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.05]">
                      {[
                        { icon: Shield, label: 'Asuransi Full' },
                        { icon: Clock, label: '24/7 Support' },
                        { icon: Award, label: 'Verified' },
                      ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl neu-soft">
                          <badge.icon className="w-5 h-5 text-gold-400" />
                          <span className="text-xs text-gray-400 text-center">{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'interior' && (
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold">Interior Explorer</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Dashboard',
                        'Captain Seat',
                        'Entertainment',
                        'Storage',
                      ].map((area, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className="relative aspect-video rounded-xl overflow-hidden neu-pressed cursor-pointer"
                        >
                          <img
                            src={vehicle.image}
                            alt={area}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <p className="text-white font-medium text-sm">{area}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl glass-gold">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gold-300 font-medium mb-1">Interior Premium</p>
                          <p className="text-xs text-gray-400">
                            Semua kendaraan kami dibersihkan dan disanitasi secara menyeluruh sebelum setiap penyewaan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'specs' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Spesifikasi Lengkap</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Merek', value: vehicle.brand },
                        { label: 'Tahun', value: vehicle.year.toString() },
                        { label: 'Tipe', value: vehicle.type.toUpperCase() },
                        { label: 'Transmisi', value: vehicle.transmission === 'automatic' ? 'Otomatis' : 'Manual' },
                        { label: 'Kapasitas', value: `${vehicle.seats} Orang` },
                        { label: 'Bahan Bakar', value: vehicle.fuel.charAt(0).toUpperCase() + vehicle.fuel.slice(1) },
                        { label: 'Lokasi', value: vehicle.location },
                        { label: 'Rating', value: `${vehicle.rating}/5` },
                      ].map((spec, i) => (
                        <div key={i} className="p-3 rounded-xl neu-soft">
                          <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                          <p className="text-white font-medium">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Booking Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-luxury p-6 sticky top-24"
            >
              {/* Price */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mulai dari</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-gold-gradient font-bold text-3xl">
                    {formatCurrency(vehicle.pricePerDay)}
                  </p>
                  <span className="text-sm text-gray-500">/hari</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(vehicle.rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-white font-medium">{vehicle.rating}</span>
                  <span className="text-xs text-gray-500">({vehicle.reviews})</span>
                </div>
              </div>

              <div className="divider-subtle mb-6" />

              {/* Duration Selection */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Durasi Sewa</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'Harian' },
                    { id: 'weekly', label: 'Mingguan' },
                    { id: 'monthly', label: 'Bulanan' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDuration(opt.id as any)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        duration === opt.id
                          ? 'neu-gold text-gold-300'
                          : 'neu-soft text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rental Type */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Opsi Sewa</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'with_driver', label: 'Dengan Driver', icon: '🚗' },
                    { id: 'self_drive', label: 'Lepas Kunci', icon: '🔑' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRentalType(opt.id as any)}
                      className={`p-3 rounded-lg text-xs font-medium transition-all text-left ${
                        rentalType === opt.id
                          ? 'neu-gold text-gold-300'
                          : 'neu-soft text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <p className="mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mulai</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold-400/50 z-10" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-luxury pl-8 py-2 text-xs [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Selesai</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold-400/50 z-10" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-luxury pl-8 py-2 text-xs [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="divider-subtle my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durasi</span>
                  <span className="text-white">{days} hari</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(priceCalculation.basePrice)}</span>
                </div>
                {priceCalculation.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Diskon</span>
                    <span className="text-emerald-400">-{priceCalculation.discount}%</span>
                  </div>
                )}
                {priceCalculation.driverFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jasa Driver</span>
                    <span className="text-white">{formatCurrency(priceCalculation.driverFee)}</span>
                  </div>
                )}
                <div className="divider-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-gold-gradient font-bold text-lg">
                    {formatCurrency(priceCalculation.total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">DP (30%)</span>
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
                className="w-full btn-luxury py-3.5 text-base flex items-center justify-center gap-2"
              >
                BOOK NOW
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <p className="text-center text-xs text-gray-600 mt-3">
                Anda tidak akan dikenakan biaya sekarang
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
