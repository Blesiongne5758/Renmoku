# 📊 RevenueChart Component Documentation

## Overview

The RevenueChart component displays revenue data using an interactive area chart powered by Recharts library. It supports multiple time periods (daily, weekly, monthly) and provides a smooth, animated visualization of income trends.

## Features

- **Interactive Area Chart**: Smooth area chart with gradient fill
- **Multiple Periods**: Switch between daily, weekly, and monthly views
- **Responsive Design**: Automatically adjusts to container size
- **Custom Tooltips**: Shows formatted revenue data on hover
- **Animated Transitions**: Smooth animations when switching periods
- **Dark Theme**: Optimized for dark mode dashboard

## Installation

The component uses Recharts library which is already installed:

```bash
npm install recharts
```

## Usage

```tsx
import RevenueChart from '@/components/dashboard/RevenueChart';

// In your component
<RevenueChart />
```

## Props

This component doesn't accept any props. It uses internal state to manage the selected period.

## Data Structure

### Daily Data
```typescript
const dataDaily = [
  { name: 'Sen', revenue: 4200000, bookings: 3 },
  { name: 'Sel', revenue: 5800000, bookings: 4 },
  // ... more data
];
```

### Monthly Data
```typescript
const dataMonthly = [
  { name: 'Jan', revenue: 32000000 },
  { name: 'Feb', revenue: 38000000 },
  // ... more data
];
```

## Styling

The component uses Tailwind CSS classes for styling:

- **Container**: `bg-[#141414] border border-white/5 rounded-2xl`
- **Active Button**: `bg-gradient-to-r from-yellow-400 to-yellow-600 text-black`
- **Inactive Button**: `text-gray-400 hover:text-white`
- **Chart Area**: Gold gradient fill (`#D4AF37`)

## Chart Configuration

### Area Chart Settings
- **Type**: Monotone curve
- **Stroke**: Gold color (`#D4AF37`)
- **Stroke Width**: 2px
- **Fill**: Gradient from gold (40% opacity) to transparent

### Tooltip Configuration
```typescript
{
  backgroundColor: '#1a1a1a',
  border: '1px solid #D4AF37',
  borderRadius: '12px',
  color: '#fff',
  formatter: (value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']
}
```

### Axis Configuration
- **X-Axis**: Day/Month names
- **Y-Axis**: Revenue in millions (formatted as "32M", "38M", etc.)
- **Grid**: Dashed lines with low opacity

## Period Switching

The component provides three period options:

1. **Harian (Daily)**: Shows daily revenue for the current week
2. **Mingguan (Weekly)**: Same as daily (can be extended to show multiple weeks)
3. **Bulanan (Monthly)**: Shows monthly revenue for the current year

## Responsive Behavior

The chart uses `ResponsiveContainer` from Recharts to automatically adjust its size based on the parent container. The chart height is fixed at 256px (`h-64`).

## Performance Considerations

⚠️ **Bundle Size Warning**: Recharts is a large library (~400KB). Consider:
- Using dynamic imports for code splitting
- Loading the chart component lazily
- Implementing virtualization for large datasets

### Recommended Optimization
```tsx
import { lazy, Suspense } from 'react';

const RevenueChart = lazy(() => import('@/components/dashboard/RevenueChart'));

// In your component
<Suspense fallback={<div>Loading chart...</div>}>
  <RevenueChart />
</Suspense>
```

## Customization

### Changing Colors
To change the chart colors, modify the gradient definition:

```tsx
<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor="#YOUR_COLOR" stopOpacity={0.4} />
  <stop offset="95%" stopColor="#YOUR_COLOR" stopOpacity={0} />
</linearGradient>
```

### Adding More Data Points
You can extend the data arrays to show more time periods:

```typescript
const dataDaily = [
  // Add more days...
  { name: 'Sen', revenue: 4200000, bookings: 3 },
  // ...
];
```

### Custom Tooltip
To customize the tooltip content:

```tsx
<Tooltip
  content={({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{label}</p>
          <p>Revenue: Rp {payload[0].value.toLocaleString('id-ID')}</p>
          {/* Add more custom content */}
        </div>
      );
    }
    return null;
  }}
/>
```

## Integration with Dashboard

This component is typically used in the Owner Dashboard:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <RevenueChart />
  </div>
  <div>
    <FleetStatus />
  </div>
</div>
```

## Browser Compatibility

Recharts supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Accessibility

The chart includes:
- Keyboard navigation support
- Screen reader friendly labels
- High contrast colors for visibility

## Future Enhancements

Potential improvements:
- [ ] Add booking count overlay
- [ ] Implement zoom/pan functionality
- [ ] Add export to PDF/CSV
- [ ] Support for custom date ranges
- [ ] Comparison with previous period
- [ ] Real-time data updates

## Related Components

- **StatsCard**: Displays individual metrics
- **FleetStatus**: Shows fleet availability
- **RecentBookings**: Lists recent bookings

## Dependencies

- `recharts`: ^2.x
- `framer-motion`: For animations
- `react`: ^18.x

## License

Part of the Renmoku dashboard system.
