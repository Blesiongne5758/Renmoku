import { create } from 'zustand';

interface BookingState {
  // Step tracking
  currentStep: number;
  
  // Booking data
  vehicleId: string | null;
  durationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  withDriver: boolean;
  startDate: string | null;
  endDate: string | null;
  
  // Renter info
  renterInfo: {
    fullName: string;
    ktpNumber: string;
    simNumber: string;
    address: string;
    phone: string;
    email: string;
  };
  
  // Trip plan
  tripPlan: {
    origin: string;
    destination: string;
    purpose: string;
  };
  
  // Guarantee
  guaranteeType: 'KTP' | 'BPKB' | 'CASH' | 'GUARANTEE_LETTER' | null;
  guaranteeDocs: string[];
  
  // Pricing
  totalPrice: number;
  dpAmount: number;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setVehicle: (vehicleId: string) => void;
  setDuration: (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', withDriver: boolean) => void;
  setDates: (startDate: string, endDate: string) => void;
  setRenterInfo: (info: Partial<BookingState['renterInfo']>) => void;
  setTripPlan: (plan: Partial<BookingState['tripPlan']>) => void;
  setGuarantee: (type: BookingState['guaranteeType'], docs: string[]) => void;
  calculatePricing: (dailyPrice: number, weeklyPrice: number, monthlyPrice: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentStep: 1,
  vehicleId: null,
  durationType: null,
  withDriver: false,
  startDate: null,
  endDate: null,
  renterInfo: {
    fullName: '',
    ktpNumber: '',
    simNumber: '',
    address: '',
    phone: '',
    email: '',
  },
  tripPlan: {
    origin: '',
    destination: '',
    purpose: '',
  },
  guaranteeType: null,
  guaranteeDocs: [],
  totalPrice: 0,
  dpAmount: 0,

  setCurrentStep: (step) => set({ currentStep: step }),
  
  setVehicle: (vehicleId) => set({ vehicleId }),
  
  setDuration: (type, withDriver) => 
    set({ durationType: type, withDriver }),
  
  setDates: (startDate, endDate) => 
    set({ startDate, endDate }),
  
  setRenterInfo: (info) => 
    set((state) => ({ 
      renterInfo: { ...state.renterInfo, ...info } 
    })),
  
  setTripPlan: (plan) => 
    set((state) => ({ 
      tripPlan: { ...state.tripPlan, ...plan } 
    })),
  
  setGuarantee: (type, docs) => 
    set({ guaranteeType: type, guaranteeDocs: docs }),
  
  calculatePricing: (dailyPrice, weeklyPrice, monthlyPrice) => {
    const { durationType, withDriver, startDate, endDate } = get();
    
    if (!durationType || !startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let basePrice = 0;
    
    if (durationType === 'DAILY') {
      basePrice = days * dailyPrice;
    } else if (durationType === 'WEEKLY') {
      const weeks = Math.ceil(days / 7);
      basePrice = weeks * weeklyPrice;
    } else if (durationType === 'MONTHLY') {
      const months = Math.ceil(days / 30);
      basePrice = months * monthlyPrice;
    }
    
    const driverCost = withDriver ? days * 150000 : 0;
    const totalPrice = basePrice + driverCost;
    const dpAmount = totalPrice * 0.5;
    
    set({ totalPrice, dpAmount });
  },
  
  reset: () => 
    set({
      currentStep: 1,
      vehicleId: null,
      durationType: null,
      withDriver: false,
      startDate: null,
      endDate: null,
      renterInfo: {
        fullName: '',
        ktpNumber: '',
        simNumber: '',
        address: '',
        phone: '',
        email: '',
      },
      tripPlan: {
        origin: '',
        destination: '',
        purpose: '',
      },
      guaranteeType: null,
      guaranteeDocs: [],
      totalPrice: 0,
      dpAmount: 0,
    }),
}));
