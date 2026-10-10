# NextAuth Authentication System

## Overview

Sistem autentikasi lengkap menggunakan NextAuth untuk backend Next.js dan adapter yang setara untuk frontend Vite + React.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  auth.ts     │  │   prisma.ts  │  │  API Routes  │     │
│  │ (NextAuth)   │  │  (Database)  │  │  (Handlers)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Configuration:                                              │
│  - Credentials Provider                                      │
│  - JWT Strategy                                              │
│  - Session Callbacks                                         │
│  - 30 days maxAge                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JWT Token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ auth-adapter │  │ auth-helpers │  │  Components  │     │
│  │  (NextAuth   │  │  (Utilities) │  │   (UI)       │     │
│  │  Equivalent) │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Features:                                                   │
│  - signIn() / signOut()                                      │
│  - getSession() / getUser()                                  │
│  - Token management                                          │
│  - Session refresh                                           │
│  - Route protection                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Backend Implementation (Next.js)

### Configuration File

**File:** `docs/backend-templates/src/lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Key Features

**Providers:**
- ✅ Credentials Provider (email + password)
- ✅ Password hashing with bcrypt
- ✅ User validation with Prisma

**Callbacks:**
- ✅ JWT callback - Add user data to token
- ✅ Session callback - Add token data to session

**Configuration:**
- ✅ JWT strategy (stateless)
- ✅ 30 days session maxAge
- ✅ Custom pages (signIn, error)
- ✅ Environment-based secret

## Frontend Implementation (Vite + React)

### Auth Adapter

**File:** `src/lib/auth-adapter.ts`

Equivalent functions to NextAuth:

| NextAuth | Frontend Equivalent |
|----------|---------------------|
| `signIn()` | `signIn(email, password)` |
| `signOut()` | `signOut()` |
| `getSession()` | `getSession()` |
| `getServerSession()` | `checkIsAuthenticated()` |
| `useSession()` | `useAppStore()` |
| JWT callbacks | Token management functions |

### Usage Examples

#### 1. Sign In

```typescript
import { signIn } from '@/lib/auth-adapter';

async function handleLogin(email: string, password: string) {
  const result = await signIn(email, password);
  
  if (result.success) {
    console.log('Signed in:', result.user);
    // Redirect to dashboard
  } else {
    console.error('Sign in failed:', result.error);
    // Show error message
  }
}
```

#### 2. Sign Out

```typescript
import { signOut } from '@/lib/auth-adapter';

async function handleLogout() {
  await signOut();
  // User is logged out and redirected to auth page
}
```

#### 3. Get Session

```typescript
import { getSession } from '@/lib/auth-adapter';

async function checkSession() {
  const session = await getSession();
  
  if (session) {
    console.log('User:', session);
  } else {
    console.log('Not authenticated');
  }
}
```

#### 4. Check Authentication

```typescript
import { checkIsAuthenticated } from '@/lib/auth-adapter';

async function protectRoute() {
  if (await checkIsAuthenticated()) {
    // User is authenticated, proceed
  } else {
    // Redirect to login
  }
}
```

#### 5. Require Authentication

```typescript
import { requireAuth } from '@/lib/auth-adapter';

async function ProtectedComponent() {
  if (await requireAuth()) {
    return <div>Protected content</div>;
  }
  return null; // Will redirect to auth page
}
```

#### 6. Require Specific Role

```typescript
import { requireRole } from '@/lib/auth-adapter';

async function OwnerDashboard() {
  if (await requireRole(['OWNER', 'ADMIN'])) {
    return <div>Owner dashboard</div>;
  }
  return null; // Will redirect to unauthorized page
}
```

#### 7. Token Management

```typescript
import { getToken, setToken, removeToken, hasValidToken } from '@/lib/auth-adapter';

// Get token
const token = getToken();

// Set token (with 30 days expiry)
setToken('your-jwt-token');

// Remove token
removeToken();

// Check if token is valid
if (hasValidToken()) {
  console.log('Token is valid');
}
```

#### 8. Session Refresh

```typescript
import { refreshSession, startSessionRefresh } from '@/lib/auth-adapter';

// Manual refresh
const refreshed = await refreshSession();
if (refreshed) {
  console.log('Session refreshed');
}

// Auto-refresh every 5 minutes
startSessionRefresh(5 * 60 * 1000);
```

## Token Management

### JWT Token Structure

```typescript
{
  id: string;
  email: string;
  role: 'RENTER' | 'OWNER' | 'ADMIN';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  iat: number;  // Issued at
  exp: number;  // Expires at
}
```

### Token Storage

**Frontend:**
- Stored in `localStorage`
- Key: `auth_token`
- Expiry: `auth_token_expiry`

**Backend:**
- JWT token in `Authorization` header
- Format: `Bearer <token>`

### Token Validation

```typescript
// Frontend
function getToken(): string | null {
  const token = localStorage.getItem('auth_token');
  const expiry = localStorage.getItem('auth_token_expiry');
  
  // Check if token is expired
  if (expiry && new Date().getTime() > parseInt(expiry)) {
    removeToken();
    return null;
  }
  
  return token;
}

// Backend
const token = req.headers.get('authorization')?.replace('Bearer ', '');

if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## Session Management

### Session Configuration

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Session Refresh

**Auto-refresh:**
```typescript
// Refresh every 5 minutes
startSessionRefresh(5 * 60 * 1000);
```

**Manual refresh:**
```typescript
const refreshed = await refreshSession();
```

### Session Data

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  expires: string;
}
```

## Error Handling

### Auth Errors

```typescript
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
};
```

### Get Error Message

```typescript
import { getAuthErrorMessage } from '@/lib/auth-adapter';

const errorMessage = getAuthErrorMessage('CredentialsSignin');
// Output: "Invalid credentials"
```

## Security Features

### 1. Password Hashing

```typescript
// Backend
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. JWT Tokens

```typescript
// Backend
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

### 3. Token Validation

```typescript
// Backend
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 4. CORS Configuration

```typescript
// Backend
cors: {
  origin: process.env.FRONTEND_URL,
  credentials: true,
}
```

### 5. Rate Limiting

```typescript
// Backend
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
```

## Environment Variables

### Backend (.env.local)

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/renmoku"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
# API URL
VITE_API_URL="http://localhost:3001/api"

# Socket URL
VITE_SOCKET_URL="http://localhost:3001"
```

## Installation

### Backend

```bash
# Install NextAuth
npm install next-auth @next-auth/prisma-adapter

# Install bcrypt
npm install bcryptjs
npm install -D @types/bcryptjs

# Install JWT
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

### Frontend

Dependencies already installed:
- ✅ zustand (state management)
- ✅ react (UI library)

## Testing

### Unit Tests

```typescript
import { signIn, signOut, getSession } from '@/lib/auth-adapter';

describe('Auth Adapter', () => {
  it('should sign in with valid credentials', async () => {
    const result = await signIn('admin@renmoku.id', 'demo123');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
  
  it('should fail with invalid credentials', async () => {
    const result = await signIn('invalid@email.com', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
  
  it('should sign out', async () => {
    await signOut();
    const session = await getSession();
    expect(session).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Auth Flow', () => {
  it('should complete full auth flow', async () => {
    // Sign in
    const loginResult = await signIn('admin@renmoku.id', 'demo123');
    expect(loginResult.success).toBe(true);
    
    // Check session
    const session = await getSession();
    expect(session).toBeDefined();
    
    // Check authentication
    const isAuthenticated = await checkIsAuthenticated();
    expect(isAuthenticated).toBe(true);
    
    // Sign out
    await signOut();
    
    // Verify signed out
    const sessionAfterLogout = await getSession();
    expect(sessionAfterLogout).toBeNull();
  });
});
```

## Best Practices

### 1. Always Validate Credentials

```typescript
// ✅ Good
if (!email || !password) {
  return { success: false, error: 'Missing credentials' };
}

// ❌ Bad
// No validation
```

### 2. Use Environment Variables

```typescript
// ✅ Good
secret: process.env.NEXTAUTH_SECRET

// ❌ Bad
secret: 'hardcoded-secret'
```

### 3. Hash Passwords

```typescript
// ✅ Good
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ Bad
// Store plain text password
```

### 4. Validate Tokens

```typescript
// ✅ Good
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// ❌ Bad
// Don't validate token
```

### 5. Handle Errors Gracefully

```typescript
// ✅ Good
try {
  const result = await signIn(email, password);
  if (!result.success) {
    showError(result.error);
  }
} catch (error) {
  showError('Authentication failed');
}

// ❌ Bad
// No error handling
```

## Troubleshooting

### Issue: Sign in fails

**Solutions:**
- Check credentials are correct
- Verify user exists in database
- Check password hash is correct
- Verify NEXTAUTH_SECRET is set

### Issue: Session expires too quickly

**Solutions:**
- Check maxAge configuration
- Verify token expiry time
- Check session refresh is working
- Verify localStorage is not cleared

### Issue: Token not persisting

**Solutions:**
- Check localStorage is enabled
- Verify token is being set
- Check token expiry time
- Verify no console errors

### Issue: CORS errors

**Solutions:**
- Check CORS configuration
- Verify FRONTEND_URL is correct
- Check credentials: true is set
- Verify backend is running

## Related Documentation

- [Auth System](./AUTH-SYSTEM.md) - Complete auth documentation
- [Route Protection](./ROUTE-PROTECTION.md) - Route protection system
- [Backend Implementation](./BACKEND-IMPLEMENTATION.md) - Backend setup
- [API Documentation](./API-DOCUMENTATION.md) - API reference

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
