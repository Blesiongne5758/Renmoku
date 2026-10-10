// ============================================================================
// FRONTEND AUTH ADAPTER - Equivalent to NextAuth for Vite + React
// ============================================================================
// File: src/lib/auth-adapter.ts
// ============================================================================
// Adapter autentikasi untuk frontend Vite + React yang setara dengan NextAuth
// ============================================================================

import { useAppStore } from '../stores/useAppStore';

// ============================================================================
// AUTH CONFIGURATION (Equivalent to NextAuth Options)
// ============================================================================

export const authConfig = {
  // Session configuration
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  
  // Pages configuration
  pages: {
    signIn: '/auth',
    error: '/auth/error',
    signOut: '/auth',
  },
  
  // Callbacks (client-side equivalents)
  callbacks: {
    // Called after successful login
    async onLogin(user: any) {
      const { setCurrentUser, setAuthModalOpen } = useAppStore.getState();
      setCurrentUser(user);
      setAuthModalOpen(false);
    },
    
    // Called before logout
    async onLogout() {
      const { logout } = useAppStore.getState();
      logout();
    },
    
    // Called to check if session is valid
    async onSessionCheck() {
      const { currentUser, isAuthenticated } = useAppStore.getState();
      return isAuthenticated && !!currentUser;
    },
  },
};

// ============================================================================
// SESSION MANAGEMENT (Equivalent to NextAuth Session)
// ============================================================================

/**
 * Get current session (equivalent to getSession())
 */
export async function getSession(): Promise<any | null> {
  const { currentUser, isAuthenticated } = useAppStore.getState();
  
  if (!isAuthenticated || !currentUser) {
    return null;
  }
  
  return currentUser;
}

/**
 * Check if user is authenticated (equivalent to getServerSession())
 */
export async function checkIsAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Get user from session (equivalent to session.user)
 */
export async function getUser(): Promise<any | null> {
  const session = await getSession();
  return session;
}

// ============================================================================
// JWT TOKEN MANAGEMENT (Equivalent to NextAuth JWT)
// ============================================================================

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  // Check if token is expired
  if (expiry && new Date().getTime() > parseInt(expiry)) {
    removeToken();
    return null;
  }
  
  return token;
}

/**
 * Set JWT token to localStorage
 */
export function setToken(token: string, maxAge: number = authConfig.session.maxAge): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, token);
  
  // Set expiry time
  const expiry = new Date().getTime() + (maxAge * 1000);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Check if token exists and is valid
 */
export function hasValidToken(): boolean {
  return !!getToken();
}

// ============================================================================
// SIGN IN / SIGN OUT (Equivalent to NextAuth signIn/signOut)
// ============================================================================

/**
 * Sign in with credentials (equivalent to signIn('credentials', { ... }))
 */
export async function signIn(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> {
  try {
    // Validate credentials
    if (!email || !password) {
      return { success: false, error: 'Missing credentials' };
    }
    
    // Call login API
    const { login } = useAppStore.getState();
    const success = await login(email, password);
    
    if (!success) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Get user from store
    const { currentUser } = useAppStore.getState();
    
    if (!currentUser) {
      return { success: false, error: 'Failed to get user data' };
    }
    
    // Call onLogin callback
    await authConfig.callbacks.onLogin(currentUser);
    
    return { success: true, user: currentUser };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign in failed' 
    };
  }
}

/**
 * Sign out (equivalent to signOut())
 */
export async function signOut(): Promise<void> {
  try {
    // Call onLogout callback
    await authConfig.callbacks.onLogout();
    
    // Remove token
    removeToken();
    
    // Redirect to sign in page
    const { setCurrentPage } = useAppStore.getState();
    setCurrentPage('auth');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// ============================================================================
// PROTECTED ROUTE HELPERS (Equivalent to NextAuth withAuth)
// ============================================================================

type UserRole = 'RENTER' | 'OWNER' | 'ADMIN';

/**
 * Check if user is authorized for a specific role
 */
export async function isAuthorized(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getUser();
  
  if (!user) {
    return false;
  }
  
  // Map frontend roles to backend roles
  const roleMap: Record<string, UserRole> = {
    'individual': 'RENTER',
    'corporate': 'RENTER',
    'owner': 'OWNER',
    'admin': 'ADMIN',
  };
  
  const userRole = roleMap[user.role] || user.role as UserRole;
  
  return allowedRoles.includes(userRole);
}

/**
 * Require authentication (redirect if not authenticated)
 */
export async function requireAuth(redirectPath: string = authConfig.pages.signIn): Promise<boolean> {
  const authenticated = await checkIsAuthenticated();
  
  if (!authenticated) {
    const { setCurrentPage } = useAppStore.getState();
    setCurrentPage('auth');
    return false;
  }
  
  return true;
}

/**
 * Require specific role (redirect if not authorized)
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectPath: string = authConfig.pages.error
): Promise<boolean> {
  const authorized = await isAuthorized(allowedRoles);
  
  if (!authorized) {
    const { setCurrentPage } = useAppStore.getState();
    setCurrentPage('unauthorized');
    return false;
  }
  
  return true;
}

// ============================================================================
// SESSION REFRESH (Equivalent to NextAuth session refresh)
// ============================================================================

/**
 * Refresh session (re-validate token and user data)
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const token = getToken();
    
    if (!token) {
      return false;
    }
    
    // Call API to validate token and get fresh user data
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      // Token is invalid or expired
      removeToken();
      await signOut();
      return false;
    }
    
    const user = await response.json();
    
    // Update store with fresh user data
    const { setCurrentUser } = useAppStore.getState();
    setCurrentUser(user);
    
    return true;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
}

/**
 * Auto-refresh session periodically
 */
export function startSessionRefresh(interval: number = 5 * 60 * 1000): void {
  // Refresh every 5 minutes by default
  setInterval(async () => {
    if (hasValidToken()) {
      await refreshSession();
    }
  }, interval);
}

// ============================================================================
// ERROR HANDLING (Equivalent to NextAuth error pages)
// ============================================================================

export const AuthError = {
  Configuration: 'Configuration error',
  AccessDenied: 'Access denied',
  Verification: 'Verification failed',
  Default: 'Authentication failed',
  CredentialsSignin: 'Invalid credentials',
  OAuthSignin: 'OAuth sign in error',
  OAuthCallback: 'OAuth callback error',
  OAuthCreateAccount: 'OAuth account creation error',
  EmailCreateAccount: 'Email account creation error',
  Callback: 'Callback error',
  OAuthAccountNotLinked: 'OAuth account not linked',
  SessionRequired: 'Session required',
} as const;

/**
 * Get error message from error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AuthError[errorCode as keyof typeof AuthError] || AuthError.Default;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Sign in
const result = await signIn('user@example.com', 'password123');
if (result.success) {
  console.log('Signed in:', result.user);
} else {
  console.error('Sign in failed:', result.error);
}

// Example 2: Sign out
await signOut();

// Example 3: Get session
const session = await getSession();
if (session) {
  console.log('User:', session);
}

// Example 4: Check authentication
if (await checkIsAuthenticated()) {
  console.log('User is authenticated');
}

// Example 5: Require authentication
if (await requireAuth()) {
  // User is authenticated, proceed
}

// Example 6: Require specific role
if (await requireRole(['OWNER', 'ADMIN'])) {
  // User is owner or admin, proceed
}

// Example 7: Check authorization
if (await isAuthorized(['ADMIN'])) {
  console.log('User is admin');
}

// Example 8: Refresh session
const refreshed = await refreshSession();
if (refreshed) {
  console.log('Session refreshed');
}

// Example 9: Auto-refresh session
startSessionRefresh(5 * 60 * 1000); // Refresh every 5 minutes

// Example 10: Get token
const token = getToken();
if (token) {
  console.log('Token:', token);
}
*/
