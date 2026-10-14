# Booking Approval API Documentation

## Overview

Endpoint untuk approve atau reject booking oleh owner/admin dengan notifikasi real-time ke renter.

## Endpoint

```
POST /api/bookings/[id]/approve
```

## Authentication

- **Required**: Yes
- **Roles**: OWNER, ADMIN
- **Method**: JWT Bearer Token

## Request

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Booking ID (CUID format) |

### Body

```json
{
  "action": "approve" | "reject"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | "approve" atau "reject" |

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clx123abc456def789",
    "renterId": "clx987zyx654wvu321",
    "vehicleId": "clx111aaa222bbb333",
    "startDate": "2026-10-12T00:00:00.000Z",
    "endDate": "2026-10-15T00:00:00.000Z",
    "durationType": "DAILY",
    "withDriver": true,
    "totalPrice": 8400000,
    "dpAmount": 4200000,
    "tripOrigin": "Jakarta",
    "tripDestination": "Bandung",
    "tripPurpose": "wisata",
    "guaranteeType": "KTP",
    "status": "CONFIRMED",
    "contractSigned": false,
    "createdAt": "2026-10-10T08:00:00.000Z",
    "updatedAt": "2026-10-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

**Cause**: Token tidak valid atau expired

#### 403 Forbidden

```json
{
  "error": "Forbidden"
}
```

**Cause**: 
- User bukan OWNER atau ADMIN
- OWNER mencoba approve booking kendaraan milik owner lain

#### 404 Not Found

```json
{
  "error": "Booking not found"
}
```

**Cause**: Booking ID tidak ditemukan

#### 500 Internal Server Error

```json
{
  "error": "Failed to process"
}
```

**Cause**: Error server internal

## Business Logic

### 1. Authentication Check
```typescript
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. User & Booking Fetch
```typescript
const user = await prisma.user.findUnique({
  where: { email: session.user?.email! },
  include: { fleetOwner: true },
});

const booking = await prisma.booking.findUnique({
  where: { id: params.id },
  include: {
    vehicle: true,
    renter: true,
  },
});
```

### 3. Ownership Verification
```typescript
// OWNER hanya bisa approve booking kendaraan miliknya
if (user?.role === 'OWNER' && booking.vehicle.ownerId !== user.fleetOwner?.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ADMIN bisa approve semua booking
// Tidak perlu check untuk ADMIN
```

### 4. Status Update
```typescript
const updatedBooking = await prisma.booking.update({
  where: { id: params.id },
  data: {
    status: action === 'approve' ? 'CONFIRMED' : 'CANCELLED',
  },
});
```

### 5. Real-time Notification
```typescript
if (io) {
  io.to(`user_${booking.renterId}`).emit('booking_status_update', {
    bookingId: booking.id,
    status: updatedBooking.status,
    vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
  });
}
```

## Status Flow

```
PENDING → CONFIRMED (approve)
PENDING → CANCELLED (reject)
```

### Status Definitions

| Status | Description | Next Action |
|--------|-------------|-------------|
| `PENDING` | Menunggu approval owner | Approve/Reject |
| `CONFIRMED` | Disetujui, menunggu pembayaran DP | Payment |
| `ACTIVE` | DP dibayar, rental berjalan | Check-in |
| `COMPLETED` | Rental selesai | Review |
| `CANCELLED` | Dibatalkan | - |

## Real-time Events

### Event: `booking_status_update`

**Emitted to**: `user_{renterId}`

**Payload**:
```json
{
  "bookingId": "clx123abc456def789",
  "status": "CONFIRMED",
  "vehicleName": "Toyota Alphard"
}
```

### Frontend Listener

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join user room
socket.emit('join_room', userId);

// Listen for booking status updates
socket.on('booking_status_update', (data) => {
  console.log('Booking status updated:', data);
  
  // Update UI
  if (data.status === 'CONFIRMED') {
    showNotification('Booking Anda telah disetujui!');
    updateBookingStatus(data.bookingId, 'CONFIRMED');
  } else if (data.status === 'CANCELLED') {
    showNotification('Booking Anda telah dibatalkan.');
    updateBookingStatus(data.bookingId, 'CANCELLED');
  }
});
```

## Usage Examples

### cURL

#### Approve Booking

```bash
curl -X POST http://localhost:3001/api/bookings/clx123abc456def789/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve"
  }'
```

#### Reject Booking

```bash
curl -X POST http://localhost:3001/api/bookings/clx123abc456def789/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject"
  }'
```

### JavaScript (Fetch)

```javascript
// Approve booking
const approveBooking = async (bookingId, token) => {
  const response = await fetch(`/api/bookings/${bookingId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'approve' }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.data;
};

// Reject booking
const rejectBooking = async (bookingId, token) => {
  const response = await fetch(`/api/bookings/${bookingId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'reject' }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.data;
};
```

### React Component

```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BookingActionsProps {
  bookingId: string;
  onStatusChange: (newStatus: string) => void;
}

export default function BookingActions({ bookingId, onStatusChange }: BookingActionsProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      onStatusChange(data.data.status);
      alert('Booking berhasil disetujui!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak booking ini?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      onStatusChange(data.data.status);
      alert('Booking berhasil ditolak.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Approve'}
      </button>
      
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Reject'}
      </button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
```

## Security Considerations

### 1. Authorization

```typescript
// OWNER hanya bisa approve booking kendaraan miliknya
if (user?.role === 'OWNER' && booking.vehicle.ownerId !== user.fleetOwner?.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Why**: Mencegah owner approve booking kendaraan owner lain

### 2. Role-Based Access

```typescript
// Hanya OWNER dan ADMIN yang bisa approve/reject
if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Why**: RENTER tidak boleh approve/reject booking

### 3. Input Validation

```typescript
const { action } = await req.json();

if (!['approve', 'reject'].includes(action)) {
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
```

**Why**: Mencegah invalid action

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| `Unauthorized` | 401 | Token invalid/expired | Re-login |
| `Forbidden` | 403 | Not owner/admin | Check role |
| `Booking not found` | 404 | Invalid booking ID | Check ID |
| `Failed to process` | 500 | Server error | Check logs |

### Error Logging

```typescript
catch (error) {
  console.error('POST /api/bookings/[id]/approve error:', error);
  
  // Log to monitoring service (Sentry, etc.)
  // Sentry.captureException(error);
  
  return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
}
```

## Testing

### Unit Test

```typescript
import { POST } from '@/app/api/bookings/[id]/approve/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

jest.mock('@/lib/prisma');
jest.mock('next-auth');

describe('POST /api/bookings/[id]/approve', () => {
  it('should approve booking successfully', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'owner@example.com' },
    });

    // Mock user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      role: 'OWNER',
      fleetOwner: { id: 'owner-1' },
    });

    // Mock booking
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: 'booking-1',
      vehicle: { ownerId: 'owner-1' },
      renter: { id: 'renter-1' },
    });

    // Mock update
    (prisma.booking.update as jest.Mock).mockResolvedValue({
      id: 'booking-1',
      status: 'CONFIRMED',
    });

    const req = new Request('http://localhost:3001/api/bookings/booking-1/approve', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    });

    const res = await POST(req, { params: { id: 'booking-1' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('CONFIRMED');
  });

  it('should return 403 if owner tries to approve another owner booking', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'owner1@example.com' },
    });

    // Mock user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      role: 'OWNER',
      fleetOwner: { id: 'owner-1' },
    });

    // Mock booking (belongs to different owner)
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
      id: 'booking-1',
      vehicle: { ownerId: 'owner-2' }, // Different owner
      renter: { id: 'renter-1' },
    });

    const req = new Request('http://localhost:3001/api/bookings/booking-1/approve', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    });

    const res = await POST(req, { params: { id: 'booking-1' } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });
});
```

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

// ... fetch from database

await redis.setex(cacheKey, 300, JSON.stringify(booking));
```

## Monitoring

### Metrics to Track

1. **Approval Rate**: Percentage of bookings approved vs rejected
2. **Response Time**: Time to process approval/rejection
3. **Error Rate**: Number of failed approvals
4. **Notification Delivery**: Socket.io connection success rate

### Alerts

```typescript
// Alert if approval takes > 5 seconds
if (responseTime > 5000) {
  sendAlert('Slow booking approval', { bookingId, responseTime });
}

// Alert if error rate > 5%
if (errorRate > 0.05) {
  sendAlert('High error rate in booking approval', { errorRate });
}
```

## Related Endpoints

- `GET /api/bookings` - List all bookings
- `GET /api/bookings/[id]` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/[id]` - Update booking

## Changelog

### v1.0.0 (2026-10-15)
- Initial implementation
- Approve/reject functionality
- Real-time notifications
- Role-based access control

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
