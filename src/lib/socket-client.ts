import { io, Socket } from 'socket.io-client';

// ============================================================================
// SOCKET.IO CLIENT - Frontend Implementation
// ============================================================================

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.io server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚫 Max reconnection attempts reached');
        this.socket?.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
    });
  }

  /**
   * Join user-specific room for notifications
   */
  joinUserRoom(userId: string) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('join_user_room', userId);
    console.log(`👤 Joined user room: user_${userId}`);
  }

  /**
   * Join owner room for fleet updates
   */
  joinOwnerRoom(ownerId: string) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('join_owner_room', ownerId);
    console.log(`🏢 Joined owner room: owner_${ownerId}`);
  }

  /**
   * Listen for booking status updates
   */
  onBookingStatusUpdate(callback: (data: BookingStatusUpdate) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('booking_status_update', callback);
  }

  /**
   * Listen for new bookings (owner only)
   */
  onNewBooking(callback: (data: NewBookingNotification) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('new_booking', callback);
  }

  /**
   * Listen for payment received
   */
  onPaymentReceived(callback: (data: PaymentNotification) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('payment_received', callback);
  }

  /**
   * Listen for fleet updates (owner only)
   */
  onFleetUpdate(callback: (data: FleetUpdate) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('fleet_update', callback);
  }

  /**
   * Listen for general notifications
   */
  onNotification(callback: (data: GeneralNotification) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('notification', callback);
  }

  /**
   * Remove specific event listener
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface BookingStatusUpdate {
  bookingId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'ACTIVE' | 'COMPLETED';
  vehicleName: string;
  action: 'approve' | 'reject';
  message: string;
}

export interface NewBookingNotification {
  bookingId: string;
  vehicleName: string;
  renterName: string;
  totalPrice: number;
}

export interface PaymentNotification {
  bookingId: string;
  amount: number;
  type: 'DP' | 'FULL_PAYMENT';
  status: 'PAID' | 'FAILED';
}

export interface FleetUpdate {
  vehicleId: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
  location?: string;
}

export interface GeneralNotification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const socketClient = new SocketClient();
export default socketClient;
