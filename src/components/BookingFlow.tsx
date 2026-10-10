import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, User, FileText, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, Shield, Clock, MapPin
} from 'lucide-react';
import { useAppStore, RentalType, UserRole } from '../stores/useAppStore';
import { formatCurrency, calculatePrice, getDurationDiscount } from '../data/mockData';

const steps = [
  { id: 0, label: 'Kendaraan', icon: Car },
  { id: 1, label: 'Data Penyewa', icon: User },
  { id: 2, label: 'Perjalanan', icon: MapPin },
  { id: 3, label: 'Dokumen', icon: FileText },
  { id: 4, label: 'Pembayaran', icon: CreditCard },
  { id: 5, label: 'Konfirmasi', icon: CheckCircle2 },
];

export default function BookingFlow() {
  const { selectedVehicle, bookingStep, setBookingStep, setCurrentPage } = useAppStore();
  const [renterType, setRenterType] = useState<UserRole>('individual');
  const [rentalType, setRentalType] = useState<RentalType>('with_driver');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ktp: '',
    sim: '',
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    companyName: '',
    nib: '',
    npwp: '',
    pic: '',
  });

  const vehicle = selectedVehicle;

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gold-400 mx-auto mb-4" />
          <h2 className="font-[Playfair_Display] text-2xl text-white mb-2">Pilih Kendaraan</h2>
          <p className="text-gray-400 mb-6">Silakan pilih kendaraan dari halaman armada terlebih dahulu</p>
          <button
            onClick={() => setCurrentPage('fleet')}
            className="btn-luxury"
          >
            Lihat Armada
          </button>
        </div>
      </div>
    );
  }

  const duration = formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  const basePrice = calculatePrice(vehicle, duration);
  const discount = getDurationDiscount(duration);
  const totalPrice = basePrice * (1 - discount / 100);
  const dpAmount = totalPrice * 0.3;
  const remainingAmount = totalPrice - dpAmount;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setBookingStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    bookingStep === step.id
                      ? 'bg-gold-500/20 border border-gold-500/30'
                      : bookingStep > step.id
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-white/[0.02] border border-white/5'
                  }`}
                >
                  <step.icon className={`w-4 h-4 ${
                    bookingStep === step.id ? 'text-gold-400' :
                    bookingStep > step.id ? 'text-emerald-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs font-medium hidden sm:block ${
                    bookingStep === step.id ? 'text-gold-300' :
                    bookingStep > step.id ? 'text-emerald-300' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-px mx-1 ${
                    bookingStep > step.id ? 'bg-emerald-500/30' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={bookingStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-6 border border-gold-500/10"
              >
                {/* Step 0: Vehicle Selection */}
                {bookingStep === 0 && (
                  <div>
                    <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-6">
                      Konfirmasi Kendaraan
                    </h3>
                    
                    {/* Selected vehicle preview */}
                    <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                      <img src={vehicle.image} alt={vehicle.name} className="w-24 h-24 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-white font-semibold">{vehicle.name}</h4>
                        <p className="text-sm text-gray-400">{vehicle.brand} • {vehicle.year}</p>
                        <p className="text-gold-400 font-bold mt-1">{formatCurrency(vehicle.pricePerDay)}/hari</p>
                      </div>
                    </div>

                    {/* Rental type */}
                    <div className="mb-6">
                      <label className="text-sm text-gray-300 mb-3 block">Opsi Sewa</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'with_driver' as RentalType, label: 'Dengan Driver', icon: '🚗', desc: 'Termasuk driver profesional' },
                          { value: 'self_drive' as RentalType, label: 'Lepas Kunci', icon: '🔑', desc: 'Self drive, bebas kemana saja' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setRentalType(opt.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              rentalType === opt.value
                                ? 'bg-gold-500/10 border-gold-500/30'
                                : 'bg-white/[0.02] border-white/5 hover:border-gold-500/20'
                            }`}
                          >
                            <span className="text-2xl">{opt.icon}</span>
                            <p className="text-white font-medium mt-2">{opt.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Tanggal Mulai</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Tanggal Selesai</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Renter Data */}
                {bookingStep === 1 && (
                  <div>
                    <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-6">
                      Data Penyewa
                    </h3>

                    {/* Renter type */}
                    <div className="mb-6">
                      <label className="text-sm text-gray-300 mb-3 block">Tipe Penyewa</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'individual' as UserRole, label: 'Pribadi', desc: 'KTP, SIM A, KK' },
                          { value: 'corporate' as UserRole, label: 'Corporate', desc: 'NIB, Akta, NPWP' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setRenterType(opt.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              renterType === opt.value
                                ? 'bg-gold-500/10 border-gold-500/30'
                                : 'bg-white/[0.02] border-white/5 hover:border-gold-500/20'
                            }`}
                          >
                            <p className="text-white font-medium">{opt.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            {renterType === 'individual' ? 'Nama Lengkap' : 'Nama Perusahaan'}
                          </label>
                          <input
                            type="text"
                            value={renterType === 'individual' ? formData.name : formData.companyName}
                            onChange={(e) => setFormData({
                              ...formData,
                              ...(renterType === 'individual' ? { name: e.target.value } : { companyName: e.target.value })
                            })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder={renterType === 'individual' ? 'Sesuai KTP' : 'PT / CV'}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">No. Telepon</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="+62 812 xxx xxxx"
                          />
                        </div>
                        {renterType === 'individual' ? (
                          <>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">No. KTP</label>
                              <input
                                type="text"
                                value={formData.ktp}
                                onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                                placeholder="16 digit NIK"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">NIB</label>
                              <input
                                type="text"
                                value={formData.nib}
                                onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                                placeholder="Nomor Induk Berusaha"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      {renterType === 'corporate' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">NPWP</label>
                            <input
                              type="text"
                              value={formData.npwp}
                              onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                              placeholder="NPWP Perusahaan"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">PIC (Person in Charge)</label>
                            <input
                              type="text"
                              value={formData.pic}
                              onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                              placeholder="Nama PIC"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Trip Details */}
                {bookingStep === 2 && (
                  <div>
                    <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-6">
                      Rencana Perjalanan
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Lokasi Penjemputan</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                          <input
                            type="text"
                            value={formData.pickupLocation}
                            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="Alamat / landmark penjemputan"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Lokasi Pengantaran</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                          <input
                            type="text"
                            value={formData.dropoffLocation}
                            onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="Alamat / landmark pengantaran"
                          />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
                        <p className="text-sm text-gold-300">
                          💡 <strong>Catatan:</strong> Untuk sewa dengan driver, biaya BBM dan tol ditanggung penyewa.
                          Driver tersedia 24 jam dengan shift 12 jam.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Documents */}
                {bookingStep === 3 && (
                  <div>
                    <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-6">
                      Upload Dokumen & Jaminan
                    </h3>
                    <div className="space-y-4">
                      {renterType === 'individual' ? (
                        <>
                          <p className="text-sm text-gray-400 mb-4">
                            Syarat penyewa pribadi: Upload foto dokumen berikut
                          </p>
                          {['KTP (Kartu Tanda Penduduk)', 'SIM A (Surat Izin Mengemudi)', 'KK (Kartu Keluarga)', 'Jaminan (BPKB/Sertifikat)'].map((doc, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gold-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{doc}</p>
                                <p className="text-xs text-gray-500">JPG, PNG max 5MB</p>
                              </div>
                              <span className="text-xs text-gold-400">Upload</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400 mb-4">
                            Syarat penyewa corporate: Upload dokumen berikut
                          </p>
                          {['NIB (Nomor Induk Berusaha)', 'Akta Pendirian Perusahaan', 'NPWP Perusahaan', 'Guarantee Letter', 'KTP PIC'].map((doc, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gold-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{doc}</p>
                                <p className="text-xs text-gray-500">PDF, JPG max 10MB</p>
                              </div>
                              <span className="text-xs text-gold-400">Upload</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Payment */}
                {bookingStep === 4 && (
                  <div>
                    <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-6">
                      Pembayaran
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10">
                        <p className="text-sm text-gold-300 font-medium mb-2">Sistem Pembayaran DP</p>
                        <p className="text-xs text-gray-400">
                          Bayar DP 30% untuk konfirmasi booking. Pelunasan dilakukan saat pick-up kendaraan.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                          <p className="text-xs text-gray-500 mb-1">DP (30%)</p>
                          <p className="text-gold-gradient font-bold text-xl">{formatCurrency(dpAmount)}</p>
                          <p className="text-xs text-gray-500 mt-1">Bayar sekarang</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                          <p className="text-xs text-gray-500 mb-1">Pelunasan</p>
                          <p className="text-white font-bold text-xl">{formatCurrency(remainingAmount)}</p>
                          <p className="text-xs text-gray-500 mt-1">Saat pick-up</p>
                        </div>
                      </div>

                      {/* Payment methods */}
                      <div>
                        <p className="text-sm text-gray-300 mb-3">Metode Pembayaran</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['Bank Transfer', 'Virtual Account', 'E-Wallet', 'Credit Card', 'QRIS', 'Klaim Corporate'].map((method, i) => (
                            <button
                              key={i}
                              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 text-sm text-gray-300 hover:text-white transition-all text-center"
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {bookingStep === 5 && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </div>
                    </motion.div>
                    <h3 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                      Booking Berhasil!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Booking ID: <span className="text-gold-400 font-mono">#BK-{Date.now().toString(36).toUpperCase()}</span>
                    </p>
                    <div className="glass rounded-xl p-4 max-w-sm mx-auto mb-6">
                      <p className="text-xs text-gray-500 mb-2">E-Contract akan dikirim ke email Anda</p>
                      <p className="text-xs text-gray-500">Tim kami akan menghubungi dalam 5 menit untuk konfirmasi</p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('dashboard')}
                      className="btn-luxury"
                    >
                      Lihat Dashboard
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            {bookingStep < 5 && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setBookingStep(Math.max(0, bookingStep - 1))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors ${bookingStep === 0 ? 'invisible' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBookingStep(Math.min(5, bookingStep + 1))}
                  className="btn-luxury flex items-center gap-2"
                >
                  {bookingStep === 4 ? 'Bayar DP' : 'Lanjut'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-5 border border-gold-500/10 sticky top-24"
            >
              <h4 className="font-[Playfair_Display] text-lg font-bold text-white mb-4">
                Ringkasan Pesanan
              </h4>

              {/* Vehicle */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-white/5">
                <img src={vehicle.image} alt={vehicle.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-white font-medium text-sm">{vehicle.name}</p>
                  <p className="text-xs text-gray-500">{vehicle.brand} • {vehicle.year}</p>
                  <p className="text-xs text-gold-400 mt-1">
                    {rentalType === 'with_driver' ? '🚗 Dengan Driver' : '🔑 Lepas Kunci'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2 mb-4 pb-4 border-b border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Durasi</span>
                  <span className="text-white">{duration} hari</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Diskon</span>
                    <span className="text-emerald-400">-{discount}%</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-300">Total</span>
                  <span className="text-gold-gradient">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-400">DP (30%)</span>
                  <span className="text-gold-400 font-medium">{formatCurrency(dpAmount)}</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
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
