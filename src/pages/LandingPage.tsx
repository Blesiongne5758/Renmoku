import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Car,
  Clock3,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import HeroCinematic from '../components/vehicle/HeroCinematic';

const popularCars = [
  {
    name: 'Toyota Avanza',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=900&q=85',
    rating: '4,8',
  },
  {
    name: 'Honda HR-V',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=85',
    rating: '4,9',
  },
  {
    name: 'BMW X5',
    price: 2500000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=85',
    rating: '5,0',
  },
  {
    name: 'Mercedes S-Class',
    price: 3500000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=85',
    rating: '5,0',
  },
];

const benefits = [
  { icon: ShieldCheck, title: 'Perlindungan lengkap', desc: 'Perlindungan kendaraan untuk perjalanan yang lebih tenang.' },
  { icon: Clock3, title: 'Proses praktis', desc: 'Pilih kendaraan dan ajukan pemesanan secara online.' },
  { icon: Award, title: 'Kendaraan terawat', desc: 'Pilihan kendaraan yang disiapkan untuk kenyamanan Anda.' },
  { icon: Users, title: 'Layanan profesional', desc: 'Dukungan ramah untuk membantu kebutuhan perjalanan.' },
  { icon: CreditCard, title: 'Pembayaran fleksibel', desc: 'Informasi biaya dan pembayaran yang jelas sebelum memesan.' },
  { icon: FileCheck2, title: 'Kontrak digital', desc: 'Dokumen pemesanan tersimpan dengan praktis dan rapi.' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

export default function LandingPage() {
  const { setCurrentPage, setAuthMode } = useAppStore();

  const handleGetStarted = () => {
    setAuthMode('register');
    setCurrentPage('auth');
  };

  return (
    <main className="min-h-screen bg-luxury-900 text-white">
      <HeroCinematic />

      <section id="mobil-populer" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Koleksi pilihan</p>
              <h2 className="font-[Playfair_Display] text-3xl font-medium tracking-tight text-white sm:text-4xl">
                Mobil populer
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-gray-400 sm:text-base">
              Temukan kendaraan yang sesuai dengan rencana dan gaya perjalanan Anda.
            </p>
          </motion.header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-4 xl:gap-6">
            {popularCars.map((car, index) => (
              <motion.article
                key={car.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#15151c] shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.36)]"
              >
                <div className="relative aspect-[1.42/1] overflow-hidden bg-[#20202a]">
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-[#0a0a0f]/90 px-3 py-1 text-xs font-medium text-gray-100 shadow-sm">
                    ★ {car.rating}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="font-[Playfair_Display] text-xl font-medium text-white">{car.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-semibold text-gold-300">{formatPrice(car.price)}</span>
                    <span className="text-sm text-gray-500">/ hari</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 text-center sm:mt-12">
            <button
              type="button"
              onClick={() => setCurrentPage('fleet')}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/15 px-6 text-sm font-medium text-gray-200 transition-colors hover:border-gold-400 hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
            >
              Lihat semua armada <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-luxury-850 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Layanan Renmoku</p>
            <h2 className="font-[Playfair_Display] text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Kenyamanan di setiap perjalanan
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-400">
              Hal-hal penting yang membantu perjalanan Anda terasa lebih mudah sejak awal.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-12">
            {benefits.map(({ icon: Icon, title, desc }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="flex gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-500/20 bg-[#15151c] text-gold-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Untuk pemilik rental</p>
            <h2 className="font-[Playfair_Display] text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
              Kelola armada dengan lebih mudah
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-400">
              Kelola kendaraan, pemesanan, dan laporan melalui satu platform yang praktis.
            </p>
            <ul className="mt-7 space-y-4 text-sm text-gray-300">
              {['Dashboard untuk manajemen armada', 'Kalender pemesanan', 'Pengaturan pembayaran fleksibel', 'Laporan pendapatan'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleGetStarted}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold-500 px-6 text-sm font-medium text-luxury-900 transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
            >
              Daftar sebagai pemilik <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#15151c] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.32)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm text-gray-400">Ringkasan pemilik</p>
                <h3 className="mt-1 font-[Playfair_Display] text-xl font-medium text-white">Dashboard armada</h3>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Aktif</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="rounded-2xl bg-[#0e0e15] p-4 sm:p-5">
                <p className="text-sm text-gray-400">Total armada</p>
                <p className="mt-2 text-3xl font-medium tracking-tight text-white">12</p>
              </div>
              <div className="rounded-2xl bg-[#0e0e15] p-4 sm:p-5">
                <p className="text-sm text-gray-400">Pemesanan aktif</p>
                <p className="mt-2 text-3xl font-medium tracking-tight text-gold-300">4</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0e0e15] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-400">Pendapatan bulan ini</p>
                <span className="text-xs font-medium text-emerald-300">+15%</span>
              </div>
              <p className="mt-2 font-[Playfair_Display] text-3xl font-medium text-white">Rp 45,5 jt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-gold-500/15 bg-[#15151c] px-5 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Mulai perjalanan Anda</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-[Playfair_Display] text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Siap menemukan kendaraan yang tepat?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-400">
            Jelajahi pilihan armada dan tentukan kendaraan untuk perjalanan berikutnya.
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('fleet')}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold-500 px-7 text-sm font-medium text-luxury-900 transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
          >
            Jelajahi armada <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0a0a0f] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-white">
            <Car className="h-5 w-5 text-gold-400" aria-hidden="true" />
            <span className="font-[Playfair_Display] text-lg font-medium tracking-wide">RENMOKU</span>
          </div>
          <button type="button" onClick={() => setCurrentPage('terms')} className="text-sm text-gray-400 transition-colors hover:text-gold-300">
            Syarat &amp; Ketentuan
          </button>
          <p className="text-sm text-gray-500">© 2026 Renmoku</p>
        </div>
      </footer>
    </main>
  );
}
