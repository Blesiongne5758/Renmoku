import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <div className="flex gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => changeLanguage('id')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            i18n.language === 'id'
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
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
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          EN
        </motion.button>
      </div>
    </div>
  );
}
