# Authentication & Authorization

## Overview

SerenAI uses a comprehensive authentication and authorization system with JWT tokens, OAuth integration, and role-based access control (RBAC). This document explains the complete auth flow, permission system, and implementation details.

---

## Authentication System

### Authentication Methods

1. **Email/Password Authentication**
   - Traditional username/password login
   - Bcrypt password hashing on backend
   - JWT token generation on successful login

2. **Google OAuth 2.0**
   - Single Sign-On via Google accounts
   - Automatic user creation on first login
   - Token exchange with backend

3. **Microsoft SSO** (Partial Implementation)
   - Azure AD integration scaffolded
   - Not fully implemented in current version

---

## JWT Token System

### Token Types

#### Access Token
- **Purpose**: Authenticate API requests
- **Storage**: `localStorage` with key `'token'`
- **Lifetime**: 1 hour (configurable on backend)
- **Format**: JWT with user info and permissions
- **Header**: `Authorization: Bearer <token>`

#### Refresh Token
- **Purpose**: Obtain new access tokens
- **Storage**: `localStorage` with key `'refreshToken'`
- **Lifetime**: 7 days (configurable on backend)
- **Usage**: Automatic refresh on 401 errors

### Token Payload Structure

```typescript
interface TokenPayload {
  userId: string;
  email: string;
  permissions: string[]; // ["read:chatbot:self", "create:document:self", ...]
  roles: string[];
  iat: number; // Issued at
  exp: number; // Expiration time
}
```

### Token Storage

```typescript
// Store tokens after login
localStorage.setItem('token', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Retrieve tokens
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');

// Clear tokens on logout
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
```

---

## Authentication Flow

### Login Flow (Email/Password)

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Enter email/password
       ↓
┌─────────────────────────┐
│   Login Form            │
│   (Zod Validation)      │
└──────┬──────────────────┘
       │ 2. POST /auth/login
       ↓
┌─────────────────────────┐
│   Backend API           │
│   - Verify credentials  │
│   - Generate JWT tokens │
└──────┬──────────────────┘
       │ 3. Return {user, accessToken, refreshToken}
       ↓
┌─────────────────────────┐
│   Frontend              │
│   - Store tokens        │
│   - Update AuthContext  │
│   - Redirect /dashboard │
└─────────────────────────┘
```

### Login Flow (Google OAuth)

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Click "Sign in with Google"
       ↓
┌─────────────────────────┐
│   Google OAuth Popup    │
│   (Google Authorization)│
└──────┬──────────────────┘
       │ 2. User authorizes
       │ 3. Google returns token
       ↓
┌─────────────────────────┐
│   Frontend              │
│   - Receive Google token│
└──────┬──────────────────┘
       │ 4. POST /auth/google-sso-login {googleToken}
       ↓
┌─────────────────────────┐
│   Backend API           │
│   - Verify Google token │
│   - Find/create user    │
│   - Generate JWT tokens │
└──────┬──────────────────┘
       │ 5. Return {user, accessToken, refreshToken}
       ↓
┌─────────────────────────┐
│   Frontend              │
│   - Store tokens        │
│   - Update AuthContext  │
│   - Redirect /dashboard │
└─────────────────────────┘
```

### Token Refresh Flow

```
┌─────────────┐
│   API Call  │
└──────┬──────┘
       │ 1. Request with expired token
       ↓
┌─────────────────────────┐
│   Backend API           │
│   - Returns 401         │
└──────┬──────────────────┘
       │ 2. 401 Unauthorized
       ↓
┌─────────────────────────┐
│   Axios Interceptor     │
│   - Catch 401 error     │
└──────┬──────────────────┘
       │ 3. POST /auth/refresh {refreshToken}
       ↓
┌─────────────────────────┐
│   Backend API           │
│   - Validate refresh    │
│   - Generate new access │
└──────┬──────────────────┘
       │ 4. Return {accessToken}
       ↓
┌─────────────────────────┐
│   Axios Interceptor     │
│   - Update localStorage │
│   - Dispatch event      │
│   - Retry original req  │
└─────────────────────────┘
```

---

## AuthContext Implementation

**File**: [src/context/AuthContext.tsx](../../frontend/src/context/AuthContext.tsx)

### Context State

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string, resource: string, scope: string) => boolean;
  updateUser: (user: User) => void;
}
```

### User Object Structure

```typescript
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  action: string;   // "read", "create", "update", "delete", "execute"
  resource: string; // "chatbot", "document", "user", etc.
  scope: string;    // "self", "all"
}
```

### Context Provider

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to refresh user data');
      }
    };

    window.addEventListener('token-refresh', handleTokenRefresh);
    return () => window.removeEventListener('token-refresh', handleTokenRefresh);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const hasPermission = (action: string, resource: string, scope: string) => {
    if (!user) return false;

    const permissionString = `${action}:${resource}:${scope}`;

    return user.roles.some(role =>
      role.permissions.some(perm => {
        const permStr = `${perm.action}:${perm.resource}:${perm.scope}`;
        return permStr === permissionString;
      })
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasPermission,
      updateUser: setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Using AuthContext

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasPermission, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      {hasPermission('create', 'chatbot', 'self') && (
        <Button onClick={createChatbot}>Create Chatbot</Button>
      )}
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

---

## Permission System

### Permission Format

Permissions use a three-part format: `action:resource:scope`

**Format**: `<action>:<resource>:<scope>`

**Examples**:
- `read:chatbot:self` - Read own chatbots
- `create:document:self` - Create documents
- `delete:user:all` - Delete any user (admin)
- `update:profile:self` - Update own profile

### Permission Components

#### Actions
- `read` - View/list resources
- `create` - Create new resources
- `update` - Modify existing resources
- `delete` - Remove resources
- `execute` - Perform special operations

#### Resources
- `chatbot` - AI chatbots
- `document` - Documents
- `chat` - Conversations
- `user` - User accounts
- `role` - Roles and permissions
- `llm_config` - LLM configurations
- `profile` - User profile
- `dashboard` - Dashboard stats
- `admin_stats` - Admin analytics
- `contact_us` - Contact submissions
- `help` - Help tickets
#### Scopes
- `self` - Own resources only
- `all` - All resources (typically admin)

### Default User Permissions

**User Role** (24 permissions):
```
read:chatbot:self
create:chatbot:self
update:chatbot:self
delete:chatbot:self

read:document:self
create:document:self
update:document:self
delete:document:self

read:chat:self
create:chat:self

read:llm_config:self
create:llm_config:self
update:llm_config:self
delete:llm_config:self

read:dashboard:self
update:profile:self
read:help:self
create:help:self
```

### Admin Permissions

**Admin Role** (26 permissions):
- All user permissions
- Plus admin-level permissions:

```
read:user:all
create:user:all
update:user:all
delete:user:all

read:role:all
create:role:all
update:role:all
delete:role:all

read:admin_stats:all
read:contact_us:all
read:help:all
```

---

## Protected Routes

### Route Protection Implementation

**File**: [src/app/(protected)/layout.tsx](../../frontend/src/app/(protected)/layout.tsx)

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
```

### Public Routes

No authentication required:
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/contact` - Contact form
- `/public-chat/[botId]` - Public chatbot

### Protected Routes

Authentication required (all under `/(protected)/` group):
- `/dashboard`
- `/chatbots/*`
- `/documents/*`
- `/chats/*`
- `/chat/[id]`
- `/llmconfigs/*`
- `/profile`
- `/help`
- `/admin/*` (requires admin permissions)

---

## Permission Guards

### PermissionGuard Component

**File**: [src/components/auth/PermissionGuard.tsx](../../frontend/src/components/auth/PermissionGuard.tsx)

```typescript
import { useAuth } from '@/context/AuthContext';

interface PermissionGuardProps {
  permission: string; // Format: "action:resource:scope"
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  const [action, resource, scope] = permission.split(':');

  if (!hasPermission(action, resource, scope)) {
    return fallback || null;
  }

  return <>{children}</>;
}
```

### Usage Examples

#### Conditional Rendering

```typescript
<PermissionGuard permission="create:chatbot:self">
  <Button onClick={createChatbot}>Create Chatbot</Button>
</PermissionGuard>
```

#### With Fallback

```typescript
<PermissionGuard
  permission="read:admin_stats:all"
  fallback={<UnauthorizedState />}
>
  <AdminDashboard />
</PermissionGuard>
```

#### Multiple Permissions

```typescript
function ChatbotActions({ chatbot }) {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('update', 'chatbot', 'self') && (
        <Button onClick={edit}>Edit</Button>
      )}
      {hasPermission('delete', 'chatbot', 'self') && (
        <Button onClick={deleteBot} variant="destructive">Delete</Button>
      )}
    </div>
  );
}
```

---

## OAuth Integration

### Google OAuth Setup

#### Installation

```bash
npm install @react-oauth/google
```

#### Configuration

**File**: [src/app/layout.tsx](../../frontend/src/app/layout.tsx)

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html>
      <body>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {children}
          </GoogleOAuthProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
```

#### Google Login Button

```typescript
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '@/lib/api/services/authService';
import { useAuth } from '@/context/AuthContext';

function GoogleLoginButton() {
  const { updateUser } = useAuth();
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await authService.googleSSOLogin(tokenResponse.access_token);
        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        updateUser(user);
        router.push('/dashboard');
      } catch (error) {
        toast.error('Google login failed');
      }
    },
    onError: () => {
      toast.error('Google login failed');
    },
  });

  return (
    <Button onClick={() => login()} variant="outline">
      <GoogleIcon /> Sign in with Google
    </Button>
  );
}
```

---

## Security Best Practices

### 1. Token Storage

**Current**: localStorage (acceptable for non-critical apps)

**Considerations**:
- ✅ Simple implementation
- ✅ Works across tabs
- ⚠️ Vulnerable to XSS attacks
- 💡 Alternative: HttpOnly cookies (requires backend support)

### 2. Token Refresh

- ✅ Automatic refresh on 401
- ✅ Retry failed requests
- ✅ Logout on refresh failure

### 3. Password Security

- ✅ Bcrypt hashing on backend
- ✅ Min 8 characters required
- ✅ Password confirmation on registration
- 💡 Consider: Password strength meter

### 4. Permission Checks

- ✅ Frontend checks for UI
- ✅ Backend validates all requests
- ⚠️ Never trust frontend-only checks

### 5. Session Management

- ✅ Automatic logout on token expiry
- ✅ Logout on all tabs (localStorage event)
- 💡 Consider: "Remember me" feature

---

## Common Auth Patterns

### Check if User is Admin

```typescript
function isAdmin(user: User): boolean {
  return user.roles.some(role => role.name === 'admin');
}
```

### Get User Permissions

```typescript
function getUserPermissions(user: User): string[] {
  return user.roles.flatMap(role =>
    role.permissions.map(p => `${p.action}:${p.resource}:${p.scope}`)
  );
}
```

### Protect Component

```typescript
function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  return <YourComponent />;
}
```

---

## Troubleshooting

### Token Not Persisting

**Problem**: User logged out on page refresh

**Solution**:
```typescript
// Check if token exists in localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// Ensure AuthProvider initializes user from token
```

### Permission Check Failing

**Problem**: `hasPermission()` returns false

**Debug**:
```typescript
const { user } = useAuth();
console.log('User roles:', user?.roles);
console.log('Permissions:', getUserPermissions(user));
```

### 401 Errors After Login

**Problem**: API calls fail with 401

**Check**:
```typescript
// Verify token is in localStorage
console.log('Token:', localStorage.getItem('token'));

// Check axios interceptor is attaching token
// Open Network tab, check request headers
```

### OAuth Not Working

**Problem**: Google Sign-In button not showing

**Check**:
```typescript
// Verify environment variable
console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Ensure GoogleOAuthProvider is wrapping app
// Check authorized origins in Google Console
```

---

## Summary

### Authentication Methods
- **Email/Password**: Traditional auth with JWT
- **Google OAuth**: Single sign-on
- **Microsoft SSO**: Partially implemented

### Token Management
- **Access Token**: 1 hour, stored in localStorage
- **Refresh Token**: 7 days, auto-refresh on 401
- **Automatic Logout**: On token expiry or refresh failure

### Permission System
- **Format**: `action:resource:scope`
- **Scopes**: `self` (own resources), `all` (admin)
- **Checks**: Frontend + Backend validation

### Key Components
- **AuthContext**: Global auth state
- **PermissionGuard**: Conditional rendering
- **Protected Layout**: Route protection

---

## Further Resources

- [Pages Documentation](./pages.md) - Permission requirements per page
- [API Integration](./api-integration.md) - Auth service methods
- [Environment Variables](./env.md) - OAuth configuration
- [Backend Auth Docs](../backend/authentication.md) - Backend auth system

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
