// ============================================================================
// API TYPES - Request & Response Definitions
// ============================================================================

// ============================================================================
// AUTH API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'individual' | 'corporate' | 'owner' | 'admin';
    avatar?: string;
    phone?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'individual' | 'corporate' | 'owner';
  // Individual fields
  ktpNumber?: string;
  simNumber?: string;
  // Corporate fields
  companyName?: string;
  nib?: string;
  npwp?: string;
  picName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: 'individual' | 'corporate' | 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

// ============================================================================
// VEHICLES API
// ============================================================================

export interface Vehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  transmission: 'manual' | 'automatic';
  capacity: number;
  fuelType: string;
  features: string[];
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  hasDriverOption: boolean;
  driverPriceDaily?: number;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  location: string;
  images: string[];
  model3D?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  transmission: 'manual' | 'automatic';
  capacity: number;
  fuelType: string;
  features: string[];
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  hasDriverOption: boolean;
  driverPriceDaily?: number;
  location: string;
  images: string[];
  model3D?: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  status?: 'available' | 'rented' | 'maintenance' | 'inactive';
}

export interface VehiclesListResponse {
  success: boolean;
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehicleResponse {
  success: boolean;
  data: Vehicle;
}

// ============================================================================
// BOOKINGS API
// ============================================================================

export interface Booking {
  id: string;
  renterId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  durationType: 'daily' | 'weekly' | 'monthly';
  withDriver: boolean;
  totalPrice: number;
  dpAmount: number;
  tripOrigin: string;
  tripDestination: string;
  tripPurpose: string;
  guaranteeType: 'ktp' | 'bpkb' | 'cash' | 'guarantee_letter';
  guaranteeDoc?: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  contractSigned: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  renter?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle?: Vehicle;
  payments?: Payment[];
}

export interface CreateBookingRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
  durationType: 'daily' | 'weekly' | 'monthly';
  withDriver: boolean;
  tripOrigin: string;
  tripDestination: string;
  tripPurpose: string;
  guaranteeType: 'ktp' | 'bpkb' | 'cash' | 'guarantee_letter';
  guaranteeDoc?: string;
}

export interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  reason?: string;
}

export interface BookingsListResponse {
  success: boolean;
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
}

export interface ApproveBookingResponse {
  success: boolean;
  message: string;
  booking: Booking;
}

// ============================================================================
// PAYMENTS API
// ============================================================================

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  type: 'dp' | 'full_payment';
  amount: number;
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  type: 'dp' | 'full_payment';
  amount: number;
  method: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
  paymentUrl?: string; // For payment gateway redirect
}

export interface PaymentsListResponse {
  success: boolean;
  data: Payment[];
  total: number;
}

export interface PaymentCallbackRequest {
  transactionId: string;
  status: 'success' | 'pending' | 'failed' | 'refund';
  amount: number;
  paymentType: string;
  orderId: string;
}

export interface PaymentCallbackResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// USERS API
// ============================================================================

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'individual' | 'corporate' | 'owner' | 'admin';
  status: 'pending' | 'verified' | 'rejected';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface VerifyUserRequest {
  status: 'verified' | 'rejected';
  reason?: string;
  notes?: string;
}

export interface VerifyUserResponse {
  success: boolean;
  message: string;
  user: User;
}

// ============================================================================
// REPORTS API
// ============================================================================

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalBookings: number;
  totalCommission: number;
  averageBookingValue: number;
  growthRate: number;
  breakdown: {
    date: string;
    revenue: number;
    bookings: number;
  }[];
}

export interface RevenueReportRequest {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
}

export interface ExportReportRequest {
  type: 'revenue' | 'bookings' | 'users' | 'vehicles';
  format: 'csv' | 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
}

export interface ExportReportResponse {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
}
