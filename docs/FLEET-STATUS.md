# FleetStatus Component Documentation

## Overview

The FleetStatus component displays the current status distribution of the vehicle fleet using an animated circular progress chart (donut chart) with a legend showing the count of vehicles in each status category.

## Features

- **Circular Progress Chart**: SVG-based donut chart showing fleet distribution
- **Animated Segments**: Each status segment animates in sequence using Framer Motion
- **Color-Coded Status**: Four distinct colors for different fleet statuses
- **Glowing Indicators**: Legend items have subtle glow effects matching their status color
- **Center Display**: Shows total fleet count in the center of the chart
- **Responsive Design**: Adapts to different screen sizes

## Fleet Status Categories

| Status | Color | Hex Code | Description |
|--------|-------|----------|-------------|
| Available | Green | `#10B981` | Vehicles ready for rental |
| Rented | Gold | `#D4AF37` | Vehicles currently rented |
| Maintenance | Orange | `#F59E0B` | Vehicles under maintenance |
| Inactive | Gray | `#666666` | Vehicles not in service |

## Data Structure

```typescript
const fleetData = [
  { 
    status: string,      // Status name
    count: number,       // Number of vehicles
    color: string,       // Hex color code
    percentage: number   // Percentage of total fleet
  }
]
```

### Current Data

```typescript
[
  { status: 'Available', count: 12, color: '#10B981', percentage: 60 },
  { status: 'Rented', count: 8, color: '#D4AF37', percentage: 40 },
  { status: 'Maintenance', count: 3, color: '#F59E0B', percentage: 15 },
  { status: 'Inactive', count: 2, color: '#666', percentage: 10 },
]
```

## Technical Implementation

### Circular Progress Chart

The chart is built using SVG circles with `stroke-dasharray` and `stroke-dashoffset` to create the segmented donut effect:

- **SVG Container**: 160x160px with `-rotate-90` to start from top
- **Background Circle**: Dark gray (`#1a1a1a`) with 16px stroke width
- **Status Circles**: Colored segments with calculated dash arrays
- **Center Content**: Total fleet count (20 vehicles)

### Animation

Each segment animates in sequence with a 0.2s delay between segments:

```typescript
<motion.circle
  initial={{ pathLength: 0 }}
  animate={{ pathLength: strokeLength }}
  transition={{ duration: 1, delay: idx * 0.2 }}
/>
```

### Calculations

```typescript
const circumference = 2 * Math.PI * 60;  // Circle circumference
const strokeLength = (percentage / 100) * circumference;  // Segment length
const strokeOffset = (totalPercentage / 100) * circumference;  // Segment position
```

## Styling

### Container
- Background: `#141414`
- Border: `1px solid rgba(255, 255, 255, 0.05)`
- Border Radius: `16px`
- Padding: `24px`

### Typography
- Title: `font-serif text-xl`
- Subtitle: `text-sm text-gray-500`
- Total Count: `text-3xl font-bold font-mono`
- Legend Text: `text-sm text-gray-300`

### Legend Indicators
- Size: 12x12px
- Shape: Rounded full
- Glow Effect: `boxShadow: 0 0 8px ${color}`

## Usage

```tsx
import FleetStatus from '@/components/dashboard/FleetStatus';

// In your dashboard
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <RevenueChart />
  </div>
  <div>
    <FleetStatus />
  </div>
</div>
```

## Customization

### Updating Fleet Data

To update the fleet data, modify the `fleetData` array:

```typescript
const fleetData = [
  { status: 'Available', count: 15, color: '#10B981', percentage: 60 },
  { status: 'Rented', count: 7, color: '#D4AF37', percentage: 28 },
  { status: 'Maintenance', count: 2, color: '#F59E0B', percentage: 8 },
  { status: 'Inactive', count: 1, color: '#666', percentage: 4 },
]
```

**Note**: Ensure percentages add up to 100% for proper visualization.

### Changing Colors

Update the `color` property in the `fleetData` array:

```typescript
{ status: 'Available', count: 12, color: '#YOUR_COLOR', percentage: 60 }
```

### Adjusting Chart Size

Modify the container dimensions:

```tsx
<div className="relative w-48 h-48 mx-auto mb-6">  {/* Change w-40 h-40 */}
  <svg className="w-full h-full -rotate-90">
    <circle cx="96" cy="96" r="72" ... />  {/* Adjust cx, cy, r */}
```

## Performance Considerations

- **SVG Rendering**: Efficient for small datasets (4 segments)
- **Animation**: Uses Framer Motion for smooth transitions
- **No External Dependencies**: Pure SVG implementation (no chart library needed)

## Accessibility

- **Color Contrast**: All status colors meet WCAG AA standards
- **Semantic HTML**: Proper heading structure (h3)
- **Screen Reader**: Total count is clearly displayed
- **Keyboard Navigation**: Component is non-interactive (display only)

## Future Enhancements

Potential improvements:
- [ ] Real-time data updates via WebSocket
- [ ] Click segments to filter fleet list
- [ ] Tooltip on hover showing detailed stats
- [ ] Export chart as image
- [ ] Comparison with previous period
- [ ] Breakdown by vehicle type

## Related Components

- **StatsCard**: Displays individual metrics
- **RevenueChart**: Shows revenue trends over time
- **RecentBookings**: Lists recent booking activity

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Responsive design

## Build Output

```
✓ Built in 11.45s
✓ CSS: 92.24 kB (gzip: 13.85 kB)
✓ JS: 871.12 kB (gzip: 239.70 kB)
```

## Version History

- **v2.0.0** (2025-01-15): Circular progress chart with animated segments
- **v1.0.0** (2025-01-15): Initial horizontal bar chart implementation

## License

Part of the Renmoku Dashboard System.
