// ============================================================================
// MOCK API HANDLERS - Simulated Backend for Development
// ============================================================================
// This file provides mock implementations of all API endpoints for development
// In production, these would be replaced with real API calls to the backend
// ============================================================================

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MeResponse,
  Vehicle,
  VehiclesListResponse,
  VehicleResponse,
  CreateVehicleRequest,
  Booking,
  BookingsListResponse,
  BookingResponse,
  CreateBookingRequest,
  Payment,
  PaymentsListResponse,
  PaymentResponse,
  User,
  UsersListResponse,
  UserResponse,
  RevenueReport,
  RevenueReportRequest,
  ExportReportResponse,
} from '../types/api';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@renmoku.id',
    phone: '+6281234567890',
    name: 'Super Admin',
    role: 'admin',
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'owner@renmoku.id',
    phone: '+6281234567891',
    name: "John's Rental",
    role: 'owner',
    status: 'verified',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'ahmad@example.com',
    phone: '+6281234567892',
    name: 'Ahmad Sudirman',
    role: 'individual',
    status: 'verified',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-4',
    email: 'budi@example.com',
    phone: '+6281234567893',
    name: 'Budi Pratama',
    role: 'individual',
    status: 'pending',
    createdAt: '2024-10-10T00:00:00Z',
    updatedAt: '2024-10-10T00:00:00Z',
  },
];

const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    ownerId: 'user-2',
    brand: 'Toyota',
    model: 'Alphard',
    year: 2023,
    transmission: 'automatic',
    capacity: 7,
    fuelType: 'bensin',
    features: ['Captain Seat', 'Panoramic Roof', 'JBL Sound', '360 Camera'],
    priceDaily: 2500000,
    priceWeekly: 15000000,
    priceMonthly: 50000000,
    hasDriverOption: true,
    driverPriceDaily: 300000,
    status: 'available',
    location: 'Jakarta',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'vehicle-2',
    ownerId: 'user-2',
    brand: 'Honda',
    model: 'HR-V',
    year: 2023,
    transmission: 'automatic',
    capacity: 5,
    fuelType: 'bensin',
    features: ['Honda Sensing', 'Sunroof', 'Leather Seat'],
    priceDaily: 450000,
    priceWeekly: 2700000,
    priceMonthly: 9000000,
    hasDriverOption: true,
    driverPriceDaily: 200000,
    status: 'available',
    location: 'Jakarta',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    renterId: 'user-3',
    vehicleId: 'vehicle-1',
    startDate: '2026-10-12',
    endDate: '2026-10-15',
    durationType: 'daily',
    withDriver: true,
    totalPrice: 1500000,
    dpAmount: 750000,
    tripOrigin: 'Jakarta',
    tripDestination: 'Bandung',
    tripPurpose: 'wisata',
    guaranteeType: 'ktp',
    status: 'pending',
    contractSigned: false,
    createdAt: '2026-10-10T00:00:00Z',
    updatedAt: '2026-10-10T00:00:00Z',
  },
  {
    id: 'booking-2',
    renterId: 'user-3',
    vehicleId: 'vehicle-2',
    startDate: '2026-10-13',
    endDate: '2026-10-17',
    durationType: 'daily',
    withDriver: false,
    totalPrice: 2200000,
    dpAmount: 1100000,
    tripOrigin: 'Jakarta',
    tripDestination: 'Bogor',
    tripPurpose: 'bisnis',
    guaranteeType: 'bpkb',
    status: 'confirmed',
    contractSigned: true,
    createdAt: '2026-10-09T00:00:00Z',
    updatedAt: '2026-10-09T00:00:00Z',
  },
];

const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    bookingId: 'booking-1',
    userId: 'user-3',
    type: 'dp',
    amount: 750000,
    method: 'bank_transfer',
    status: 'pending',
    createdAt: '2026-10-10T00:00:00Z',
    updatedAt: '2026-10-10T00:00:00Z',
  },
  {
    id: 'payment-2',
    bookingId: 'booking-2',
    userId: 'user-3',
    type: 'dp',
    amount: 1100000,
    method: 'ewallet',
    status: 'paid',
    transactionId: 'TRX-123456',
    paidAt: '2026-10-09T10:00:00Z',
    createdAt: '2026-10-09T00:00:00Z',
    updatedAt: '2026-10-09T10:00:00Z',
  },
];

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === data.email);
    
    // Demo credentials
    if (data.email === 'admin@renmoku.id' && data.password === 'demo123') {
      return {
        success: true,
        token: 'mock-jwt-token-admin',
        user: {
          id: 'user-1',
          email: 'admin@renmoku.id',
          name: 'Super Admin',
          role: 'admin',
        },
      };
    }
    
    if (data.email === 'owner@renmoku.id' && data.password === 'demo123') {
      return {
        success: true,
        token: 'mock-jwt-token-owner',
        user: {
          id: 'user-2',
          email: 'owner@renmoku.id',
          name: "John's Rental",
          role: 'owner',
        },
      };
    }
    
    if (data.email === 'renter@renmoku.id' && data.password === 'demo123') {
      return {
        success: true,
        token: 'mock-jwt-token-renter',
        user: {
          id: 'user-3',
          email: 'renter@renmoku.id',
          name: 'Ahmad Sudirman',
          role: 'individual',
        },
      };
    }
    
    throw new Error('Invalid credentials');
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    await delay(800);
    
    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: `user-${Date.now()}`,
    };
  },

  async me(): Promise<MeResponse> {
    await delay(300);
    
    const token = localStorage.getItem('auth_token');
    
    if (token === 'mock-jwt-token-admin') {
      return {
        id: 'user-1',
        email: 'admin@renmoku.id',
        name: 'Super Admin',
        role: 'admin',
        status: 'verified',
        createdAt: '2024-01-01T00:00:00Z',
      };
    }
    
    if (token === 'mock-jwt-token-owner') {
      return {
        id: 'user-2',
        email: 'owner@renmoku.id',
        name: "John's Rental",
        role: 'owner',
        status: 'verified',
        createdAt: '2024-01-15T00:00:00Z',
      };
    }
    
    if (token === 'mock-jwt-token-renter') {
      return {
        id: 'user-3',
        email: 'renter@renmoku.id',
        name: 'Ahmad Sudirman',
        role: 'individual',
        status: 'verified',
        createdAt: '2024-02-01T00:00:00Z',
      };
    }
    
    throw new Error('Not authenticated');
  },

  async logout(): Promise<{ success: boolean }> {
    await delay(200);
    localStorage.removeItem('auth_token');
    return { success: true };
  },
};

// ============================================================================
// VEHICLES API
// ============================================================================

export const vehiclesApi = {
  async list(params?: { page?: number; limit?: number; status?: string }): Promise<VehiclesListResponse> {
    await delay(400);
    
    let filtered = [...mockVehicles];
    
    if (params?.status) {
      filtered = filtered.filter(v => v.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      success: true,
      data: paginated,
      total: filtered.length,
      page,
      limit,
    };
  },

  async getById(id: string): Promise<VehicleResponse> {
    await delay(300);
    
    const vehicle = mockVehicles.find(v => v.id === id);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return {
      success: true,
      data: vehicle,
    };
  },

  async create(data: CreateVehicleRequest): Promise<VehicleResponse> {
    await delay(600);
    
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      ownerId: 'user-2', // Current user (owner)
      ...data,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockVehicles.push(newVehicle);
    
    return {
      success: true,
      data: newVehicle,
    };
  },

  async update(id: string, data: Partial<CreateVehicleRequest>): Promise<VehicleResponse> {
    await delay(500);
    
    const index = mockVehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    mockVehicles[index] = {
      ...mockVehicles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockVehicles[index],
    };
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    
    const index = mockVehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    mockVehicles.splice(index, 1);
    
    return {
      success: true,
      message: 'Vehicle deleted successfully',
    };
  },
};

// ============================================================================
// BOOKINGS API
// ============================================================================

export const bookingsApi = {
  async list(params?: { page?: number; limit?: number; status?: string }): Promise<BookingsListResponse> {
    await delay(400);
    
    let filtered = [...mockBookings];
    
    if (params?.status) {
      filtered = filtered.filter(b => b.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      success: true,
      data: paginated,
      total: filtered.length,
      page,
      limit,
    };
  },

  async getById(id: string): Promise<BookingResponse> {
    await delay(300);
    
    const booking = mockBookings.find(b => b.id === id);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return {
      success: true,
      data: booking,
    };
  },

  async create(data: CreateBookingRequest): Promise<BookingResponse> {
    await delay(600);
    
    const vehicle = mockVehicles.find(v => v.id === data.vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      renterId: 'user-3', // Current user
      ...data,
      totalPrice: vehicle.priceDaily * 3, // Simplified calculation
      dpAmount: vehicle.priceDaily * 3 * 0.5,
      status: 'pending',
      contractSigned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockBookings.push(newBooking);
    
    return {
      success: true,
      data: newBooking,
    };
  },

  async updateStatus(id: string, status: string, reason?: string): Promise<BookingResponse> {
    await delay(500);
    
    const index = mockBookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    mockBookings[index] = {
      ...mockBookings[index],
      status: status as any,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockBookings[index],
    };
  },

  async approve(id: string): Promise<{ success: boolean; message: string; booking: Booking }> {
    await delay(500);
    
    const index = mockBookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    mockBookings[index] = {
      ...mockBookings[index],
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Booking approved successfully',
      booking: mockBookings[index],
    };
  },

  async reject(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = mockBookings.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    mockBookings[index] = {
      ...mockBookings[index],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: `Booking rejected: ${reason}`,
    };
  },
};

// ============================================================================
// PAYMENTS API
// ============================================================================

export const paymentsApi = {
  async list(params?: { bookingId?: string }): Promise<PaymentsListResponse> {
    await delay(400);
    
    let filtered = [...mockPayments];
    
    if (params?.bookingId) {
      filtered = filtered.filter(p => p.bookingId === params.bookingId);
    }
    
    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  },

  async create(bookingId: string, amount: number, method: string): Promise<PaymentResponse> {
    await delay(600);
    
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      bookingId,
      userId: 'user-3',
      type: 'dp',
      amount,
      method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockPayments.push(newPayment);
    
    return {
      success: true,
      data: newPayment,
      paymentUrl: 'https://payment-gateway.example.com/pay/123456',
    };
  },

  async callback(data: any): Promise<{ success: boolean; message: string }> {
    await delay(300);
    
    // Simulate payment gateway callback
    const payment = mockPayments.find(p => p.transactionId === data.transactionId);
    
    if (payment) {
      payment.status = data.status === 'success' ? 'paid' : 'failed';
      payment.updatedAt = new Date().toISOString();
    }
    
    return {
      success: true,
      message: 'Callback processed',
    };
  },
};

// ============================================================================
// USERS API
// ============================================================================

export const usersApi = {
  async list(params?: { page?: number; limit?: number; role?: string; status?: string }): Promise<UsersListResponse> {
    await delay(400);
    
    let filtered = [...mockUsers];
    
    if (params?.role) {
      filtered = filtered.filter(u => u.role === params.role);
    }
    
    if (params?.status) {
      filtered = filtered.filter(u => u.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      success: true,
      data: paginated,
      total: filtered.length,
      page,
      limit,
    };
  },

  async getById(id: string): Promise<UserResponse> {
    await delay(300);
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: user,
    };
  },

  async verify(id: string, status: 'verified' | 'rejected', reason?: string): Promise<{ success: boolean; message: string; user: User }> {
    await delay(500);
    
    const index = mockUsers.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[index] = {
      ...mockUsers[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: status === 'verified' ? 'User verified successfully' : `User rejected: ${reason}`,
      user: mockUsers[index],
    };
  },
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsApi = {
  async revenue(params: RevenueReportRequest): Promise<RevenueReport> {
    await delay(600);
    
    // Generate mock revenue data
    const breakdown = [];
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalRevenue = 0;
    let totalBookings = 0;
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const revenue = Math.floor(Math.random() * 5000000) + 1000000;
      const bookings = Math.floor(Math.random() * 10) + 1;
      
      breakdown.push({
        date: date.toISOString().split('T')[0],
        revenue,
        bookings,
      });
      
      totalRevenue += revenue;
      totalBookings += bookings;
    }
    
    return {
      period: `${params.startDate} to ${params.endDate}`,
      totalRevenue,
      totalBookings,
      totalCommission: totalRevenue * 0.125,
      averageBookingValue: totalRevenue / totalBookings,
      growthRate: 18.5,
      breakdown,
    };
  },

  async export(type: string, format: string, startDate?: string, endDate?: string): Promise<ExportReportResponse> {
    await delay(800);
    
    // Simulate export generation
    return {
      success: true,
      downloadUrl: `https://api.renmoku.id/exports/${type}-${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const api = {
  auth: authApi,
  vehicles: vehiclesApi,
  bookings: bookingsApi,
  payments: paymentsApi,
  users: usersApi,
  reports: reportsApi,
};

export default api;
