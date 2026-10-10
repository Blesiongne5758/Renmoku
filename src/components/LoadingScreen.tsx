import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 3;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-luxury-950 flex flex-col items-center justify-center"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-radial-gold opacity-40" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
          className="w-16 h-16 rounded-2xl neu-gold flex items-center justify-center mb-6 animate-glow-pulse"
        >
          <Car className="w-8 h-8 text-gold-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-[Playfair_Display] text-3xl font-bold text-gold-gradient-soft mb-2 tracking-tight-custom"
        >
          RENMOKU
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-8"
        >
          Premium Car Rental
        </motion.p>

        {/* Progress bar - Neumorphic */}
        <div className="w-48 h-1 rounded-full neu-pressed overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-[10px] text-gray-600 font-mono"
        >
          {progress}%
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
