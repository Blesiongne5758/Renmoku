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
  dpPercentage: number;
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
  isAuthenticated: boolean;
  authModalOpen: boolean;
  authMode: 'login' | 'register';
  
  // Booking
  currentBooking: Partial<Booking> | null;
  bookingStep: number;
  
  // Owner Settings
  ownerSettings: {
    defaultDpPercentage: number;
    minDpPercentage: number;
    maxDpPercentage: number;
  };
  
  // Actions
  setCurrentPage: (page: string) => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setShowBookingModal: (show: boolean) => void;
  setSearchFilters: (filters: Partial<AppState['searchFilters']>) => void;
  
  // Auth Actions
  setCurrentUser: (user: User | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  
  // Booking Actions
  setCurrentBooking: (booking: Partial<Booking> | null) => void;
  setBookingStep: (step: number) => void;
  
  // Owner Settings Actions
  setOwnerSettings: (settings: Partial<AppState['ownerSettings']>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'individual' | 'corporate' | 'owner';
  companyName?: string;
  nib?: string;
  npwp?: string;
}

export const useAppStore = create<AppState>((set, get) => ({
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
  isAuthenticated: false,
  authModalOpen: false,
  authMode: 'login',
  currentBooking: null,
  bookingStep: 0,
  ownerSettings: {
    defaultDpPercentage: 30,
    minDpPercentage: 20,
    maxDpPercentage: 50,
  },
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setShowBookingModal: (show) => set({ showBookingModal: show }),
  setSearchFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters } 
  })),
  
  // Auth Actions
  setCurrentUser: (user) => set({ 
    currentUser: user, 
    isAuthenticated: !!user,
    authModalOpen: false,
  }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthMode: (mode) => set({ authMode: mode }),
  
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo credentials
    const demoUsers: Record<string, User> = {
      'renter@renmoku.id': {
        id: 'u1',
        name: 'Ahmad Wijaya',
        email: 'renter@renmoku.id',
        role: 'individual',
        phone: '+62 812-1234-5678',
      },
      'corporate@renmoku.id': {
        id: 'u2',
        name: 'PT Maju Bersama',
        email: 'corporate@renmoku.id',
        role: 'corporate',
        phone: '+62 21-5555-6666',
      },
      'owner@renmoku.id': {
        id: 'u3',
        name: 'Budi Santoso Fleet',
        email: 'owner@renmoku.id',
        role: 'owner',
        phone: '+62 815-4567-8901',
      },
      'admin@renmoku.id': {
        id: 'u4',
        name: 'Admin Renmoku',
        email: 'admin@renmoku.id',
        role: 'admin',
        phone: '+62 811-0000-0000',
      },
    };
    
    const user = demoUsers[email];
    if (user && password === 'demo123') {
      set({ 
        currentUser: user, 
        isAuthenticated: true,
        authModalOpen: false,
      });
      return true;
    }
    return false;
  },
  
  register: async (data: RegisterData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.role === 'corporate' ? (data.companyName || data.name) : data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    };
    
    set({ 
      currentUser: newUser, 
      isAuthenticated: true,
      authModalOpen: false,
    });
    return true;
  },
  
  logout: () => set({ 
    currentUser: null, 
    isAuthenticated: false,
    currentPage: 'home',
  }),
  
  // Booking Actions
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setBookingStep: (step) => set({ bookingStep: step }),
  
  // Owner Settings Actions
  setOwnerSettings: (settings) => set((state) => ({ 
    ownerSettings: { ...state.ownerSettings, ...settings } 
  })),
}));
