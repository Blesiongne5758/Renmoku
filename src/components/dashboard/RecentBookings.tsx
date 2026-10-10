import { motion } from 'framer-motion';
import { Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../data/mockData';

interface Booking {
  id: string;
  vehicle: string;
  image: string;
  renter: string;
  type: 'individual' | 'corporate';
  dates: string;
  price: number;
  rating: number;
}

interface RecentBookingsProps {
  bookings?: Booking[];
}

const defaultBookings: Booking[] = [
  {
    id: '1',
    vehicle: 'Toyota Avanza',
    image: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=200&q=80',
    renter: 'Ahmad S.',
    type: 'individual',
    dates: '12-15 Okt',
    price: 1500000,
    rating: 5.0,
  },
  {
    id: '2',
    vehicle: 'Honda HR-V',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&q=80',
    renter: 'Budi P.',
    type: 'individual',
    dates: '13-17 Okt',
    price: 2200000,
    rating: 4.8,
  },
  {
    id: '3',
    vehicle: 'BMW X5',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80',
    renter: 'PT Maju',
    type: 'corporate',
    dates: '15-22 Okt',
    price: 17500000,
    rating: 0,
  },
];

export default function RecentBookings({ bookings = defaultBookings }: RecentBookingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card-luxury p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">📋 Booking Terbaru</h3>
        <button className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300 transition-colors">
          Lihat Semua Booking
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl neu-soft hover:neu-gold transition-all"
          >
            {/* Vehicle Image */}
            <img
              src={booking.image}
              alt={booking.vehicle}
              className="w-16 h-16 rounded-lg object-cover"
            />

            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold mb-1">{booking.vehicle}</h4>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {booking.renter}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {booking.dates}
                </span>
                {booking.type === 'corporate' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    🏢 Corp
                  </span>
                )}
              </div>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gold-gradient font-bold text-lg">
                  {formatCurrency(booking.price)}
                </p>
                {booking.rating > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                    <span className="text-xs text-gray-400">{booking.rating}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  Terima
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                >
                  Tolak
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
