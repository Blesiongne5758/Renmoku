import { create } from 'zustand';

// === TYPES ===
export type UserRole = 'individual' | 'corporate' | 'owner' | 'admin';
export type RentalType = 'with_driver' | 'self_drive';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'dp_paid' | 'fully_paid' | 'refunded';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  type: 'sedan' | 'suv' | 'mpv' | 'luxury' | 'sport';
  year: number;
  transmission: 'automatic' | 'manual';
  seats: number;
  fuel: 'bensin' | 'diesel' | 'hybrid' | 'electric';
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  image: string;
  images: string[];
  features: string[];
  available: boolean;
  ownerId: string;
  location: string;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  renterId: string;
  renterName: string;
  renterType: UserRole;
  rentalType: RentalType;
  startDate: string;
  endDate: string;
  duration: number;
  totalPrice: number;
  dpAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  pickupLocation: string;
  dropoffLocation: string;
  driverName?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

// === APP STORE ===
interface AppState {
  // UI State
  currentPage: string;
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  selectedVehicle: Vehicle | null;
  showBookingModal: boolean;
  
  // Search & Filter
  searchFilters: {
    location: string;
    startDate: string;
    endDate: string;
    vehicleType: string;
    transmission: string;
    priceRange: [number, number];
    rentalType: RentalType | '';
  };
  
  // Auth
  currentUser: User | null;
  
  // Booking
  currentBooking: Partial<Booking> | null;
  bookingStep: number;
  
  // Actions
  setCurrentPage: (page: string) => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setShowBookingModal: (show: boolean) => void;
  setSearchFilters: (filters: Partial<AppState['searchFilters']>) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentBooking: (booking: Partial<Booking> | null) => void;
  setBookingStep: (step: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  isMenuOpen: false,
  isSearchOpen: false,
  selectedVehicle: null,
  showBookingModal: false,
  searchFilters: {
    location: '',
    startDate: '',
    endDate: '',
    vehicleType: '',
    transmission: '',
    priceRange: [0, 5000000],
    rentalType: '',
  },
  currentUser: null,
  currentBooking: null,
  bookingStep: 0,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setShowBookingModal: (show) => set({ showBookingModal: show }),
  setSearchFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters } 
  })),
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setBookingStep: (step) => set({ bookingStep: step }),
}));
