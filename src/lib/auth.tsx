// ============================================================================
// AUTHENTICATION & AUTHORIZATION UTILITIES
// ============================================================================
// Client-side auth utilities untuk Vite + React
// ============================================================================

import { useAppStore } from '../stores/useAppStore';
import React from 'react';

export type UserRole = 'RENTER' | 'OWNER' | 'ADMIN';

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get current authenticated user
 */
export function getAuthenticatedUser() {
  const { currentUser, isAuthenticated } = useAppStore.getState();
  
  if (!isAuthenticated || !currentUser) {
    return null;
  }
  
  return currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { isAuthenticated } = useAppStore.getState();
  return isAuthenticated;
}

/**
 * Get user role
 */
export function getUserRole(): UserRole | null {
  const user = getAuthenticatedUser();
  if (!user) return null;
  
  // Map frontend roles to backend roles
  const roleMap: Record<string, UserRole> = {
    'individual': 'RENTER',
    'corporate': 'RENTER',
    'owner': 'OWNER',
    'admin': 'ADMIN',
  };
  
  return roleMap[user.role] || null;
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Check if user has required role
 */
export function hasRole(allowedRoles: UserRole[]): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole(['ADMIN']);
}

/**
 * Check if user is owner
 */
export function isOwner(): boolean {
  return hasRole(['OWNER', 'ADMIN']);
}

/**
 * Check if user is renter
 */
export function isRenter(): boolean {
  return hasRole(['RENTER']);
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth(redirectPath = '/auth') {
  const { isAuthenticated, setCurrentPage } = useAppStore.getState();
  
  if (!isAuthenticated) {
    setCurrentPage('auth');
    return false;
  }
  
  return true;
}

/**
 * Require specific role - redirect if user doesn't have required role
 */
export function requireRole(allowedRoles: UserRole[], redirectPath = '/home') {
  const { setCurrentPage } = useAppStore.getState();
  
  if (!requireAuth()) {
    return false;
  }
  
  if (!hasRole(allowedRoles)) {
    setCurrentPage('home');
    return false;
  }
  
  return true;
}

/**
 * Require admin role
 */
export function requireAdmin(redirectPath = '/home') {
  return requireRole(['ADMIN'], redirectPath);
}

/**
 * Require owner or admin role
 */
export function requireOwner(redirectPath = '/home') {
  return requireRole(['OWNER', 'ADMIN'], redirectPath);
}

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

/**
 * Higher-order component for protected routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, currentUser, setCurrentPage } = useAppStore();
    
    // Check authentication
    if (!isAuthenticated || !currentUser) {
      // Redirect to login
      setTimeout(() => setCurrentPage('auth'), 0);
      return null;
    }
    
    // Check role if specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = getUserRole();
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to home
        setTimeout(() => setCurrentPage('home'), 0);
        return null;
      }
    }
    
    return <Component {...props} />;
  };
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Set auth token to localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Check if token exists
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Check if session is valid
 */
export function isSessionValid(): boolean {
  const token = getAuthToken();
  const user = getAuthenticatedUser();
  
  return !!token && !!user;
}

/**
 * Clear session (logout)
 */
export function clearSession(): void {
  removeAuthToken();
  const { logout } = useAppStore.getState();
  logout();
}

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Booking permissions
  CREATE_BOOKING: 'create_booking',
  VIEW_OWN_BOOKINGS: 'view_own_bookings',
  VIEW_ALL_BOOKINGS: 'view_all_bookings',
  APPROVE_BOOKING: 'approve_booking',
  REJECT_BOOKING: 'reject_booking',
  
  // Vehicle permissions
  CREATE_VEHICLE: 'create_vehicle',
  VIEW_OWN_VEHICLES: 'view_own_vehicles',
  VIEW_ALL_VEHICLES: 'view_all_vehicles',
  UPDATE_VEHICLE: 'update_vehicle',
  DELETE_VEHICLE: 'delete_vehicle',
  
  // User permissions
  VIEW_OWN_PROFILE: 'view_own_profile',
  VIEW_ALL_USERS: 'view_all_users',
  VERIFY_USER: 'verify_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Payment permissions
  CREATE_PAYMENT: 'create_payment',
  VIEW_OWN_PAYMENTS: 'view_own_payments',
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  
  // Report permissions
  VIEW_OWN_REPORTS: 'view_own_reports',
  VIEW_ALL_REPORTS: 'view_all_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Admin permissions
  MANAGE_PLATFORM: 'manage_platform',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
} as const;

/**
 * Role-based permission matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  RENTER: [
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_OWN_BOOKINGS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VIEW_OWN_PAYMENTS,
    PERMISSIONS.VIEW_OWN_REPORTS,
  ],
  OWNER: [
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_OWN_BOOKINGS,
    PERMISSIONS.APPROVE_BOOKING,
    PERMISSIONS.REJECT_BOOKING,
    PERMISSIONS.CREATE_VEHICLE,
    PERMISSIONS.VIEW_OWN_VEHICLES,
    PERMISSIONS.UPDATE_VEHICLE,
    PERMISSIONS.DELETE_VEHICLE,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_PAYMENTS,
    PERMISSIONS.VIEW_OWN_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
  ],
  ADMIN: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return userPermissions.includes(permission);
}

/**
 * Require specific permission
 */
export function requirePermission(permission: string, redirectPath = '/home'): boolean {
  const { setCurrentPage } = useAppStore.getState();
  
  if (!requireAuth()) {
    return false;
  }
  
  if (!hasPermission(permission)) {
    setCurrentPage('home');
    return false;
  }
  
  return true;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Check authentication
if (isAuthenticated()) {
  console.log('User is logged in');
}

// Example 2: Check role
if (isAdmin()) {
  console.log('User is admin');
}

// Example 3: Require authentication
function ProtectedPage() {
  if (!requireAuth()) {
    return null; // Will redirect to login
  }
  
  return <div>Protected content</div>;
}

// Example 4: Require specific role
function OwnerDashboard() {
  if (!requireOwner()) {
    return null; // Will redirect to home
  }
  
  return <div>Owner dashboard</div>;
}

// Example 5: Higher-order component
const ProtectedComponent = withAuth(MyComponent, ['OWNER', 'ADMIN']);

// Example 6: Check permission
if (hasPermission(PERMISSIONS.APPROVE_BOOKING)) {
  console.log('User can approve bookings');
}

// Example 7: Require permission
function ApproveBookingButton() {
  if (!requirePermission(PERMISSIONS.APPROVE_BOOKING)) {
    return null; // Will redirect if no permission
  }
  
  return <button>Approve</button>;
}
*/
