import { Vehicle, Booking } from '../stores/useAppStore';

// === VEHICLE DATA ===
export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Toyota Alphard',
    brand: 'Toyota',
    type: 'luxury',
    year: 2024,
    transmission: 'automatic',
    seats: 7,
    fuel: 'hybrid',
    pricePerDay: 2500000,
    pricePerWeek: 15000000,
    pricePerMonth: 50000000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    ],
    features: ['Captain Seat', 'Power Door', 'Panoramic Roof', 'JBL Sound', '360 Camera'],
    available: true,
    ownerId: 'owner1',
    location: 'Jakarta',
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 'v2',
    name: 'Mercedes-Benz S-Class',
    brand: 'Mercedes-Benz',
    type: 'luxury',
    year: 2024,
    transmission: 'automatic',
    seats: 5,
    fuel: 'hybrid',
    pricePerDay: 5000000,
    pricePerWeek: 30000000,
    pricePerMonth: 100000000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    ],
    features: ['Massage Seat', 'Burmester Sound', 'Night Vision', 'Air Balance', 'Executive Rear'],
    available: true,
    ownerId: 'owner1',
    location: 'Jakarta',
    rating: 5.0,
    reviews: 56,
  },
  {
    id: 'v3',
    name: 'BMW X7',
    brand: 'BMW',
    type: 'suv',
    year: 2024,
    transmission: 'automatic',
    seats: 7,
    fuel: 'diesel',
    pricePerDay: 4000000,
    pricePerWeek: 24000000,
    pricePerMonth: 80000000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    ],
    features: ['Sky Lounge', 'Harman Kardon', 'Air Suspension', 'Head-Up Display', 'Parking Assist'],
    available: true,
    ownerId: 'owner2',
    location: 'Surabaya',
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 'v4',
    name: 'Toyota Fortuner',
    brand: 'Toyota',
    type: 'suv',
    year: 2023,
    transmission: 'automatic',
    seats: 7,
    fuel: 'diesel',
    pricePerDay: 1200000,
    pricePerWeek: 7200000,
    pricePerMonth: 25000000,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    ],
    features: ['4WD', 'Cruise Control', 'Toyota Safety Sense', 'Wireless Charging'],
    available: true,
    ownerId: 'owner2',
    location: 'Bandung',
    rating: 4.7,
    reviews: 234,
  },
  {
    id: 'v5',
    name: 'Honda Civic Type R',
    brand: 'Honda',
    type: 'sport',
    year: 2024,
    transmission: 'manual',
    seats: 5,
    fuel: 'bensin',
    pricePerDay: 2000000,
    pricePerWeek: 12000000,
    pricePerMonth: 40000000,
    image: 'https://images.unsplash.com/photo-1679239872580-81a3be572cbe?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1679239872580-81a3be572cbe?w=800&q=80',
    ],
    features: ['Turbo Engine', 'Brembo Brake', 'Limited Slip Diff', 'Sport Exhaust', 'Rev Match'],
    available: true,
    ownerId: 'owner3',
    location: 'Jakarta',
    rating: 4.9,
    reviews: 67,
  },
  {
    id: 'v6',
    name: 'Mitsubishi Pajero Sport',
    brand: 'Mitsubishi',
    type: 'suv',
    year: 2023,
    transmission: 'automatic',
    seats: 7,
    fuel: 'diesel',
    pricePerDay: 1100000,
    pricePerWeek: 6600000,
    pricePerMonth: 22000000,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    ],
    features: ['Super Select 4WD', 'Adaptive Cruise', 'Rockford Fosgate', 'Power Tailgate'],
    available: true,
    ownerId: 'owner3',
    location: 'Surabaya',
    rating: 4.6,
    reviews: 189,
  },
];

// === BOOKING DATA ===
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    vehicleId: 'v1',
    vehicleName: 'Toyota Alphard',
    renterId: 'renter1',
    renterName: 'Ahmad Wijaya',
    renterType: 'individual',
    rentalType: 'with_driver',
    startDate: '2025-02-01',
    endDate: '2025-02-03',
    duration: 3,
    totalPrice: 7500000,
    dpAmount: 2250000,
    paymentStatus: 'dp_paid',
    bookingStatus: 'confirmed',
    pickupLocation: 'Soekarno-Hatta Airport',
    dropoffLocation: 'Hotel Indonesia Kempinski',
    driverName: 'Pak Budi',
    createdAt: '2025-01-28',
  },
  {
    id: 'b2',
    vehicleId: 'v2',
    vehicleName: 'Mercedes-Benz S-Class',
    renterId: 'renter2',
    renterName: 'PT Maju Bersama',
    renterType: 'corporate',
    rentalType: 'with_driver',
    startDate: '2025-02-05',
    endDate: '2025-02-05',
    duration: 1,
    totalPrice: 5000000,
    dpAmount: 1500000,
    paymentStatus: 'fully_paid',
    bookingStatus: 'active',
    pickupLocation: 'SCBD Office Tower',
    dropoffLocation: 'Bandung',
    driverName: 'Pak Hendra',
    createdAt: '2025-01-30',
  },
  {
    id: 'b3',
    vehicleId: 'v4',
    vehicleName: 'Toyota Fortuner',
    renterId: 'renter3',
    renterName: 'Siti Rahayu',
    renterType: 'individual',
    rentalType: 'self_drive',
    startDate: '2025-01-20',
    endDate: '2025-01-22',
    duration: 3,
    totalPrice: 3600000,
    dpAmount: 1080000,
    paymentStatus: 'fully_paid',
    bookingStatus: 'completed',
    pickupLocation: 'Bandung City',
    dropoffLocation: 'Bandung City',
    createdAt: '2025-01-15',
  },
];

// === LOCATIONS ===
export const locations = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Bali',
  'Yogyakarta',
  'Medan',
  'Makassar',
  'Semarang',
];

// === VEHICLE TYPES ===
export const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'mpv', label: 'MPV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'sport', label: 'Sport' },
];

// === UTILITY FUNCTIONS ===
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateDuration = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const calculatePrice = (vehicle: Vehicle, duration: number): number => {
  if (duration >= 30) {
    const months = Math.ceil(duration / 30);
    return months * vehicle.pricePerMonth;
  }
  if (duration >= 7) {
    const weeks = Math.ceil(duration / 7);
    return weeks * vehicle.pricePerWeek;
  }
  return duration * vehicle.pricePerDay;
};

export const getDurationDiscount = (duration: number): number => {
  if (duration >= 30) return 20; // 20% discount for monthly
  if (duration >= 7) return 10;  // 10% discount for weekly
  return 0;
};
