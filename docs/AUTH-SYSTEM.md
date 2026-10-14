# Authentication & Authorization System

## Overview

Sistem autentikasi dan otorisasi lengkap untuk platform Renmoku dengan dukungan role-based access control (RBAC) dan permission-based authorization.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  auth.tsx    │  │ auth-helpers │  │  Components  │     │
│  │  (Client)    │  │   (Legacy)   │  │   (UI)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JWT Token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ auth.ts      │  │   prisma.ts  │  │  API Routes  │     │
│  │ (Middleware) │  │  (Database)  │  │  (Handlers)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Roles

### 1. RENTER (Penyewa)
- Individual users yang menyewa kendaraan
- Corporate users (perusahaan) yang menyewa kendaraan

**Permissions:**
- ✅ Create booking
- ✅ View own bookings
- ✅ View own profile
- ✅ Create payment
- ✅ View own payments
- ✅ View own reports

### 2. OWNER (Pemilik Armada)
- Pemilik kendaraan yang menyewakan armada

**Permissions:**
- ✅ All RENTER permissions
- ✅ Create vehicle
- ✅ View own vehicles
- ✅ Update vehicle
- ✅ Delete vehicle
- ✅ Approve/reject bookings
- ✅ Export reports

### 3. ADMIN (Administrator)
- Administrator platform

**Permissions:**
- ✅ All permissions
- ✅ View all users
- ✅ Verify users (KYC)
- ✅ Update/delete users
- ✅ View all bookings
- ✅ View all vehicles
- ✅ View all payments
- ✅ View all reports
- ✅ Manage platform
- ✅ View analytics
- ✅ Manage settings

## Frontend Implementation

### Files

1. **`src/lib/auth.tsx`** - Client-side auth utilities
2. **`src/lib/auth-helpers.ts`** - Legacy auth helpers
3. **`src/stores/useAppStore.ts`** - Global auth state

### Usage Examples

#### Check Authentication
```typescript
import { isAuthenticated, getAuthenticatedUser } from '@/lib/auth';

if (isAuthenticated()) {
  const user = getAuthenticatedUser();
  console.log('User:', user.name);
}
```

#### Check Role
```typescript
import { isAdmin, isOwner, isRenter } from '@/lib/auth';

if (isAdmin()) {
  console.log('User is admin');
}

if (isOwner()) {
  console.log('User is owner or admin');
}
```

#### Require Authentication
```typescript
import { requireAuth } from '@/lib/auth';

function ProtectedPage() {
  if (!requireAuth()) {
    return null; // Will redirect to login
  }
  
  return <div>Protected content</div>;
}
```

#### Require Specific Role
```typescript
import { requireOwner, requireAdmin } from '@/lib/auth';

function OwnerDashboard() {
  if (!requireOwner()) {
    return null; // Will redirect to home
  }
  
  return <div>Owner dashboard</div>;
}

function AdminPanel() {
  if (!requireAdmin()) {
    return null; // Will redirect to home
  }
  
  return <div>Admin panel</div>;
}
```

#### Higher-Order Component
```typescript
import { withAuth } from '@/lib/auth';

const ProtectedComponent = withAuth(MyComponent, ['OWNER', 'ADMIN']);

// Usage
<ProtectedComponent />
```

#### Check Permission
```typescript
import { hasPermission, PERMISSIONS } from '@/lib/auth';

if (hasPermission(PERMISSIONS.APPROVE_BOOKING)) {
  console.log('User can approve bookings');
}
```

#### Require Permission
```typescript
import { requirePermission, PERMISSIONS } from '@/lib/auth';

function ApproveBookingButton() {
  if (!requirePermission(PERMISSIONS.APPROVE_BOOKING)) {
    return null; // Will redirect if no permission
  }
  
  return <button>Approve</button>;
}
```

## Backend Implementation

### Files

1. **`docs/backend-templates/src/lib/auth-middleware.ts`** - Backend middleware
2. **`docs/backend-templates/src/lib/auth.ts`** - NextAuth configuration
3. **`docs/backend-templates/src/lib/prisma.ts`** - Database client

### Middleware Functions

#### authenticate()
Authenticate user from session and return user object with profile data.

```typescript
const user = await authenticate();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### authorize(allowedRoles)
Create middleware that checks if user has required role.

```typescript
export const POST = authorize(['OWNER', 'ADMIN'])(async (req) => {
  const user = (req as any).user;
  // Only owners and admins can access this endpoint
  return NextResponse.json({ success: true });
});
```

#### Role-Based Helpers
```typescript
// Require admin
export const GET = requireAdmin(handler);

// Require owner or admin
export const POST = requireOwner(handler);

// Require renter
export const PUT = requireRenter(handler);

// Require any authenticated user
export const DELETE = requireAuth(handler);
```

#### Permission-Based Authorization
```typescript
export const PUT = requirePermission(PERMISSIONS.APPROVE_BOOKING)(
  async (req, context) => {
    const user = (req as any).user;
    // User has permission to approve bookings
    return NextResponse.json({ success: true });
  }
);
```

#### Ownership Verification
```typescript
export const DELETE = requireOwnership('vehicle')(
  async (req, { params }) => {
    const user = (req as any).user;
    // User owns this vehicle
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  }
);
```

## API Route Examples

### Bookings API

```typescript
// GET /api/bookings - List bookings
export const GET = requireAuth(async (req: NextRequest) => {
  const user = (req as any).user;
  
  let whereClause = {};
  
  if (user.role === 'RENTER') {
    whereClause = { renterId: user.id };
  } else if (user.role === 'OWNER') {
    whereClause = { vehicle: { ownerId: user.fleetOwner?.id } };
  }
  // ADMIN can see all
  
  const bookings = await prisma.booking.findMany({ where: whereClause });
  
  return NextResponse.json({ success: true,  bookings });
});

// POST /api/bookings - Create booking
export const POST = requireRenter(async (req: NextRequest) => {
  const user = (req as any).user;
  const body = await req.json();
  
  const booking = await prisma.booking.create({
     {
      renterId: user.id,
      ...body,
    },
  });
  
  return NextResponse.json({ success: true,  booking });
});

// POST /api/bookings/[id]/approve - Approve booking
export const POST = requirePermission(PERMISSIONS.APPROVE_BOOKING)(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = (req as any).user;
    
    // Verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { vehicle: true },
    });
    
    if (user.role === 'OWNER' && booking.vehicle.ownerId !== user.fleetOwner?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await prisma.booking.update({
      where: { id: params.id },
       { status: 'CONFIRMED' },
    });
    
    return NextResponse.json({ success: true });
  }
);
```

### Vehicles API

```typescript
// POST /api/vehicles - Create vehicle
export const POST = requireOwner(async (req: NextRequest) => {
  const user = (req as any).user;
  const body = await req.json();
  
  const vehicle = await prisma.vehicle.create({
     {
      ownerId: user.fleetOwner.id,
      ...body,
    },
  });
  
  return NextResponse.json({ success: true,  vehicle });
});

// PUT /api/vehicles/[id] - Update vehicle
export const PUT = requireOwnership('vehicle')(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json();
    
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: body,
    });
    
    return NextResponse.json({ success: true,  vehicle });
  }
);

// DELETE /api/vehicles/[id] - Delete vehicle
export const DELETE = requireOwnership('vehicle')(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await prisma.vehicle.delete({ where: { id: params.id } });
    
    return NextResponse.json({ success: true });
  }
);
```

### Users API (Admin Only)

```typescript
// GET /api/users - List users
export const GET = requireAdmin(async (req: NextRequest) => {
  const users = await prisma.user.findMany();
  
  return NextResponse.json({ success: true,  users });
});

// POST /api/users/[id]/verify - Verify user
export const POST = requirePermission(PERMISSIONS.VERIFY_USER)(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const body = await req.json();
    
    const user = await prisma.user.update({
      where: { id: params.id },
       { status: body.status },
    });
    
    return NextResponse.json({ success: true,  user });
  }
);
```

## Security Features

### 1. JWT Authentication
- Token-based authentication
- Secure token storage (localStorage)
- Automatic token refresh

### 2. Role-Based Access Control (RBAC)
- Three user roles: RENTER, OWNER, ADMIN
- Role-based permission matrix
- Automatic role verification

### 3. Permission-Based Authorization
- Granular permission system
- 20+ defined permissions
- Permission checking middleware

### 4. Ownership Verification
- Verify user owns the resource
- Prevent unauthorized access
- Support for vehicles and bookings

### 5. Input Validation
- Zod schema validation
- Type-safe request handling
- Error handling

### 6. CORS Configuration
- Configurable CORS origins
- Credentials support
- Secure cross-origin requests

## Token Management

### Frontend
```typescript
// Get token
const token = getAuthToken();

// Set token
setAuthToken('your-jwt-token');

// Remove token
removeAuthToken();

// Check if token exists
if (hasAuthToken()) {
  // Token exists
}
```

### Backend
```typescript
// Verify token in middleware
const token = req.headers.get('authorization')?.replace('Bearer ', '');

if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## Session Management

### Frontend
```typescript
// Check if session is valid
if (isSessionValid()) {
  // Session is valid
}

// Clear session (logout)
clearSession();
```

### Backend
```typescript
// Get session
const session = await getServerSession(authOptions);

if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Error Handling

### Authentication Errors
```typescript
// 401 Unauthorized
{
  "error": "Unauthorized - Please login"
}

// 403 Forbidden
{
  "error": "Forbidden - Insufficient permissions"
}
```

### Frontend Error Handling
```typescript
try {
  const response = await apiClient.get('/bookings');
} catch (error) {
  if (error.message === 'Unauthorized') {
    // Redirect to login
    setCurrentPage('auth');
  } else if (error.message === 'Forbidden') {
    // Show permission error
    alert('Anda tidak memiliki izin');
  }
}
```

## Testing

### Unit Tests
```typescript
import { isAuthenticated, hasRole, hasPermission } from '@/lib/auth';

describe('Auth utilities', () => {
  it('should check authentication', () => {
    expect(isAuthenticated()).toBe(true);
  });
  
  it('should check role', () => {
    expect(hasRole(['ADMIN'])).toBe(true);
  });
  
  it('should check permission', () => {
    expect(hasPermission('approve_booking')).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('API authentication', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/bookings');
    expect(response.status).toBe(401);
  });
  
  it('should require role', async () => {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { Authorization: 'Bearer renter-token' },
    });
    expect(response.status).toBe(403);
  });
});
```

## Best Practices

### 1. Always Check Authentication First
```typescript
// ✅ Good
if (!requireAuth()) return null;
if (!requireOwner()) return null;

// ❌ Bad
if (!requireOwner()) return null; // Might crash if not authenticated
```

### 2. Use Specific Permissions
```typescript
// ✅ Good
if (hasPermission(PERMISSIONS.APPROVE_BOOKING)) {
  // Show approve button
}

// ❌ Bad
if (isAdmin() || isOwner()) {
  // Too broad
}
```

### 3. Verify Ownership
```typescript
// ✅ Good
const hasOwnership = await verifyOwnership(userId, 'vehicle', vehicleId);
if (!hasOwnership) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ❌ Bad
// No ownership check
await prisma.vehicle.delete({ where: { id: vehicleId } });
```

### 4. Handle Errors Gracefully
```typescript
// ✅ Good
try {
  await apiClient.post('/bookings', data);
  toast.success('Booking created');
} catch (error) {
  toast.error(error.message);
}

// ❌ Bad
await apiClient.post('/bookings', data); // No error handling
```

## Related Documentation

- [API Documentation](./API-DOCUMENTATION.md)
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md)
- [Socket.io Implementation](./SOCKET-IO-IMPLEMENTATION.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
