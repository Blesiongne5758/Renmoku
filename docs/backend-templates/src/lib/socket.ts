// ============================================================================
// SOCKET.IO SERVER INITIALIZATION
// ============================================================================
// File: backend/src/lib/socket.ts
// ============================================================================
// Inisialisasi Socket.io server dengan event handlers untuk real-time
// notifications dan room management.
// ============================================================================

import { Server as NetServer } from 'http';
import { Server as SocketServer, Server as SocketIO } from 'socket.io';
import { NextApiRequest } from 'next';

export interface ServerWithIO extends NetServer {
  io?: SocketIO;
}

export let io: SocketIO | null = null;

export const initSocket = (httpServer: NetServer) => {
  if (io) return io;

  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socketio',
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Join owner room (for fleet updates)
    socket.on('join_owner_room', (ownerId: string) => {
      socket.join(`owner_${ownerId}`);
      console.log(`🏢 Owner ${ownerId} joined their room`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Emit booking status update to specific user
 */
export const emitBookingStatusUpdate = (
  userId: string,
  BookingStatusUpdate
) => {
  if (io) {
    io.to(`user_${userId}`).emit('booking_status_update', data);
    console.log(`📦 Emitted booking_status_update to user_${userId}`);
  }
};

/**
 * Emit new booking notification to owner
 */
export const emitNewBooking = (
  ownerId: string,
  NewBookingNotification
) => {
  if (io) {
    io.to(`owner_${ownerId}`).emit('new_booking', data);
    console.log(`🆕 Emitted new_booking to owner_${ownerId}`);
  }
};

/**
 * Emit payment received notification
 */
export const emitPaymentReceived = (
  userId: string,
  PaymentNotification
) => {
  if (io) {
    io.to(`user_${userId}`).emit('payment_received', data);
    console.log(`💰 Emitted payment_received to user_${userId}`);
  }
};

/**
 * Emit fleet update to owner
 */
export const emitFleetUpdate = (
  ownerId: string,
  FleetUpdate
) => {
  if (io) {
    io.to(`owner_${ownerId}`).emit('fleet_update', data);
    console.log(`🚗 Emitted fleet_update to owner_${ownerId}`);
  }
};

/**
 * Emit general notification
 */
export const emitNotification = (
  userId: string,
  GeneralNotification
) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', data);
    console.log(`🔔 Emitted notification to user_${userId}`);
  }
};

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
