import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { useSocketContext } from './SocketProvider';

// ============================================================================
// REAL-TIME NOTIFICATION BELL
// ============================================================================

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isConnected, 
    notifications, 
    bookingUpdates, 
    newBookings,
    clearNotifications,
    clearBookingUpdates,
    clearNewBookings 
  } = useSocketContext();

  const totalUnread = notifications.length + bookingUpdates.length + newBookings.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'approve':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
      case 'reject':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </motion.span>
        )}

        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-400' : 'bg-red-400'
        }`} />
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Notifikasi</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isConnected ? '🟢 Terhubung' : '🔴 Terputus'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {totalUnread === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {/* New Bookings (Owner) */}
                  {newBookings.map((booking, idx) => (
                    <motion.div
                      key={`new-booking-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 hover:bg-white/5 transition cursor-pointer"
                      onClick={() => {
                        // Navigate to booking detail
                        clearNewBookings();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Info className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            Booking Baru!
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {booking.renterName} ingin menyewa {booking.vehicleName}
                          </p>
                          <p className="text-xs text-gold-400 mt-1 font-medium">
                            Rp {booking.totalPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Booking Updates */}
                  {bookingUpdates.map((update, idx) => (
                    <motion.div
                      key={`booking-update-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 hover:bg-white/5 transition cursor-pointer"
                      onClick={() => {
                        clearBookingUpdates();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          update.action === 'approve' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                        }`}>
                          {getIcon(update.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {update.action === 'approve' ? 'Booking Disetujui' : 'Booking Ditolak'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {update.vehicleName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {update.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* General Notifications */}
                  {notifications.map((notif, idx) => (
                    <motion.div
                      key={`notification-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 hover:bg-white/5 transition cursor-pointer"
                      onClick={() => {
                        clearNotifications();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {totalUnread > 0 && (
              <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={() => {
                    clearNotifications();
                    clearBookingUpdates();
                    clearNewBookings();
                  }}
                  className="w-full text-xs text-gray-400 hover:text-white transition text-center"
                >
                  Tandai semua sudah dibaca
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
