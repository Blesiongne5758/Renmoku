import { supabase } from '../lib/supabase';

// ============================================================================
// AUTH SERVICE - Menggunakan Supabase Auth
// ============================================================================

export const authService = {
  // Register new user
  register: async (email: string, password: string, metadata: {
    full_name?: string;
    phone?: string;
    role?: 'RENTER' | 'OWNER' | 'ADMIN';
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    // Create user profile in database
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: metadata.full_name,
          phone: metadata.phone,
          role: metadata.role || 'RENTER',
          status: 'PENDING',
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Logout user
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      return { ...user, profile };
    }

    return null;
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Verify user (Admin only)
  verifyUser: async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// VEHICLE SERVICE - Menggunakan Supabase Database
// ============================================================================

export const vehicleService = {
  // Get all vehicles
  getAll: async (filters?: {
    status?: string;
    location?: string;
    brand?: string;
    ownerId?: string;
  }) => {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        owner:owners(*)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }
    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get vehicle by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        owner:owners(*),
        bookings(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create vehicle
  create: async (vehicleData: any) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update vehicle
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete vehicle
  delete: async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get vehicles by owner
  getByOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// BOOKING SERVICE - Menggunakan Supabase Database
// ============================================================================

export const bookingService = {
  // Get all bookings
  getAll: async (filters?: {
    status?: string;
    renterId?: string;
    vehicleId?: string;
  }) => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        renter:users!renter_id(*),
        vehicle:vehicles(*)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.renterId) {
      query = query.eq('renter_id', filters.renterId);
    }
    if (filters?.vehicleId) {
      query = query.eq('vehicle_id', filters.vehicleId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get booking by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        renter:users!renter_id(*),
        vehicle:vehicles(*),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create booking
  create: async (bookingData: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking status
  updateStatus: async (id: string, status: string, reason?: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Approve booking
  approve: async (id: string) => {
    return bookingService.updateStatus(id, 'CONFIRMED');
  },

  // Reject booking
  reject: async (id: string, reason: string) => {
    return bookingService.updateStatus(id, 'CANCELLED', reason);
  },

  // Get bookings by renter
  getByRenter: async (renterId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(*)
      `)
      .eq('renter_id', renterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get bookings by vehicle owner
  getByVehicleOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        renter:users!renter_id(*),
        vehicle:vehicles!vehicle_id(*)
      `)
      .eq('vehicle.owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// PAYMENT SERVICE - Menggunakan Supabase Database
// ============================================================================

export const paymentService = {
  // Create payment
  create: async (paymentData: any) => {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get payment by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status
  updateStatus: async (id: string, status: string, transactionId?: string) => {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (transactionId) {
      updates.transaction_id = transactionId;
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get payments by booking
  getByBooking: async (bookingId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get payments by user
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// OWNER SERVICE - Menggunakan Supabase Database
// ============================================================================

export const ownerService = {
  // Get owner by user ID
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        *,
        user:users(*),
        vehicles(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create owner profile
  create: async (ownerData: any) => {
    const { data, error } = await supabase
      .from('owners')
      .insert(ownerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update owner profile
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('owners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all owners
  getAll: async () => {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// REPORT SERVICE - Analytics & Reports
// ============================================================================

export const reportService = {
  // Get revenue report
  getRevenueReport: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        total_price,
        created_at,
        status
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('status', ['CONFIRMED', 'ACTIVE', 'COMPLETED']);

    if (error) throw error;

    // Calculate totals
    const totalRevenue = data.reduce((sum, booking) => sum + booking.total_price, 0);
    const totalBookings = data.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalRevenue,
      totalBookings,
      averageBookingValue,
      bookings: data,
    };
  },

  // Get booking statistics
  getBookingStats: async (ownerId?: string) => {
    let query = supabase
      .from('bookings')
      .select('status, created_at');

    if (ownerId) {
      query = query.eq('vehicle.owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter(b => b.status === 'PENDING').length,
      confirmed: data.filter(b => b.status === 'CONFIRMED').length,
      active: data.filter(b => b.status === 'ACTIVE').length,
      completed: data.filter(b => b.status === 'COMPLETED').length,
      cancelled: data.filter(b => b.status === 'CANCELLED').length,
    };

    return stats;
  },

  // Get user statistics
  getUserStats: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('role, status, created_at');

    if (error) throw error;

    const stats = {
      total: data.length,
      renters: data.filter(u => u.role === 'RENTER').length,
      owners: data.filter(u => u.role === 'OWNER').length,
      admins: data.filter(u => u.role === 'ADMIN').length,
      verified: data.filter(u => u.status === 'VERIFIED').length,
      pending: data.filter(u => u.status === 'PENDING').length,
    };

    return stats;
  },
};

export default {
  auth: authService,
  vehicle: vehicleService,
  booking: bookingService,
  payment: paymentService,
  owner: ownerService,
  report: reportService,
};
