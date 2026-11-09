import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function HeroCinematic() {
  const { setCurrentPage } = useAppStore();
  const handleSearch = () => setCurrentPage('fleet');

  return (
    <section className="relative isolate overflow-hidden bg-gradient-dark-purple pt-28 sm:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-gold-500/[0.08] blur-3xl sm:h-[30rem] sm:w-[30rem]" />
        <div className="absolute -left-32 bottom-24 h-72 w-72 rounded-full bg-purple-500/[0.08] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-luxury-950/70 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 max-w-2xl text-center lg:text-left"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/[0.07] px-3 py-1.5 text-xs font-medium tracking-[0.16em] text-gold-300 uppercase">
              Rental mobil pilihan
            </p>
            <h1 className="font-[Playfair_Display] text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Perjalanan istimewa, <span className="text-gold-gradient">dimulai di sini.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-300 sm:text-lg lg:mx-0">
              Temukan mobil yang tepat untuk perjalanan Anda, dengan proses pemesanan yang mudah dan layanan terpercaya.
            </p>
            <button
              type="button"
              onClick={handleSearch}
              className="btn-luxury mt-7 inline-flex min-h-12 items-center justify-center gap-2 px-6"
            >
              Cari mobil
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative mx-auto w-full max-w-3xl"
          >
            <div aria-hidden="true" className="absolute inset-x-10 bottom-5 h-12 rounded-full bg-gold-400/20 blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85"
              alt="Mobil Mercedes untuk disewa di Renmoku"
              className="relative z-10 mx-auto aspect-[1.55/1] w-full object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.45)]"
              fetchPriority="high"
            />
            <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-luxury-950/75 px-4 py-2 text-xs tracking-wide text-gray-300 backdrop-blur sm:bottom-5">
              Pilihan premium untuk setiap perjalanan
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
