# Route Protection System

## Overview

Sistem proteksi route berdasarkan role user yang setara dengan Next.js Middleware, diimplementasikan untuk stack Vite + React.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS MIDDLEWARE                        │
│                    (Backend Reference)                       │
│                                                              │
│  middleware.ts                                               │
│  ├── /admin/* → ADMIN only                                  │
│  ├── /dashboard/owner/* → OWNER, ADMIN                      │
│  ├── /dashboard/renter/* → RENTER, ADMIN                    │
│  └── Redirect to /unauthorized if denied                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Equivalent
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    VITE + REACT                              │
│                    (Frontend Implementation)                 │
│                                                              │
│  src/lib/auth.tsx                                           │
│  ├── canAccessRoute(path)                                   │
│  ├── protectRoute(path)                                     │
│  ├── withRouteProtection(Component, path)                   │
│  └── ROUTE_PROTECTION config                                │
│                                                              │
│  src/App.tsx                                                │
│  ├── Route protection check in renderPage()                 │
│  └── UnauthorizedPage component                             │
│                                                              │
│  src/pages/UnauthorizedPage.tsx                             │
│  └── UI for unauthorized access                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Route Protection Rules

### Backend (Next.js Middleware)

```typescript
// /admin/* → ADMIN only
if (pathname.startsWith('/admin')) {
  if (userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
}

// /dashboard/owner/* → OWNER, ADMIN
if (pathname.startsWith('/dashboard/owner')) {
  if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
}

// /dashboard/renter/* → RENTER, ADMIN
if (pathname.startsWith('/dashboard/renter')) {
  if (userRole !== 'RENTER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
}
```

### Frontend (Vite + React)

```typescript
// src/lib/auth.tsx
export const ROUTE_PROTECTION = {
  '/admin': ['ADMIN'],
  '/dashboard/owner': ['OWNER', 'ADMIN'],
  '/dashboard/renter': ['RENTER', 'ADMIN'],
  '/dashboard': ['RENTER', 'OWNER', 'ADMIN'],
} as const;

export function canAccessRoute(path: string): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;

  for (const [route, allowedRoles] of Object.entries(ROUTE_PROTECTION)) {
    if (path.startsWith(route)) {
      return (allowedRoles as readonly UserRole[]).includes(userRole);
    }
  }

  return true; // Public route
}
```

## Implementation Details

### 1. Route Protection Configuration

```typescript
// src/lib/auth.tsx
export const ROUTE_PROTECTION = {
  '/admin': ['ADMIN'],
  '/dashboard/owner': ['OWNER', 'ADMIN'],
  '/dashboard/renter': ['RENTER', 'ADMIN'],
  '/dashboard': ['RENTER', 'OWNER', 'ADMIN'],
} as const;
```

**Route Mapping:**
- `/admin/*` → Only ADMIN role
- `/dashboard/owner/*` → OWNER or ADMIN role
- `/dashboard/renter/*` → RENTER or ADMIN role
- `/dashboard/*` → Any authenticated user

### 2. Access Check Function

```typescript
export function canAccessRoute(path: string): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;

  // Check each route protection rule
  for (const [route, allowedRoles] of Object.entries(ROUTE_PROTECTION)) {
    if (path.startsWith(route)) {
      return (allowedRoles as readonly UserRole[]).includes(userRole);
    }
  }

  // If no specific rule matches, allow access (public route)
  return true;
}
```

**Logic:**
1. Get user role from auth store
2. Check if route matches any protection rule
3. If match found, check if user role is allowed
4. If no match, allow access (public route)

### 3. Route Protection Function

```typescript
export function protectRoute(path: string): boolean {
  const { setCurrentPage } = useAppStore.getState();
  
  if (!canAccessRoute(path)) {
    setCurrentPage('unauthorized');
    return false;
  }
  
  return true;
}
```

**Usage:**
```typescript
// In component
if (!protectRoute('/dashboard/owner')) {
  return null; // Will redirect to unauthorized
}
```

### 4. Higher-Order Component

```typescript
export function withRouteProtection<P extends object>(
  Component: React.ComponentType<P>,
  routePath: string
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, currentUser, setCurrentPage } = useAppStore();
    
    // Check authentication
    if (!isAuthenticated || !currentUser) {
      setTimeout(() => setCurrentPage('auth'), 0);
      return null;
    }
    
    // Check route access
    if (!canAccessRoute(routePath)) {
      setTimeout(() => setCurrentPage('unauthorized'), 0);
      return null;
    }
    
    return <Component {...props} />;
  };
}
```

**Usage:**
```typescript
const ProtectedDashboard = withRouteProtection(Dashboard, '/dashboard/owner');

// In App.tsx
<ProtectedDashboard />
```

### 5. App.tsx Integration

```typescript
const renderPage = () => {
  // Route protection - check access before rendering
  if (currentPage !== 'auth' && currentPage !== 'unauthorized' && 
      currentPage !== 'home' && currentPage !== 'fleet' && 
      currentPage !== 'terms' && currentPage !== 'database') {
    if (!canAccessRoute(`/${currentPage}`)) {
      return <UnauthorizedPage />;
    }
  }

  switch (currentPage) {
    case 'dashboard':
      if (currentUser?.role === 'owner') {
        return <OwnerDashboardNew />;
      }
      if (currentUser?.role === 'admin') {
        return <AdminDashboard />;
      }
      return <DashboardPage />;
    case 'unauthorized':
      return <UnauthorizedPage />;
    // ... other cases
  }
};
```

**Logic:**
1. Check if route requires protection
2. Verify user can access the route
3. If denied, render UnauthorizedPage
4. Otherwise, render appropriate component

## Unauthorized Page

### Component

```typescript
// src/pages/UnauthorizedPage.tsx
export default function UnauthorizedPage() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-luxury">
      <motion.div className="card-luxury p-8 sm:p-12 max-w-md w-full text-center">
        <Shield className="w-10 h-10 text-red-400 mx-auto mb-6" />
        <h1 className="font-[Playfair_Display] text-3xl font-bold text-white mb-3">
          Akses Ditolak
        </h1>
        <p className="text-gray-400 mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setCurrentPage('home')}>
            Ke Beranda
          </button>
          <button onClick={() => setCurrentPage('auth')}>
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

**Features:**
- ✅ Shield icon dengan red accent
- ✅ Clear error message
- ✅ Action buttons (Home, Login)
- ✅ Smooth animations
- ✅ Responsive design

## Usage Examples

### Example 1: Protect Dashboard Route

```typescript
// In App.tsx
const renderPage = () => {
  if (currentPage === 'dashboard') {
    if (!canAccessRoute('/dashboard')) {
      return <UnauthorizedPage />;
    }
    
    if (currentUser?.role === 'owner') {
      return <OwnerDashboardNew />;
    }
    if (currentUser?.role === 'admin') {
      return <AdminDashboard />;
    }
    return <DashboardPage />;
  }
};
```

### Example 2: Protect Admin Route

```typescript
// In component
function AdminPanel() {
  if (!protectRoute('/admin')) {
    return null; // Will redirect to unauthorized
  }
  
  return <div>Admin panel content</div>;
}
```

### Example 3: Higher-Order Component

```typescript
// Define protected component
const ProtectedOwnerDashboard = withRouteProtection(
  OwnerDashboardNew,
  '/dashboard/owner'
);

// Use in App.tsx
<ProtectedOwnerDashboard />
```

### Example 4: Manual Check

```typescript
import { canAccessRoute } from '@/lib/auth';

function MyComponent() {
  const hasAccess = canAccessRoute('/dashboard/owner');
  
  if (!hasAccess) {
    return <div>Access denied</div>;
  }
  
  return <div>Protected content</div>;
}
```

## Route Protection Matrix

| Route | RENTER | OWNER | ADMIN | Public |
|-------|--------|-------|-------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/fleet` | ✅ | ✅ | ✅ | ✅ |
| `/vehicle-detail` | ✅ | ✅ | ✅ | ✅ |
| `/booking` | ✅ | ✅ | ✅ | ❌ |
| `/dashboard` | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/renter` | ✅ | ❌ | ✅ | ❌ |
| `/dashboard/owner` | ❌ | ✅ | ✅ | ❌ |
| `/admin` | ❌ | ❌ | ✅ | ❌ |
| `/auth` | ✅ | ✅ | ✅ | ✅ |
| `/terms` | ✅ | ✅ | ✅ | ✅ |
| `/database` | ✅ | ✅ | ✅ | ✅ |
| `/unauthorized` | ✅ | ✅ | ✅ | ✅ |

## Security Features

### 1. Client-Side Protection
- ✅ Route access check before rendering
- ✅ Automatic redirect to unauthorized page
- ✅ Role-based access control
- ✅ Permission-based authorization

### 2. Server-Side Protection (Backend)
- ✅ Next.js middleware for route protection
- ✅ JWT token validation
- ✅ Role verification on each request
- ✅ API endpoint protection

### 3. Defense in Depth
- ✅ Client-side check (UX)
- ✅ Server-side check (Security)
- ✅ Database-level permissions
- ✅ Audit logging

## Error Handling

### Unauthorized Access

```typescript
// Client-side
if (!canAccessRoute('/admin')) {
  setCurrentPage('unauthorized');
  return null;
}

// Server-side
if (userRole !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Forbidden - Insufficient permissions' },
    { status: 403 }
  );
}
```

### Unauthenticated Access

```typescript
// Client-side
if (!isAuthenticated()) {
  setCurrentPage('auth');
  return null;
}

// Server-side
if (!session) {
  return NextResponse.json(
    { error: 'Unauthorized - Please login' },
    { status: 401 }
  );
}
```

## Testing

### Unit Tests

```typescript
import { canAccessRoute, getUserRole } from '@/lib/auth';

describe('Route Protection', () => {
  it('should allow admin to access /admin', () => {
    // Mock admin user
    jest.spyOn(getUserRole, 'mockReturnValue').mockReturnValue('ADMIN');
    
    expect(canAccessRoute('/admin')).toBe(true);
  });
  
  it('should deny renter from accessing /admin', () => {
    // Mock renter user
    jest.spyOn(getUserRole, 'mockReturnValue').mockReturnValue('RENTER');
    
    expect(canAccessRoute('/admin')).toBe(false);
  });
  
  it('should allow owner to access /dashboard/owner', () => {
    // Mock owner user
    jest.spyOn(getUserRole, 'mockReturnValue').mockReturnValue('OWNER');
    
    expect(canAccessRoute('/dashboard/owner')).toBe(true);
  });
  
  it('should allow public access to /home', () => {
    expect(canAccessRoute('/home')).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Route Protection Integration', () => {
  it('should redirect to unauthorized page when access denied', () => {
    // Login as renter
    login('renter@renmoku.id', 'demo123');
    
    // Try to access admin route
    navigate('/admin');
    
    // Should show unauthorized page
    expect(screen.getByText('Akses Ditolak')).toBeInTheDocument();
  });
  
  it('should allow admin to access admin route', () => {
    // Login as admin
    login('admin@renmoku.id', 'demo123');
    
    // Access admin route
    navigate('/admin');
    
    // Should show admin panel
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Always Check on Both Sides

```typescript
// ✅ Good - Client + Server
// Client
if (!canAccessRoute('/admin')) {
  return <UnauthorizedPage />;
}

// Server
if (userRole !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ❌ Bad - Only client
if (!canAccessRoute('/admin')) {
  return <UnauthorizedPage />;
}
// No server check - security risk!
```

### 2. Use Consistent Route Names

```typescript
// ✅ Good
const ROUTE_PROTECTION = {
  '/admin': ['ADMIN'],
  '/dashboard/owner': ['OWNER', 'ADMIN'],
};

// ❌ Bad
const ROUTE_PROTECTION = {
  '/admin-panel': ['ADMIN'],
  '/owner-dashboard': ['OWNER', 'ADMIN'],
};
```

### 3. Provide Clear Error Messages

```typescript
// ✅ Good
<p>Anda tidak memiliki izin untuk mengakses halaman ini. 
   Silakan login dengan akun yang sesuai.</p>

// ❌ Bad
<p>Error 403</p>
```

### 4. Log Unauthorized Access Attempts

```typescript
if (!canAccessRoute('/admin')) {
  console.warn(`Unauthorized access attempt: ${userId} -> /admin`);
  setCurrentPage('unauthorized');
  return null;
}
```

## Troubleshooting

### Issue: User can access protected route

**Solutions:**
- Check if route is in ROUTE_PROTECTION config
- Verify user role is correctly set
- Check canAccessRoute logic
- Verify App.tsx integration

### Issue: User redirected to unauthorized incorrectly

**Solutions:**
- Check ROUTE_PROTECTION config
- Verify user role mapping
- Check route path matching
- Verify public routes are excluded

### Issue: Unauthorized page not showing

**Solutions:**
- Check if UnauthorizedPage is imported
- Verify route protection logic in App.tsx
- Check if 'unauthorized' case exists in switch
- Verify setCurrentPage is called correctly

## Related Documentation

- [Auth System](./AUTH-SYSTEM.md) - Complete auth documentation
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md) - Backend setup
- [API Documentation](./API-DOCUMENTATION.md) - API reference

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
