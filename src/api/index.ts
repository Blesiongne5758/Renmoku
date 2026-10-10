// ============================================================================
// API INDEX - Central Export Point
// ============================================================================

// Export API client
export { apiClient, default as client } from './client';

// Export mock API handlers (for development)
export { api, authApi, vehiclesApi, bookingsApi, paymentsApi, usersApi, reportsApi } from './mock';

// Export all types
export * from '../types/api';

// ============================================================================
// API USAGE EXAMPLES
// ============================================================================

/*
// Authentication
import { authApi } from '@/api';

// Login
const response = await authApi.login({
  email: 'admin@renmoku.id',
  password: 'demo123'
});

// Register
const response = await authApi.register({
  email: 'newuser@example.com',
  password: 'password123',
  name: 'New User',
  phone: '+6281234567890',
  role: 'individual'
});

// Get current user
const user = await authApi.me();

// Vehicles
import { vehiclesApi } from '@/api';

// List vehicles
const vehicles = await vehiclesApi.list({ page: 1, limit: 10, status: 'available' });

// Get vehicle by ID
const vehicle = await vehiclesApi.getById('vehicle-1');

// Create vehicle
const newVehicle = await vehiclesApi.create({
  brand: 'Toyota',
  model: 'Avanza',
  year: 2023,
  transmission: 'automatic',
  capacity: 7,
  fuelType: 'bensin',
  features: ['AC', 'Power Steering'],
  priceDaily: 350000,
  priceWeekly: 2100000,
  priceMonthly: 7000000,
  hasDriverOption: true,
  driverPriceDaily: 150000,
  location: 'Jakarta',
  images: ['https://...']
});

// Bookings
import { bookingsApi } from '@/api';

// List bookings
const bookings = await bookingsApi.list({ page: 1, limit: 10 });

// Create booking
const booking = await bookingsApi.create({
  vehicleId: 'vehicle-1',
  startDate: '2026-10-12',
  endDate: '2026-10-15',
  durationType: 'daily',
  withDriver: true,
  tripOrigin: 'Jakarta',
  tripDestination: 'Bandung',
  tripPurpose: 'wisata',
  guaranteeType: 'ktp'
});

// Approve booking (owner/admin)
const approved = await bookingsApi.approve('booking-1');

// Payments
import { paymentsApi } from '@/api';

// Create payment
const payment = await paymentsApi.create('booking-1', 750000, 'bank_transfer');

// Users (Admin)
import { usersApi } from '@/api';

// List users
const users = await usersApi.list({ page: 1, limit: 10, role: 'individual' });

// Verify user (KYC)
const verified = await usersApi.verify('user-4', 'verified');

// Reports (Admin)
import { reportsApi } from '@/api';

// Get revenue report
const report = await reportsApi.revenue({
  startDate: '2026-01-01',
  endDate: '2026-10-31',
  groupBy: 'month'
});

// Export report
const exportData = await reportsApi.export('revenue', 'csv', '2026-01-01', '2026-10-31');
*/
