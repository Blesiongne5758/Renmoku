import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className={`w-4 h-4 ${light ? 'text-stone-500' : 'text-gray-400'}`} />
      <div className="flex gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => changeLanguage('id')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            i18n.language === 'id'
              ? light ? 'bg-[#f3f0e9] text-[#8a6b38] border border-[#e4dccd]' : 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              : light ? 'text-stone-500 hover:text-stone-900' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ID
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            i18n.language === 'en'
              ? light ? 'bg-[#f3f0e9] text-[#8a6b38] border border-[#e4dccd]' : 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              : light ? 'text-stone-500 hover:text-stone-900' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          EN
        </motion.button>
      </div>
    </div>
  );
}
