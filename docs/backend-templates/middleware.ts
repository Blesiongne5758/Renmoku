// ============================================================================
// NEXT.JS MIDDLEWARE - Route Protection by Role
// ============================================================================
// File: backend/middleware.ts
// ============================================================================
// Middleware Next.js untuk proteksi route berdasarkan role user
// ============================================================================

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth.token?.role;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Owner routes protection
    if (pathname.startsWith('/dashboard/owner')) {
      if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Renter routes protection
    if (pathname.startsWith('/dashboard/renter')) {
      if (userRole !== 'RENTER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
