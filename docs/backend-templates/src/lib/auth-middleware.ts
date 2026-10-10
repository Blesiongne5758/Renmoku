// ============================================================================
// BACKEND AUTHENTICATION MIDDLEWARE (Next.js)
// ============================================================================
// File: backend/src/lib/auth-middleware.ts
// ============================================================================
// Middleware untuk autentikasi dan otorisasi di backend Next.js
// ============================================================================

import { getServerSession } from 'next-auth';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';

export type UserRole = 'RENTER' | 'OWNER' | 'ADMIN';

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Authenticate user from session
 * Returns user object with profile data or null if not authenticated
 */
export async function authenticate() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      renterIndividual: true,
      renterCorporate: true,
      fleetOwner: true,
    },
  });
  
  return user;
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Authorize user based on role
 * Returns middleware function that checks if user has required role
 */
export function authorize(allowedRoles: UserRole[]) {
  return async (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = await authenticate();
      
      // Check if user is authenticated
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
      
      // Check if user has required role
      if (!allowedRoles.includes(user.role as UserRole)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Attach user to request context
      (req as any).user = user;
      
      return handler(req, context);
    };
  };
}

// ============================================================================
// ROLE-BASED AUTHORIZATION HELPERS
// ============================================================================

/**
 * Require admin role
 */
export function requireAdmin(handler: Function) {
  return authorize(['ADMIN'])(handler);
}

/**
 * Require owner or admin role
 */
export function requireOwner(handler: Function) {
  return authorize(['OWNER', 'ADMIN'])(handler);
}

/**
 * Require renter role
 */
export function requireRenter(handler: Function) {
  return authorize(['RENTER'])(handler);
}

/**
 * Require authenticated user (any role)
 */
export function requireAuth(handler: Function) {
  return authorize(['RENTER', 'OWNER', 'ADMIN'])(handler);
}

// ============================================================================
// PERMISSION-BASED AUTHORIZATION
// ============================================================================

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
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return userPermissions.includes(permission);
}

/**
 * Require specific permission
 */
export function requirePermission(permission: string) {
  return async (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = await authenticate();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
      
      if (!hasPermission(user.role as UserRole, permission)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
      
      (req as any).user = user;
      
      return handler(req, context);
    };
  };
}

// ============================================================================
// OWNERSHIP VERIFICATION
// ============================================================================

/**
 * Verify that user owns the resource
 */
export async function verifyOwnership(
  userId: string,
  resourceType: 'vehicle' | 'booking',
  resourceId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { fleetOwner: true },
  });
  
  if (!user) return false;
  
  if (resourceType === 'vehicle') {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: resourceId },
    });
    
    if (!vehicle) return false;
    
    // Admin can access any vehicle
    if (user.role === 'ADMIN') return true;
    
    // Owner can only access their own vehicles
    if (user.role === 'OWNER') {
      return vehicle.ownerId === user.fleetOwner?.id;
    }
    
    return false;
  }
  
  if (resourceType === 'booking') {
    const booking = await prisma.booking.findUnique({
      where: { id: resourceId },
      include: { vehicle: { include: { owner: true } } },
    });
    
    if (!booking) return false;
    
    // Admin can access any booking
    if (user.role === 'ADMIN') return true;
    
    // Renter can only access their own bookings
    if (user.role === 'RENTER') {
      return booking.renterId === userId;
    }
    
    // Owner can only access bookings for their vehicles
    if (user.role === 'OWNER') {
      return booking.vehicle.ownerId === user.fleetOwner?.id;
    }
    
    return false;
  }
  
  return false;
}

/**
 * Require ownership of resource
 */
export function requireOwnership(resourceType: 'vehicle' | 'booking') {
  return async (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = await authenticate();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
      
      const resourceId = context.params?.id;
      
      if (!resourceId) {
        return NextResponse.json(
          { error: 'Resource ID is required' },
          { status: 400 }
        );
      }
      
      const hasOwnership = await verifyOwnership(user.id, resourceType, resourceId);
      
      if (!hasOwnership) {
        return NextResponse.json(
          { error: 'Forbidden - You do not own this resource' },
          { status: 403 }
        );
      }
      
      (req as any).user = user;
      
      return handler(req, context);
    };
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Require authentication
export const GET = requireAuth(async (req: NextRequest) => {
  const user = (req as any).user;
  return NextResponse.json({ user });
});

// Example 2: Require specific role
export const POST = requireOwner(async (req: NextRequest) => {
  const user = (req as any).user;
  // Only owners can create vehicles
  return NextResponse.json({ success: true });
});

// Example 3: Require permission
export const PUT = requirePermission(PERMISSIONS.APPROVE_BOOKING)(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = (req as any).user;
    // User has permission to approve bookings
    return NextResponse.json({ success: true });
  }
);

// Example 4: Require ownership
export const DELETE = requireOwnership('vehicle')(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = (req as any).user;
    // User owns this vehicle
    return NextResponse.json({ success: true });
  }
);

// Example 5: Combine multiple middlewares
export const PUT = requireAuth(
  requirePermission(PERMISSIONS.UPDATE_VEHICLE)(
    requireOwnership('vehicle')(
      async (req: NextRequest, { params }: { params: { id: string } }) => {
        const user = (req as any).user;
        // User is authenticated, has permission, and owns the vehicle
        return NextResponse.json({ success: true });
      }
    )
  )
);
*/
