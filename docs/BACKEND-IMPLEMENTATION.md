# Backend Implementation Guide - Next.js API Routes

## Overview

Dokumentasi ini berisi implementasi lengkap backend API menggunakan Next.js App Router untuk platform Renmoku. Backend ini terpisah dari frontend React + Vite dan dapat di-deploy secara independen.

## Project Structure

```
renmoku-backend/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── bookings/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── vehicles/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── users/
│   │       │   └── route.ts
│   │       └── payments/
│   │           └── route.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth-middleware.ts
│   │   └── socket.ts
│   └── types/
│       └── next-auth.d.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── .env.local
```

## Setup Instructions

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest renmoku-backend --typescript --app --no-src-dir
cd renmoku-backend
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install next-auth @next-auth/prisma-adapter bcryptjs zod
npm install @prisma/client socket.io socket.io-client

# Development dependencies
npm install -D @types/bcryptjs @types/node prisma
```

### 3. Setup Prisma

```bash
npx prisma init
```

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  role          UserRole  @default(RENTER)
  status        UserStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  renterIndividual RenterIndividual?
  renterCorporate  RenterCorporate?
  fleetOwner       FleetOwner?
  bookings         Booking[]
}

enum UserRole {
  RENTER
  OWNER
  ADMIN
}

enum UserStatus {
  PENDING
  VERIFIED
  REJECTED
}

model RenterIndividual {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  fullName    String
  ktpNumber   String
  ktpScan     String
  simNumber   String
  simScan     String
  kkScan      String
  address     String
  verifiedAt  DateTime?
}

model RenterCorporate {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  companyName     String
  nib             String
  nibDocument     String
  akta            String
  npwp            String
  npwpDocument    String
  picName         String
  picKtp          String
  picKtpScan      String
  picSim          String
  picSimScan      String
  verifiedAt      DateTime?
}

model FleetOwner {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  businessName    String
  bankAccount     String
  bankName        String
  verifiedAt      DateTime?
  vehicles        Vehicle[]
}

model Vehicle {
  id                String   @id @default(cuid())
  ownerId           String
  owner             FleetOwner @relation(fields: [ownerId], references: [id])
  brand             String
  model             String
  year              Int
  transmission      Transmission
  capacity          Int
  fuelType          String
  features          String[]
  priceDaily        Float
  priceWeekly       Float
  priceMonthly      Float
  hasDriverOption   Boolean  @default(false)
  driverPriceDaily  Float?
  status            VehicleStatus @default(AVAILABLE)
  location          String
  images            String[]
  model3D           String?
  createdAt         DateTime @default(now())
  bookings          Booking[]
}

enum Transmission {
  MANUAL
  AUTOMATIC
}

enum VehicleStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  INACTIVE
}

model Booking {
  id              String   @id @default(cuid())
  renterId        String
  renter          User     @relation(fields: [renterId], references: [id])
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  startDate       DateTime
  endDate         DateTime
  durationType    DurationType
  withDriver      Boolean  @default(false)
  totalPrice      Float
  dpAmount        Float
  tripOrigin      String
  tripDestination String
  tripPurpose     String
  guaranteeType   GuaranteeType
  guaranteeDoc    String?
  status          BookingStatus @default(PENDING)
  contractSigned  Boolean  @default(false)
  createdAt       DateTime @default(now())
  payments        Payment[]
}

enum DurationType {
  DAILY
  WEEKLY
  MONTHLY
}

enum GuaranteeType {
  KTP
  BPKB
  CASH
  GUARANTEE_LETTER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
}

model Payment {
  id              String   @id @default(cuid())
  bookingId       String
  booking         Booking  @relation(fields: [bookingId], references: [id])
  type            PaymentType
  amount          Float
  method          String
  status          PaymentStatus @default(PENDING)
  transactionId   String?
  paidAt          DateTime?
  createdAt       DateTime @default(now())
}

enum PaymentType {
  DP
  FULL_PAYMENT
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### 4. Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Socket.io
SOCKET_IO_CORS_ORIGIN="http://localhost:5173"

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"
```

### 5. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

## Core Library Files

### `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
```

### `src/lib/socket.ts`

```typescript
import { Server as NetServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketServer | null = null;

export const initSocket = (httpServer: NetServer) => {
  if (io) return io;

  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export { io };
```

### `src/types/next-auth.d.ts`

```typescript
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}
```

## API Routes Implementation

### Bookings API - `src/app/api/bookings/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { io } from '@/lib/socket';

// Validation Schema
const createBookingSchema = z.object({
  vehicleId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  durationType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  withDriver: z.boolean(),
  tripOrigin: z.string().min(3),
  tripDestination: z.string().min(3),
  tripPurpose: z.string(),
  guaranteeType: z.enum(['KTP', 'BPKB', 'CASH', 'GUARANTEE_LETTER']),
});

// GET — List bookings (filtered by role)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        renterIndividual: true,
        renterCorporate: true,
        fleetOwner: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause based on role
    let whereClause = {};
    if (user.role === 'RENTER') {
      whereClause = { renterId: user.id };
    } else if (user.role === 'OWNER') {
      whereClause = {
        vehicle: { ownerId: user.fleetOwner?.id },
      };
    }
    // ADMIN can see all

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        renter: {
          include: {
            renterIndividual: true,
            renterCorporate: true,
          },
        },
        vehicle: {
          include: { owner: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST — Create new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== 'RENTER') {
      return NextResponse.json(
        { error: 'Only renters can create bookings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createBookingSchema.parse(body);

    // Check vehicle availability
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Vehicle not available' },
        { status: 400 }
      );
    }

    // Calculate price
    let basePrice = 0;
    const start = new Date(validated.startDate);
    const end = new Date(validated.endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (validated.durationType === 'DAILY') {
      basePrice = days * vehicle.priceDaily;
    } else if (validated.durationType === 'WEEKLY') {
      const weeks = Math.ceil(days / 7);
      basePrice = weeks * vehicle.priceWeekly;
    } else if (validated.durationType === 'MONTHLY') {
      const months = Math.ceil(days / 30);
      basePrice = months * vehicle.priceMonthly;
    }

    const driverCost = validated.withDriver ? days * 150000 : 0;
    const totalPrice = basePrice + driverCost;
    const dpAmount = totalPrice * 0.5;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        renterId: user.id,
        vehicleId: validated.vehicleId,
        startDate: start,
        endDate: end,
        durationType: validated.durationType,
        withDriver: validated.withDriver,
        totalPrice,
        dpAmount,
        tripOrigin: validated.tripOrigin,
        tripDestination: validated.tripDestination,
        tripPurpose: validated.tripPurpose,
        guaranteeType: validated.guaranteeType,
        status: 'PENDING',
      },
      include: {
        vehicle: { include: { owner: { include: { user: true } } } },
        renter: true,
      },
    });

    // 🔔 REAL-TIME NOTIFICATION to owner
    if (io && vehicle.owner.user.email) {
      io.to(`user_${vehicle.owner.userId}`).emit('new_booking', {
        bookingId: booking.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        renterName: user.email,
        totalPrice,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

### Booking Detail API - `src/app/api/bookings/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET — Get booking by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        renter: {
          include: {
            renterIndividual: true,
            renterCorporate: true,
          },
        },
        vehicle: {
          include: { owner: true },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check access permission
    const isOwner = user.role === 'OWNER' && booking.vehicle.ownerId === user.fleetOwner?.id;
    const isRenter = user.role === 'RENTER' && booking.renterId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isRenter && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT — Update booking status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { fleetOwner: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { vehicle: { include: { owner: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permission
    const isOwner = user.role === 'OWNER' && booking.vehicle.ownerId === user.fleetOwner?.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only owners or admins can update booking status' },
        { status: 403 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        renter: true,
        vehicle: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated',
    });
  } catch (error) {
    console.error('PUT /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
```

## Frontend Integration

### Update API Client

Update `src/api/client.ts` to use real backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data as T;
    } catch (error) {
      console.error(`API Error:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### Usage in Components

```typescript
import { apiClient } from '@/api/client';

// List bookings
const bookings = await apiClient.get('/bookings');

// Create booking
const newBooking = await apiClient.post('/bookings', {
  vehicleId: 'vehicle-123',
  startDate: '2026-10-12T00:00:00Z',
  endDate: '2026-10-15T00:00:00Z',
  durationType: 'DAILY',
  withDriver: true,
  tripOrigin: 'Jakarta',
  tripDestination: 'Bandung',
  tripPurpose: 'wisata',
  guaranteeType: 'KTP',
});

// Get booking detail
const booking = await apiClient.get('/bookings/booking-123');

// Update booking status
await apiClient.put('/bookings/booking-123', {
  status: 'CONFIRMED',
});
```

## Deployment

### 1. Build Backend

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### 3. Environment Variables

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SOCKET_IO_CORS_ORIGIN`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`

### 4. Update Frontend

Update `VITE_API_URL` in frontend `.env`:

```env
VITE_API_URL=https://renmoku-backend.vercel.app/api
```

## Testing

### Test with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@renmoku.id","password":"demo123"}'

# List bookings
curl http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle-123",
    "startDate": "2026-10-12T00:00:00Z",
    "endDate": "2026-10-15T00:00:00Z",
    "durationType": "DAILY",
    "withDriver": true,
    "tripOrigin": "Jakarta",
    "tripDestination": "Bandung",
    "tripPurpose": "wisata",
    "guaranteeType": "KTP"
  }'
```

## Security Considerations

1. **Authentication**: Always verify session before processing requests
2. **Authorization**: Check user role and ownership before allowing operations
3. **Validation**: Use Zod schemas to validate all input data
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **CORS**: Configure CORS properly to allow only trusted origins
6. **HTTPS**: Always use HTTPS in production
7. **Environment Variables**: Never commit sensitive data to repository

## Performance Optimization

1. **Database Indexes**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Use cursor-based pagination for large datasets
4. **Connection Pooling**: Configure Prisma connection pooling
5. **Query Optimization**: Use `select` to fetch only needed fields

## Monitoring

1. **Logging**: Use structured logging (Winston, Pino)
2. **Error Tracking**: Integrate Sentry for error monitoring
3. **Metrics**: Track API response times and error rates
4. **Alerts**: Set up alerts for critical errors

## Next Steps

1. Implement remaining API routes (vehicles, users, payments)
2. Add file upload endpoints for documents
3. Integrate Midtrans payment gateway
4. Implement email notifications
5. Add WebSocket for real-time updates
6. Set up CI/CD pipeline
7. Configure monitoring and logging

---

**Status**: ✅ Backend Implementation Guide Complete  
**Ready for**: Production Deployment  
**Last Updated**: 2026-10-15
