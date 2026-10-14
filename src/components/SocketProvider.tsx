import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { socketClient } from '../lib/socket-client';
import type { 
  BookingStatusUpdate, 
  NewBookingNotification,
  GeneralNotification 
} from '../lib/socket-client';
import { useAppStore } from '../stores/useAppStore';

// ============================================================================
// SOCKET CONTEXT
// ============================================================================

interface SocketContextType {
  isConnected: boolean;
  notifications: GeneralNotification[];
  bookingUpdates: BookingStatusUpdate[];
  newBookings: NewBookingNotification[];
  clearNotifications: () => void;
  clearBookingUpdates: () => void;
  clearNewBookings: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ============================================================================
// SOCKET PROVIDER
// ============================================================================

export function SocketProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [bookingUpdates, setBookingUpdates] = useState<BookingStatusUpdate[]>([]);
  const [newBookings, setNewBookings] = useState<NewBookingNotification[]>([]);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser?.id) return;

    // Connect to socket server
    socketClient.connect();
    
    // Join user room
    socketClient.joinUserRoom(currentUser.id);

    // Join owner room if user is owner
    if (currentUser.role === 'owner') {
      socketClient.joinOwnerRoom(currentUser.id);
    }

    // Listen for connection status
    const socket = socketClient.getSocket();
    
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket connected for user:', currentUser.id);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    };

    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);

    // Listen for booking status updates
    socketClient.onBookingStatusUpdate((data) => {
      console.log('📦 Booking status update:', data);
      setBookingUpdates(prev => [data, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Renmoku - Update Booking', {
          body: data.message,
          icon: '/logo.png',
          tag: 'booking-update',
        });
      }
    });

    // Listen for new bookings (owner only)
    if (currentUser.role === 'owner') {
      socketClient.onNewBooking((data) => {
        console.log('🆕 New booking received:', data);
        setNewBookings(prev => [data, ...prev]);
        
        if (Notification.permission === 'granted') {
          new Notification('Renmoku - Booking Baru!', {
            body: `${data.renterName} ingin menyewa ${data.vehicleName}`,
            icon: '/logo.png',
            tag: 'new-booking',
          });
        }
      });
    }

    // Listen for general notifications
    socketClient.onNotification((data) => {
      console.log('🔔 Notification received:', data);
      setNotifications(prev => [data, ...prev]);
      
      // Keep only last 50 notifications
      if (notifications.length >= 50) {
        setNotifications(prev => prev.slice(0, 49));
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socketClient.off('booking_status_update');
      socketClient.off('new_booking');
      socketClient.off('notification');
      socketClient.disconnect();
    };
  }, [currentUser?.id, currentUser?.role]);

  const clearNotifications = () => setNotifications([]);
  const clearBookingUpdates = () => setBookingUpdates([]);
  const clearNewBookings = () => setNewBookings([]);

  const value: SocketContextType = {
    isConnected,
    notifications,
    bookingUpdates,
    newBookings,
    clearNotifications,
    clearBookingUpdates,
    clearNewBookings,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// ============================================================================
// HOOK TO USE SOCKET CONTEXT
// ============================================================================

export function useSocketContext() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  
  return context;
}
