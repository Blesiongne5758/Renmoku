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
  const [socketConnected, setSocketConnected] = useState(false);
  const [databaseRealtimeConnected, setDatabaseRealtimeConnected] = useState(false);
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [bookingUpdates, setBookingUpdates] = useState<BookingStatusUpdate[]>([]);
  const [newBookings, setNewBookings] = useState<NewBookingNotification[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    let socket = socketClient.getSocket();
    const realtimeChannel = supabase.channel(`booking-notifications:${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, async (payload) => {
        const booking = payload.new as Record<string, any>;
        if (currentUser.role === 'owner') {
          const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
          if (!owner) return;
          const { data: vehicle } = await supabase.from('vehicles').select('id,brand,model').eq('id', booking.vehicle_id).eq('owner_id', owner.id).maybeSingle();
          if (!vehicle) return;
          const { data: renter } = await supabase.from('users').select('full_name,email').eq('id', booking.renter_id).maybeSingle();
          setNewBookings((items) => [{ bookingId: booking.id, vehicleName: `${vehicle.brand} ${vehicle.model}`, renterName: renter?.full_name || renter?.email || 'Penyewa', totalPrice: Number(booking.total_price || 0) }, ...items].slice(0, 50));
        } else if (currentUser.role === 'admin' || booking.renter_id === currentUser.id) {
          const notification: GeneralNotification = { type: 'info', title: 'Pemesanan dibuat', message: `Pemesanan ${booking.id} berhasil dibuat.` };
          setNotifications((items) => [notification, ...items].slice(0, 50));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, async (payload) => {
        const booking = payload.new as Record<string, any>;
        const oldBooking = payload.old as Record<string, any>;
        if (booking.status === oldBooking.status) return;
        const isRenter = booking.renter_id === currentUser.id;
        const isAdmin = currentUser.role === 'admin';
        const isOwner = currentUser.role === 'owner' && booking.vehicle_id;
        if (!isRenter && !isAdmin && !isOwner) return;
        if (isOwner) {
          const { data: owner } = await supabase.from('owners').select('id').eq('user_id', currentUser.id).maybeSingle();
          const { data: vehicle } = owner ? await supabase.from('vehicles').select('id').eq('id', booking.vehicle_id).eq('owner_id', owner.id).maybeSingle() : { data: null };
          if (!vehicle) return;
        }
        const update: BookingStatusUpdate = {
          bookingId: booking.id,
          status: booking.status as BookingStatusUpdate['status'],
          vehicleName: 'Pemesanan kendaraan',
          action: booking.status === 'CONFIRMED' ? 'approve' : 'reject',
          message: `Status pemesanan berubah menjadi ${booking.status}.`,
        };
        setBookingUpdates((items) => [update, ...items].slice(0, 50));
      })
      .subscribe((status) => { setDatabaseRealtimeConnected(status === 'SUBSCRIBED'); });
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
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
    }).catch(() => setSocketConnected(false));

    return () => {
      cancelled = true;
      void supabase.removeChannel(realtimeChannel);
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socketClient.off('booking_status_update', handleBookingUpdate);
      socketClient.off('new_booking', handleNewBooking);
      socketClient.off('notification', handleNotification);
      socketClient.disconnect();
      setSocketConnected(false);
      setDatabaseRealtimeConnected(false);
    };
  }, [currentUser?.id, currentUser?.role]);

  const clearNotifications = () => setNotifications([]);
  const clearBookingUpdates = () => setBookingUpdates([]);
  const clearNewBookings = () => setNewBookings([]);
  const isConnected = socketConnected || databaseRealtimeConnected;

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
