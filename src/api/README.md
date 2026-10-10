# Renmoku API Structure

## Overview

This directory contains the complete API layer for the Renmoku car rental platform. The API is structured following RESTful conventions with clear separation of concerns.

## Directory Structure

```
src/api/
├── index.ts              # Main export file with usage examples
├── client.ts             # HTTP client configuration
├── mock.ts               # Mock API handlers for development
└── README.md             # This file

src/types/
└── api.ts                # TypeScript type definitions

docs/
└── API-DOCUMENTATION.md  # Complete API documentation
```

## Architecture

### API Client (`client.ts`)

The API client provides a centralized HTTP client with:
- JWT token management
- Automatic header injection
- Error handling
- Request/response interceptors
- Environment-based base URL configuration

**Usage:**
```typescript
import { apiClient } from '@/api';

// Set authentication token
apiClient.setToken('your-jwt-token');

// Make requests
const data = await apiClient.get('/vehicles');
const result = await apiClient.post('/bookings', { vehicleId: '123' });
```

### Mock API (`mock.ts`)

The mock API provides simulated backend responses for development:
- Realistic data structures
- Simulated network delays
- CRUD operations
- Authentication flows
- Error scenarios

**Usage:**
```typescript
import { api } from '@/api';

// Authentication
const loginResponse = await api.auth.login({
  email: 'admin@renmoku.id',
  password: 'demo123'
});

// Vehicles
const vehicles = await api.vehicles.list({ page: 1, limit: 10 });

// Bookings
const booking = await api.bookings.create({
  vehicleId: 'vehicle-1',
  startDate: '2026-10-12',
  endDate: '2026-10-15',
  // ...
});
```

### Type Definitions (`types/api.ts`)

Comprehensive TypeScript types for:
- Request payloads
- Response structures
- Entity models
- Error formats
- Pagination

## API Endpoints

### Authentication (`/api/auth`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/login` | POST | User login | No |
| `/register` | POST | User registration | No |
| `/me` | GET | Get current user | Yes |

### Vehicles (`/api/vehicles`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | List vehicles | No |
| `/` | POST | Create vehicle | Yes (Owner) |
| `/:id` | GET | Get vehicle details | No |
| `/:id` | PUT | Update vehicle | Yes (Owner) |
| `/:id` | DELETE | Delete vehicle | Yes (Owner) |

### Bookings (`/api/bookings`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | List bookings | Yes |
| `/` | POST | Create booking | Yes |
| `/:id` | GET | Get booking details | Yes |
| `/:id/status` | PUT | Update booking status | Yes (Owner/Admin) |
| `/:id/approve` | POST | Approve booking | Yes (Owner) |
| `/:id/reject` | POST | Reject booking | Yes (Owner) |

### Payments (`/api/payments`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | List payments | Yes |
| `/` | POST | Create payment | Yes |
| `/callback` | POST | Payment webhook | No (Internal) |

### Users (`/api/users`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | List users | Yes (Admin) |
| `/:id` | GET | Get user details | Yes (Admin) |
| `/:id/verify` | POST | Verify user (KYC) | Yes (Admin) |

### Reports (`/api/reports`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/revenue` | GET | Revenue report | Yes (Admin) |
| `/export` | POST | Export report | Yes (Admin) |

## Authentication Flow

### 1. Login
```typescript
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Store token
apiClient.setToken(response.token);
```

### 2. Protected Requests
```typescript
// Token automatically included in headers
const vehicles = await api.vehicles.list();
```

### 3. Logout
```typescript
await api.auth.logout();
apiClient.setToken(null);
```

## Error Handling

All API methods throw errors with consistent structure:

```typescript
try {
  const vehicle = await api.vehicles.getById('invalid-id');
} catch (error) {
  console.error(error.message); // "Vehicle not found"
}
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development
VITE_USE_MOCK_API=true
```

## Testing

### Unit Tests
```typescript
import { api } from '@/api';

describe('Vehicles API', () => {
  it('should list vehicles', async () => {
    const response = await api.vehicles.list();
    expect(response.success).toBe(true);
    expect(response.data).toBeInstanceOf(Array);
  });
});
```

### Integration Tests
```typescript
describe('Booking Flow', () => {
  it('should create and approve booking', async () => {
    // Create booking
    const booking = await api.bookings.create({
      vehicleId: 'vehicle-1',
      startDate: '2026-10-12',
      endDate: '2026-10-15',
      // ...
    });
    
    expect(booking.data.status).toBe('pending');
    
    // Approve booking
    const approved = await api.bookings.approve(booking.data.id);
    expect(approved.booking.status).toBe('confirmed');
  });
});
```

## Demo Credentials

### Admin
- **Email**: admin@renmoku.id
- **Password**: demo123

### Owner
- **Email**: owner@renmoku.id
- **Password**: demo123

### Renter
- **Email**: renter@renmoku.id
- **Password**: demo123

## Migration to Production

When ready to connect to a real backend:

1. **Set API URL**:
```env
VITE_API_URL=https://api.renmoku.id/api
VITE_USE_MOCK_API=false
```

2. **Update API Client**:
```typescript
// Remove mock imports
// Use real HTTP requests
```

3. **Implement Backend**:
- Node.js/Express or Next.js API routes
- Database integration (PostgreSQL)
- Authentication (JWT)
- Payment gateway (Midtrans)
- File storage (AWS S3)

## Documentation

- **API Documentation**: `docs/API-DOCUMENTATION.md`
- **Type Definitions**: `src/types/api.ts`
- **Usage Examples**: `src/api/index.ts`

## Support

For API questions:
- Email: api-support@renmoku.id
- Docs: https://docs.renmoku.id/api

---

**Version**: 1.0.0  
**Last Updated**: 2026-10-15  
**Status**: Development Ready
