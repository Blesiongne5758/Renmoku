# 🗄️ Renmoku Database Setup Guide

Panduan lengkap untuk setup dan konfigurasi database Renmoku.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd renmoku
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

#### Option A: Menggunakan Prisma (Recommended)

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed database (optional, untuk data contoh)
pnpm prisma db seed
```

#### Option B: Menggunakan SQL Manual

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE renmoku;
\c renmoku

# Import schema
\i database/schema.sql

# Import seed data (optional)
\i database/seed.sql
```

### 4. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env dengan credentials Anda
nano .env
```

**Environment variables penting:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
SENDGRID_API_KEY="your-sendgrid-api-key"
```

### 5. Run Development Server

```bash
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📊 Database Schema Overview

### Core Tables (15 tabel utama)

| Table | Description | Records (Seed) |
|-------|-------------|----------------|
| `users` | Pengguna platform | 9 |
| `individual_profiles` | Profil penyewa pribadi | 3 |
| `corporate_profiles` | Profil penyewa corporate | 1 |
| `owner_profiles` | Profil pemilik armada | 2 |
| `driver_profiles` | Profil driver | 2 |
| `vehicles` | Data kendaraan | 6 |
| `bookings` | Pemesanan | 3 |
| `payments` | Pembayaran | 3 |
| `contracts` | E-Contract | 1 |
| `vehicle_inspections` | Inspeksi kendaraan | 2 |
| `reviews` | Rating & review | 1 |
| `documents` | Upload dokumen | 3 |
| `notifications` | Notifikasi | 2 |
| `maintenance_logs` | Log perawatan | 2 |
| `promotions` | Kode promo | 2 |

### Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  (INDIVIDUAL, CORPORATE, OWNER, ADMIN, DRIVER)              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ INDIVIDUAL │  │ CORPORATE  │  │   OWNER    │  │   DRIVER   │
    │  PROFILES  │  │  PROFILES  │  │  PROFILES  │  │  PROFILES  │
    └────────────┘  └────────────┘  └─────┬──────┘  └────────────┘
                                          │
                                          │ 1:N
                                          ▼
                                   ┌────────────┐
                                   │  VEHICLES  │
                                   └─────┬──────┘
                                         │
                                         │ 1:N
                                         ▼
                                   ┌────────────┐
                                   │  BOOKINGS  │◄───────┐
                                   └─────┬──────┘        │
                                         │               │
                    ┌────────────────────┼───────────────┘
                    │                    │
                    ▼                    ▼
             ┌────────────┐      ┌────────────┐
             │  PAYMENTS  │      │  CONTRACTS │
             └────────────┘      └────────────┘
```

## 🔧 Database Management

### View Database with Prisma Studio

```bash
pnpm prisma studio
```

Akan membuka UI di `http://localhost:5555`

### Reset Database

```bash
# Reset database (WARNING: akan menghapus semua data)
pnpm prisma migrate reset

# Atau manual
psql -U postgres -c "DROP DATABASE renmoku;"
psql -U postgres -c "CREATE DATABASE renmoku;"
pnpm prisma migrate dev
```

### Backup Database

```bash
# Backup ke file
pg_dump -U postgres renmoku > backup_$(date +%Y%m%d).sql

# Restore dari file
psql -U postgres renmoku < backup_20250115.sql
```

### Run SQL Queries

```bash
# Interactive SQL
psql -U postgres -d renmoku

# Execute SQL file
psql -U postgres -d renmoku -f query.sql
```

## 📝 Common Queries

### Get Available Vehicles

```sql
SELECT v.*, o.business_name as owner_name
FROM vehicles v
JOIN owner_profiles o ON v.owner_id = o.id
WHERE v.status = 'AVAILABLE'
  AND v.is_active = TRUE
ORDER BY v.rating DESC;
```

### Get User Bookings with Details

```sql
SELECT 
  b.*,
  v.name as vehicle_name,
  v.brand,
  v.plate_number,
  r.full_name as renter_name,
  d.full_name as driver_name
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN individual_profiles r ON b.renter_id = r.user_id
LEFT JOIN driver_profiles d ON b.driver_id = d.user_id
WHERE b.renter_id = 'user-uuid-here'
ORDER BY b.created_at DESC;
```

### Calculate Monthly Revenue

```sql
SELECT 
  DATE_TRUNC('month', confirmed_at) as month,
  COUNT(*) as total_bookings,
  SUM(total_price) as total_revenue,
  AVG(total_price) as avg_booking_value
FROM bookings
WHERE status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED')
GROUP BY DATE_TRUNC('month', confirmed_at)
ORDER BY month DESC;
```

## 🔐 Security Best Practices

### 1. Use Environment Variables

Jangan pernah hardcode credentials di code:

```typescript
// ❌ BAD
const db = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://user:password@localhost:5432/renmoku' }
  }
});

// ✅ GOOD
const db = new PrismaClient(); // Uses DATABASE_URL from .env
```

### 2. Enable SSL for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/renmoku?sslmode=require"
```

### 3. Use Connection Pooling

Untuk production, gunakan connection pooling:

```env
DATABASE_URL="postgresql://user:password@host:5432/renmoku?connection_limit=10&pool_timeout=10"
```

### 4. Regular Backups

Setup automated backup:

```bash
# Crontab (backup setiap hari jam 2 pagi)
0 2 * * * pg_dump -U postgres renmoku > /backups/renmoku_$(date +\%Y\%m\%d).sql
```

## 🧪 Testing

### Run Database Tests

```bash
# Unit tests
pnpm test

# Integration tests (requires test database)
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Create Test Database

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE renmoku_test;"

# Set environment
export DATABASE_URL="postgresql://user:password@localhost:5432/renmoku_test"

# Run migrations
pnpm prisma migrate dev
```

## 📈 Performance Optimization

### Indexes

Database sudah dilengkapi dengan indexes untuk performa optimal:

```sql
-- Critical indexes
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_vehicles_location_status ON vehicles(location, status);
```

### Query Optimization Tips

1. **Use `select` untuk limit fields:**
```typescript
const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true }
});
```

2. **Pagination dengan cursor:**
```typescript
const bookings = await prisma.booking.findMany({
  take: 20,
  cursor: { id: lastId },
  orderBy: { createdAt: 'desc' }
});
```

3. **Avoid N+1 queries:**
```typescript
// ❌ BAD (N+1 queries)
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: booking.vehicleId }
  });
}

// ✅ GOOD (single query with include)
const bookings = await prisma.booking.findMany({
  include: { vehicle: true }
});
```

## 🐛 Troubleshooting

### Error: "Database connection failed"

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT 1;"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Error: "Migration failed"

```bash
# Reset migrations
pnpm prisma migrate reset

# Or manually
psql -U postgres -d renmoku -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm prisma migrate dev
```

### Error: "Prisma Client not generated"

```bash
# Regenerate Prisma Client
pnpm prisma generate
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.vertabelo.com/blog/database-design-best-practices/)
- [SQL Tutorial](https://www.w3schools.com/sql/)

## 🤝 Support

Untuk pertanyaan tentang database:

- 📧 Email: tech@renmoku.id
- 💬 Discord: [Renmoku Dev Community](https://discord.gg/renmoku)
- 📖 Docs: [https://docs.renmoku.id](https://docs.renmoku.id)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Maintainer**: Renmoku Tech Team
