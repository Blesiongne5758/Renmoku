import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Car, Calendar, Users, MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, AlertCircle, Shield, Clock } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useBookingStore } from '../store/useBookingStore';
import { formatCurrency } from '../data/mockData';
import { getTermsByUserType, individualTerms } from '../data/termsAndConditions';
import TermsAndConditions from './TermsAndConditions';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import RenterIdentityForm, { RenterIdentity } from './RenterIdentityForm';
import DigitalSignaturePad from './DigitalSignaturePad';

export default function BookingFlow() {
  const { selectedVehicle, setCurrentPage, currentUser, setCurrentUser } = useAppStore();
  const {
    currentStep,
    setCurrentStep,
    durationType,
    setDuration,
    withDriver,
    startDate,
    endDate,
    setDates,
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

  const [identity, setIdentity] = useState<RenterIdentity>({ fullName: '', email: '', phone: '', ktpNumber: '', simNumber: '', address: '', latitude: null, longitude: null, files: {}, paths: {} });
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signedContractSnapshot, setSignedContractSnapshot] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [bookingFeeProof, setBookingFeeProof] = useState<File | null>(null);
  const [bookingFeeQris, setBookingFeeQris] = useState('');
  const [reusableFeeId, setReusableFeeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    void Promise.all([
      supabase.from('booking_fee_settings').select('qris_image_path').eq('id', true).maybeSingle(),
      currentUser?.id ? supabase.from('booking_fee_transactions').select('id').eq('renter_id', currentUser.id).eq('status', 'PAID_AVAILABLE').is('current_booking_id', null).order('created_at', { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]).then(([setting, reusable]) => {
      if (!alive) return;
      const path = setting.data?.qris_image_path;
      if (path) setBookingFeeQris(supabase.storage.from('booking-fee-qris').getPublicUrl(path).data.publicUrl);
      if (reusable.data?.id) setReusableFeeId(reusable.data.id);
    });
    return () => { alive = false; };
  }, [currentUser?.id]);

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

  const createContractSnapshot = () => JSON.stringify({
    title: 'Perjanjian Sewa Menyewa Kendaraan Renmoku', version: individualTerms.version,
    renter: { name: identity.fullName.trim(), email: identity.email, phone: identity.phone.trim(), ktp: identity.ktpNumber, simA: identity.simNumber, address: identity.address.trim(), latitude: identity.latitude, longitude: identity.longitude },
    vehicle: { id: selectedVehicle.id, name: selectedVehicle.name }, rental: { startDate, endDate, durationType, withDriver, totalPrice, dpAmount },
    trip: tripPlan, guaranteeType, bookingFee: 25000, termsAccepted: agreeTerms, acceptedTerms: individualTerms.sections,
    termsText: 'Penyewa menyatakan data benar, mematuhi masa dan tujuan sewa, menjaga kendaraan, bertanggung jawab atas pelanggaran dan kerusakan sesuai perjanjian, serta mengembalikan kendaraan sesuai waktu dan kondisi yang disepakati. Perubahan/perpanjangan harus disetujui pemilik. Biaya booking Rp25.000 tidak dapat dikembalikan; jika kendaraan pilihan tidak tersedia biaya yang telah divalidasi digunakan untuk memilih kendaraan lain sampai pemilik mengonfirmasi ketersediaan.',
  });
  const invalidateSignature = () => { setSignatureDataUrl(''); setSignedContractSnapshot(''); };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!currentUser?.id) { toast.error('Masuk ke akun penyewa terlebih dahulu.'); setCurrentPage('auth'); return; }
      if (!agreeTerms) { toast.error('Setujui syarat dan ketentuan sebelum melanjutkan.'); return; }
      if (!guaranteeType || !durationType || !startDate || !endDate || !tripPlan.origin.trim() || !tripPlan.destination.trim()) { toast.error('Lengkapi durasi, tanggal, perjalanan, dan jaminan.'); return; }
      if (!identity.fullName.trim() || !identity.email || !identity.phone.trim() || !/^\d{16}$/.test(identity.ktpNumber) || !identity.simNumber.trim() || identity.address.trim().length < 10) { toast.error('Lengkapi nama, email akun, telepon, NIK 16 digit, SIM A, dan alamat domisili.'); setCurrentStep(2); return; }
      const requiredDocuments: Array<keyof RenterIdentity['files']> = ['ktp','simA','familyCard','selfieKtp'];
      if (requiredDocuments.some((key) => !identity.files[key] && !identity.paths[key])) { toast.error('Lengkapi KTP, SIM A, Kartu Keluarga, dan selfie memegang KTP.'); setCurrentStep(2); return; }
      if (!signatureDataUrl) { toast.error('Tanda tangani perjanjian sewa secara digital.'); setCurrentStep(5); return; }
      if (signedContractSnapshot !== createContractSnapshot()) { setSignatureDataUrl(''); setSignedContractSnapshot(''); toast.error('Data kontrak berubah setelah tanda tangan. Periksa kontrak lalu tanda tangani ulang.'); setCurrentStep(5); return; }
      if (!reusableFeeId && !bookingFeeProof) { toast.error('Unggah bukti pembayaran biaya booking Rp25.000.'); return; }
      setSubmitting(true);
      const uploadPrivate = async (file: File, path: string) => {
        const { data, error } = await supabase.storage.from('renter-kyc-private').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        return data.path;
      };
      let proofPath: string | null = null;
      let savedSignaturePath = '';
      try {
        const documentPath = async (key: keyof RenterIdentity['files'], oldPath: string | undefined) => {
          const file = identity.files[key];
          if (!file) return oldPath;
          const extension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
          return uploadPrivate(file, `${currentUser.id}/kyc/${key}-${crypto.randomUUID()}.${extension}`);
        };
        const [ktpPath, simPath, familyPath, selfiePath] = await Promise.all([
          documentPath('ktp', identity.paths.ktp), documentPath('simA', identity.paths.simA),
          documentPath('familyCard', identity.paths.familyCard), documentPath('selfieKtp', identity.paths.selfieKtp),
        ]);
        if (!ktpPath || !simPath || !familyPath || !selfiePath) throw new Error('Dokumen identitas belum lengkap.');
        const { error: profileError } = await supabase.from('users').update({ full_name: identity.fullName.trim(), phone: identity.phone.trim() }).eq('id', currentUser.id);
        if (profileError) throw profileError;
        setCurrentUser({ ...currentUser, name: identity.fullName.trim(), phone: identity.phone.trim() });
        const { error: kycError } = await supabase.from('kyc_documents_individual').upsert({
          user_id: currentUser.id, ktp_number: identity.ktpNumber, ktp_scan_url: ktpPath,
          sim_number: identity.simNumber, sim_scan_url: simPath, kk_scan_url: familyPath, selfie_ktp_url: selfiePath,
          address: identity.address.trim(), residential_latitude: identity.latitude, residential_longitude: identity.longitude,
        }, { onConflict: 'user_id' });
        if (kycError) throw kycError;
        const signatureBlob = await (await fetch(signatureDataUrl)).blob();
        savedSignaturePath = await uploadPrivate(new File([signatureBlob], 'renter-signature.png', { type: 'image/png' }), `${currentUser.id}/contracts/${crypto.randomUUID()}.png`);
        const contractSnapshot = createContractSnapshot();
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(contractSnapshot));
        const contractHash = Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2,'0')).join('');
        if (!reusableFeeId && bookingFeeProof) {
          const ext = bookingFeeProof.type === 'image/png' ? 'png' : bookingFeeProof.type === 'image/webp' ? 'webp' : 'jpg';
          proofPath = `${currentUser.id}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('booking-fee-proofs').upload(proofPath, bookingFeeProof, { contentType: bookingFeeProof.type });
          if (uploadError) throw uploadError;
        }
        const payload = {
          vehicle_id: selectedVehicle.id, start_date: startDate, end_date: endDate, duration_type: durationType,
          with_driver: withDriver, total_price: totalPrice, dp_amount: dpAmount,
          trip_origin: tripPlan.origin, trip_destination: tripPlan.destination, trip_purpose: tripPlan.purpose || 'Perjalanan pribadi',
          guarantee_type: guaranteeType, guarantee_doc_url: null,
          contract_signed: true, contract_signer_name: identity.fullName.trim(), contract_version: '1.0.0',
          contract_content_snapshot: contractSnapshot, contract_sha256: contractHash, contract_signature_path: savedSignaturePath,
        };
        const { error: submitError } = await supabase.rpc('submit_booking_with_fee', {
          p_booking: payload, p_proof_path: proofPath, p_reuse_transaction_id: reusableFeeId || null,
        });
        if (submitError) throw submitError;
      } catch (error) {
        // Keep newly uploaded identity files: the KYC profile may already reference them.
        setSubmitting(false);
        toast.error(error instanceof Error && error.message.includes('vehicle_unavailable') ? 'Kendaraan tidak lagi tersedia. Pilih kendaraan lain.' : error instanceof Error && error.message ? `Data profil atau booking gagal disimpan: ${error.message}` : 'Data profil atau booking gagal disimpan.');
        return;
      }
      setSubmitting(false);
      toast.success(reusableFeeId ? 'Booking pengganti terkirim menggunakan biaya yang sudah dibayar.' : 'Booking dan bukti pembayaran terkirim untuk validasi admin.');
      reset();
      setCurrentPage('dashboard');
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
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
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
                            onClick={() => { invalidateSignature(); setDuration(opt.id as any, withDriver); }}
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
                            onClick={() => { invalidateSignature(); setDuration(durationType || 'DAILY', opt.id); }}
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
                              onChange={(e) => { invalidateSignature(); setDates(e.target.value, endDate || ''); }}
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
                              onChange={(e) => { invalidateSignature(); setDates(startDate || '', e.target.value); }}
                              className="input-luxury pl-10 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Renter Profile and Documents */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
                        STEP 2: Profil dan Dokumen Penyewa
                      </h2>
                      <p className="text-gray-400 text-sm">Lengkapi profil penyewa, lokasi domisili, dan dokumen verifikasi.</p>
                    </div>
                    <RenterIdentityForm value={identity} onChange={(next) => { setIdentity(next); setSignatureDataUrl(''); setSignedContractSnapshot(''); }}/>
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
                            onChange={(e) => { invalidateSignature(); setTripPlan({ origin: e.target.value }); }}
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
                            onChange={(e) => { invalidateSignature(); setTripPlan({ destination: e.target.value }); }}
                            className="input-luxury pl-10"
                            placeholder="Kota tujuan"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-400 mb-1.5 block">Tujuan Perjalanan</label>
                        <select
                          value={tripPlan.purpose}
                          onChange={(e) => { invalidateSignature(); setTripPlan({ purpose: e.target.value }); }}
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
                            onClick={() => { invalidateSignature(); setGuarantee(opt.id as any, guaranteeDocs); }}
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

                    {/* Fixed booking fee, paid via admin QRIS */}
                    <div>
                      <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-gold-200">Biaya booking satu transaksi · Rp25.000</p><p className="mt-1 max-w-xl text-xs leading-5 text-gray-400">Bayar melalui QRIS admin dan unggah bukti. Biaya tidak dapat dikembalikan. Jika kendaraan tidak tersedia, biaya yang tervalidasi dapat dipakai kembali untuk memilih kendaraan lain tanpa biaya tambahan sampai pemilik mengonfirmasi ketersediaan.</p></div><span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">QRIS statis</span></div>
                        {reusableFeeId ? <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><input type="checkbox" checked={!bookingFeeProof} onChange={(event) => { if (event.target.checked) setBookingFeeProof(null); else setReusableFeeId(''); }} className="mt-1 accent-yellow-400"/><span className="text-sm text-emerald-200">Gunakan biaya booking yang sudah dibayar untuk kendaraan pengganti. Tidak perlu membayar ulang.</span></label> : <>
                          {bookingFeeQris ? <img src={bookingFeeQris} alt="QRIS pembayaran biaya booking" className="mx-auto my-4 max-h-64 rounded-xl bg-white p-2"/> : <p className="my-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">QRIS booking belum diatur oleh admin. Pembayaran belum dapat dilanjutkan.</p>}
                          <label className="block text-sm text-gray-300">Unggah bukti pembayaran (JPG, PNG, WEBP · maks. 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setBookingFeeProof(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-gray-200"/></label>
                          {bookingFeeProof && <p className="mt-2 text-xs text-emerald-300">Bukti siap diunggah: {bookingFeeProof.name}</p>}
                        </>}
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
                      onAgree={(agreed) => { invalidateSignature(); setAgreeTerms(agreed); }}
                    />

                    <section className="space-y-3 rounded-xl border border-gold-500/20 bg-gold-500/5 p-4">
                      <div><p className="text-xs font-semibold uppercase tracking-wider text-gold-300">Perjanjian elektronik sewa kendaraan</p><h3 className="mt-1 font-[Playfair_Display] text-xl font-bold text-white">Ringkasan kontrak Anda</h3></div>
                      <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-gray-500">Penyewa</dt><dd className="text-gray-100">{identity.fullName || 'Nama sesuai KTP'} · {identity.email || 'Email akun'}</dd><dd className="text-xs text-gray-400">{identity.phone || 'Nomor telepon'} · NIK {identity.ktpNumber ? `••••${identity.ktpNumber.slice(-4)}` : '—'}</dd></div><div><dt className="text-xs text-gray-500">Kendaraan dan pemilik</dt><dd className="text-gray-100">{selectedVehicle.name}</dd><dd className="text-xs text-gray-400">Pemilik rental kendaraan yang dipilih</dd></div><div><dt className="text-xs text-gray-500">Masa sewa</dt><dd className="text-gray-100">{startDate || 'Tanggal mulai'} – {endDate || 'Tanggal selesai'} · {withDriver ? 'Dengan driver' : 'Lepas kunci'}</dd></div><div><dt className="text-xs text-gray-500">Harga sewa dan booking</dt><dd className="text-gray-100">{formatCurrency(totalPrice)} · biaya booking Rp25.000</dd><dd className="text-xs text-gray-400">Biaya booking tidak dapat dikembalikan. Jika kendaraan tidak tersedia, biaya terverifikasi dipakai untuk kendaraan lain sampai pemilik mengonfirmasi.</dd></div></dl>
                      <div className="rounded-lg border border-white/5 bg-black/20 p-3 text-xs leading-5 text-gray-300"><p className="font-medium text-gray-100">Ketentuan utama</p><p className="mt-1">Penyewa bertanggung jawab atas kebenaran data, penggunaan kendaraan sesuai tujuan dan masa sewa, perawatan wajar, denda/pelanggaran selama penggunaan, serta pengembalian kendaraan sesuai waktu dan kondisi yang disepakati. Perubahan masa sewa memerlukan persetujuan pemilik. Detail hak dan kewajiban mengikuti seluruh syarat dan ketentuan di atas dan tersimpan sebagai salinan kontrak booking.</p><p className="mt-2 text-gray-500">Versi kontrak {individualTerms.version} · tanda tangan dan waktu persetujuan dicatat bersama booking.</p></div>
                    </section>

                    <DigitalSignaturePad value={signatureDataUrl} onChange={(dataUrl) => { setSignatureDataUrl(dataUrl); setSignedContractSnapshot(createContractSnapshot()); }}/>
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
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 btn-luxury py-3 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Mengirim…' : currentStep === 5 ? 'Kirim Booking' : 'Lanjut'}
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
