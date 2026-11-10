import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export default function HeroCinematic() {
  const { setCurrentPage } = useAppStore();

  return (
    <section className="relative overflow-hidden bg-luxury-900 pt-28 sm:pt-32 lg:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-14 sm:px-8 sm:pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-10 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 order-2 max-w-xl text-center lg:order-1 lg:text-left"
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            Rental mobil pilihan
          </p>
          <h1 className="font-[Playfair_Display] text-[2.65rem] font-medium leading-[1.12] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.8rem]">
            Perjalanan istimewa,
            <span className="mt-1 block text-gold-300">dimulai di sini.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-gray-400 sm:text-lg sm:leading-8 lg:mx-0">
            Pilih kendaraan yang tepat untuk setiap tujuan. Pemesanan mudah, pilihan terpercaya, layanan penuh perhatian.
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('fleet')}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold-500 px-7 text-sm font-medium text-luxury-900 transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
          >
            Lihat armada
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="order-1 flex min-h-56 items-center justify-center lg:order-2 lg:min-h-[27rem]"
        >
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85"
            alt="Mercedes-Benz untuk perjalanan premium"
            className="w-full max-w-3xl object-contain drop-shadow-[0_28px_28px_rgba(30,25,15,0.16)]"
            fetchPriority="high"
          />
        </motion.div>
      </div>
      <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
    </section>
  );
}
