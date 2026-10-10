'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle, X, Eye, Building2, User } from 'lucide-react';
import { useState } from 'react';

const pendingVerifications = [
  {
    id: 'KYC001',
    type: 'individual',
    name: 'Ahmad Sudirman',
    submittedAt: '2 jam lalu',
    documents: ['KTP', 'SIM', 'KK'],
    risk: 'low',
  },
  {
    id: 'KYC002',
    type: 'corporate',
    name: 'PT Maju Jaya Sentosa',
    submittedAt: '5 jam lalu',
    documents: ['NIB', 'Akta', 'NPWP', 'GL'],
    risk: 'medium',
  },
  {
    id: 'KYC003',
    type: 'owner',
    name: 'Siti Rental',
    submittedAt: '1 hari lalu',
    documents: ['KTP', 'STNK', 'BPKB', 'KIR'],
    risk: 'high',
  },
];

const riskColors = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Risiko Rendah' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Risiko Sedang' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Risiko Tinggi' },
};

export default function AdminVerificationPanel() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-[#141414] border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-serif text-xl">Verifikasi KYC</h3>
            <p className="text-sm text-gray-500">Menunggu persetujuan admin</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold">
          {pendingVerifications.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {pendingVerifications.map((item, idx) => {
            const risk = riskColors[item.risk as keyof typeof riskColors];
            const isSelected = selected === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl bg-black/40 border border-white/5 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setSelected(isSelected ? null : item.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                    {item.type === 'corporate' ? (
                      <Building2 className="w-5 h-5 text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{item.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.type === 'individual' ? 'Individual' : item.type === 'corporate' ? 'Corporate' : 'Fleet Owner'} 
                      {' • '}Dikirim {item.submittedAt}
                    </p>
                  </div>

                  <Eye className="w-4 h-4 text-gray-500" />
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-4 space-y-4">
                        {/* Documents */}
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Dokumen Terlampir:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.documents.map((doc) => (
                              <span
                                key={doc}
                                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
                              >
                                📄 {doc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Warning for high risk */}
                        {item.risk === 'high' && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300">
                              Dokumen memerlukan verifikasi manual. Periksa keaslian dokumen dengan teliti.
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition">
                            <X className="w-4 h-4" /> Tolak
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:scale-[1.02] transition">
                            <CheckCircle className="w-4 h-4" /> Verifikasi
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
