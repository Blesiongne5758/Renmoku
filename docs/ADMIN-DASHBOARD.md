# Admin Dashboard Component Documentation

## Overview

The Admin Dashboard is a comprehensive control panel for platform administrators to monitor and manage the entire Renmoku rental platform. It provides real-time insights into platform performance, user management, and operational metrics.

## Features

### 1. **Platform Overview Stats**
- **Total Users**: 2,847 users (+234 growth)
- **Total Armada**: 458 vehicles (+45 growth)
- **GMV Bulan Ini**: Rp 1.2B (+18% growth)
- **Komisi Platform**: Rp 150M (12.5% commission rate)

### 2. **Platform Growth Chart**
- Interactive area chart showing 6-month trends
- Three metrics tracked: Revenue, Users, Bookings
- Color-coded lines: Gold (Revenue), Purple (Users), Blue (Bookings)
- Responsive design with tooltips

### 3. **Top Performing Owners**
- Ranked list of top 3 owners by revenue
- Visual rank badges (Gold, Silver, Bronze)
- Shows revenue, vehicle count, and rating
- Interactive hover effects

### 4. **Action Items Panel**
- Real-time alerts for pending actions
- Color-coded severity levels:
  - 🔴 Red: KYC Pending (12 items)
  - 🟡 Yellow: Active Disputes (5 items)
  - 🟠 Orange: Pending Payouts (3 items)
  - 🔵 Blue: Vehicle Reviews (8 items)
- Clickable items with detailed descriptions

### 5. **KYC Verification Queue**
- Pending identity verification requests
- Individual and Corporate user types
- Document upload status
- Quick approve/reject actions

### 6. **Active Disputes**
- Real-time dispute tracking
- Shows vehicle, renter, issue, and claim amount
- Quick access to dispute details
- Status indicators

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (256px)  │  Main Content Area                      │
│                   │                                          │
│  📊 Dashboard     │  ┌──────────────────────────────────┐  │
│  👥 Users         │  │  Stats Cards (4 columns)         │  │
│  🚗 Vehicles      │  └──────────────────────────────────┘  │
│  📋 Bookings      │                                          │
│  ✅ Verifikasi    │  ┌────────────────┐ ┌──────────────┐  │
│  💰 Payout        │  │ Growth Chart   │ │ Action Items │  │
│  ⚠️ Dispute       │  │ (2/3 width)    │ │ (1/3 width)  │  │
│  ⚙️ Settings      │  └────────────────┘ └──────────────┘  │
│                   │                                          │
│  [Admin Profile]  │  ┌────────────────┐ ┌──────────────┐  │
│                   │  │ Top Owners     │ │ KYC Queue    │  │
│                   │  └────────────────┘ └──────────────┘  │
│                   │                                          │
│                   │  ┌──────────────────────────────────┐  │
│                   │  │ Active Disputes                  │  │
│                   │  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AdminDashboard
├── Sidebar
│   ├── Logo & Branding
│   ├── Navigation Menu (8 items)
│   └── Admin Profile Card
│
├── TopBar
│   ├── Page Title
│   ├── Notification Bell (28 alerts)
│   └── User Menu Dropdown
│
└── Main Content
    ├── Stats Grid (4 cards)
    │   ├── Total Users
    │   ├── Total Armada
    │   ├── GMV Bulan Ini
    │   └── Komisi Platform
    │
    ├── Two Column Layout
    │   ├── Left Column (2/3)
    │   │   ├── Platform Growth Chart
    │   │   └── Top Performing Owners
    │   │
    │   └── Right Column (1/3)
    │       ├── Action Items Panel
    │       ├── KYC Verification Queue
    │       └── Active Disputes
    │
    └── Footer (optional)
```

## Data Structure

### Stats Card Data
```typescript
interface AdminStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'gold' | 'purple' | 'blue' | 'green';
}
```

### Platform Growth Data
```typescript
interface GrowthDataPoint {
  month: string;
  users: number;
  bookings: number;
  revenue: number;
}
```

### Top Owners Data
```typescript
interface TopOwner {
  rank: number;
  name: string;
  revenue: number;
  vehicles: number;
  rating: number;
}
```

### Action Items Data
```typescript
interface ActionItem {
  id: number;
  type: 'kyc' | 'dispute' | 'payout' | 'review';
  severity: 'red' | 'yellow' | 'orange' | 'blue';
  title: string;
  count: number;
  description: string;
}
```

### KYC Verification Data
```typescript
interface KYCVerification {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  document: string;
  submittedAt: string;
}
```

### Dispute Data
```typescript
interface Dispute {
  id: string;
  vehicle: string;
  renter: string;
  issue: string;
  amount: number;
  status: 'active' | 'resolved' | 'escalated';
}
```

## Styling

### Color Palette
- **Background**: `#0a0a0a` (main), `#141414` (cards)
- **Borders**: `rgba(255, 255, 255, 0.05)`
- **Gold Accent**: `#D4AF37` (primary actions)
- **Purple Accent**: `#8B5CF6` (secondary actions)
- **Status Colors**:
  - Red: `#EF4444` (critical)
  - Yellow: `#F59E0B` (warning)
  - Orange: `#FB923C` (attention)
  - Blue: `#3B82F6` (info)
  - Green: `#10B981` (success)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Numbers**: Monospace for alignment

### Animations
- Staggered fade-in for list items
- Hover lift effects on cards
- Smooth transitions on interactions
- Pulse animations for status indicators

## Interactive Features

### 1. **Sidebar Navigation**
- Active state with gold gradient background
- Badge counters for pending items
- Smooth hover effects
- Collapsible on mobile

### 2. **Notification System**
- Bell icon with badge counter
- Dropdown menu (future enhancement)
- Real-time updates (future enhancement)

### 3. **User Menu**
- Profile dropdown
- Logout functionality
- Role indicator

### 4. **Chart Interactions**
- Hover tooltips with detailed data
- Legend with color indicators
- Responsive resizing

### 5. **Action Item Cards**
- Hover scale effect
- Click to navigate to detail page
- Color-coded severity indicators

### 6. **KYC Verification**
- Quick approve/reject buttons
- Document preview (future enhancement)
- Status tracking

### 7. **Dispute Management**
- View dispute details
- Status indicators
- Quick actions

## Responsive Design

### Desktop (> 1024px)
- Full sidebar visible
- 4-column stats grid
- 2/3 + 1/3 column layout
- All features visible

### Tablet (768px - 1024px)
- Collapsible sidebar
- 2-column stats grid
- Stacked layout for charts
- Optimized spacing

### Mobile (< 768px)
- Hidden sidebar (hamburger menu)
- 1-column stats grid
- Full-width stacked layout
- Touch-optimized interactions

## Performance Optimizations

### 1. **Lazy Loading**
- Chart components loaded on demand
- Images lazy-loaded
- Code splitting for admin routes

### 2. **Memoization**
- React.memo for list items
- useMemo for computed values
- useCallback for event handlers

### 3. **Virtualization**
- Long lists use virtual scrolling (future)
- Pagination for large datasets

### 4. **Caching**
- API response caching
- Chart data caching
- User session caching

## Security Considerations

### 1. **Role-Based Access**
- Admin-only routes protected
- JWT token validation
- Session management

### 2. **Data Validation**
- Input sanitization
- XSS prevention
- CSRF protection

### 3. **Audit Logging**
- All admin actions logged
- Timestamp tracking
- IP address recording

## API Integration

### Endpoints (Future Implementation)
```typescript
// Stats
GET /api/admin/stats/overview
GET /api/admin/stats/growth

// Users
GET /api/admin/users
GET /api/admin/users/:id/kyc

// Vehicles
GET /api/admin/vehicles
GET /api/admin/vehicles/:id/review

// Bookings
GET /api/admin/bookings
GET /api/admin/bookings/:id/dispute

// Actions
POST /api/admin/kyc/:id/approve
POST /api/admin/kyc/:id/reject
POST /api/admin/dispute/:id/resolve
```

## Testing Strategy

### Unit Tests
- Stats card rendering
- Chart data formatting
- Action item filtering
- Role-based access

### Integration Tests
- API data fetching
- State management
- Navigation flow
- Form submissions

### E2E Tests
- Complete admin workflows
- Multi-step processes
- Error handling
- Edge cases

## Future Enhancements

### Phase 2
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Export to CSV/PDF
- [ ] Bulk actions
- [ ] Custom dashboards

### Phase 3
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated dispute resolution
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

### Phase 4
- [ ] Mobile app integration
- [ ] Push notifications
- [ ] Voice commands
- [ ] AR/VR visualization
- [ ] Blockchain audit trail

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratios ≥ 4.5:1
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- ARIA labels

### Features
- Semantic HTML structure
- Alt text for images
- Descriptive link text
- Form labels and instructions
- Error messages

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Mobile Chrome: Android 10+

## Build Output

```
✓ 2363 modules transformed
✓ CSS: 95.19 kB (gzip: 14.12 kB)
✓ JS: 889.81 kB (gzip: 242.47 kB)
✓ Built in 11.80s
```

## Usage Example

```typescript
import AdminDashboard from './components/admin/AdminDashboard';

// In App.tsx routing
if (currentUser?.role === 'admin') {
  return <AdminDashboard />;
}
```

## Login Credentials (Demo)

```
Email: admin@renmoku.id
Password: demo123
Role: admin
```

## Related Components

- `StatsCard` - Reusable stats card component
- `RevenueChart` - Chart component using Recharts
- `FleetStatus` - Circular progress chart
- `RecentBookings` - Booking list component

## Dependencies

- `react`: ^18.0.0
- `framer-motion`: ^10.0.0
- `recharts`: ^2.0.0
- `lucide-react`: ^0.263.0
- `zustand`: ^4.0.0

## License

Part of the Renmoku Platform - Internal Use Only

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-15  
**Author**: Renmoku Development Team
