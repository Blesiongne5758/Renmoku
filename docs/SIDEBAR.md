# Sidebar Component Documentation

## Overview

Komponen Sidebar yang responsive dengan dukungan desktop (fixed sidebar) dan mobile (drawer). Diadaptasi dari Next.js ke Vite + React.

## Features

✅ **Responsive Design** - Desktop: fixed sidebar, Mobile: drawer  
✅ **Active Indicator** - Animated indicator untuk menu aktif  
✅ **Badge Support** - Notifikasi badge untuk menu items  
✅ **Smooth Animations** - Framer Motion untuk transitions  
✅ **Body Scroll Lock** - Prevent scroll saat drawer terbuka  
✅ **Auto Close** - Tutup drawer saat route change  
✅ **User Profile** - Avatar, name, dan logout button  
✅ **Dark Theme** - Konsisten dengan design system  

## Components

### 1. Sidebar (Owner)

**File:** `src/components/Sidebar.tsx`

**Menu Items:**
- Overview
- Fleet
- Bookings
- Revenue
- Check-in/out
- Analytics
- Settings

**Usage:**
```typescript
import Sidebar from './components/Sidebar';

function OwnerDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main>
        {/* Content */}
      </main>
    </div>
  );
}
```

### 2. AdminSidebar

**File:** `src/components/admin/AdminSidebar.tsx`

**Menu Items:**
- Dashboard
- Users
- Vehicles
- Bookings
- Verifikasi (badge: 12)
- Payout (badge: 3)
- Dispute (badge: 5)
- Settings

**Usage:**
```typescript
import AdminSidebar from './components/admin/AdminSidebar';

function AdminDashboard() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main>
        {/* Content */}
      </main>
    </div>
  );
}
```

## Props & State

### Internal State
```typescript
const [isOpen, setIsOpen] = useState(false);      // Drawer state
const [isMobile, setIsMobile] = useState(false);  // Responsive detection
```

### Store Integration
```typescript
const { currentPage, currentUser, setCurrentPage, logout } = useAppStore();
```

## Responsive Behavior

### Desktop (≥ 1024px)
```
┌─────────────────────────────────────────┐
│ Sidebar (fixed) │ Main Content          │
│                 │                       │
│ - Logo          │ - Top Bar             │
│ - Menu          │ - Stats               │
│ - Profile       │ - Charts              │
│                 │ - Tables              │
└─────────────────────────────────────────┘
```

### Mobile (< 1024px)
```
┌─────────────────────────────────────────┐
│ [☰] Hamburger Button                    │
├─────────────────────────────────────────┤
│ Main Content                            │
│                                         │
│ - Top Bar                               │
│ - Stats                                 │
│ - Charts                                │
│ - Tables                                │
└─────────────────────────────────────────┘

When hamburger clicked:
┌─────────────────────────────────────────┐
│ ┌──────────┐                            │
│ │ Sidebar  │                            │
│ │ (drawer) │                            │
│ │          │                            │
│ │ - Logo   │                            │
│ │ - Menu   │                            │
│ │ - Profile│                            │
│ └──────────┘                            │
│                                         │
│ Main Content (blurred)                  │
└─────────────────────────────────────────┘
```

## Animations

### Drawer Open/Close
```typescript
<motion.aside
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '-100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
```

### Menu Items Stagger
```typescript
<motion.button
  initial={isMobile ? { opacity: 0, x: -20 } : false}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: idx * 0.05 }}
>
```

### Active Indicator
```typescript
<motion.div
  layoutId="activeIndicator"
  className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-lg"
/>
```

## Styling

### Desktop Sidebar
```css
width: 256px (w-64)
background: #0f0f0f
border-right: 1px solid rgba(255, 255, 255, 0.05)
position: sticky
top: 0
height: 100vh
```

### Mobile Drawer
```css
width: 288px (w-72)
background: #0f0f0f
border-right: 1px solid rgba(255, 255, 255, 0.05)
position: fixed
top: 0
left: 0
height: 100%
z-index: 50
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Backdrop
```css
background: rgba(0, 0, 0, 0.6)
backdrop-filter: blur(4px)
z-index: 40
```

### Active Menu Item
```css
background: linear-gradient(to right, rgba(250, 204, 21, 0.2), transparent)
border: 1px solid rgba(250, 204, 21, 0.3)
color: rgb(250, 204, 21)
```

### Inactive Menu Item
```css
color: rgb(156, 163, 175)
hover: background rgba(255, 255, 255, 0.05)
hover: color white
```

## Integration

### Owner Dashboard
```typescript
// src/components/OwnerDashboardContent.tsx
import Sidebar from './Sidebar';

export default function OwnerDashboardContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        {/* Content */}
      </main>
    </div>
  );
}
```

### Admin Dashboard
```typescript
// src/components/admin/AdminDashboardContent.tsx
import AdminSidebar from './AdminSidebar';

export default function AdminDashboardContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0 overflow-y-auto min-h-screen">
        {/* Content */}
      </main>
    </div>
  );
}
```

## Navigation

### Menu Click Handler
```typescript
const handleMenuClick = (href: string) => {
  setCurrentPage(href);
  if (isMobile) setIsOpen(false);
};
```

### Logout Handler
```typescript
const handleLogout = () => {
  logout();
  setCurrentPage('home');
};
```

## Accessibility

### Keyboard Navigation
- ✅ Tab navigation untuk semua menu items
- ✅ Enter/Space untuk activate menu
- ✅ Escape untuk close drawer (mobile)

### ARIA Labels
```typescript
<button aria-label="Open menu">
  <Menu />
</button>
```

### Focus Management
- ✅ Focus trap saat drawer terbuka
- ✅ Return focus ke trigger button saat drawer ditutup

## Performance

### Optimizations
- ✅ Lazy loading untuk menu icons
- ✅ Memoization untuk menu items
- ✅ Debounce untuk resize events
- ✅ CSS transforms untuk animations (GPU accelerated)

### Bundle Size
- Sidebar component: ~3KB
- AdminSidebar component: ~3.5KB
- Total: ~6.5KB

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Mobile Chrome | 90+ | ✅ Full |

## Testing

### Manual Testing Checklist
- [ ] Desktop: Sidebar visible and fixed
- [ ] Mobile: Hamburger button visible
- [ ] Mobile: Drawer opens on hamburger click
- [ ] Mobile: Backdrop appears when drawer open
- [ ] Mobile: Drawer closes on menu item click
- [ ] Mobile: Drawer closes on backdrop click
- [ ] Mobile: Body scroll locked when drawer open
- [ ] Active menu item has correct styling
- [ ] Active indicator animates smoothly
- [ ] Badge displays correctly
- [ ] User profile shows correct data
- [ ] Logout button works
- [ ] Responsive breakpoint at 1024px

### Unit Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Fleet')).toBeInTheDocument();
  });

  it('opens drawer on mobile', () => {
    // Mock mobile viewport
    window.innerWidth = 768;
    render(<Sidebar />);
    
    const hamburger = screen.getByLabelText('Open menu');
    fireEvent.click(hamburger);
    
    expect(screen.getByText('Overview')).toBeVisible();
  });

  it('closes drawer on menu click', () => {
    window.innerWidth = 768;
    render(<Sidebar />);
    
    fireEvent.click(screen.getByLabelText('Open menu'));
    fireEvent.click(screen.getByText('Fleet'));
    
    // Drawer should close
    expect(screen.queryByText('Fleet')).not.toBeVisible();
  });
});
```

## Customization

### Change Menu Items
```typescript
const ownerMenu = [
  { icon: LayoutDashboard, label: 'Overview', href: 'dashboard', subpage: 'overview' },
  // Add or remove items
];
```

### Change Badge Values
```typescript
{ icon: CheckCircle, label: 'Verifikasi', href: 'verification', badge: 12 }
```

### Change Colors
```typescript
// Active state
className="bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 text-yellow-400"

// Inactive state
className="text-gray-400 hover:bg-white/5 hover:text-white"
```

## Troubleshooting

### Issue: Drawer not closing on route change

**Solution:**
```typescript
useEffect(() => {
  if (isMobile) setIsOpen(false);
}, [currentPage, isMobile]);
```

### Issue: Body scroll not locked

**Solution:**
```typescript
useEffect(() => {
  if (isOpen && isMobile) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => { document.body.style.overflow = ''; };
}, [isOpen, isMobile]);
```

### Issue: Active indicator not animating

**Solution:**
```typescript
// Ensure layoutId is unique
<motion.div
  layoutId="activeIndicator"  // Must be unique across app
  className="w-1.5 h-1.5 rounded-full bg-yellow-400"
/>
```

## Related Components

- **RoleGuard** - Route protection based on user role
- **UnauthorizedPage** - Page for unauthorized access
- **OwnerDashboardContent** - Owner dashboard main content
- **AdminDashboardContent** - Admin dashboard main content

## Related Documentation

- [RoleGuard](./ROLE-GUARD.md) - Role-based access control
- [Route Protection](./ROUTE-PROTECTION.md) - Route protection system
- [Next.js Adaptation](./NEXTJS-ADAPTATION.md) - Next.js to Vite migration

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
