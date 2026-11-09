import { create } from 'zustand';
import { authService } from '../services/supabaseService';

// === TYPES ===
export type UserRole = 'individual' | 'corporate' | 'owner' | 'admin';
export type RentalType = 'with_driver' | 'self_drive';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'dp_paid' | 'fully_paid' | 'refunded';
export type OwnerSection = 'overview' | 'fleet' | 'bookings' | 'revenue' | 'check' | 'analytics' | 'gps' | 'settings';
export type AdminSection = 'overview' | 'users' | 'vehicles' | 'bookings' | 'verification' | 'payout' | 'dispute' | 'settings' | 'gps';

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
  // 4 sisi foto untuk 360° virtual spin
  sides?: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  has360View?: boolean; // otomatis true jika 4 sisi terupload
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
  ownerSection: OwnerSection;
  adminSection: AdminSection;
  
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
  setOwnerSection: (section: OwnerSection) => void;
  setAdminSection: (section: AdminSection) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; needsEmailConfirmation?: boolean }>;
  restoreSession: () => Promise<void>;
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

const mapAuthUser = (authUser: { id: string; email?: string; phone?: string; user_metadata?: Record<string, unknown> }): User => {
  const metadata = authUser.user_metadata ?? {};
  const accountType = metadata.account_type;
  const role: UserRole = accountType === 'owner' || accountType === 'corporate' ? accountType : 'individual';
  return {
    id: authUser.id,
    name: typeof metadata.full_name === 'string' ? metadata.full_name : (authUser.email?.split('@')[0] ?? 'Pengguna'),
    email: authUser.email ?? '',
    role,
    avatar: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined,
    phone: authUser.phone ?? (typeof metadata.phone === 'string' ? metadata.phone : undefined),
  };
};

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
  ownerSection: 'overview',
  adminSection: 'overview',
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
  setOwnerSection: (ownerSection) => set({ ownerSection }),
  setAdminSection: (adminSection) => set({ adminSection }),
  
  login: async (email: string, password: string) => {
    try {
      const { user } = await authService.login(email.trim().toLowerCase(), password);
      if (!user) return false;
      set({ currentUser: mapAuthUser(user), isAuthenticated: true, authModalOpen: false });
      return true;
    } catch {
      return false;
    }
  },
  
  register: async (data: RegisterData) => {
    try {
      const name = data.role === 'corporate' ? (data.companyName || data.name) : data.name;
      const { user, session } = await authService.register(data.email.trim().toLowerCase(), data.password, {
        full_name: name,
        phone: data.phone,
        role: data.role === 'owner' ? 'OWNER' : 'RENTER',
        account_type: data.role,
        company_name: data.role === 'corporate' ? data.companyName : undefined,
      });
      if (!user) return { success: false };
      if (session) set({ currentUser: mapAuthUser(user), isAuthenticated: true, authModalOpen: false });
      return { success: true, needsEmailConfirmation: !session };
    } catch {
      return { success: false };
    }
  },

  restoreSession: async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) set({ currentUser: mapAuthUser(session.user), isAuthenticated: true });
    } catch {
      // Keep the signed-out state when session restoration is unavailable.
    }
  },
  
  logout: () => {
    void authService.logout().catch(() => undefined);
    set({ currentUser: null, isAuthenticated: false, currentPage: 'home' });
  },
  
  // Booking Actions
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setBookingStep: (step) => set({ bookingStep: step }),
  
  // Owner Settings Actions
  setOwnerSettings: (settings) => set((state) => ({ 
    ownerSettings: { ...state.ownerSettings, ...settings } 
  })),
}));
