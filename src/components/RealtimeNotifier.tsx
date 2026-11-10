import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSocketContext } from './SocketProvider';

/** Mirrors incoming in-app notifications to toast messages across the app. */
export default function RealtimeNotifier() {
  const { notifications, bookingUpdates, newBookings } = useSocketContext();
  const seen = useRef(new Set<string>());

  useEffect(() => {
    for (const booking of newBookings) {
      const key = `new:${booking.bookingId}`;
      if (seen.current.has(key)) continue;
      seen.current.add(key);
      toast.success('Booking baru', {
        description: `${booking.renterName} memesan ${booking.vehicleName} · Rp ${booking.totalPrice.toLocaleString('id-ID')}`,
      });
    }
    for (const update of bookingUpdates) {
      const key = `update:${update.bookingId}:${update.status}`;
      if (seen.current.has(key)) continue;
      seen.current.add(key);
      toast.info(`Status booking: ${update.status}`, { description: update.message || update.vehicleName });
    }
    for (const [index, notification] of notifications.entries()) {
      const key = `general:${notification.title}:${notification.message}`;
      if (seen.current.has(key)) continue;
      seen.current.add(key);
      toast(notification.title, { description: notification.message, id: key });
      if (index > 50) break;
    }
    if (seen.current.size > 300) seen.current.clear();
  }, [notifications, bookingUpdates, newBookings]);

  return null;
}
