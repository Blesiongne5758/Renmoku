# Socket.io Real-time Implementation Guide

## Overview

Dokumentasi lengkap implementasi Socket.io untuk fitur real-time notifications di Renmoku platform.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend        │         │   Database      │
│   (React/Vite)  │◄───────►│   (Next.js)      │◄───────►│   (PostgreSQL)  │
│                 │ Socket  │                  │  Prisma │                 │
│  - SocketClient │   .io   │  - SocketServer  │         │                 │
│  - useSocket    │         │  - API Routes    │         │                 │
│  - Notification │         │  - Event Handler │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Installation

### Frontend (Already Installed)
```bash
npm install socket.io-client
```

### Backend
```bash
npm install socket.io
```

## Frontend Implementation

### 1. Socket Client (`src/lib/socket-client.ts`)

Singleton class untuk manage socket connection:

```typescript
import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  
  connect(): Socket {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });
    
    return this.socket;
  }
  
  joinUserRoom(userId: string) {
    this.socket?.emit('join_user_room', userId);
  }
  
  joinOwnerRoom(ownerId: string) {
    this.socket?.emit('join_owner_room', ownerId);
  }
  
  onBookingStatusUpdate(callback: (data) => void) {
    this.socket?.on('booking_status_update', callback);
  }
  
  // ... more methods
}

export const socketClient = new SocketClient();
```

### 2. Socket Provider (`src/components/SocketProvider.tsx`)

React Context Provider untuk manage socket state:

```typescript
export function SocketProvider({ children }) {
  const { currentUser } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (!currentUser?.id) return;
    
    socketClient.connect();
    socketClient.joinUserRoom(currentUser.id);
    
    if (currentUser.role === 'owner') {
      socketClient.joinOwnerRoom(currentUser.id);
    }
    
    // Listen for events
    socketClient.onBookingStatusUpdate((data) => {
      setBookingUpdates(prev => [data, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Renmoku', {
          body: data.message,
        });
      }
    });
    
    return () => {
      socketClient.disconnect();
    };
  }, [currentUser?.id]);
  
  return (
    <SocketContext.Provider value={{ isConnected, notifications, ... }}>
      {children}
    </SocketContext.Provider>
  );
}
```

### 3. Notification Bell (`src/components/NotificationBell.tsx`)

UI component untuk display notifications:

```typescript
export default function NotificationBell() {
  const { 
    isConnected, 
    notifications, 
    bookingUpdates, 
    newBookings 
  } = useSocketContext();
  
  const totalUnread = notifications.length + bookingUpdates.length + newBookings.length;
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full">
            {totalUnread}
          </span>
        )}
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-400' : 'bg-red-400'
        }`} />
      </button>
      
      {/* Dropdown with notifications */}
    </div>
  );
}
```

### 4. Custom Hooks (`src/hooks/useSocket.ts`)

Reusable hooks untuk socket features:

```typescript
// Connection management
export function useSocketConnection(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!userId) return;
    
    socketClient.connect();
    socketClient.joinUserRoom(userId);
    
    // ... setup listeners
    
    return () => {
      socketClient.disconnect();
    };
  }, [userId]);
  
  return { isConnected };
}

// Specific event listeners
export function useBookingStatusUpdates(callback) {
  useEffect(() => {
    socketClient.onBookingStatusUpdate(callback);
    
    return () => {
      socketClient.off('booking_status_update', callback);
    };
  }, [callback]);
}

// Combined hook
export function useRealtime(userId: string | null) {
  const { isConnected } = useSocketConnection(userId);
  const [notifications, setNotifications] = useState([]);
  const [bookingUpdates, setBookingUpdates] = useState([]);
  const [newBookings, setNewBookings] = useState([]);
  
  useBookingStatusUpdates((data) => {
    setBookingUpdates(prev => [data, ...prev]);
  });
  
  return {
    isConnected,
    notifications,
    bookingUpdates,
    newBookings,
  };
}
```

### 5. Integration in App (`src/App.tsx`)

Wrap app with SocketProvider:

```typescript
import { SocketProvider } from './components/SocketProvider';

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen">
        <Navbar />
        {/* ... rest of app */}
      </div>
    </SocketProvider>
  );
}
```

### 6. Navbar Integration (`src/components/Navbar.tsx`)

Add NotificationBell to navbar:

```typescript
import NotificationBell from './NotificationBell';

export default function Navbar() {
  return (
    <nav>
      {/* ... */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        {/* ... user menu */}
      </div>
    </nav>
  );
}
```

## Backend Implementation (Next.js)

### 1. Socket Server (`backend/src/lib/socket.ts`)

```typescript
import { Server } from 'socket.io';
import { Server as NetServer } from 'http';

export let io: Server | null = null;

export const initSocket = (httpServer: NetServer) => {
  if (io) return io;
  
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socketio',
  });
  
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });
    
    socket.on('join_owner_room', (ownerId: string) => {
      socket.join(`owner_${ownerId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
};
```

### 2. Booking Approval Route (`backend/src/app/api/bookings/[id]/approve/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { io } from '@/lib/socket';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ... authentication and validation
    
    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
       { status: action === 'approve' ? 'CONFIRMED' : 'CANCELLED' },
    });
    
    // 🔔 Real-time notification
    if (io) {
      io.to(`user_${booking.renterId}`).emit('booking_status_update', {
        bookingId: booking.id,
        status: updatedBooking.status,
        vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        action: action,
        message: action === 'approve' 
          ? 'Booking Anda telah disetujui!' 
          : 'Booking Anda telah ditolak.',
      });
    }
    
    return NextResponse.json({
      success: true,
       updatedBooking,
    });
  } catch (error) {
    // ... error handling
  }
}
```

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_user_room` | `userId: string` | Join user-specific room |
| `join_owner_room` | `ownerId: string` | Join owner fleet room |
| `disconnect` | - | Auto-fired on disconnect |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `booking_status_update` | `{ bookingId, status, vehicleName, action, message }` | Booking approved/rejected |
| `new_booking` | `{ bookingId, vehicleName, renterName, totalPrice }` | New booking created |
| `payment_received` | `{ bookingId, amount, type, status }` | Payment confirmed |
| `fleet_update` | `{ vehicleId, status, location }` | Vehicle status changed |
| `notification` | `{ type, title, message, data }` | General notification |

## Room Structure

```
user_{userId}     - Personal notifications for a specific user
owner_{ownerId}   - Fleet updates for a specific owner
booking_{id}      - Updates for a specific booking
```

## Environment Variables

### Frontend (.env)
```env
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (.env.local)
```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

## Browser Notifications

Request permission:
```typescript
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

// Show notification
if (Notification.permission === 'granted') {
  new Notification('Renmoku', {
    body: 'Booking Anda telah disetujui!',
    icon: '/logo.png',
    tag: 'booking-update',
  });
}
```

## Testing

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Flow
1. Login as owner: `owner@renmoku.id` / `demo123`
2. Open another browser tab
3. Login as renter: `renter@renmoku.id` / `demo123`
4. Create a booking
5. In owner tab, approve the booking
6. Check renter tab - notification should appear instantly

### 4. Check Console Logs
```
✅ Socket connected: abc123xyz
👤 User user-123 joined their room
📦 Booking status update: { bookingId: '...', status: 'CONFIRMED', ... }
```

## Error Handling

### Connection Errors
```typescript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  
  // Show user-friendly message
  if (error.message === 'xhr poll error') {
    alert('Koneksi ke server terputus. Silakan refresh halaman.');
  }
});
```

### Reconnection
```typescript
// Automatic reconnection configured
socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

## Security

### Authentication
```typescript
// Frontend - Send token on connection
socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('auth_token'),
  },
});

// Backend - Verify token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  // Verify JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});
```

### CORS Configuration
```typescript
io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  },
});
```

## Performance Optimization

### 1. Connection Pooling
```typescript
// Use singleton pattern
export const socketClient = new SocketClient();
```

### 2. Event Debouncing
```typescript
import { debounce } from 'lodash';

const handleUpdate = debounce((data) => {
  // Process update
}, 300);

socket.on('booking_status_update', handleUpdate);
```

### 3. Memory Management
```typescript
// Cleanup old notifications
useEffect(() => {
  if (notifications.length > 50) {
    setNotifications(prev => prev.slice(0, 49));
  }
}, [notifications]);
```

## Monitoring

### Connection Status
```typescript
const { isConnected } = useSocketContext();

// Display in UI
<div className={`w-2 h-2 rounded-full ${
  isConnected ? 'bg-emerald-400' : 'bg-red-400'
}`} />
```

### Logging
```typescript
// Frontend
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

// Backend
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
});
```

## Troubleshooting

### Issue: Socket not connecting
**Solution:**
- Check backend is running
- Verify SOCKET_URL environment variable
- Check CORS configuration
- Check browser console for errors

### Issue: Notifications not showing
**Solution:**
- Check browser notification permission
- Verify user is in correct room
- Check backend is emitting to correct room
- Check socket connection status

### Issue: Duplicate notifications
**Solution:**
- Clean up event listeners in useEffect return
- Use unique keys for notification list
- Debounce rapid events

## Future Enhancements

1. **Chat System**
   - Direct messaging between renter and owner
   - Group chat for support

2. **Live Tracking**
   - Real-time vehicle location
   - Driver tracking

3. **Collaborative Features**
   - Multiple users editing same booking
   - Real-time collaboration

4. **Advanced Notifications**
   - Push notifications (PWA)
   - Email notifications
   - SMS notifications

## Related Documentation

- [Booking Approval API](./BOOKING-APPROVAL-API.md)
- [Booking Approval Integration](./BOOKING-APPROVAL-INTEGRATION.md)
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md)
- [API Documentation](./API-DOCUMENTATION.md)

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
