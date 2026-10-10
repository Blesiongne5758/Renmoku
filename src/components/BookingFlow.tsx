import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Car, Calendar, Users, MapPin, CreditCard, FileText, 
  CheckCircle, ArrowRight, ArrowLeft, Upload, Shield,
  AlertCircle, Clock, PenTool
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useBookingStore } from '../store/useBookingStore';
import { formatCurrency } from '../data/mockData';
import { getTermsByUserType } from '../data/termsAndConditions';
import TermsAndConditions from './TermsAndConditions';

export default function BookingFlow() {
  const { selectedVehicle, setCurrentPage } = useAppStore();
  const {
    currentStep,
    setCurrentStep,
    durationType,
    setDuration,
    withDriver,
    startDate,
    endDate,
    setDates,
    renterInfo,
    setRenterInfo,
    tripPlan,
    setTripPlan,
    guaranteeType,
    guaranteeDocs,
    setGuarantee,
    totalPrice,
    dpAmount,
    calculatePricing,
    reset,
  } = useBookingStore();

  // Local state for UI-only concerns
  const [uploadStatus, setUploadStatus] = useState({
    ktp: false,
    sim: false,
    kk: false,
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Initialize vehicle and calculate pricing when component mounts
  useEffect(() => {
    if (selectedVehicle) {
      useBookingStore.getState().setVehicle(selectedVehicle.id);
    }
  }, [selectedVehicle]);

  // Calculate pricing whenever dates or duration changes
  useEffect(() => {
    if (selectedVehicle && durationType && startDate && endDate) {
      calculatePricing(
        selectedVehicle.pricePerDay,
        selectedVehicle.pricePerWeek,
        selectedVehicle.pricePerMonth
      );
    }
  }, [durationType, startDate, endDate, withDriver, selectedVehicle, calculatePricing]);

  if (!selectedVehicle) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gold-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tidak Ada Kendaraan Dipilih</h2>
          <p className="text-gray-400 mb-6">Silakan pilih kendaraan terlebih dahulu</p>
          <button
            onClick={() => setCurrentPage('fleet')}
            className="btn-luxury"
          >
            Pilih Kendaraan
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Durasi & Opsi', icon: Calendar },
    { id: 2, title: 'Data Penyewa', icon: Users },
    { id: 3, title: 'Perjalanan', icon: MapPin },
    { id: 4, title: 'Jaminan & Bayar', icon: CreditCard },
    { id: 5, title: 'Konfirmasi', icon: CheckCircle },
  ];

  // Calculate days for display
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentPage('success');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper to convert duration type
  const getDurationTypeLabel = (type: string | null) => {
    if (type === 'DAILY') return 'Harian';
    if (type === 'WEEKLY') return 'Mingguan';
    if (type === 'MONTHLY') return 'Bulanan';
    return 'Harian';
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gold-400 font-medium">Step {currentStep}/5</span>
            </div>
            <div className="h-2 rounded-full neu-pressed overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 5) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-luxury-900'
                        : 'neu-soft text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-gold-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-gold-500' : 'bg-white/5'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card-luxury p-6"
              >
                {/* Step 1: Duration & Options */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        Pilih Durasi & Opsi Sewa
                      </h2>
                      <p className="text-gray-400 text-sm">Tentukan bagaimana Anda ingin menyewa kendaraan</p>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Durasi Sewa</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'DAILY', label: 'Harian', desc: '1-6 hari' },
                          { id: 'WEEKLY', label: 'Mingguan', desc: '7-29 hari' },
                          { id: 'MONTHLY', label: 'Bulanan', desc: '30+ hari' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDuration(opt.id as any, withDriver)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              durationType === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <p className={`font-medium ${
                              durationType === opt.id ? 'text-gold-300' : 'text-gray-300'
                            }`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Rental Type */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Opsi Sewa</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: true, label: 'Dengan Driver', icon: '🚗', desc: 'Termasuk driver profesional' },
                          { id: false, label: 'Lepas Kunci', icon: '🔑', desc: 'Self drive, bebas kemana saja' },
                        ].map((opt) => (
                          <motion.button
                            key={String(opt.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDuration(durationType || 'DAILY', opt.id)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              withDriver === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`font-medium mt-2 ${
                              withDriver === opt.id ? 'text-gold-300' : 'text-gray-300'
                            }`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Tanggal Sewa</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Tanggal Mulai</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                            <input
                              type="date"
                              value={startDate || ''}
                              onChange={(e) => setDates(e.target.value, endDate || '')}
                              className="input-luxury pl-10 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Tanggal Selesai</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                            <input
                              type="date"
                              value={endDate || ''}
                              onChange={(e) => setDates(startDate || '', e.target.value)}
                              className="input-luxury pl-10 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Renter Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        STEP 2: Informasi Penyewa
                      </h2>
                      <p className="text-gray-400 text-sm">Lengkapi data diri Anda untuk proses verifikasi</p>
                    </div>

                    {/* Nama Lengkap - Full Width */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Nama Lengkap:</label>
                      <input
                        type="text"
                        value={renterInfo.fullName}
                        onChange={(e) => setRenterInfo({ fullName: e.target.value })}
                        className="input-luxury w-full"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* No. KTP dan No. SIM - 2 Kolom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">No. KTP:</label>
                        <input
                          type="text"
                          value={renterInfo.ktpNumber}
                          onChange={(e) => setRenterInfo({ ktpNumber: e.target.value })}
                          className="input-luxury"
                          placeholder="317XXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">No. SIM:</label>
                        <input
                          type="text"
                          value={renterInfo.simNumber}
                          onChange={(e) => setRenterInfo({ simNumber: e.target.value })}
                          className="input-luxury"
                          placeholder="123XXXXXXXXX"
                        />
                      </div>
                    </div>

                    {/* Upload Dokumen */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Upload Dokumen:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'ktp', label: 'KTP', uploaded: uploadStatus.ktp },
                          { id: 'sim', label: 'SIM', uploaded: uploadStatus.sim },
                          { id: 'kk', label: 'KK', uploaded: uploadStatus.kk },
                        ].map((doc) => (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setUploadStatus({ ...uploadStatus, [doc.id]: !doc.uploaded })}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                              doc.uploaded
                                ? 'neu-gold border-2 border-gold-500/30'
                                : 'neu-soft'
                            }`}
                          >
                            {doc.uploaded ? (
                              <>
                                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-2">
                                  <FileText className="w-6 h-6 text-gold-400" />
                                </div>
                                <p className="text-sm text-gold-300 font-medium mb-1">{doc.label}</p>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                  <Upload className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium mb-1">{doc.label}</p>
                                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Lanjut Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      className="w-full btn-luxury py-3.5 flex items-center justify-center gap-2"
                    >
                      LANJUT
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Step 3: Trip Plan */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        Rencana Perjalanan
                      </h2>
                      <p className="text-gray-400 text-sm">Informasi tentang rencana perjalanan Anda</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Kota Asal</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                          <input
                            type="text"
                            value={tripPlan.origin}
                            onChange={(e) => setTripPlan({ origin: e.target.value })}
                            className="input-luxury pl-10"
                            placeholder="Kota asal"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Kota Tujuan</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/50 z-10" />
                          <input
                            type="text"
                            value={tripPlan.destination}
                            onChange={(e) => setTripPlan({ destination: e.target.value })}
                            className="input-luxury pl-10"
                            placeholder="Kota tujuan"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-400 mb-1.5 block">Tujuan Perjalanan</label>
                        <select
                          value={tripPlan.purpose}
                          onChange={(e) => setTripPlan({ purpose: e.target.value })}
                          className="input-luxury"
                        >
                          <option value="">Pilih tujuan</option>
                          <option value="bisnis">Bisnis</option>
                          <option value="wisata">Wisata</option>
                          <option value="keluarga">Keluarga</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl glass-gold">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gold-300 font-medium mb-1">Informasi Penting</p>
                          <p className="text-xs text-gray-400">
                            Untuk sewa dengan driver, biaya BBM dan tol ditanggung penyewa. Driver tersedia 24 jam dengan shift 12 jam.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Guarantee & Payment */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        Jaminan & Pembayaran
                      </h2>
                      <p className="text-gray-400 text-sm">Pilih jenis jaminan dan metode pembayaran</p>
                    </div>

                    {/* Guarantee Type */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Pilih Jaminan</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'KTP', label: 'KTP Asli', icon: '🆔' },
                          { id: 'BPKB', label: 'BPKB', icon: '📄' },
                          { id: 'CASH', label: 'Uang Tunai', icon: '💵' },
                          { id: 'GUARANTEE_LETTER', label: 'Guarantee Letter', icon: '📋' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setGuarantee(opt.id as any, guaranteeDocs)}
                            className={`p-4 rounded-xl text-center transition-all ${
                              guaranteeType === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`text-sm font-medium mt-2 ${
                              guaranteeType === opt.id ? 'text-gold-300' : 'text-gray-300'
                            }`}>
                              {opt.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">
                        Pembayaran DP (50%): {formatCurrency(dpAmount)}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'transfer', label: 'Transfer Bank', icon: '🏦' },
                          { id: 'cc', label: 'Credit Card', icon: '💳' },
                          { id: 'ewallet', label: 'E-Wallet', icon: '📱' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod(opt.id)}
                            className={`p-4 rounded-xl text-center transition-all ${
                              paymentMethod === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`text-sm font-medium mt-2 ${
                              paymentMethod === opt.id ? 'text-gold-300' : 'text-gray-300'
                            }`}>
                              {opt.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Terms & Confirmation */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Terms and Conditions Component */}
                    <TermsAndConditions
                      terms={getTermsByUserType('individual')}
                      agreed={agreeTerms}
                      onAgree={setAgreeTerms}
                    />

                    {/* E-Signature */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">E-Signature</label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="p-6 rounded-xl neu-soft text-center cursor-pointer"
                      >
                        <PenTool className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">Tanda Tangan Digital</p>
                        <p className="text-xs text-gray-500 mt-1">Klik untuk membuat e-signature</p>
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="flex-1 btn-ghost py-3 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 btn-luxury py-3 flex items-center justify-center gap-2"
              >
                {currentStep === 5 ? 'Konfirmasi Booking' : 'Lanjut'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-luxury p-5 sticky top-24"
            >
              <h3 className="font-[Playfair_Display] text-lg font-bold text-white mb-4">
                Ringkasan Pesanan
              </h3>

              {/* Vehicle */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-white/5">
                <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-white font-medium text-sm">{selectedVehicle.name}</p>
                  <p className="text-xs text-gray-500">{selectedVehicle.brand} • {selectedVehicle.year}</p>
                  <p className="text-xs text-gold-400 mt-1">
                    {withDriver ? '🚗 Dengan Driver' : '🔑 Lepas Kunci'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2 mb-4 pb-4 border-b border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durasi</span>
                  <span className="text-white">{days} hari</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tipe Sewa</span>
                  <span className="text-white">{getDurationTypeLabel(durationType)}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(totalPrice - (withDriver ? days * 150000 : 0))}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jasa Driver</span>
                    <span className="text-white">{formatCurrency(days * 150000)}</span>
                  </div>
                )}
                <div className="divider-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-gold-gradient font-bold text-lg">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-gray-400">DP (50%)</span>
                  <span className="text-gold-400 font-medium">{formatCurrency(dpAmount)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-gray-500">Asuransi all-risk included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-gray-500">24/7 roadside assistance</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
