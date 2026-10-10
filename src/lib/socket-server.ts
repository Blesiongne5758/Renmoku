// ============================================================================
// SOCKET.IO SERVER INITIALIZATION (Backend Reference)
// ============================================================================
// File: backend/src/lib/socket.ts
// ============================================================================
// This file is for the Next.js backend. It initializes Socket.io server
// and handles real-time connections for booking notifications.
// ============================================================================

/*
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
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
*/

// ============================================================================
// SOCKET EVENTS REFERENCE
// ============================================================================
// 
// CLIENT → SERVER EVENTS:
// - 'join_user_room' (userId: string) - Join user-specific notification room
// - 'join_owner_room' (ownerId: string) - Join owner fleet update room
// - 'disconnect' - Auto-fired when client disconnects
//
// SERVER → CLIENT EVENTS:
// - 'booking_status_update' - Booking approved/rejected
//   Payload: { bookingId, status, vehicleName, action, message }
//
// - 'new_booking' - New booking created (sent to owner)
//   Payload: { bookingId, vehicleName, renterName, totalPrice }
//
// - 'payment_received' - Payment confirmed
//   Payload: { bookingId, amount, type, status }
//
// - 'fleet_update' - Vehicle status changed
//   Payload: { vehicleId, status, location }
//
// - 'notification' - General notification
//   Payload: { type, title, message, data }
//
// ============================================================================
// ROOM STRUCTURE:
//
// user_{userId}     - Personal notifications for a specific user
// owner_{ownerId}   - Fleet updates for a specific owner
// booking_{id}      - Updates for a specific booking
//
// ============================================================================

export {};
