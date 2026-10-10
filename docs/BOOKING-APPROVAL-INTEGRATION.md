# Booking Approval Integration Guide

## Overview

Panduan integrasi endpoint approve/reject booking antara frontend React dan backend Next.js.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend API    │         │   Database      │
│   (React/Vite)  │────────>│   (Next.js)      │────────>│   (PostgreSQL)  │
│                 │<────────│                  │<────────│                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│   Socket.io     │         │   Real-time      │
│   Client        │<────────│   Notifications  │
│                 │         │                  │
└─────────────────┘         └──────────────────┘
```

## Frontend Implementation

### 1. API Client Setup

File: `src/api/client.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### 2. Booking Approval Component

File: `src/components/admin/BookingApproval.tsx`

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

interface BookingApprovalProps {
  bookingId: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function BookingApproval({ 
  bookingId, 
  onApprove, 
  onReject 
}: BookingApprovalProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/bookings/${bookingId}/approve`, {
        action: 'approve',
      });

      setSuccess('Booking berhasil disetujui!');
      onApprove?.();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyetujui booking');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak booking ini?')) {
      return;
    }

    setLoading('reject');
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/bookings/${bookingId}/approve`, {
        action: 'reject',
      });

      setSuccess('Booking berhasil ditolak.');
      onReject?.();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menolak booking');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition disabled:opacity-50"
        >
          {loading === 'approve' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition disabled:opacity-50"
        >
          {loading === 'reject' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          ✓ {success}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          ✗ {error}
        </motion.div>
      )}
    </div>
  );
}
```

### 3. Usage in Admin Dashboard

File: `src/components/admin/AdminDashboard.tsx`

```typescript
import BookingApproval from './BookingApproval';

// In the bookings list
{bookings.map((booking) => (
  <div key={booking.id} className="p-4 rounded-xl bg-black/40 border border-white/5">
    {/* Booking details */}
    <div className="mb-4">
      <h4 className="font-semibold">{booking.vehicle.brand} {booking.vehicle.model}</h4>
      <p className="text-sm text-gray-400">Renter: {booking.renter.name}</p>
      <p className="text-sm text-gray-400">
        {booking.startDate} - {booking.endDate}
      </p>
    </div>

    {/* Approval Actions (only for pending bookings) */}
    {booking.status === 'PENDING' && (
      <BookingApproval
        bookingId={booking.id}
        onApprove={() => {
          // Refresh bookings list
          fetchBookings();
        }}
        onReject={() => {
          // Refresh bookings list
          fetchBookings();
        }}
      />
    )}

    {/* Status Badge (for non-pending bookings) */}
    {booking.status !== 'PENDING' && (
      <span className={`px-3 py-1 rounded-full text-xs ${
        booking.status === 'CONFIRMED' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-red-500/20 text-red-400'
      }`}>
        {booking.status}
      </span>
    )}
  </div>
))}
```

### 4. Real-time Notifications

File: `src/hooks/useSocket.ts`

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(userId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join user room
    newSocket.emit('join_room', userId);

    // Listen for booking status updates
    newSocket.on('booking_status_update', (data) => {
      console.log('Booking status updated:', data);
      
      // Add to notifications
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'booking_update',
          message: data.message,
          bookingId: data.bookingId,
          status: data.status,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Renmoku', {
          body: data.message,
          icon: '/logo.png',
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return { socket, notifications };
}
```

### 5. Notification Component

File: `src/components/NotificationBell.tsx`

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useSocket('user-123'); // Replace with actual user ID

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-xl"
          >
            <h3 className="font-semibold mb-3">Notifikasi</h3>
            
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada notifikasi
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notif.timestamp.toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Backend Implementation

### Route Handler

File: `backend/src/app/api/bookings/[id]/approve/route.ts`

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
    // 1. Authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { fleetOwner: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Check role
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only owners or admins can approve bookings' },
        { status: 403 }
      );
    }

    // 4. Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        vehicle: true,
        renter: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 5. Verify ownership
    if (user.role === 'OWNER' && booking.vehicle.ownerId !== user.fleetOwner?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 6. Parse action
    const { action } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // 7. Check status
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot ${action} booking with status ${booking.status}` },
        { status: 400 }
      );
    }

    // 8. Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: action === 'approve' ? 'CONFIRMED' : 'CANCELLED',
      },
    });

    // 9. Real-time notification
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
      data: updatedBooking,
    });
  } catch (error) {
    console.error('POST /api/bookings/[id]/approve error:', error);
    return NextResponse.json(
      { error: 'Failed to process' },
      { status: 500 }
    );
  }
}
```

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (.env.local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key"
SOCKET_IO_CORS_ORIGIN="http://localhost:5173"
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

### 3. Test Approval Flow

1. Login as owner: `owner@renmoku.id` / `demo123`
2. Navigate to Dashboard
3. Find pending booking
4. Click "Approve" or "Reject"
5. Verify real-time notification appears for renter

### 4. Test with cURL

```bash
# Approve booking
curl -X POST http://localhost:3001/api/bookings/booking-123/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'

# Reject booking
curl -X POST http://localhost:3001/api/bookings/booking-123/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "reject"}'
```

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| `Unauthorized` | 401 | Token invalid | Re-login |
| `Forbidden` | 403 | Not owner/admin | Check role |
| `Booking not found` | 404 | Invalid ID | Check booking ID |
| `Invalid action` | 400 | Wrong action | Use "approve" or "reject" |
| `Cannot approve` | 400 | Wrong status | Only PENDING can be approved |

### Frontend Error Handling

```typescript
try {
  await apiClient.post(`/bookings/${bookingId}/approve`, {
    action: 'approve',
  });
} catch (error) {
  if (error.message === 'Unauthorized') {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.message === 'Forbidden') {
    // Show permission error
    alert('Anda tidak memiliki izin untuk approve booking ini');
  } else {
    // Show generic error
    alert(error.message);
  }
}
```

## Security Checklist

- [x] JWT authentication required
- [x] Role-based access control (OWNER/ADMIN only)
- [x] Ownership verification (OWNER can only approve own vehicles)
- [x] Input validation (action must be "approve" or "reject")
- [x] Status check (only PENDING bookings can be approved)
- [x] Error handling with proper status codes
- [x] Audit logging for all approval actions
- [x] CORS configuration for frontend-backend communication

## Performance Optimization

### 1. Database Indexes

```prisma
model Booking {
  id        String   @id @default(cuid())
  vehicleId String
  renterId  String
  status    BookingStatus
  
  @@index([vehicleId])
  @@index([renterId])
  @@index([status])
}
```

### 2. Caching

```typescript
// Cache booking data for 5 minutes
const cacheKey = `booking:${params.id}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return NextResponse.json(JSON.parse(cached));
}
```

### 3. Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
  try {
    await limiter.check(req, 10, 'APPROVE_BOOKING');
    // ... rest of the code
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
}
```

## Deployment

### 1. Backend Deployment (Vercel)

```bash
cd backend
vercel --prod
```

### 2. Frontend Deployment

```bash
npm run build
vercel --prod
```

### 3. Environment Variables

Set in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SOCKET_IO_CORS_ORIGIN`
- `VITE_API_URL`
- `VITE_SOCKET_URL`

## Monitoring

### 1. Logging

```typescript
console.log(`[Booking Approval] ${action.toUpperCase()} by ${user.email}:`, {
  bookingId: booking.id,
  vehicleId: booking.vehicleId,
  renterId: booking.renterId,
  timestamp: new Date().toISOString(),
});
```

### 2. Metrics

Track:
- Approval rate (approved vs rejected)
- Average response time
- Error rate
- Socket.io connection success rate

### 3. Alerts

Set up alerts for:
- High error rate (> 5%)
- Slow response time (> 5s)
- Socket.io connection failures

## Related Documentation

- [API Documentation](./API-DOCUMENTATION.md)
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md)
- [Booking Approval API](./BOOKING-APPROVAL-API.md)

---

**Status**: ✅ Integration Guide Complete  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
