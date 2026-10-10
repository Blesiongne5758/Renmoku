import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Car, Calendar, Users, MapPin, CreditCard, FileText, 
  CheckCircle, ArrowRight, ArrowLeft, Upload, Shield,
  AlertCircle, Clock, PenTool
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../data/mockData';

export default function BookingFlow() {
  const { selectedVehicle, setCurrentPage, setBookingStep, bookingStep } = useAppStore();
  const [rentalDuration, setRentalDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [rentalType, setRentalType] = useState<'with_driver' | 'self_drive'>('with_driver');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    ktpNumber: '',
    simNumber: '',
    address: '',
    phone: '',
    email: '',
    originCity: '',
    destinationCity: '',
    estimatedDistance: '',
    tripPurpose: '',
    guaranteeType: '',
    paymentMethod: '',
    agreeTerms: false,
  });

  // Upload status tracking
  const [uploadStatus, setUploadStatus] = useState({
    ktp: false,
    sim: false,
    kk: false,
  });

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

  const calculateTotal = () => {
    const days = startDate && endDate 
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    
    let basePrice = 0;
    if (rentalDuration === 'daily') basePrice = days * selectedVehicle.pricePerDay;
    else if (rentalDuration === 'weekly') basePrice = Math.ceil(days / 7) * selectedVehicle.pricePerWeek;
    else basePrice = Math.ceil(days / 30) * selectedVehicle.pricePerMonth;

    const driverFee = rentalType === 'with_driver' ? days * 300000 : 0;
    const total = basePrice + driverFee;
    const dp = total * 0.5;

    return { days, basePrice, driverFee, total, dp };
  };

  const pricing = calculateTotal();

  const handleNext = () => {
    if (bookingStep < 5) {
      setBookingStep(bookingStep + 1);
    } else {
      setCurrentPage('success');
    }
  };

  const handleBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
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
              <span className="text-sm text-gold-400 font-medium">Step {bookingStep}/5</span>
            </div>
            <div className="h-2 rounded-full neu-pressed overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(bookingStep / 5) * 100}%` }}
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
                      bookingStep >= step.id
                        ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-luxury-900'
                        : 'neu-soft text-gray-500'
                    }`}
                  >
                    {bookingStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    bookingStep >= step.id ? 'text-gold-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    bookingStep > step.id ? 'bg-gold-500' : 'bg-white/5'
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
                key={bookingStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card-luxury p-6"
              >
                {/* Step 1: Duration & Options */}
                {bookingStep === 1 && (
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
                          { id: 'daily', label: 'Harian', desc: '1-6 hari' },
                          { id: 'weekly', label: 'Mingguan', desc: '7-29 hari' },
                          { id: 'monthly', label: 'Bulanan', desc: '30+ hari' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRentalDuration(opt.id as any)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              rentalDuration === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <p className={`font-medium ${
                              rentalDuration === opt.id ? 'text-gold-300' : 'text-gray-300'
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
                          { id: 'with_driver', label: 'Dengan Driver', icon: '🚗', desc: 'Termasuk driver profesional' },
                          { id: 'self_drive', label: 'Lepas Kunci', icon: '🔑', desc: 'Self drive, bebas kemana saja' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRentalType(opt.id as any)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              rentalType === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`font-medium mt-2 ${
                              rentalType === opt.id ? 'text-gold-300' : 'text-gray-300'
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
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
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
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="input-luxury pl-10 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Renter Information */}
                {bookingStep === 2 && (
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
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                          value={formData.ktpNumber}
                          onChange={(e) => setFormData({ ...formData, ktpNumber: e.target.value })}
                          className="input-luxury"
                          placeholder="317XXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">No. SIM:</label>
                        <input
                          type="text"
                          value={formData.simNumber}
                          onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
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
                {bookingStep === 3 && (
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
                            value={formData.originCity}
                            onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
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
                            value={formData.destinationCity}
                            onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                            className="input-luxury pl-10"
                            placeholder="Kota tujuan"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Estimasi Jarak (km)</label>
                        <input
                          type="number"
                          value={formData.estimatedDistance}
                          onChange={(e) => setFormData({ ...formData, estimatedDistance: e.target.value })}
                          className="input-luxury"
                          placeholder="Contoh: 500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Tujuan Perjalanan</label>
                        <select
                          value={formData.tripPurpose}
                          onChange={(e) => setFormData({ ...formData, tripPurpose: e.target.value })}
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
                {bookingStep === 4 && (
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'ktp', label: 'KTP Asli', icon: '🆔' },
                          { id: 'bpkb', label: 'BPKB', icon: '📄' },
                          { id: 'cash', label: 'Uang Tunai', icon: '💵' },
                        ].map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, guaranteeType: opt.id })}
                            className={`p-4 rounded-xl text-center transition-all ${
                              formData.guaranteeType === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`text-sm font-medium mt-2 ${
                              formData.guaranteeType === opt.id ? 'text-gold-300' : 'text-gray-300'
                            }`}>
                              {opt.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Guarantee Document */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Upload Dokumen Jaminan</label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="p-6 rounded-xl neu-soft text-center cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300 font-medium">Upload Foto Jaminan</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG max 10MB</p>
                      </motion.div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">
                        Pembayaran DP (50%): {formatCurrency(pricing.dp)}
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
                            onClick={() => setFormData({ ...formData, paymentMethod: opt.id })}
                            className={`p-4 rounded-xl text-center transition-all ${
                              formData.paymentMethod === opt.id
                                ? 'neu-gold'
                                : 'neu-soft'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className={`text-sm font-medium mt-2 ${
                              formData.paymentMethod === opt.id ? 'text-gold-300' : 'text-gray-300'
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
                {bookingStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        Syarat & Ketentuan
                      </h2>
                      <p className="text-gray-400 text-sm">Baca dan setujui syarat & ketentuan sebelum melanjutkan</p>
                    </div>

                    {/* Terms */}
                    <div className="p-4 rounded-xl neu-pressed max-h-64 overflow-y-auto">
                      <div className="space-y-3 text-sm text-gray-300">
                        <p><strong className="text-gold-400">1. Ketentuan Umum</strong></p>
                        <p className="text-xs text-gray-400">
                          Penyewa wajib mengembalikan kendaraan dalam kondisi baik dan bersih. Keterlambatan pengembalian akan dikenakan denda 10% per hari.
                        </p>
                        <p><strong className="text-gold-400">2. Tanggung Jawab</strong></p>
                        <p className="text-xs text-gray-400">
                          Segala bentuk kerusakan yang terjadi selama masa sewa menjadi tanggung jawab penyewa, kecuali kerusakan yang disebabkan oleh faktor alam.
                        </p>
                        <p><strong className="text-gold-400">3. Pembayaran</strong></p>
                        <p className="text-xs text-gray-400">
                          DP 50% dibayar saat booking, pelunasan dilakukan saat pick-up kendaraan. Pembayaran dapat dilakukan melalui transfer bank, credit card, atau e-wallet.
                        </p>
                        <p><strong className="text-gold-400">4. Pembatalan</strong></p>
                        <p className="text-xs text-gray-400">
                          Pembatalan H-3 mendapat refund 100%, H-1 mendapat refund 50%, dan pada hari H tidak ada refund.
                        </p>
                      </div>
                    </div>

                    {/* Agreement */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 accent-gold-500"
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-gray-300 cursor-pointer">
                        Saya telah membaca dan menyetujui seluruh Syarat & Ketentuan yang berlaku
                      </label>
                    </div>

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
              {bookingStep > 1 && (
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
                {bookingStep === 5 ? 'Konfirmasi Booking' : 'Lanjut'}
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
                    {rentalType === 'with_driver' ? '🚗 Dengan Driver' : '🔑 Lepas Kunci'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2 mb-4 pb-4 border-b border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durasi</span>
                  <span className="text-white">{pricing.days} hari</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tipe Sewa</span>
                  <span className="text-white">{rentalDuration === 'daily' ? 'Harian' : rentalDuration === 'weekly' ? 'Mingguan' : 'Bulanan'}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(pricing.basePrice)}</span>
                </div>
                {pricing.driverFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jasa Driver</span>
                    <span className="text-white">{formatCurrency(pricing.driverFee)}</span>
                  </div>
                )}
                <div className="divider-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-gold-gradient font-bold text-lg">{formatCurrency(pricing.total)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-gray-400">DP (50%)</span>
                  <span className="text-gold-400 font-medium">{formatCurrency(pricing.dp)}</span>
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
