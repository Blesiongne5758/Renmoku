# 🚀 Renmoku Backend API

Backend API lengkap untuk platform rental mobil Renmoku, dibangun dengan Express.js, TypeScript, PostgreSQL, dan Prisma ORM.

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [API Endpoints](#-api-endpoints)
- [Keamanan](#-keamanan)
- [Database](#-database)
- [Deployment](#-deployment)
- [Testing](#-testing)

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                     │
│                  React + TypeScript                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ JWT Token
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                            │
│              Express.js + Middleware                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  • CORS           • Rate Limiting                 │  │
│  │  • Helmet         • Compression                  │  │
│  │  • Authentication • Validation                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │ Vehicle  │  │ Booking  │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   ▼
        ┌─────────────────────┐
        │   Prisma ORM        │
        └──────────┬──────────┘
                   ▼
        ┌─────────────────────┐
        │   PostgreSQL DB     │
        └─────────────────────┘
```

---

## ✨ Fitur

### 🔐 Autentikasi & Otorisasi
- ✅ JWT-based authentication
- ✅ Refresh token mechanism
- ✅ Role-based access control (RBAC)
- ✅ Multi-role support (Renter, Owner, Admin)
- ✅ Password hashing dengan bcrypt

### 🚗 Manajemen Kendaraan
- ✅ CRUD operations untuk kendaraan
- ✅ Filter & search kendaraan
- ✅ Upload gambar kendaraan
- ✅ Status management (Available, Rented, Maintenance)
- ✅ Owner-specific vehicle management

### 📅 Sistem Booking
- ✅ Booking flow lengkap
- ✅ Kalkulasi harga otomatis
- ✅ Status tracking
- ✅ Owner approval system
- ✅ Conflict detection

### 💳 Pembayaran
- ✅ Multiple payment methods
- ✅ Midtrans integration ready
- ✅ Virtual account generation
- ✅ Payment status tracking
- ✅ Webhook handling

### 📊 Analytics & Reporting
- ✅ Revenue tracking
- ✅ Booking statistics
- ✅ User analytics
- ✅ Export reports (PDF, Excel, CSV)

### 🔔 Real-time Features
- ✅ Socket.io integration
- ✅ Live notifications
- ✅ Booking status updates
- ✅ Payment confirmations

### 🛡️ Keamanan
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation dengan Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF protection ready

### 📈 Performa
- ✅ Compression middleware
- ✅ Database query optimization
- ✅ Caching ready (Redis)
- ✅ Connection pooling
- ✅ Async/await patterns

---

## 🛠 Teknologi

### Core
- **Node.js 18+** - Runtime environment
- **Express.js 4.18** - Web framework
- **TypeScript 5.3** - Type safety
- **Prisma 5.7** - ORM & database toolkit

### Database
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions (optional)

### Security
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Zod** - Schema validation

### File Upload
- **Multer** - File upload handling
- **AWS S3** - Cloud storage (optional)

### Real-time
- **Socket.io 4.8** - WebSocket server

### Payment
- **Midtrans** - Payment gateway integration

### Logging & Monitoring
- **Winston** - Logging framework
- **Morgan** - HTTP request logger

### Email
- **Nodemailer** - Email sending

---

## 📦 Instalasi

### Prerequisites
```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# npm or yarn
npm --version
```

### Setup

1. **Clone repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku"
JWT_SECRET="your-super-secret-key"
PORT=3001
```

4. **Setup database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

5. **Start development server**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

---

## ⚙️ Konfigurasi

### Environment Variables

#### Server
```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
```

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku?schema=public"
```

#### JWT
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d
```

#### CORS
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true
```

#### Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@renmoku.id
```

#### Payment (Midtrans)
```env
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+6281234567890",
  "role": "RENTER",
  "fullName": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "RENTER",
      "status": "VERIFIED"
    }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Vehicles

#### Get All Vehicles
```http
GET /vehicles?status=AVAILABLE&location=Jakarta&page=1&limit=10
```

#### Get Vehicle by ID
```http
GET /vehicles/:id
```

#### Create Vehicle (Owner only)
```http
POST /vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "brand": "Toyota",
  "model": "Alphard",
  "year": 2023,
  "transmission": "AUTOMATIC",
  "capacity": 7,
  "fuelType": "bensin",
  "features": ["Captain Seat", "Panoramic Roof"],
  "priceDaily": 2500000,
  "priceWeekly": 15000000,
  "priceMonthly": 50000000,
  "hasDriverOption": true,
  "driverPriceDaily": 300000,
  "location": "Jakarta",
  "images": ["https://..."]
}
```

#### Update Vehicle
```http
PUT /vehicles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceDaily": 2700000,
  "status": "AVAILABLE"
}
```

#### Delete Vehicle
```http
DELETE /vehicles/:id
Authorization: Bearer <token>
```

### Bookings

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle-123",
  "startDate": "2026-10-20",
  "endDate": "2026-10-25",
  "durationType": "DAILY",
  "withDriver": true,
  "tripOrigin": "Jakarta",
  "tripDestination": "Bandung",
  "tripPurpose": "wisata",
  "guaranteeType": "KTP"
}
```

#### Get My Bookings
```http
GET /bookings/my-bookings
Authorization: Bearer <token>
```

#### Approve Booking (Owner)
```http
POST /bookings/:id/approve
Authorization: Bearer <token>
```

#### Reject Booking (Owner)
```http
POST /bookings/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Vehicle not available"
}
```

### Payments

#### Create Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-123",
  "amount": 5000000,
  "method": "bank_transfer"
}
```

#### Get Payment Status
```http
GET /payments/:id/status
Authorization: Bearer <token>
```

### Users (Admin only)

#### Get All Users
```http
GET /users?page=1&limit=10&role=RENTER
Authorization: Bearer <token>
```

#### Verify User (KYC)
```http
POST /users/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "VERIFIED",
  "notes": "Documents verified"
}
```

### Reports (Admin only)

#### Get Revenue Report
```http
GET /reports/revenue?startDate=2026-01-01&endDate=2026-10-31&groupBy=month
Authorization: Bearer <token>
```

#### Export Report
```http
POST /reports/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "revenue",
  "format": "pdf",
  "startDate": "2026-01-01",
  "endDate": "2026-10-31"
}
```

---

## 🔒 Keamanan

### Authentication Flow
```
1. User login dengan email & password
   ↓
2. Server verify credentials
   ↓
3. Server generate JWT token (7 days)
   ↓
4. Server generate refresh token (30 days)
   ↓
5. Client simpan tokens di localStorage
   ↓
6. Client kirim JWT di header Authorization
   ↓
7. Server verify JWT untuk setiap request
   ↓
8. Jika JWT expired, client gunakan refresh token
   ↓
9. Server generate new JWT & refresh token
```

### Password Security
```typescript
// Hash password dengan bcrypt (12 rounds)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Rate Limiting
```typescript
// General: 100 requests per 15 minutes
// Auth: 5 login attempts per 15 minutes
// API: 60 requests per minute
```

### Security Headers (Helmet)
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Input Validation
```typescript
// Validate dengan Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = schema.parse(req.body);
```

---

## 🗄 Database

### Schema Overview

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(RENTER)
  status    UserStatus @default(PENDING)
  
  renterIndividual RenterIndividual?
  renterCorporate  RenterCorporate?
  fleetOwner       FleetOwner?
  bookings         Booking[]
}

model Vehicle {
  id          String   @id @default(cuid())
  ownerId     String
  brand       String
  model       String
  year        Int
  priceDaily  Float
  status      VehicleStatus @default(AVAILABLE)
  
  owner       FleetOwner @relation(...)
  bookings    Booking[]
}

model Booking {
  id          String   @id @default(cuid())
  renterId    String
  vehicleId   String
  startDate   DateTime
  endDate     DateTime
  totalPrice  Float
  status      BookingStatus @default(PENDING)
  
  renter      User     @relation(...)
  vehicle     Vehicle  @relation(...)
  payments    Payment[]
}

model Payment {
  id          String   @id @default(cuid())
  bookingId   String
  amount      Float
  method      String
  status      PaymentStatus @default(PENDING)
  
  booking     Booking  @relation(...)
}
```

### Migrations
```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Seed Data
```bash
npm run prisma:seed
```

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=strong-production-secret
CORS_ORIGIN=https://renmoku.id
```

### Deployment Platforms

#### Vercel
```bash
npm i -g vercel
vercel
```

#### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

#### AWS EC2
```bash
# Install Node.js & PM2
sudo apt update
sudo apt install nodejs npm
sudo npm install -g pm2

# Clone & setup
git clone <repo>
cd backend
npm install
npm run build

# Start with PM2
pm2 start dist/server.js --name renmoku-api
pm2 save
pm2 startup
```

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Example Test
```typescript
describe('Auth Service', () => {
  it('should register new user', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      phone: '+6281234567890',
      role: 'RENTER',
    };

    const result = await authService.register(input);
    
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(input.email);
  });
});
```

---

## 📊 Monitoring & Logging

### Logs
```
logs/
├── error.log      # Error logs only
├── combined.log   # All logs
└── access.log     # HTTP requests
```

### Log Levels
- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `debug` - Debug information

### Health Check
```http
GET /health

Response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-10-15T10:00:00Z",
  "uptime": 3600
}
```

---

## 📚 Dokumentasi API

### Swagger/OpenAPI
```bash
# Generate API documentation
npm run docs:generate

# View documentation
open docs/swagger.html
```

### Postman Collection
Import `postman_collection.json` ke Postman untuk testing API.

---

## 🤝 Kontribusi

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 Lisensi

MIT License - lihat file [LICENSE](LICENSE)

---

## 📞 Support

- **Email**: backend@renmoku.id
- **Documentation**: https://docs.renmoku.id/api

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: 2026-10-15
