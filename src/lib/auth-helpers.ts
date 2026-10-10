// ============================================================================
// AUTHENTICATION & AUTHORIZATION HELPERS
// ============================================================================
// Frontend auth helpers untuk Renmoku platform
// ============================================================================

export type UserRole = 'RENTER' | 'OWNER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  avatar?: string;
  phone?: string;
  renterIndividual?: any;
  renterCorporate?: any;
  fleetOwner?: any;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'RENTER' | 'OWNER' | 'ADMIN';
  renterType?: 'individual' | 'corporate';
  // Individual fields
  ktpNumber?: string;
  simNumber?: string;
  address?: string;
  // Corporate fields
  companyName?: string;
  nib?: string;
  npwp?: string;
  picName?: string;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Get authentication token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set authentication token to localStorage
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * Set current user to localStorage
 */
export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ============================================================================
// AUTHENTICATION CHECKS
// ============================================================================

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: UserRole[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user is verified
 */
export function isVerified(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.status === 'VERIFIED';
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if user can access a specific resource
 */
export function canAccess(requiredRoles: UserRole[]): boolean {
  return hasAnyRole(requiredRoles);
}

/**
 * Check if user can perform a specific action
 */
export function canPerform(action: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const permissions: Record<string, UserRole[]> = {
    'create_booking': ['RENTER'],
    'view_bookings': ['RENTER', 'OWNER', 'ADMIN'],
    'approve_booking': ['OWNER', 'ADMIN'],
    'reject_booking': ['OWNER', 'ADMIN'],
    'manage_vehicles': ['OWNER', 'ADMIN'],
    'view_users': ['ADMIN'],
    'manage_users': ['ADMIN'],
    'view_reports': ['ADMIN'],
    'export_data': ['OWNER', 'ADMIN'],
    'verify_kyc': ['ADMIN'],
  };

  const allowedRoles = permissions[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(user.role);
}

/**
 * Get user's accessible routes based on role
 */
export function getAccessibleRoutes(): string[] {
  const user = getCurrentUser();
  if (!user) return ['/login', '/register'];

  const routes: Record<UserRole, string[]> = {
    RENTER: [
      '/',
      '/fleet',
      '/bookings',
      '/bookings/new',
      '/profile',
      '/dashboard',
    ],
    OWNER: [
      '/',
      '/fleet',
      '/dashboard',
      '/vehicles',
      '/vehicles/new',
      '/bookings',
      '/revenue',
      '/profile',
    ],
    ADMIN: [
      '/',
      '/dashboard',
      '/admin',
      '/admin/users',
      '/admin/bookings',
      '/admin/vehicles',
      '/admin/reports',
      '/admin/settings',
      '/profile',
    ],
  };

  return routes[user.role] || [];
}

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized - Please login');
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new Error('Forbidden - Insufficient permissions');
  }

  return response;
}

// ============================================================================
// LOGIN / LOGOUT
// ============================================================================

/**
 * Login user and store credentials
 */
export async function login(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed',
      };
    }

    // Store token and user
    setToken(data.token);
    setCurrentUser(data.user);

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error - Please try again',
    };
  }
}

/**
 * Logout user and clear credentials
 */
export function logout(): void {
  removeToken();
  window.location.href = '/login';
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Registration failed',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Network error - Please try again',
    };
  }
}

// ============================================================================
// PROTECTED ROUTE HELPER
// ============================================================================

/**
 * Check if user can access a route
 */
export function canAccessRoute(path: string): boolean {
  const accessibleRoutes = getAccessibleRoutes();
  return accessibleRoutes.includes(path);
}

/**
 * Redirect user if not authenticated
 */
export function requireAuth(redirectPath: string = '/login'): void {
  if (!isAuthenticated()) {
    window.location.href = redirectPath;
  }
}

/**
 * Redirect user if not authorized
 */
export function requireRole(role: UserRole, redirectPath: string = '/'): void {
  if (!hasRole(role)) {
    window.location.href = redirectPath;
  }
}

/**
 * Redirect user if doesn't have any of the required roles
 */
export function requireAnyRole(roles: UserRole[], redirectPath: string = '/'): void {
  if (!hasAnyRole(roles)) {
    window.location.href = redirectPath;
  }
}

// ============================================================================
// USER DATA HELPERS
// ============================================================================

/**
 * Get user's display name
 */
export function getUserDisplayName(): string {
  const user = getCurrentUser();
  if (!user) return 'Guest';

  if (user.renterIndividual?.fullName) {
    return user.renterIndividual.fullName;
  }

  if (user.renterCorporate?.companyName) {
    return user.renterCorporate.companyName;
  }

  if (user.fleetOwner?.businessName) {
    return user.fleetOwner.businessName;
  }

  return user.name || user.email;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(): string {
  const user = getCurrentUser();
  if (!user) return 'Unknown';

  const roleNames: Record<UserRole, string> = {
    RENTER: 'Penyewa',
    OWNER: 'Pemilik Rental',
    ADMIN: 'Administrator',
  };

  return roleNames[user.role];
}

/**
 * Get user's avatar or initials
 */
export function getUserAvatar(): string {
  const user = getCurrentUser();
  if (!user) return '';

  if (user.avatar) {
    return user.avatar;
  }

  // Generate initials
  const name = getUserDisplayName();
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${initials}&background=D4AF37&color=000`;
}
