# Next.js App Router Pattern Adaptation

## Overview

Dokumentasi ini menjelaskan bagaimana pola Next.js App Router diadaptasi ke stack Vite + React untuk aplikasi Renmoku.

## Original Next.js Structure

```
src/app/
├── dashboard/
│   └── owner/
│       └── page.tsx          # Owner Dashboard Page
├── admin/
│   └── page.tsx              # Admin Dashboard Page
└── components/
    └── auth/
        └── RoleGuard.tsx     # Role-based access control
```

### Next.js Implementation

**`src/app/dashboard/owner/page.tsx`**
```typescript
import RoleGuard from '@/components/auth/RoleGuard';
import OwnerDashboardContent from './OwnerDashboardContent';

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}
```

**`src/app/admin/page.tsx`**
```typescript
import RoleGuard from '@/components/auth/RoleGuard';
import AdminDashboardContent from './AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}
```

## Adapted Vite + React Structure

```
src/
├── pages/
│   ├── OwnerDashboardPage.tsx      # Owner Dashboard Page
│   └── AdminDashboardPage.tsx      # Admin Dashboard Page
├── components/
│   ├── RoleGuard.tsx               # Role-based access control
│   ├── OwnerDashboardContent.tsx   # Owner Dashboard Content
│   └── admin/
│       └── AdminDashboardContent.tsx # Admin Dashboard Content
└── App.tsx                         # Main router
```

### Vite + React Implementation

**`src/pages/OwnerDashboardPage.tsx`**
```typescript
import OwnerDashboardContent from '../components/OwnerDashboardContent';
import RoleGuard from '../components/RoleGuard';

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}
```

**`src/pages/AdminDashboardPage.tsx`**
```typescript
import AdminDashboardContent from '../components/admin/AdminDashboardContent';
import RoleGuard from '../components/RoleGuard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}
```

**`src/App.tsx`**
```typescript
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const { currentPage, currentUser } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        // Route to appropriate dashboard based on user role
        // Each dashboard page has its own RoleGuard
        if (currentUser?.role === 'admin') {
          return <AdminDashboardPage />;
        }
        if (currentUser?.role === 'owner') {
          return <OwnerDashboardPage />;
        }
        return <DashboardPage />;
      // ... other cases
    }
  };

  return (
    <SocketProvider>
      {/* ... */}
      {renderPage()}
      {/* ... */}
    </SocketProvider>
  );
}
```

## Key Differences

### 1. File-Based Routing vs State-Based Routing

**Next.js:**
- File-based routing (`src/app/dashboard/owner/page.tsx`)
- Automatic route matching
- Server-side rendering

**Vite + React:**
- State-based routing (`currentPage` in Zustand store)
- Manual route matching in `App.tsx`
- Client-side rendering

### 2. Component Organization

**Next.js:**
```
src/app/dashboard/owner/
├── page.tsx              # Page component with RoleGuard
└── OwnerDashboardContent.tsx  # Content component
```

**Vite + React:**
```
src/
├── pages/
│   └── OwnerDashboardPage.tsx  # Page component with RoleGuard
└── components/
    └── OwnerDashboardContent.tsx  # Content component
```

### 3. Role Naming Convention

**Next.js (Backend Roles):**
```typescript
allowedRoles={['OWNER', 'ADMIN']}  // Uppercase
```

**Vite + React (Frontend Roles):**
```typescript
allowedRoles={['owner', 'admin']}  // Lowercase
```

### 4. Import Paths

**Next.js:**
```typescript
import RoleGuard from '@/components/auth/RoleGuard';
```

**Vite + React:**
```typescript
import RoleGuard from '../components/RoleGuard';
```

## Architecture Pattern

### Separation of Concerns

```
┌─────────────────────────────────────┐
│         Page Component              │
│  (OwnerDashboardPage.tsx)           │
│                                     │
│  - RoleGuard wrapper                │
│  - Route-level protection           │
│  - Page-level logic                 │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│       Content Component             │
│  (OwnerDashboardContent.tsx)        │
│                                     │
│  - UI rendering                     │
│  - Data fetching                    │
│  - User interactions                │
│  - Component logic                  │
└─────────────────────────────────────┘
```

### Benefits of This Pattern

1. **Clear Separation**
   - Page component handles routing and protection
   - Content component handles UI and logic

2. **Reusability**
   - Content component can be used in different contexts
   - Easy to test content independently

3. **Maintainability**
   - Clear file organization
   - Easy to understand component responsibilities

4. **Type Safety**
   - RoleGuard ensures only authorized users access content
   - TypeScript provides compile-time checks

## Migration Guide

### From Next.js to Vite + React

1. **Create Page Component**
   ```typescript
   // Next.js: src/app/dashboard/owner/page.tsx
   // Vite: src/pages/OwnerDashboardPage.tsx
   
   import RoleGuard from '../components/RoleGuard';
   import OwnerDashboardContent from '../components/OwnerDashboardContent';
   
   export default function OwnerDashboardPage() {
     return (
       <RoleGuard allowedRoles={['owner', 'admin']}>
         <OwnerDashboardContent />
       </RoleGuard>
     );
   }
   ```

2. **Create Content Component**
   ```typescript
   // Next.js: src/app/dashboard/owner/OwnerDashboardContent.tsx
   // Vite: src/components/OwnerDashboardContent.tsx
   
   export default function OwnerDashboardContent() {
     // ... component logic
   }
   ```

3. **Update Router**
   ```typescript
   // Next.js: Automatic file-based routing
   // Vite: Manual routing in App.tsx
   
   case 'dashboard':
     if (currentUser?.role === 'owner') {
       return <OwnerDashboardPage />;
     }
   ```

4. **Adjust Role Names**
   ```typescript
   // Next.js: allowedRoles={['OWNER', 'ADMIN']}
   // Vite: allowedRoles={['owner', 'admin']}
   ```

## Best Practices

### 1. Consistent Naming

```typescript
// ✅ Good
OwnerDashboardPage.tsx
OwnerDashboardContent.tsx

// ❌ Bad
owner-dashboard-page.tsx
OwnerDashboard.tsx
```

### 2. Clear Separation

```typescript
// ✅ Good - Page component only handles protection
export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}

// ❌ Bad - Mixing protection and content
export default function OwnerDashboardPage() {
  const [data, setData] = useState([]);
  // ... lots of logic
  
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <div>{/* content */}</div>
    </RoleGuard>
  );
}
```

### 3. Type Safety

```typescript
// ✅ Good - Explicit role types
interface RoleGuardProps {
  allowedRoles: Array<'owner' | 'admin' | 'renter'>;
  children: React.ReactNode;
}

// ❌ Bad - Generic string array
interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}
```

## Testing

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import OwnerDashboardPage from './OwnerDashboardPage';
import { useAppStore } from '../stores/useAppStore';

jest.mock('../stores/useAppStore');
jest.mock('../components/RoleGuard', () => {
  return ({ children, allowedRoles }) => {
    const { currentUser } = useAppStore();
    if (allowedRoles.includes(currentUser?.role)) {
      return <div>{children}</div>;
    }
    return <div>Unauthorized</div>;
  };
});

describe('OwnerDashboardPage', () => {
  it('renders dashboard for owner', () => {
    useAppStore.mockReturnValue({
      currentUser: { role: 'owner' },
    });

    render(<OwnerDashboardPage />);
    expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
  });

  it('renders dashboard for admin', () => {
    useAppStore.mockReturnValue({
      currentUser: { role: 'admin' },
    });

    render(<OwnerDashboardPage />);
    expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
  });

  it('shows unauthorized for renter', () => {
    useAppStore.mockReturnValue({
      currentUser: { role: 'renter' },
    });

    render(<OwnerDashboardPage />);
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });
});
```

## Related Documentation

- [RoleGuard Component](./ROLE-GUARD.md)
- [Auth System](./AUTH-SYSTEM.md)
- [Route Protection](./ROUTE-PROTECTION.md)
- [NextAuth System](./NEXTAUTH-SYSTEM.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
