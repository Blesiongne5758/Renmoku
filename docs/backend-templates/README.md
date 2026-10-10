# Backend Templates - Next.js with Socket.io

## Overview

Template files untuk backend Next.js dengan Socket.io integration. File-file ini siap digunakan untuk setup backend Renmoku.

## 📁 File Structure

```
backend/
├── server.js                          # Custom server dengan Socket.io
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── next.config.js                     # Next.js config
├── .env.local                         # Environment variables
├── prisma/
│   └── schema.prisma                  # Database schema
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   │   └── [...nextauth]/
    │   │   │       └── route.ts       # NextAuth configuration
    │   │   ├── bookings/
    │   │   │   ├── route.ts           # GET/POST bookings
    │   │   │   └── [id]/
    │   │   │       ├── route.ts       # GET/PUT booking
    │   │   │       └── approve/
    │   │   │           └── route.ts   # POST approve/reject
    │   │   ├── vehicles/
    │   │   │   ├── route.ts           # GET/POST vehicles
    │   │   │   └── [id]/
    │   │   │       └── route.ts       # GET/PUT/DELETE vehicle
    │   │   ├── users/
    │   │   │   ├── route.ts           # GET users
    │   │   │   └── [id]/
    │   │   │       └── verify/
    │   │   │           └── route.ts   # POST verify user
    │   │   └── payments/
    │   │       ├── route.ts           # GET/POST payments
    │   │       └── callback/
    │   │           └── route.ts       # POST payment webhook
    │   └── layout.tsx                 # Root layout
    ├── lib/
    │   ├── socket.ts                  # Socket.io initialization
    │   ├── prisma.ts                  # Prisma client
    │   ├── auth.ts                    # NextAuth configuration
    │   └── auth-middleware.ts         # Auth middleware
    └── types/
        └── next-auth.d.ts             # NextAuth types
```

## 🚀 Quick Start

### 1. Create Backend Project

```bash
# Create new Next.js project
npx create-next-app@latest renmoku-backend --typescript --app --no-src-dir
cd renmoku-backend

# Copy template files
cp -r docs/backend-templates/* .
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install next-auth @next-auth/prisma-adapter bcryptjs zod
npm install @prisma/client socket.io socket.io-client

# Development dependencies
npm install -D @types/bcryptjs @types/node prisma typescript
```

### 3. Setup Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Socket.io
NEXT_PUBLIC_APP_URL="http://localhost:5173"
SOCKET_IO_CORS_ORIGIN="http://localhost:5173"

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"

# Application
NODE_ENV="development"
PORT=3001
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 5. Update package.json

Add custom server script:

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "lint": "next lint"
  }
}
```

### 6. Start Backend

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3001` dengan Socket.io di `/api/socketio`.

## 📝 Template Files

### 1. server.js

Custom server untuk Next.js dengan Socket.io initialization:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./src/lib/socket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  initSocket(server);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO enabled on /api/socketio`);
  });
});
```

### 2. src/lib/socket.ts

Socket.io server initialization dengan event handlers:

```typescript
import { Server as NetServer } from 'http';
import { Server as SocketServer, Server as SocketIO } from 'socket.io';

export let io: SocketIO | null = null;

export const initSocket = (httpServer: NetServer) => {
  if (io) return io;

  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socketio',
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
    });

    socket.on('join_owner_room', (ownerId: string) => {
      socket.join(`owner_${ownerId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper functions
export const emitBookingStatusUpdate = (userId, data) => {
  io?.to(`user_${userId}`).emit('booking_status_update', data);
};

export const emitNewBooking = (ownerId, data) => {
  io?.to(`owner_${ownerId}`).emit('new_booking', data);
};
```

### 3. src/lib/prisma.ts

Prisma client singleton:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## 🔧 API Routes

### Bookings API

**GET /api/bookings** - List bookings
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });

  // Filter by role
  let whereClause = {};
  if (user.role === 'RENTER') {
    whereClause = { renterId: user.id };
  } else if (user.role === 'OWNER') {
    whereClause = { vehicle: { ownerId: user.fleetOwner?.id } };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: { renter: true, vehicle: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true,  bookings });
}
```

**POST /api/bookings/[id]/approve** - Approve/reject booking
```typescript
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: { fleetOwner: true },
  });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { vehicle: true, renter: true },
  });

  // Verify ownership
  if (user?.role === 'OWNER' && booking.vehicle.ownerId !== user.fleetOwner?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action } = await req.json();

  const updatedBooking = await prisma.booking.update({
    where: { id: params.id },
     {
      status: action === 'approve' ? 'CONFIRMED' : 'CANCELLED',
    },
  });

  // 🔔 Real-time notification
  emitBookingStatusUpdate(booking.renterId, {
    bookingId: booking.id,
    status: updatedBooking.status,
    vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
    action,
    message: action === 'approve' 
      ? 'Booking Anda telah disetujui!' 
      : 'Booking Anda telah ditolak.',
  });

  return NextResponse.json({ success: true,  updatedBooking });
}
```

## 🔐 Authentication

### NextAuth Configuration

```typescript
// src/lib/auth.ts
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
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },
  },
};
```

## 🧪 Testing

### Test Socket Connection

```bash
# Start backend
npm run dev

# Check Socket.io endpoint
curl http://localhost:3001/api/socketio
```

### Test API Endpoints

```bash
# Login
curl -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@renmoku.id","password":"demo123"}'

# List bookings
curl http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve booking
curl -X POST http://localhost:3001/api/bookings/booking-123/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'
```

## 🚢 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - MIDTRANS_SERVER_KEY
# - etc.
```

### Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL="..."
railway variables set NEXTAUTH_SECRET="..."
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/renmoku
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=renmoku
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔒 Security Checklist

- [ ] Set strong NEXTAUTH_SECRET
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Validate all inputs with Zod
- [ ] Use parameterized queries (Prisma)
- [ ] Hash passwords with bcrypt
- [ ] Implement JWT token expiration
- [ ] Set up audit logging
- [ ] Configure firewall rules

## 📊 Monitoring

### Logging

```typescript
// Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Booking approved', { bookingId, userId, timestamp: new Date() });
```

### Metrics

Track:
- API response times
- Error rates
- Socket.io connections
- Database query performance
- Memory usage

### Alerts

Set up alerts for:
- High error rate (> 5%)
- Slow response time (> 5s)
- Database connection failures
- Socket.io disconnections

## 📚 Related Documentation

- [Socket.io Implementation](../SOCKET-IO-IMPLEMENTATION.md)
- [API Documentation](../API-DOCUMENTATION.md)
- [Booking Approval API](../BOOKING-APPROVAL-API.md)
- [Backend Implementation](../BACKEND-IMPLEMENTATION.md)

## ✅ Checklist

### Setup
- [ ] Create Next.js project
- [ ] Copy template files
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Setup database
- [ ] Run migrations

### Testing
- [ ] Test Socket.io connection
- [ ] Test API endpoints
- [ ] Test authentication flow
- [ ] Test real-time notifications
- [ ] Test error handling

### Deployment
- [ ] Build production bundle
- [ ] Deploy to Vercel/Railway
- [ ] Configure environment variables
- [ ] Setup monitoring
- [ ] Configure alerts

---

**Status**: ✅ Templates Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
