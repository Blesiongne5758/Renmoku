# RealtimeNotifier Component Documentation

## Overview

`RealtimeNotifier` adalah komponen React yang menampilkan notifikasi real-time menggunakan Socket.io dan Sonner toast notifications. Komponen ini terhubung ke Socket.io server dan menampilkan toast notifications untuk berbagai event seperti booking baru, update status booking, dan pembayaran.

## Features

- ✅ **Real-time Connection Status** - Menampilkan status koneksi Live/Offline
- ✅ **Toast Notifications** - Notifikasi popup dengan Sonner
- ✅ **Multiple Event Types** - Support untuk booking, payment, dan fleet updates
- ✅ **Browser Notifications** - Integrasi dengan native browser notifications
- ✅ **Auto-reconnect** - Automatic reconnection jika koneksi terputus
- ✅ **Type-safe** - Full TypeScript support

## Installation

### Dependencies

```bash
npm install sonner socket.io-client
```

### Component Setup

```typescript
// src/App.tsx
import { Toaster } from 'sonner';
import RealtimeNotifier from './components/RealtimeNotifier';

function App() {
  return (
    <SocketProvider>
      {/* ... your app */}
      <RealtimeNotifier />
      <Toaster position="top-right" theme="dark" />
    </SocketProvider>
  );
}
```

## Usage

### Basic Usage

```typescript
import RealtimeNotifier from './components/RealtimeNotifier';

function MyComponent() {
  return <RealtimeNotifier />;
}
```

### With Custom Callbacks

```typescript
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';

function MyComponent() {
  const { currentUser } = useAppStore();
  
  const { isConnected } = useSocket({
    userId: currentUser?.id,
    onNewBooking: (data) => {
      toast.success(`🎉 Booking Baru!`, {
        description: `${data.renterName} memesan ${data.vehicleName}`,
        duration: 5000,
      });
    },
    onBookingUpdate: (data) => {
      const statusText = data.status === 'CONFIRMED' ? '✅ Disetujui' : '❌ Ditolak';
      toast.info(`Booking ${statusText}`, {
        description: `${data.vehicleName} - ${statusText}`,
      });
    },
    onPaymentUpdate: (data) => {
      toast.success(`💰 Pembayaran Diterima`, {
        description: `Pembayaran ${data.type} sebesar Rp ${data.amount.toLocaleString('id-ID')}`,
      });
    },
  });

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Props

### useSocket Hook Options

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string \| null \| undefined` | Yes | User ID untuk join room |
| `onNewBooking` | `(data: NewBookingNotification) => void` | No | Callback untuk booking baru |
| `onBookingUpdate` | `(data: BookingStatusUpdate) => void` | No | Callback untuk update status booking |
| `onPaymentUpdate` | `(data: PaymentNotification) => void` | No | Callback untuk pembayaran |
| `onFleetUpdate` | `(data: FleetUpdate) => void` | No | Callback untuk update armada |
| `onNotification` | `(data: GeneralNotification) => void` | No | Callback untuk notifikasi umum |

### Event Data Types

#### NewBookingNotification

```typescript
interface NewBookingNotification {
  bookingId: string;
  vehicleName: string;
  renterName: string;
  totalPrice: number;
}
```

#### BookingStatusUpdate

```typescript
interface BookingStatusUpdate {
  bookingId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'ACTIVE' | 'COMPLETED';
  vehicleName: string;
  action: 'approve' | 'reject';
  message: string;
}
```

#### PaymentNotification

```typescript
interface PaymentNotification {
  bookingId: string;
  amount: number;
  type: 'DP' | 'FULL_PAYMENT';
  status: 'PAID' | 'FAILED';
}
```

#### FleetUpdate

```typescript
interface FleetUpdate {
  vehicleId: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
  location?: string;
}
```

## UI Elements

### Connection Status Indicator

Komponen menampilkan indicator koneksi di pojok kanan bawah:

```typescript
<div className="fixed bottom-4 right-4 z-50">
  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs backdrop-blur-xl border ${
    isConnected 
      ? 'bg-green-500/20 border-green-500/30 text-green-400' 
      : 'bg-red-500/20 border-red-500/30 text-red-400'
  }`}>
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
    {isConnected ? 'Live' : 'Offline'}
  </div>
</div>
```

**States:**
- 🟢 **Live** (Hijau) - Terhubung ke Socket.io server
- 🔴 **Offline** (Merah) - Tidak terhubung

### Toast Notifications

Komponen menggunakan Sonner untuk menampilkan toast notifications:

```typescript
// Success notification
toast.success(`🎉 Booking Baru!`, {
  description: `${data.renterName} memesan ${data.vehicleName}`,
  duration: 5000,
});

// Info notification
toast.info(`Booking ✅ Disetujui`, {
  description: `${data.vehicleName} - Disetujui oleh pemilik`,
});

// Error notification
toast.error(`❌ Pembayaran Gagal`, {
  description: `Silakan coba lagi`,
});
```

## Event Flow

### 1. Connection Flow

```
User Login
  ↓
Get userId from useAppStore
  ↓
useSocket hook initialized
  ↓
socketClient.connect()
  ↓
Join user room: user_{userId}
  ↓
Listen for events
  ↓
Display connection status
```

### 2. Notification Flow

```
Backend emits event
  ↓
Socket.io receives event
  ↓
Callback function triggered
  ↓
Toast notification displayed
  ↓
Browser notification (if permitted)
```

## Backend Integration

### Emitting Events from Backend

```typescript
// backend/src/app/api/bookings/[id]/approve/route.ts
import { emitBookingStatusUpdate } from '@/lib/socket';

// After updating booking
emitBookingStatusUpdate(booking.renterId, {
  bookingId: booking.id,
  status: 'CONFIRMED',
  vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
  action: 'approve',
  message: 'Booking Anda telah disetujui!',
});
```

### Available Emit Functions

```typescript
// Booking status update
emitBookingStatusUpdate(userId, data);

// New booking notification
emitNewBooking(ownerId, data);

// Payment received
emitPaymentReceived(userId, data);

// Fleet update
emitFleetUpdate(ownerId, data);

// General notification
emitNotification(userId, data);
```

## Customization

### Toast Position

```typescript
<Toaster position="top-right" /> // Default
<Toaster position="top-center" />
<Toaster position="bottom-right" />
<Toaster position="bottom-center" />
```

### Toast Theme

```typescript
<Toaster theme="dark" /> // Dark theme
<Toaster theme="light" /> // Light theme
<Toaster theme="system" /> // Auto based on system preference
```

### Toast Styling

```typescript
<Toaster 
  toastOptions={{
    style: {
      background: '#1a1a1a',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      color: '#fff',
      borderRadius: '12px',
    },
  }}
/>
```

### Connection Indicator Position

```typescript
// Default: bottom-right
<div className="fixed bottom-4 right-4 z-50">

// Bottom-left
<div className="fixed bottom-4 left-4 z-50">

// Top-right
<div className="fixed top-20 right-4 z-50">
```

## Browser Notifications

### Request Permission

```typescript
if (Notification.permission === 'default') {
  Notification.requestPermission();
}
```

### Show Browser Notification

```typescript
if (Notification.permission === 'granted') {
  new Notification('Renmoku', {
    body: 'Booking Anda telah disetujui!',
    icon: '/logo.png',
    tag: 'booking-update',
  });
}
```

### Notification Permissions

| Permission | Description |
|------------|-------------|
| `default` | User belum memutuskan |
| `granted` | User mengizinkan notifikasi |
| `denied` | User menolak notifikasi |

## Error Handling

### Connection Errors

```typescript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  
  // Show user-friendly message
  toast.error('Koneksi terputus', {
    description: 'Mencoba menghubungkan kembali...',
  });
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

## Performance Optimization

### Memoization

```typescript
import { useCallback } from 'react';

const onNewBooking = useCallback((data) => {
  toast.success(`🎉 Booking Baru!`, {
    description: `${data.renterName} memesan ${data.vehicleName}`,
  });
}, []);

useSocket({
  userId,
  onNewBooking,
});
```

### Debouncing

```typescript
import { debounce } from 'lodash';

const onBookingUpdate = debounce((data) => {
  toast.info(`Booking ${data.status}`);
}, 300);
```

## Testing

### Manual Testing

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Test Connection**
   - Login as user
   - Check connection indicator (should be green "Live")
   - Open browser console to see socket logs

4. **Test Notifications**
   - Create a booking (as renter)
   - Approve booking (as owner)
   - Check renter receives toast notification

### Unit Testing

```typescript
import { render, screen } from '@testing-library/react';
import RealtimeNotifier from './RealtimeNotifier';

describe('RealtimeNotifier', () => {
  it('should render connection indicator', () => {
    render(<RealtimeNotifier />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should show offline status when disconnected', () => {
    // Mock disconnected state
    render(<RealtimeNotifier />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Not receiving notifications

**Solutions:**
- Check browser console for socket errors
- Verify backend is emitting to correct room
- Check userId is correct
- Verify socket connection is established

### Issue: Connection indicator shows "Offline"

**Solutions:**
- Check backend server is running
- Verify SOCKET_URL environment variable
- Check CORS configuration
- Check browser console for connection errors

### Issue: Toast notifications not showing

**Solutions:**
- Verify Toaster component is rendered
- Check Sonner is installed
- Verify toast() is being called
- Check browser console for errors

### Issue: Browser notifications not showing

**Solutions:**
- Check notification permission
- Verify Notification API is supported
- Check browser notification settings
- Try in different browser

## Security Considerations

### Authentication

```typescript
// Send JWT token on connection
socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('auth_token'),
  },
});
```

### Authorization

```typescript
// Backend verifies user can only join their own room
socket.on('join_user_room', (userId) => {
  if (socket.userId !== userId) {
    socket.disconnect();
    return;
  }
  socket.join(`user_${userId}`);
});
```

### Data Validation

```typescript
// Validate event data before processing
socket.on('booking_status_update', (data) => {
  if (!data.bookingId || !data.status) {
    console.error('Invalid event data');
    return;
  }
  // Process valid data
});
```

## Accessibility

### Screen Reader Support

```typescript
<div 
  role="status" 
  aria-live="polite"
  aria-label={`Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`}
>
  {isConnected ? 'Live' : 'Offline'}
</div>
```

### Keyboard Navigation

```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  View Notifications
</button>
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Mobile Chrome | 90+ | ✅ Full |

## Related Components

- **NotificationBell** - Dropdown notification list
- **SocketProvider** - Global socket state management
- **BookingApproval** - Approve/reject booking actions

## Related Documentation

- [Socket.io Implementation](./SOCKET-IO-IMPLEMENTATION.md)
- [Booking Approval API](./BOOKING-APPROVAL-API.md)
- [Backend Templates](./backend-templates/README.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
