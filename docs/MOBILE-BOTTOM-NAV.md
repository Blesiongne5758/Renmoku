# Mobile Bottom Navigation Component

## Overview

Komponen navigasi bawah (bottom navigation) khusus untuk tampilan mobile. Hanya muncul di layar kecil (< 1024px) dan menyediakan akses cepat ke halaman-halaman utama.

## Features

✅ **Mobile Only** - Hanya muncul di layar < 1024px (lg:hidden)  
✅ **4 Menu Items** - Home, Fleet, Bookings, Profile  
✅ **Active Indicator** - Animated layoutId untuk smooth transitions  
✅ **Backdrop Blur** - Efek glass morphism dengan blur  
✅ **iOS Safe Area** - Support untuk notch/home indicator  
✅ **State-Based Routing** - Menggunakan currentPage dari store  
✅ **Smooth Animations** - Spring animation untuk active indicator  

## Component Structure

```
MobileBottomNav
├── Container (fixed bottom)
│   ├── Backdrop (blur effect)
│   ├── Grid (4 columns)
│   │   ├── Home Button
│   │   │   ├── Icon (LayoutDashboard)
│   │   │   ├── Label
│   │   │   └── Active Indicator (conditional)
│   │   ├── Fleet Button
│   │   │   ├── Icon (Car)
│   │   │   ├── Label
│   │   │   └── Active Indicator (conditional)
│   │   ├── Bookings Button
│   │   │   ├── Icon (Calendar)
│   │   │   ├── Label
│   │   │   └── Active Indicator (conditional)
│   │   └── Profile Button
│   │       ├── Icon (User)
│   │       ├── Label
│   │       └── Active Indicator (conditional)
│   └── Safe Area (iOS)
```

## Usage

### In Owner Dashboard

```typescript
import MobileBottomNav from './MobileBottomNav';

export default function OwnerDashboardContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto pb-20 lg:pb-0">
        {/* Content */}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
```

### In Admin Dashboard

```typescript
import MobileBottomNav from '../MobileBottomNav';

export default function AdminDashboardContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0 overflow-y-auto min-h-screen pb-20 lg:pb-0">
        {/* Content */}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
```

## Menu Items

```typescript
const menuItems = [
  { icon: LayoutDashboard, label: 'Home', href: 'dashboard' },
  { icon: Car, label: 'Fleet', href: 'fleet' },
  { icon: Calendar, label: 'Bookings', href: 'bookings' },
  { icon: User, label: 'Profile', href: 'settings' },
];
```

| Icon | Label | Route | Description |
|------|-------|-------|-------------|
| LayoutDashboard | Home | dashboard | Halaman utama dashboard |
| Car | Fleet | fleet | Daftar kendaraan |
| Calendar | Bookings | bookings | Daftar booking |
| User | Profile | settings | Pengaturan profil |

## Styling

### Container
```css
position: fixed
bottom: 0
left: 0
right: 0
z-index: 40
display: none (lg:hidden)
```

### Background
```css
background: rgba(15, 15, 15, 0.95)
backdrop-filter: blur(24px)
border-top: 1px solid rgba(255, 255, 255, 0.1)
```

### Grid
```css
display: grid
grid-template-columns: repeat(4, minmax(0, 1fr))
gap: 0.25rem
padding: 0.5rem
```

### Button
```css
position: relative
display: flex
flex-direction: column
align-items: center
gap: 0.25rem
padding: 0.5rem
border-radius: 0.75rem
transition: all
```

### Active State
```css
/* Icon */
color: rgb(250, 204, 21) /* yellow-400 */

/* Label */
color: rgb(250, 204, 21)
font-weight: 600

/* Indicator */
background: linear-gradient(to bottom right, rgba(250, 204, 21, 0.2), transparent)
border: 1px solid rgba(250, 204, 21, 0.3)
```

### Inactive State
```css
/* Icon */
color: rgb(107, 114, 128) /* gray-500 */

/* Label */
color: rgb(107, 114, 128)
```

## Animations

### Active Indicator
```typescript
<motion.div
  layoutId="bottomNavIndicator"
  className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl border border-yellow-400/30"
  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
/>
```

**Animation Properties:**
- Type: spring
- Damping: 20 (smooth)
- Stiffness: 300 (responsive)
- LayoutId: shared across all buttons for smooth transition

## Responsive Behavior

### Desktop (≥ 1024px)
```
❌ MobileBottomNav tidak muncul
✅ Sidebar visible
✅ Main content dengan margin left
```

### Mobile (< 1024px)
```
✅ MobileBottomNav visible (fixed bottom)
✅ Sidebar hidden (drawer)
✅ Main content dengan padding bottom 80px
```

## iOS Safe Area

```html
<div className="h-[env(safe-area-inset-bottom)]" />
```

**Purpose:**
- Menghindari overlap dengan home indicator
- Support untuk iPhone notch
- Automatic adjustment berdasarkan device

## Integration with Store

```typescript
const { currentPage, setCurrentPage } = useAppStore();

const handleNavigation = (href: string) => {
  setCurrentPage(href);
};
```

**Flow:**
1. User clicks menu item
2. `handleNavigation` called with route
3. `setCurrentPage` updates store
4. App.tsx re-renders with new page
5. Active indicator animates to new position

## Padding Strategy

### Main Content
```css
/* Mobile */
padding-bottom: 5rem /* 80px */

/* Desktop */
padding-bottom: 0
```

**Reason:**
- Mencegah konten tertutup bottom nav
- Smooth transition di breakpoint
- Konsisten dengan bottom nav height

## Accessibility

### Keyboard Navigation
- ✅ Tab navigation untuk semua menu items
- ✅ Enter/Space untuk activate menu
- ✅ Focus indicators visible

### Screen Reader
```html
<button aria-label="Navigate to Home">
  <LayoutDashboard />
  <span>Home</span>
</button>
```

### Touch Targets
- ✅ Minimum 44x44px (Apple HIG)
- ✅ Adequate spacing between items
- ✅ Clear visual feedback

## Performance

### Optimizations
- ✅ CSS transforms untuk animations (GPU accelerated)
- ✅ LayoutId untuk shared layout animations
- ✅ Conditional rendering untuk active indicator
- ✅ Minimal re-renders dengan React.memo (future)

### Bundle Size
- Component: ~2KB
- Icons: ~1KB (shared)
- Total: ~3KB

## Customization

### Change Menu Items
```typescript
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: 'dashboard' },
  { icon: Car, label: 'Vehicles', href: 'vehicles' },
  { icon: Calendar, label: 'Bookings', href: 'bookings' },
  { icon: User, label: 'Profile', href: 'profile' },
];
```

### Change Colors
```typescript
// Active state
className="text-yellow-400"

// Inactive state
className="text-gray-500"

// Indicator
className="bg-gradient-to-br from-yellow-400/20 to-transparent border border-yellow-400/30"
```

### Change Animation
```typescript
<motion.div
  layoutId="bottomNavIndicator"
  transition={{ 
    type: 'spring', 
    damping: 20,    // Increase for less bouncy
    stiffness: 300  // Increase for faster
  }}
/>
```

## Testing

### Manual Testing Checklist
- [ ] Bottom nav visible di mobile
- [ ] Bottom nav hidden di desktop
- [ ] Active indicator animates smoothly
- [ ] Navigation works untuk semua items
- [ ] Safe area works di iOS devices
- [ ] Content tidak tertutup bottom nav
- [ ] Touch targets cukup besar
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

### Unit Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MobileBottomNav from './MobileBottomNav';

describe('MobileBottomNav', () => {
  it('renders all menu items', () => {
    render(<MobileBottomNav />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Fleet')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('navigates on click', () => {
    const setCurrentPage = jest.fn();
    useAppStore.setState({ setCurrentPage });
    
    render(<MobileBottomNav />);
    
    fireEvent.click(screen.getByText('Fleet'));
    
    expect(setCurrentPage).toHaveBeenCalledWith('fleet');
  });

  it('shows active indicator for current page', () => {
    useAppStore.setState({ currentPage: 'fleet' });
    
    render(<MobileBottomNav />);
    
    const fleetButton = screen.getByText('Fleet').closest('button');
    expect(fleetButton).toHaveClass('text-yellow-400');
  });
});
```

## Troubleshooting

### Issue: Bottom nav tidak muncul di mobile

**Solutions:**
- Check `lg:hidden` class ada
- Verify viewport width < 1024px
- Check z-index tidak conflict

### Issue: Active indicator tidak animates

**Solutions:**
- Verify layoutId sama di semua buttons
- Check Framer Motion installed
- Verify motion.div digunakan

### Issue: Content tertutup bottom nav

**Solutions:**
- Add `pb-20 lg:pb-0` ke main content
- Verify padding bottom cukup (80px)
- Check bottom nav height

### Issue: Safe area tidak works di iOS

**Solutions:**
- Verify meta viewport tag ada
- Check `env(safe-area-inset-bottom)` supported
- Test di actual iOS device

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

- **Sidebar** - Desktop navigation
- **AdminSidebar** - Admin desktop navigation
- **RoleGuard** - Route protection

## Related Documentation

- [Sidebar](./SIDEBAR.md) - Desktop navigation
- [Route Protection](./ROUTE-PROTECTION.md) - Route protection system
- [Next.js Adaptation](./NEXTJS-ADAPTATION.md) - Migration guide

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
