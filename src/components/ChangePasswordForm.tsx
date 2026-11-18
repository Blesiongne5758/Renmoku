import { useState } from 'react';
import { Lock, Eye, EyeOff, Save, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

interface ChangePasswordFormProps {
  title?: string;
  subtitle?: string;
}

export default function ChangePasswordForm({
  title = 'Ganti Kata Sandi',
  subtitle = 'Perbarui password akun Anda untuk menjaga keamanan akses.',
}: ChangePasswordFormProps) {
  const { currentUser } = useAppStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Anda harus login terlebih dahulu.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk sesi login berikutnya.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengubah kata sandi. Periksa koneksi dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7 shadow-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Email Info */}
        <div className="rounded-xl bg-black/20 border border-white/5 p-3 text-xs text-gray-400 flex items-center justify-between">
          <span>Akun:</span>
          <span className="font-mono text-gray-200">{currentUser?.email || 'User'}</span>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan minimal 6 karakter"
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-yellow-400/60"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <p className={`mt-1 text-[11px] ${isPasswordValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPasswordValid ? '✓ Panjang password memenuhi syarat' : 'Minimal 6 karakter'}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-yellow-400/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <p className={`mt-1 text-[11px] ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
              {isMatch ? '✓ Konfirmasi password cocok' : 'Password belum cocok'}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isPasswordValid || !isMatch}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
          </button>
        </div>
      </form>
    </section>
  );
}
