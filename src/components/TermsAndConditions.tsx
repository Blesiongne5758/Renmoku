import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { TermsDocument } from '../data/termsAndConditions';

interface Props {
  terms: TermsDocument;
  onAgree: (agreed: boolean) => void;
  agreed: boolean;
}

export default function TermsAndConditions({ terms, onAgree, agreed }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-[Playfair_Display] text-2xl font-bold text-white mb-2">
          {terms.title}
        </h2>
        <p className="text-gold-400 text-sm font-medium">{terms.subtitle}</p>
        <p className="text-gray-500 text-xs mt-2">
          {terms.effectiveDate} • Versi {terms.version}
        </p>
      </div>

      {/* Important Notice */}
      <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gold-300 font-medium mb-1">Perhatian</p>
            <p className="text-xs text-gray-400">
              Dengan menyetujui syarat dan ketentuan ini, Anda menyatakan telah membaca, memahami, 
              dan menyetujui seluruh ketentuan yang tertera. Silakan baca dengan seksama sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {terms.sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl neu-soft overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  <span className="text-gold-400 font-bold text-sm">{index + 1}</span>
                </div>
                <h3 className="text-white font-semibold text-sm">
                  {section.title}
                </h3>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gold-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Section Content */}
            {expandedSection === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="pl-11 space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Agreement Checkbox */}
      <div className="pt-4 border-t border-white/5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgree(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                agreed
                  ? 'bg-gold-500 border-gold-500'
                  : 'bg-transparent border-gray-600 group-hover:border-gold-500/50'
              }`}
            >
              {agreed && <CheckCircle2 className="w-4 h-4 text-luxury-900" />}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 leading-relaxed">
              Saya telah membaca, memahami, dan menyetujui seluruh{' '}
              <span className="text-gold-400 font-medium">
                Syarat & Ketentuan
              </span>{' '}
              yang berlaku untuk penyewa {terms.userType === 'individual' ? 'pribadi' : 'korporat'}.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dengan mencentang kotak ini, Anda menyatakan setuju untuk terikat oleh ketentuan di atas.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
