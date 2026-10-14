import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, FileText, Users, Building2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { individualTerms, corporateTerms, TermsDocument } from '../data/termsAndConditions';
import TermsAndConditions from '../components/TermsAndConditions';

export default function TermsPage() {
  const { setCurrentPage } = useAppStore();
  const [selectedType, setSelectedType] = useState<'individual' | 'corporate'>('individual');

  const terms = selectedType === 'individual' ? individualTerms : corporateTerms;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-luxury">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Beranda</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 mb-4">
            <FileText className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="font-[Playfair_Display] text-3xl sm:text-4xl font-bold text-white mb-2">
            Syarat & Ketentuan
          </h1>
          <p className="text-gray-400">
            Silakan baca dengan seksama sebelum menggunakan layanan Renmoku
          </p>
        </motion.div>

        {/* User Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-3 p-1.5 rounded-2xl neu-soft">
            <button
              onClick={() => setSelectedType('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedType === 'individual'
                  ? 'neu-gold text-gold-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Penyewa Pribadi
            </button>
            <button
              onClick={() => setSelectedType('corporate')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedType === 'corporate'
                  ? 'neu-gold text-gold-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Penyewa Corporate
            </button>
          </div>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          key={selectedType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-luxury p-6 sm:p-8"
        >
          <TermsAndConditions
            terms={terms}
            agreed={false}
            onAgree={() => {}}
          />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Dokumen ini terakhir diperbarui pada {terms.effectiveDate}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami di{' '}
            <a href="mailto:legal@renmoku.id" className="text-gold-400 hover:text-gold-300">
              legal@renmoku.id
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
