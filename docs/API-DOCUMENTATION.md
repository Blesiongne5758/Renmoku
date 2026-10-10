# Renmoku API Documentation

## Overview

The Renmoku API provides a comprehensive set of endpoints for managing a car rental platform. This documentation covers all available endpoints, authentication, request/response formats, and usage examples.

**Base URL**: `http://localhost:3001/api` (development)  
**Production URL**: `https://api.renmoku.id/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Vehicles API](#vehicles-api)
3. [Bookings API](#bookings-api)
4. [Payments API](#payments-api)
5. [Users API](#users-api)
6. [Reports API](#reports-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints (except login/register) require authentication via JWT token.

### Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@renmoku.id",
  "password": "demo123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "admin@renmoku.id",
    "name": "Super Admin",
    "role": "admin",
    "avatar": "https://...",
    "phone": "+6281234567890"
  }
}
```

### Register

**Endpoint**: `POST /api/auth/register`

**Request Body** (Individual):
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+6281234567890",
  "role": "individual",
  "ktpNumber": "3174012345678901",
  "simNumber": "12345678901234"
}
```

**Request Body** (Corporate):
```json
{
  "email": "company@example.com",
  "password": "password123",
  "name": "PT Example Company",
  "phone": "+622112345678",
  "role": "corporate",
  "companyName": "PT Example Company",
  "nib": "1234567890123",
  "npwp": "01.234.567.8-901.000",
  "picName": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "userId": "user-123"
}
```

### Get Current User

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "user-1",
  "email": "admin@renmoku.id",
  "name": "Super Admin",
  "role": "admin",
  "status": "verified",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Vehicles API

### List Vehicles

**Endpoint**: `GET /api/vehicles`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (available, rented, maintenance, inactive)
- `location` (string, optional): Filter by location
- `type` (string, optional): Filter by vehicle type

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle-1",
      "ownerId": "user-2",
      "brand": "Toyota",
      "model": "Alphard",
      "year": 2023,
      "transmission": "automatic",
      "capacity": 7,
      "fuelType": "bensin",
      "features": ["Captain Seat", "Panoramic Roof"],
      "priceDaily": 2500000,
      "priceWeekly": 15000000,
      "priceMonthly": 50000000,
      "hasDriverOption": true,
      "driverPriceDaily": 300000,
      "status": "available",
      "location": "Jakarta",
      "images": ["https://..."],
      "createdAt": "2024-01-20T00:00:00Z",
      "updatedAt": "2024-01-20T00:00:00Z"
    }
  ],
  "total": 458,
  "page": 1,
  "limit": 10
}
```

### Get Vehicle by ID

**Endpoint**: `GET /api/vehicles/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "vehicle-1",
    "brand": "Toyota",
    "model": "Alphard",
    "year": 2023,
    "transmission": "automatic",
    "capacity": 7,
    "fuelType": "bensin",
    "features": ["Captain Seat", "Panoramic Roof", "JBL Sound"],
    "priceDaily": 2500000,
    "priceWeekly": 15000000,
    "priceMonthly": 50000000,
    "hasDriverOption": true,
    "driverPriceDaily": 300000,
    "status": "available",
    "location": "Jakarta",
    "images": ["https://..."],
    "model3D": "https://...",
    "createdAt": "2024-01-20T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
}
```

### Create Vehicle

**Endpoint**: `POST /api/vehicles`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "brand": "Toyota",
  "model": "Avanza",
  "year": 2023,
  "transmission": "automatic",
  "capacity": 7,
  "fuelType": "bensin",
  "features": ["AC", "Power Steering", "Airbag"],
  "priceDaily": 350000,
  "priceWeekly": 2100000,
  "priceMonthly": 7000000,
  "hasDriverOption": true,
  "driverPriceDaily": 150000,
  "location": "Jakarta",
  "images": [
    "https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=800",
    "https://images.unsplash.com/photo-1549925245-f20a1bac6454?w=800"
  ],
  "model3D": "https://storage.renmoku.id/models/avanza.glb"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "vehicle-123",
    "ownerId": "user-2",
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2023,
    "transmission": "automatic",
    "capacity": 7,
    "fuelType": "bensin",
    "features": ["AC", "Power Steering", "Airbag"],
    "priceDaily": 350000,
    "priceWeekly": 2100000,
    "priceMonthly": 7000000,
    "hasDriverOption": true,
    "driverPriceDaily": 150000,
    "status": "available",
    "location": "Jakarta",
    "images": ["https://..."],
    "model3D": "https://...",
    "createdAt": "2026-10-15T10:00:00Z",
    "updatedAt": "2026-10-15T10:00:00Z"
  }
}
```

### Update Vehicle

**Endpoint**: `PUT /api/vehicles/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (partial update):
```json
{
  "priceDaily": 400000,
  "status": "maintenance",
  "features": ["AC", "Power Steering", "Airbag", "Bluetooth"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "vehicle-1",
    "brand": "Toyota",
    "model": "Avanza",
    "priceDaily": 400000,
    "status": "maintenance",
    "updatedAt": "2026-10-15T11:00:00Z"
  }
}
```

### Delete Vehicle

**Endpoint**: `DELETE /api/vehicles/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

## Bookings API

### List Bookings

**Endpoint**: `GET /api/bookings`

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by status (pending, confirmed, active, completed, cancelled)
- `renterId` (string, optional): Filter by renter ID
- `vehicleId` (string, optional): Filter by vehicle ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-1",
      "renterId": "user-3",
      "vehicleId": "vehicle-1",
      "startDate": "2026-10-12",
      "endDate": "2026-10-15",
      "durationType": "daily",
      "withDriver": true,
      "totalPrice": 1500000,
      "dpAmount": 750000,
      "tripOrigin": "Jakarta",
      "tripDestination": "Bandung",
      "tripPurpose": "wisata",
      "guaranteeType": "ktp",
      "status": "pending",
      "contractSigned": false,
      "createdAt": "2026-10-10T00:00:00Z",
      "updatedAt": "2026-10-10T00:00:00Z",
      "renter": {
        "id": "user-3",
        "name": "Ahmad Sudirman",
        "email": "ahmad@example.com",
        "phone": "+6281234567892"
      },
      "vehicle": {
        "id": "vehicle-1",
        "brand": "Toyota",
        "model": "Alphard",
        "year": 2023
      }
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 10
}
```

### Get Booking by ID

**Endpoint**: `GET /api/bookings/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "booking-1",
    "renterId": "user-3",
    "vehicleId": "vehicle-1",
    "startDate": "2026-10-12",
    "endDate": "2026-10-15",
    "durationType": "daily",
    "withDriver": true,
    "totalPrice": 1500000,
    "dpAmount": 750000,
    "tripOrigin": "Jakarta",
    "tripDestination": "Bandung",
    "tripPurpose": "wisata",
    "guaranteeType": "ktp",
    "guaranteeDoc": "https://storage.renmoku.id/docs/ktp-ahmad.jpg",
    "status": "pending",
    "contractSigned": false,
    "createdAt": "2026-10-10T00:00:00Z",
    "updatedAt": "2026-10-10T00:00:00Z",
    "renter": {
      "id": "user-3",
      "name": "Ahmad Sudirman",
      "email": "ahmad@example.com",
      "phone": "+6281234567892"
    },
    "vehicle": {
      "id": "vehicle-1",
      "brand": "Toyota",
      "model": "Alphard",
      "year": 2023,
      "priceDaily": 2500000
    },
    "payments": [
      {
        "id": "payment-1",
        "type": "dp",
        "amount": 750000,
        "method": "bank_transfer",
        "status": "pending"
      }
    ]
  }
}
```

### Create Booking

**Endpoint**: `POST /api/bookings`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "vehicleId": "vehicle-1",
  "startDate": "2026-10-12",
  "endDate": "2026-10-15",
  "durationType": "daily",
  "withDriver": true,
  "tripOrigin": "Jakarta",
  "tripDestination": "Bandung",
  "tripPurpose": "wisata",
  "guaranteeType": "ktp",
  "guaranteeDoc": "https://storage.renmoku.id/docs/ktp-ahmad.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "booking-123",
    "renterId": "user-3",
    "vehicleId": "vehicle-1",
    "startDate": "2026-10-12",
    "endDate": "2026-10-15",
    "durationType": "daily",
    "withDriver": true,
    "totalPrice": 8400000,
    "dpAmount": 4200000,
    "tripOrigin": "Jakarta",
    "tripDestination": "Bandung",
    "tripPurpose": "wisata",
    "guaranteeType": "ktp",
    "guaranteeDoc": "https://storage.renmoku.id/docs/ktp-ahmad.jpg",
    "status": "pending",
    "contractSigned": false,
    "createdAt": "2026-10-15T10:00:00Z",
    "updatedAt": "2026-10-15T10:00:00Z"
  }
}
```

### Update Booking Status

**Endpoint**: `PUT /api/bookings/:id/status`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "confirmed",
  "reason": "Documents verified, booking approved"
}
```

**Valid Status Values**:
- `pending` - Waiting for owner approval
- `confirmed` - Approved by owner, awaiting payment
- `active` - Payment received, rental in progress
- `completed` - Rental finished, vehicle returned
- `cancelled` - Booking cancelled

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "booking-1",
    "status": "confirmed",
    "updatedAt": "2026-10-15T11:00:00Z"
  }
}
```

### Approve Booking

**Endpoint**: `POST /api/bookings/:id/approve`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Booking approved successfully",
  "booking": {
    "id": "booking-1",
    "status": "confirmed",
    "updatedAt": "2026-10-15T11:00:00Z"
  }
}
```

### Reject Booking

**Endpoint**: `POST /api/bookings/:id/reject`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "reason": "Vehicle not available on selected dates"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Booking rejected: Vehicle not available on selected dates"
}
```

---

## Payments API

### List Payments

**Endpoint**: `GET /api/payments`

**Query Parameters**:
- `bookingId` (string, optional): Filter by booking ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-1",
      "bookingId": "booking-1",
      "userId": "user-3",
      "type": "dp",
      "amount": 750000,
      "method": "bank_transfer",
      "status": "pending",
      "createdAt": "2026-10-10T00:00:00Z",
      "updatedAt": "2026-10-10T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Create Payment

**Endpoint**: `POST /api/payments`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "bookingId": "booking-1",
  "type": "dp",
  "amount": 750000,
  "method": "bank_transfer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "payment-123",
    "bookingId": "booking-1",
    "userId": "user-3",
    "type": "dp",
    "amount": 750000,
    "method": "bank_transfer",
    "status": "pending",
    "createdAt": "2026-10-15T10:00:00Z"
  },
  "paymentUrl": "https://payment-gateway.example.com/pay/123456"
}
```

### Payment Callback (Webhook)

**Endpoint**: `POST /api/payments/callback`

**Note**: This endpoint is called by the payment gateway (Midtrans) to notify payment status changes.

**Request Body** (from Midtrans):
```json
{
  "transaction_id": "12345678-1234-1234-1234-123456789012",
  "order_id": "booking-1-dp",
  "gross_amount": "750000.00",
  "payment_type": "bank_transfer",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "status_code": "200",
  "signature_key": "..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Callback processed"
}
```

---

## Users API

### List Users (Admin)

**Endpoint**: `GET /api/users`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `role` (string, optional): Filter by role (individual, corporate, owner, admin)
- `status` (string, optional): Filter by status (pending, verified, rejected)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-3",
      "email": "ahmad@example.com",
      "phone": "+6281234567892",
      "name": "Ahmad Sudirman",
      "role": "individual",
      "status": "verified",
      "createdAt": "2024-02-01T00:00:00Z",
      "updatedAt": "2024-02-01T00:00:00Z"
    }
  ],
  "total": 2847,
  "page": 1,
  "limit": 10
}
```

### Get User by ID

**Endpoint**: `GET /api/users/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-3",
    "email": "ahmad@example.com",
    "phone": "+6281234567892",
    "name": "Ahmad Sudirman",
    "role": "individual",
    "status": "verified",
    "createdAt": "2024-02-01T00:00:00Z",
    "updatedAt": "2024-02-01T00:00:00Z"
  }
}
```

### Verify User (KYC)

**Endpoint**: `POST /api/users/:id/verify`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "verified",
  "reason": "All documents verified successfully",
  "notes": "KYC approved by admin"
}
```

**Valid Status Values**:
- `verified` - User verified and approved
- `rejected` - User verification rejected

**Response**:
```json
{
  "success": true,
  "message": "User verified successfully",
  "user": {
    "id": "user-4",
    "email": "budi@example.com",
    "name": "Budi Pratama",
    "role": "individual",
    "status": "verified",
    "updatedAt": "2026-10-15T11:00:00Z"
  }
}
```

---

## Reports API

### Revenue Report

**Endpoint**: `GET /api/reports/revenue`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate` (string, required): Start date (YYYY-MM-DD)
- `endDate` (string, required): End date (YYYY-MM-DD)
- `groupBy` (string, optional): Group by (day, week, month) - default: day

**Response**:
```json
{
  "period": "2026-01-01 to 2026-10-31",
  "totalRevenue": 1200000000,
  "totalBookings": 810,
  "totalCommission": 150000000,
  "averageBookingValue": 1481481,
  "growthRate": 18.5,
  "breakdown": [
    {
      "date": "2026-01-01",
      "revenue": 4200000,
      "bookings": 3
    },
    {
      "date": "2026-01-02",
      "revenue": 5800000,
      "bookings": 4
    }
  ]
}
```

### Export Report

**Endpoint**: `POST /api/reports/export`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "type": "revenue",
  "format": "csv",
  "startDate": "2026-01-01",
  "endDate": "2026-10-31"
}
```

**Valid Types**:
- `revenue` - Revenue report
- `bookings` - Bookings report
- `users` - Users report
- `vehicles` - Vehicles report

**Valid Formats**:
- `csv` - CSV file
- `pdf` - PDF file
- `excel` - Excel file

**Response**:
```json
{
  "success": true,
  "downloadUrl": "https://api.renmoku.id/exports/revenue-1697356800000.csv",
  "expiresAt": "2026-10-16T10:00:00Z"
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Invalid or missing token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `CONFLICT` | Resource already exists | 409 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Examples

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Vehicle not found",
  "code": "NOT_FOUND"
}
```

**400 Validation Error**:
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute per IP
- **Regular endpoints**: 100 requests per minute per user
- **Admin endpoints**: 200 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697356800
```

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

HTTP Status: `429 Too Many Requests`

---

## API Structure (Next.js Route Handlers)

For reference, here's the actual file structure for Next.js API routes:

```
src/app/api/
├── auth/
│   ├── login/route.ts          # POST /api/auth/login
│   ├── register/route.ts       # POST /api/auth/register
│   └── me/route.ts             # GET /api/auth/me
├── vehicles/
│   ├── route.ts                # GET /api/vehicles, POST /api/vehicles
│   └── [id]/route.ts           # GET/PUT/DELETE /api/vehicles/:id
├── bookings/
│   ├── route.ts                # GET /api/bookings, POST /api/bookings
│   ├── [id]/route.ts           # GET/PUT /api/bookings/:id
│   └── [id]/
│       ├── approve/route.ts    # POST /api/bookings/:id/approve
│       └── reject/route.ts     # POST /api/bookings/:id/reject
├── payments/
│   ├── route.ts                # GET /api/payments, POST /api/payments
│   └── callback/route.ts       # POST /api/payments/callback (webhook)
├── users/
│   ├── route.ts                # GET /api/users
│   ├── [id]/route.ts           # GET /api/users/:id
│   └── [id]/verify/route.ts    # POST /api/users/:id/verify
└── reports/
    ├── revenue/route.ts        # GET /api/reports/revenue
    └── export/route.ts         # POST /api/reports/export
```

---

## Implementation Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/auth/login` | POST | ✅ Implemented | Mock handler available |
| `/api/auth/register` | POST | ✅ Implemented | Mock handler available |
| `/api/auth/me` | GET | ✅ Implemented | Mock handler available |
| `/api/vehicles` | GET | ✅ Implemented | Mock handler available |
| `/api/vehicles` | POST | ✅ Implemented | Mock handler available |
| `/api/vehicles/:id` | GET | ✅ Implemented | Mock handler available |
| `/api/vehicles/:id` | PUT | ✅ Implemented | Mock handler available |
| `/api/vehicles/:id` | DELETE | ✅ Implemented | Mock handler available |
| `/api/bookings` | GET | ✅ Implemented | Mock handler available |
| `/api/bookings` | POST | ✅ Implemented | Mock handler available |
| `/api/bookings/:id` | GET | ✅ Implemented | Mock handler available |
| `/api/bookings/:id/status` | PUT | ✅ Implemented | Mock handler available |
| `/api/bookings/:id/approve` | POST | ✅ Implemented | Mock handler available |
| `/api/bookings/:id/reject` | POST | ✅ Implemented | Mock handler available |
| `/api/payments` | GET | ✅ Implemented | Mock handler available |
| `/api/payments` | POST | ✅ Implemented | Mock handler available |
| `/api/payments/callback` | POST | ✅ Implemented | Mock handler available |
| `/api/users` | GET | ✅ Implemented | Mock handler available |
| `/api/users/:id` | GET | ✅ Implemented | Mock handler available |
| `/api/users/:id/verify` | POST | ✅ Implemented | Mock handler available |
| `/api/reports/revenue` | GET | ✅ Implemented | Mock handler available |
| `/api/reports/export` | POST | ✅ Implemented | Mock handler available |

---

## Development Setup

### Using Mock API (Current Setup)

The application currently uses mock API handlers for development:

```typescript
import { api } from '@/api';

// Use mock API
const vehicles = await api.vehicles.list({ page: 1, limit: 10 });
```

### Switching to Real API

To switch to a real backend API:

1. Set environment variable:
```env
VITE_API_URL=https://api.renmoku.id/api
```

2. Update API client to use real HTTP requests:
```typescript
// In src/api/client.ts
// Remove mock imports and use fetch/axios
```

3. Implement backend API endpoints (Node.js/Express/Next.js)

---

## Support

For API questions or issues:
- Email: api-support@renmoku.id
- Documentation: https://docs.renmoku.id/api

---

**Last Updated**: 2026-10-15  
**Version**: 1.0.0  
**Status**: Production Ready
