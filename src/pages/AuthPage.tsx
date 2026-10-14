import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Phone, Building2, FileText,
  Eye, EyeOff, ArrowRight, ArrowLeft, Car,
  CheckCircle2, Sparkles, Shield, Crown
} from 'lucide-react';
import { useAppStore, RegisterData } from '../stores/useAppStore';

export default function AuthPage() {
  const { authMode, setAuthMode, login, register, setCurrentPage, setAuthModalOpen } = useAppStore();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'individual',
    companyName: '',
    nib: '',
    npwp: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(loginData.email, loginData.password);
    setIsLoading(false);

    if (success) {
      setSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 1000);
    } else {
      setError('Email atau password salah. Gunakan demo credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await register(registerData);
    setIsLoading(false);

    if (success) {
      setSuccess('Pendaftaran berhasil! Mengalihkan...');
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 1000);
    } else {
      setError('Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  const roleOptions = [
    {
      value: 'individual' as const,
      label: 'Penyewa Pribadi',
      icon: User,
      desc: 'Sewa kendaraan untuk kebutuhan pribadi',
      requirements: ['KTP', 'SIM A', 'KK', 'Jaminan Pribadi'],
      color: 'from-blue-500 to-blue-600',
    },
    {
      value: 'corporate' as const,
      label: 'Penyewa Corporate',
      icon: Building2,
      desc: 'Sewa kendaraan untuk perusahaan',
      requirements: ['NIB', 'Akta Perusahaan', 'NPWP', 'PIC', 'Guarantee Letter'],
      color: 'from-purple-500 to-purple-600',
    },
    {
      value: 'owner' as const,
      label: 'Pemilik Rental',
      icon: Crown,
      desc: 'Daftarkan armada kendaraan Anda',
      requirements: ['KTP Pemilik', 'STNK', 'BPKB', 'Foto Kendaraan'],
      color: 'from-gold-500 to-gold-700',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-900 via-luxury-800 to-luxury-900" />
        <div className="absolute inset-0 bg-radial-gold" />
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            className="absolute w-1 h-1 rounded-full bg-gold-500/40"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center mb-4 shadow-lg shadow-gold-500/20"
          >
            <Car className="w-8 h-8 text-luxury-900" />
          </motion.div>
          <h1 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-2">
            {authMode === 'login' ? 'Selamat Datang' : 'Bergabung dengan Renmoku'}
          </h1>
          <p className="text-gray-400">
            {authMode === 'login' ? 'Masuk ke akun premium Anda' : 'Daftar dan nikmati layanan rental premium'}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-gold-500/10 max-w-md mx-auto"
        >
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.02] border border-white/5">
            <button
              onClick={() => { setAuthMode('login'); setStep(1); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                authMode === 'login'
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setAuthMode('register'); setStep(1); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                authMode === 'register'
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          {authMode === 'login' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                  Ingat saya
                </label>
                <button type="button" className="text-gold-400 hover:text-gold-300">
                  Lupa password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-luxury py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-luxury-900/30 border-t-luxury-900 rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Demo Credentials */}
              <div className="mt-4 p-3 rounded-lg bg-gold-500/5 border border-gold-500/10">
                <p className="text-xs text-gold-300 font-medium mb-2">🔑 Demo Credentials:</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <p><span className="text-gold-400">Penyewa:</span> renter@renmoku.id</p>
                  <p><span className="text-gold-400">Corporate:</span> corporate@renmoku.id</p>
                  <p><span className="text-gold-400">Owner:</span> owner@renmoku.id</p>
                  <p><span className="text-gold-400">Password:</span> demo123</p>
                </div>
              </div>
            </motion.form>
          )}

          {/* Register Form */}
          {authMode === 'register' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* Step 1: Choose Role */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-gray-300 mb-4">Pilih tipe akun Anda:</p>
                  {roleOptions.map((role) => (
                    <motion.button
                      key={role.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRegisterData({ ...registerData, role: role.value })}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        registerData.role === role.value
                          ? 'bg-gold-500/10 border-gold-500/30'
                          : 'bg-white/[0.02] border-white/5 hover:border-gold-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                          <role.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{role.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.requirements.slice(0, 3).map((req, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] text-gray-500 border border-white/5">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                        {registerData.role === role.value && (
                          <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="w-full btn-luxury py-3 flex items-center justify-center gap-2 mt-4"
                  >
                    Lanjut
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-gray-300 mb-4">Informasi {registerData.role === 'corporate' ? 'Perusahaan' : 'Pribadi'}:</p>

                  {registerData.role === 'corporate' ? (
                    <>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Nama Perusahaan</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                          <input
                            type="text"
                            value={registerData.companyName}
                            onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="PT / CV"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">NIB (Nomor Induk Berusaha)</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                          <input
                            type="text"
                            value={registerData.nib}
                            onChange={(e) => setRegisterData({ ...registerData, nib: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="13 digit NIB"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">NPWP Perusahaan</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                          <input
                            type="text"
                            value={registerData.npwp}
                            onChange={(e) => setRegisterData({ ...registerData, npwp: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                        <input
                          type="text"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                          placeholder="Sesuai KTP"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">No. Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                      <input
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                        placeholder="+62 812 xxx xxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali
                    </button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="flex-1 btn-luxury py-3 flex items-center justify-center gap-2"
                    >
                      Lanjut
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Password & Submit */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-300 mb-4">Buat password untuk akun Anda:</p>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-gold-500/50"
                        placeholder="Min. 8 karakter"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Ringkasan Pendaftaran:</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-400">
                        Tipe: <span className="text-gold-400">
                          {roleOptions.find(r => r.value === registerData.role)?.label}
                        </span>
                      </p>
                      <p className="text-gray-400">
                        Email: <span className="text-white">{registerData.email}</span>
                      </p>
                      <p className="text-gray-400">
                        Nama: <span className="text-white">
                          {registerData.role === 'corporate' ? registerData.companyName : registerData.name}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 rounded border-white/10 bg-white/5" required />
                    <span>
                      Saya menyetujui <span className="text-gold-400">Syarat & Ketentuan</span> serta{' '}
                      <span className="text-gold-400">Kebijakan Privasi</span> Renmoku
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-luxury py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-luxury-900/30 border-t-luxury-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Daftar
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.form>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => setCurrentPage('home')}
            className="text-sm text-gray-500 hover:text-gold-400 transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  );
}
