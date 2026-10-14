# RoleGuard Component Documentation

## Overview

`RoleGuard` adalah Higher-Order Component (HOC) untuk proteksi route berdasarkan role user. Komponen ini memastikan hanya user dengan role tertentu yang dapat mengakses halaman tertentu.

## Features

✅ **Role-Based Access Control** - Proteksi berdasarkan role user  
✅ **Loading State** - Menampilkan loader saat checking authentication  
✅ **Unauthenticated Redirect** - Redirect ke login jika belum login  
✅ **Unauthorized Fallback** - Custom fallback untuk unauthorized access  
✅ **TypeScript Support** - Full type safety  
✅ **Dark Theme** - Konsisten dengan design system  

## Installation

Komponen ini sudah tersedia di `src/components/RoleGuard.tsx`.

## Usage

### Basic Usage

```typescript
import RoleGuard from './components/RoleGuard';

function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin-only content */}
      </div>
    </RoleGuard>
  );
}
```

### Multiple Roles

```typescript
function OwnerDashboard() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <div>
        <h1>Owner Dashboard</h1>
        {/* Owner and Admin can access */}
      </div>
    </RoleGuard>
  );
}
```

### Custom Fallback

```typescript
function ProtectedPage() {
  return (
    <RoleGuard 
      allowedRoles={['renter']}
      fallback={
        <div className="custom-unauthorized">
          <h2>Anda bukan penyewa</h2>
          <p>Silakan daftar sebagai penyewa untuk mengakses halaman ini.</p>
        </div>
      }
    >
      <div>
        <h1>Renter Dashboard</h1>
        {/* Renter-only content */}
      </div>
    </RoleGuard>
  );
}
```

### With Authentication Check

```typescript
function BookingPage() {
  return (
    <RoleGuard allowedRoles={['renter', 'owner', 'admin']}>
      <div>
        <h1>Booking Page</h1>
        {/* All authenticated users can access */}
      </div>
    </RoleGuard>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `allowedRoles` | `string[]` | Yes | Array of roles that can access this component |
| `children` | `React.ReactNode` | Yes | Content to render if user has access |
| `fallback` | `React.ReactNode` | No | Custom component to render if user doesn't have access |

### Allowed Roles

Available roles:
- `'renter'` - Penyewa (individual/corporate)
- `'owner'` - Pemilik rental
- `'admin'` - Administrator platform

## Behavior

### 1. Loading State
Saat component mount dan status authentication belum diketahui:
```typescript
<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
  <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
</div>
```

### 2. Unauthenticated State
Jika user belum login:
- Redirect ke halaman login (`/auth`)
- Return `null`

### 3. Unauthorized State
Jika user login tapi tidak punya role yang diizinkan:
- Redirect ke halaman unauthorized (`/unauthorized`)
- Atau render custom `fallback` jika disediakan

### 4. Authorized State
Jika user login dan punya role yang diizinkan:
- Render `children`

## Integration with App

### In App.tsx

```typescript
import RoleGuard from './components/RoleGuard';

function App() {
  const { currentPage } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return (
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        );
      
      case 'owner-dashboard':
        return (
          <RoleGuard allowedRoles={['owner', 'admin']}>
            <OwnerDashboard />
          </RoleGuard>
        );
      
      case 'renter-dashboard':
        return (
          <RoleGuard allowedRoles={['renter']}>
            <RenterDashboard />
          </RoleGuard>
        );
      
      default:
        return <LandingPage />;
    }
  };

  return <>{renderPage()}</>;
}
```

## Examples

### Example 1: Admin Only Page

```typescript
import RoleGuard from './components/RoleGuard';

function AdminPanel() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="admin-panel">
        <h1>Admin Panel</h1>
        <p>Hanya admin yang bisa melihat ini</p>
        
        <div className="admin-actions">
          <button>Manage Users</button>
          <button>View Analytics</button>
          <button>System Settings</button>
        </div>
      </div>
    </RoleGuard>
  );
}
```

### Example 2: Owner Dashboard

```typescript
function OwnerDashboard() {
  return (
    <RoleGuard 
      allowedRoles={['owner', 'admin']}
      fallback={
        <div className="not-owner">
          <h2>Akses Ditolak</h2>
          <p>Halaman ini hanya untuk pemilik rental.</p>
          <button onClick={() => window.history.back()}>
            Kembali
          </button>
        </div>
      }
    >
      <div className="owner-dashboard">
        <h1>Dashboard Pemilik</h1>
        
        <div className="stats">
          <StatCard title="Total Kendaraan" value="15" />
          <StatCard title="Booking Aktif" value="8" />
          <StatCard title="Pendapatan" value="Rp 45.2M" />
        </div>
        
        <div className="actions">
          <button>Tambah Kendaraan</button>
          <button>Lihat Booking</button>
        </div>
      </div>
    </RoleGuard>
  );
}
```

### Example 3: Renter Booking Page

```typescript
function BookingPage() {
  return (
    <RoleGuard allowedRoles={['renter']}>
      <div className="booking-page">
        <h1>Booking Kendaraan</h1>
        
        <BookingForm />
        <VehicleList />
        <PaymentMethod />
      </div>
    </RoleGuard>
  );
}
```

### Example 4: Shared Page (All Roles)

```typescript
function ProfilePage() {
  return (
    <RoleGuard allowedRoles={['renter', 'owner', 'admin']}>
      <div className="profile-page">
        <h1>Profil Saya</h1>
        <ProfileForm />
      </div>
    </RoleGuard>
  );
}
```

## Styling

Component ini menggunakan Tailwind CSS dan konsisten dengan design system:

### Loading State
```css
bg-[#0a0a0a]          /* Dark background */
text-yellow-400       /* Gold accent */
animate-spin          /* Rotation animation */
```

### Unauthorized Fallback
```css
bg-[#0a0a0a]          /* Dark background */
text-white            /* White text */
text-red-400          /* Red accent for error */
font-serif            /* Serif font for heading */
```

## Error Handling

### Common Errors

**Error: "Cannot read property 'role' of undefined"**
- Solution: Pastikan user sudah login sebelum menggunakan RoleGuard
- Check: `isAuthenticated` state

**Error: "allowedRoles is not defined"**
- Solution: Pastikan prop `allowedRoles` di-pass dengan benar
- Check: Array of strings

**Error: Component tidak render**
- Solution: Check console untuk error
- Check: Role user sesuai dengan `allowedRoles`

## Testing

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import RoleGuard from './RoleGuard';
import { useAppStore } from '../stores/useAppStore';

jest.mock('../stores/useAppStore');

describe('RoleGuard', () => {
  it('renders children when user has allowed role', () => {
    useAppStore.mockReturnValue({
      isAuthenticated: true,
      currentUser: { role: 'admin' },
      setCurrentPage: jest.fn(),
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when user has wrong role', () => {
    const setCurrentPage = jest.fn();
    
    useAppStore.mockReturnValue({
      isAuthenticated: true,
      currentUser: { role: 'renter' },
      setCurrentPage,
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(setCurrentPage).toHaveBeenCalledWith('unauthorized');
  });

  it('redirects to login when user is not authenticated', () => {
    const setCurrentPage = jest.fn();
    
    useAppStore.mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      setCurrentPage,
    });

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(setCurrentPage).toHaveBeenCalledWith('auth');
  });
});
```

## Performance

### Optimization Tips

1. **Memoize Children**
```typescript
const MemoizedContent = React.memo(({ children }) => <>{children}</>);

<RoleGuard allowedRoles={['admin']}>
  <MemoizedContent>
    <ExpensiveComponent />
  </MemoizedContent>
</RoleGuard>
```

2. **Lazy Load Fallback**
```typescript
const UnauthorizedFallback = React.lazy(() => import('./UnauthorizedFallback'));

<RoleGuard 
  allowedRoles={['admin']}
  fallback={<Suspense fallback={<Loader />}><UnauthorizedFallback /></Suspense>}
>
  <AdminContent />
</RoleGuard>
```

3. **Avoid Re-renders**
```typescript
// ❌ Bad - Creates new array on every render
<RoleGuard allowedRoles={['admin', 'owner']}>

// ✅ Good - Memoized array
const ALLOWED_ROLES = ['admin', 'owner'];
<RoleGuard allowedRoles={ALLOWED_ROLES}>
```

## Security Considerations

### Client-Side Only

⚠️ **Important**: RoleGuard hanya proteksi di client-side. Untuk keamanan penuh:

1. **Server-Side Validation**
   - Validasi role di backend API
   - Jangan hanya rely pada client-side check

2. **API Protection**
   - Protect semua API endpoints dengan middleware
   - Check role di setiap request

3. **Data Filtering**
   - Filter data berdasarkan role di backend
   - Jangan kirim data sensitif ke client

### Example: Secure API Call

```typescript
// ❌ Bad - No server-side validation
async function getAdminData() {
  const response = await fetch('/api/admin/data');
  return response.json();
}

// ✅ Good - Server validates role
async function getAdminData() {
  const response = await fetch('/api/admin/data', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (response.status === 403) {
    throw new Error('Unauthorized');
  }
  
  return response.json();
}
```

## Comparison with Next.js

| Feature | Next.js (useSession) | Vite + React (useAppStore) |
|---------|---------------------|---------------------------|
| Authentication | `useSession()` | `useAppStore()` |
| Router | `useRouter()` | `setCurrentPage()` |
| Loading | `status === 'loading'` | `!isAuthenticated && !currentUser` |
| Redirect | `router.push()` | `setCurrentPage()` |
| Session | `session.user.role` | `currentUser.role` |

## Migration from Next.js

Jika migrasi dari Next.js:

```typescript
// ❌ Next.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { data: session, status } = useSession();
const router = useRouter();

// ✅ Vite + React
import { useAppStore } from '../stores/useAppStore';

const { currentUser, isAuthenticated, setCurrentPage } = useAppStore();
```

## Related Components

- **UnauthorizedPage** - Halaman untuk unauthorized access
- **AuthPage** - Halaman login/register
- **LoadingScreen** - Loading indicator

## Related Documentation

- [Auth System](./AUTH-SYSTEM.md) - Complete auth documentation
- [Route Protection](./ROUTE-PROTECTION.md) - Route protection system
- [NextAuth System](./NEXTAUTH-SYSTEM.md) - NextAuth equivalent

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
