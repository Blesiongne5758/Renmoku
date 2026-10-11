import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Building2, QrCode, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface PaymentIntegrationProps {
  amount: number;
  bookingId: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

type PaymentMethod = 'bank_transfer' | 'credit_card' | 'ewallet' | 'qris';

const paymentMethods = [
  {
    id: 'bank_transfer' as PaymentMethod,
    name: 'Transfer Bank',
    icon: Building2,
    description: 'BCA, Mandiri, BNI, BRI',
    fee: 0,
  },
  {
    id: 'credit_card' as PaymentMethod,
    name: 'Kartu Kredit',
    icon: CreditCard,
    description: 'Visa, Mastercard, JCB',
    fee: 0,
  },
  {
    id: 'ewallet' as PaymentMethod,
    name: 'E-Wallet',
    icon: Wallet,
    description: 'GoPay, OVO, Dana, ShopeePay',
    fee: 0,
  },
  {
    id: 'qris' as PaymentMethod,
    name: 'QRIS',
    icon: QrCode,
    description: 'Scan QR dari aplikasi apapun',
    fee: 0,
  },
];

const banks = [
  { id: 'bca', name: 'BCA', account: '1234567890', holder: 'PT Renmoku Indonesia' },
  { id: 'mandiri', name: 'Mandiri', account: '0987654321', holder: 'PT Renmoku Indonesia' },
  { id: 'bni', name: 'BNI', account: '1122334455', holder: 'PT Renmoku Indonesia' },
  { id: 'bri', name: 'BRI', account: '5566778899', holder: 'PT Renmoku Indonesia' },
];

export default function PaymentIntegration({ amount, bookingId, onSuccess, onError }: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate Midtrans/Xendit API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment
      const mockTransactionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const mockVA = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;

      setTransactionId(mockTransactionId);
      setVirtualAccount(mockVA);
      setPaymentStatus('success');
      
      if (onSuccess) {
        onSuccess(mockTransactionId);
      }
    } catch (error) {
      setPaymentStatus('error');
      if (onError) {
        onError('Pembayaran gagal. Silakan coba lagi.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setSelectedMethod(null);
    setSelectedBank(null);
    setPaymentStatus('idle');
    setTransactionId(null);
    setVirtualAccount(null);
  };

  return (
    <div className="card-luxury p-6">
      <h3 className="text-xl font-bold text-white mb-6">Pembayaran</h3>

      {/* Amount Display */}
      <div className="mb-6 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Pembayaran</span>
          <span className="text-2xl font-bold text-gold-400">{formatCurrency(amount)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">Kode Booking</span>
          <span className="text-sm text-gray-300 font-mono">{bookingId}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Payment Method Selection */}
        {paymentStatus === 'idle' && (
          <motion.div
            key="method-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-sm text-gray-400 mb-4">Pilih Metode Pembayaran</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedMethod === method.id
                      ? 'bg-gold-500/10 border-gold-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? 'bg-gold-500/20' : 'bg-white/10'
                    }`}>
                      <method.icon className={`w-5 h-5 ${
                        selectedMethod === method.id ? 'text-gold-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        selectedMethod === method.id ? 'text-gold-300' : 'text-white'
                      }`}>
                        {method.name}
                      </p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bank Selection for Bank Transfer */}
            {selectedMethod === 'bank_transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6"
              >
                <p className="text-sm text-gray-400 mb-3">Pilih Bank</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedBank === bank.id
                          ? 'bg-gold-500/10 border-gold-500/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        selectedBank === bank.id ? 'text-gold-300' : 'text-white'
                      }`}>
                        {bank.name}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pay Button */}
            <motion.button
              whileHover={{ scale: selectedMethod ? 1.02 : 1 }}
              whileTap={{ scale: selectedMethod ? 0.98 : 1 }}
              onClick={handlePayment}
              disabled={!selectedMethod || (selectedMethod === 'bank_transfer' && !selectedBank)}
              className="w-full btn-luxury py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bayar {formatCurrency(amount)}
            </motion.button>
          </motion.div>
        )}

        {/* Processing State */}
        {paymentStatus === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <Loader2 className="w-16 h-16 text-gold-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Memproses Pembayaran</h3>
            <p className="text-gray-400">Mohon tunggu, jangan tutup halaman ini...</p>
          </motion.div>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h3>
            <p className="text-gray-400 mb-6">Transaksi Anda telah berhasil diproses</p>

            <div className="max-w-md mx-auto space-y-3 mb-6">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">ID Transaksi</span>
                  <span className="text-sm text-white font-mono">{transactionId}</span>
                </div>
              </div>
              {virtualAccount && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Virtual Account</span>
                    <span className="text-sm text-white font-mono">{virtualAccount}</span>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Jumlah</span>
                  <span className="text-sm text-gold-400 font-bold">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={resetPayment}
                className="flex-1 btn-ghost py-3"
              >
                Kembali
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 btn-luxury py-3"
              >
                Cetak Bukti
              </button>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {paymentStatus === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-12 h-12 text-red-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Pembayaran Gagal</h3>
            <p className="text-gray-400 mb-6">Terjadi kesalahan saat memproses pembayaran Anda</p>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={resetPayment}
                className="flex-1 btn-ghost py-3"
              >
                Kembali
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 btn-luxury py-3"
              >
                Coba Lagi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Info */}
      {paymentStatus === 'idle' && (
        <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">Informasi Pembayaran</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Pembayaran diproses melalui Midtrans/Xendit</li>
                <li>• Data transaksi Anda aman dan terenkripsi</li>
                <li>• Konfirmasi pembayaran akan dikirim via email</li>
                <li>• Hubungi support jika ada kendala pembayaran</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
