'use client';

import { motion } from 'framer-motion';
import { Check, X, Eye, Building2, User } from 'lucide-react';

const bookings = [
  {
    id: 'BK001',
    vehicle: 'Toyota Avanza 2023',
    image: '/vehicles/avanza.jpg',
    renter: 'Ahmad Sudirman',
    type: 'individual',
    dates: '12 - 15 Okt 2026',
    amount: 1500000,
    rating: 5.0,
    status: 'pending',
  },
  {
    id: 'BK002',
    vehicle: 'Honda HR-V 2023',
    image: '/vehicles/hrv.jpg',
    renter: 'Budi Pratama',
    type: 'individual',
    dates: '13 - 17 Okt 2026',
    amount: 2200000,
    rating: 4.8,
    status: 'pending',
  },
  {
    id: 'BK003',
    vehicle: 'BMW X5 2024',
    image: '/vehicles/bmwx5.jpg',
    renter: 'PT Maju Jaya',
    type: 'corporate',
    dates: '15 - 22 Okt 2026',
    amount: 17500000,
    rating: null,
    status: 'pending',
  },
];

export default function RecentBookings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-[#141414] border border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl">📋 Booking Terbaru</h3>
          <p className="text-sm text-gray-500 mt-1">Menunggu persetujuan Anda</p>
        </div>
        <a href="/dashboard/owner/bookings" className="text-sm text-yellow-400 hover:text-yellow-300">
          Lihat Semua →
        </a>
      </div>

      <div className="space-y-3">
        {bookings.map((booking, idx) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-yellow-400/30 transition group"
          >
            {/* Vehicle Image */}
            <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-purple-900/50 to-black overflow-hidden flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🚗
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{booking.vehicle}</h4>
                {booking.type === 'corporate' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Corporate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  {booking.type === 'corporate' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {booking.renter}
                </span>
                <span>•</span>
                <span>{booking.dates}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="font-mono font-semibold text-yellow-400">
                Rp {booking.amount.toLocaleString('id-ID')}
              </p>
              {booking.rating && (
                <p className="text-xs text-gray-500">⭐ {booking.rating}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="Lihat Detail">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition" title="Tolak">
                <X className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition" title="Terima">
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
