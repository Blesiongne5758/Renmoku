import { useEffect, useState, useCallback } from 'react';
import { socketClient } from '../lib/socket-client';
import type { 
  BookingStatusUpdate, 
  NewBookingNotification, 
  PaymentNotification,
  FleetUpdate,
  GeneralNotification 
} from '../lib/socket-client';

// ============================================================================
// REACT HOOKS FOR SOCKET.IO
// ============================================================================

/**
 * Hook for managing socket connection
 */
export function useSocketConnection(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect and join user room
    socketClient.connect();
    socketClient.joinUserRoom(userId);

    // Listen for connection status
    const socket = socketClient.getSocket();
    
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socketClient.disconnect();
    };
  }, [userId]);

  return { isConnected };
}

/**
 * Hook for listening to booking status updates
 */
export function useBookingStatusUpdates(
  callback: (data: BookingStatusUpdate) => void
) {
  useEffect(() => {
    socketClient.onBookingStatusUpdate(callback);

    return () => {
      socketClient.off('booking_status_update', callback);
    };
  }, [callback]);
}

/**
 * Hook for listening to new bookings (owner only)
 */
export function useNewBookings(
  callback: (data: NewBookingNotification) => void
) {
  useEffect(() => {
    socketClient.onNewBooking(callback);

    return () => {
      socketClient.off('new_booking', callback);
    };
  }, [callback]);
}

/**
 * Hook for listening to payment notifications
 */
export function usePaymentNotifications(
  callback: (data: PaymentNotification) => void
) {
  useEffect(() => {
    socketClient.onPaymentReceived(callback);

    return () => {
      socketClient.off('payment_received', callback);
    };
  }, [callback]);
}

/**
 * Hook for listening to fleet updates (owner only)
 */
export function useFleetUpdates(
  callback: (data: FleetUpdate) => void
) {
  useEffect(() => {
    socketClient.onFleetUpdate(callback);

    return () => {
      socketClient.off('fleet_update', callback);
    };
  }, [callback]);
}

/**
 * Hook for listening to general notifications
 */
export function useNotifications(
  callback: (data: GeneralNotification) => void
) {
  useEffect(() => {
    socketClient.onNotification(callback);

    return () => {
      socketClient.off('notification', callback);
    };
  }, [callback]);
}

/**
 * Combined hook for all real-time features
 */
export function useRealtime(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [bookingUpdates, setBookingUpdates] = useState<BookingStatusUpdate[]>([]);
  const [newBookings, setNewBookings] = useState<NewBookingNotification[]>([]);

  // Connection management
  useEffect(() => {
    if (!userId) return;

    socketClient.connect();
    socketClient.joinUserRoom(userId);

    const socket = socketClient.getSocket();
    
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);

    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socketClient.disconnect();
    };
  }, [userId]);

  // Booking status updates
  useBookingStatusUpdates(useCallback((data: BookingStatusUpdate) => {
    setBookingUpdates(prev => [data, ...prev]);
    
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Renmoku', {
        body: data.message,
        icon: '/logo.png',
      });
    }
  }, []));

  // New bookings (for owners)
  useNewBookings(useCallback((data: NewBookingNotification) => {
    setNewBookings(prev => [data, ...prev]);
    
    if (Notification.permission === 'granted') {
      new Notification('Booking Baru!', {
        body: `${data.renterName} ingin menyewa ${data.vehicleName}`,
        icon: '/logo.png',
      });
    }
  }, []));

  // General notifications
  useNotifications(useCallback((data: GeneralNotification) => {
    setNotifications(prev => [data, ...prev]);
  }, []));

  return {
    isConnected,
    notifications,
    bookingUpdates,
    newBookings,
    clearNotifications: () => setNotifications([]),
    clearBookingUpdates: () => setBookingUpdates([]),
    clearNewBookings: () => setNewBookings([]),
  };
}
