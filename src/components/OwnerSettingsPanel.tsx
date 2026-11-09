import { useEffect, useState } from 'react';
import { Camera, Save, UserRound, Landmark, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { cloudinaryHelpers } from '../lib/cloudinary';
import { useAppStore } from '../stores/useAppStore';

type PrivateDetails = {
  bank_name: string;
  account_name: string;
  account_number: string;
  insurance_provider: string;
  policy_number: string;
  insurance_expiry: string;
  vehicle_plate: string;
};

const emptyDetails: PrivateDetails = {
  bank_name: '', account_name: '', account_number: '', insurance_provider: '',
  policy_number: '', insurance_expiry: '', vehicle_plate: '',
};

export default function OwnerSettingsPanel() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '');
  const [details, setDetails] = useState<PrivateDetails>(emptyDetails);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    void supabase.from('owner_private_settings').select('*').eq('user_id', currentUser.id).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setSchemaMissing(true);
          return;
        }
        if (data) setDetails({
          bank_name: data.bank_name ?? '', account_name: data.account_name ?? '', account_number: data.account_number ?? '',
          insurance_provider: data.insurance_provider ?? '', policy_number: data.policy_number ?? '',
          insurance_expiry: data.insurance_expiry ?? '', vehicle_plate: data.vehicle_plate ?? '',
        });
      });
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const saveProfile = async () => {
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim(), avatar_url: avatar } });
      if (error) throw error;
      setCurrentUser({ ...currentUser, name: name.trim(), phone: phone.trim(), avatar });
      toast.success('Profil berhasil diperbarui.');
    } catch {
      toast.error('Profil belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file || !currentUser) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      toast.error('Pilih gambar maksimal 2 MB.');
      return;
    }
    setLoading(true);
    try {
      const result = await cloudinaryHelpers.uploadImage(file, `profiles/${currentUser.id}`);
      setAvatar(result.url);
      toast.success('Foto terunggah. Simpan perubahan profil untuk menerapkannya.');
    } catch {
      toast.error('Foto gagal diunggah. Periksa konfigurasi Cloudinary.');
    } finally {
      setLoading(false);
    }
  };

  const savePrivateDetails = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('owner_private_settings').upsert({
        user_id: currentUser.id,
        ...details,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
      setSchemaMissing(false);
      toast.success('Data rekening dan asuransi berhasil disimpan.');
    } catch {
      setSchemaMissing(true);
      toast.error('Data belum tersimpan. Terapkan SQL owner_private_settings di Supabase, lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof PrivateDetails, type = 'text', placeholder = '') => (
    <label className="block space-y-1.5" key={key}>
      <span className="text-sm text-gray-300">{label}</span>
      <input type={type} value={details[key]} onChange={(event) => setDetails({ ...details, [key]: event.target.value })}
        placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition focus:border-yellow-400/60" />
    </label>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3"><UserRound className="h-5 w-5 text-yellow-400" /><div><h2 className="text-lg font-semibold">Profil Pengguna</h2><p className="text-sm text-gray-500">Informasi akun pemilik rental</p></div></div>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/5 text-2xl text-yellow-300">
            {avatar ? <img src={avatar} alt="Foto profil" className="h-full w-full object-cover" /> : (name[0]?.toUpperCase() || 'P')}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-yellow-400/50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Unggah foto
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => void uploadAvatar(e.target.files?.[0])} />
          </label><span className="text-xs text-gray-500">JPG, PNG, WebP · maks. 2 MB</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="text-sm text-gray-300">Nama pengguna / usaha</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm outline-none focus:border-yellow-400/60" /></label>
          <label className="space-y-1.5"><span className="text-sm text-gray-300">Email</span><input value={currentUser?.email ?? ''} readOnly className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-gray-500" /></label>
          <label className="space-y-1.5"><span className="text-sm text-gray-300">Nomor telepon</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm outline-none focus:border-yellow-400/60" /></label>
        </div>
        <button onClick={() => void saveProfile()} disabled={savingProfile} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"><Save className="h-4 w-4" />{savingProfile ? 'Menyimpan…' : 'Simpan profil'}</button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3"><Landmark className="h-5 w-5 text-yellow-400" /><div><h2 className="text-lg font-semibold">Rekening Pencairan</h2><p className="text-sm text-gray-500">Informasi rekening untuk penerimaan pembayaran rental</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">{field('Nama bank', 'bank_name', 'text', 'Contoh: BCA')}{field('Nama pemilik rekening', 'account_name')}{field('Nomor rekening', 'account_number')}</div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-yellow-400" /><div><h2 className="text-lg font-semibold">Asuransi Kendaraan</h2><p className="text-sm text-gray-500">Catat polis kendaraan agar masa berlaku mudah dipantau</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">{field('Nomor polisi kendaraan', 'vehicle_plate')}{field('Perusahaan asuransi', 'insurance_provider')}{field('Nomor polis', 'policy_number')}{field('Tanggal berakhir polis', 'insurance_expiry', 'date')}</div>
        {schemaMissing && <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">Tabel aman untuk data rekening dan asuransi belum tersedia. Terapkan skrip <code>supabase/owner_features.sql</code> pada SQL Editor Supabase agar data dapat disimpan dengan kebijakan akses per pengguna.</p>}
        <button onClick={() => void savePrivateDetails()} disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"><Save className="h-4 w-4" />{loading ? 'Menyimpan…' : 'Simpan data rekening & asuransi'}</button>
      </section>
    </div>
  );
}
