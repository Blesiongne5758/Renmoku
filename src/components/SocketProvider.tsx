import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { socketClient } from '../lib/socket-client';
import type { 
  BookingStatusUpdate, 
  NewBookingNotification,
  GeneralNotification 
} from '../lib/socket-client';
import { useAppStore } from '../stores/useAppStore';
import { supabase } from '../lib/supabase';
import { getRuntimeSettings } from '../services/runtimeSettingsService';

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

  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    let socket = socketClient.getSocket();
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleBookingUpdate = (data: BookingStatusUpdate) => setBookingUpdates((previous) => [data, ...previous].slice(0, 50));
    const handleNewBooking = (data: NewBookingNotification) => setNewBookings((previous) => [data, ...previous].slice(0, 50));
    const handleNotification = (data: GeneralNotification) => setNotifications((previous) => [data, ...previous].slice(0, 50));

    void getRuntimeSettings().then(async (settings) => {
      if (cancelled || !settings.realtime_enabled || !settings.realtime_url) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session?.access_token) return;
      socket = socketClient.connect(settings.realtime_url, settings.realtime_path || '/socket.io', data.session.access_token);
      if (!socket) return;
      socketClient.joinUserRoom(currentUser.id);
      if (currentUser.role === 'owner') socketClient.joinOwnerRoom(currentUser.id);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socketClient.onBookingStatusUpdate(handleBookingUpdate);
      socketClient.onNotification(handleNotification);
      if (currentUser.role === 'owner') socketClient.onNewBooking(handleNewBooking);
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') void Notification.requestPermission();
    }).catch(() => setIsConnected(false));

    return () => {
      cancelled = true;
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socketClient.off('booking_status_update', handleBookingUpdate);
      socketClient.off('new_booking', handleNewBooking);
      socketClient.off('notification', handleNotification);
      socketClient.disconnect();
      setIsConnected(false);
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
