# Eagle Dashboard Authentication System

This document provides a comprehensive guide to the authentication system implemented in the Eagle Dashboard application.

## 🚀 Features

- **Complete Authentication Flow**: Login, Register, Forgot Password, Reset Password, Email Verification
- **JWT Token Management**: Secure cookie-based token storage with automatic expiration handling
- **Protected Routes**: Middleware and HOC-based route protection
- **Role-Based Access Control**: Admin, User, and custom role permissions
- **Subscription-Based Access**: Control access based on subscription levels
- **Auto-Logout**: Automatic logout on token expiration
- **Responsive UI**: Mobile-friendly authentication pages
- **TypeScript Support**: Full type safety throughout the system

## 📁 File Structure

```
eagle-dashboard/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── status/
│   │           └── route.ts          # Auth status API endpoint
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   ├── register/
│   │   │   └── page.tsx             # Register page
│   │   ├── forgot-password/
│   │   │   └── page.tsx             # Forgot password page
│   │   ├── reset-password/
│   │   │   └── [token]/
│   │   │       └── page.tsx         # Reset password page
│   │   └── verify/
│   │       └── [token]/
│   │           └── page.tsx         # Email verification page
│   ├── layout.tsx                   # Root layout with AuthProvider
│   ├── page.tsx                     # Protected dashboard home
│   └── users/
│       └── page.tsx                 # Admin-only users page
├── components/
│   ├── with-auth.tsx                # HOC for route protection
│   └── dashboard-header.tsx         # Updated with logout functionality
├── context/
│   └── auth-context.tsx             # Authentication context provider
├── hooks/
│   └── use-protected-route.ts       # Custom hooks for route protection
├── lib/
│   ├── services/
│   │   └── auth.service.ts          # Authentication API service
│   └── utils/
│       └── cookie-manager.ts        # Cookie management utilities
├── types/
│   └── auth.ts                      # TypeScript interfaces
├── middleware.ts                    # Next.js middleware for route protection
└── .env.local                       # Environment variables
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of your project:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# JWT Configuration
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here

# App Configuration
NEXT_PUBLIC_APP_NAME=Eagle Dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 2. Backend Requirements

Make sure your backend API provides the following endpoints:

- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password/:token` - Reset password
- `GET /api/activate/:token` - Activate account
- `POST /api/set-password` - Set password after activation
- `POST /api/resend-activation` - Resend activation email
- `GET /api/profile` - Get user profile

### 3. Install Dependencies

The following dependencies are required (already included in package.json):

```json
{
  "cookies-next": "^6.1.1",
  "jwt-decode": "^4.0.0",
  "sonner": "^2.0.7"
}
```

## 🔐 Usage Guide

### Authentication Context

The authentication system is built around a React context that provides:

```tsx
import { useAuth } from '@/context/auth-context';

function MyComponent() {
  const {
    user,           // Current user object
    token,          // JWT token
    loading,        // Loading state
    login,          // Login function
    register,       // Register function
    logout,         // Logout function
    forgotPassword, // Forgot password function
    resetPassword,  // Reset password function
    verifyEmail,    // Verify email function
    resendVerification, // Resend verification
    refreshUser     // Refresh user data
  } = useAuth();
}
```

### Protected Routes

#### Using HOC (Recommended)

```tsx
import { withAuth } from '@/components/with-auth';

function DashboardPage() {
  return <div>Protected Dashboard Content</div>;
}

export default withAuth(DashboardPage);
```

#### Admin-Only Routes

```tsx
import { withAdminAuth } from '@/components/with-auth';

function AdminPage() {
  return <div>Admin Only Content</div>;
}

export default withAdminAuth(AdminPage);
```

#### Subscription-Based Routes

```tsx
import { withSubscriptionAuth } from '@/components/with-auth';

function PremiumPage() {
  return <div>Premium Content</div>;
}

export default withSubscriptionAuth(PremiumPage, ['premium', 'enterprise']);
```

#### Custom Protection

```tsx
import { withAuth } from '@/components/with-auth';

function CustomProtectedPage() {
  return <div>Custom Protected Content</div>;
}

export default withAuth(CustomProtectedPage, {
  requiredRoles: ['admin', 'moderator'],
  requiredSubscriptions: ['premium'],
  redirectTo: '/upgrade',
});
```

### Custom Hooks

#### useProtectedRoute Hook

```tsx
import { useProtectedRoute } from '@/hooks/use-protected-route';

function MyComponent() {
  const { isAuthorized, isLoading, user } = useProtectedRoute({
    requiredRoles: ['admin'],
  });

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return <div>Access Denied</div>;

  return <div>Authorized Content</div>;
}
```

#### Admin Route Hook

```tsx
import { useAdminRoute } from '@/hooks/use-protected-route';

function AdminComponent() {
  const { isAuthorized, isLoading } = useAdminRoute();
  // ... rest of component
}
```

### Cookie Management

The `CookieManager` utility provides methods for handling authentication cookies:

```tsx
import { CookieManager } from '@/lib/utils/cookie-manager';

// Check authentication
const isAuthenticated = CookieManager.isAuthenticated();

// Get user role
const userRole = CookieManager.getUserRole();

// Check specific roles
const isAdmin = CookieManager.hasRole('admin');
const hasAnyRole = CookieManager.hasAnyRole(['admin', 'moderator']);

// Token management
const token = CookieManager.getToken();
const isExpired = CookieManager.isTokenExpired();
const expiration = CookieManager.getTokenExpiration();
```

## 🛡️ Security Features

### Token Management

- **Secure Storage**: Tokens are stored in HTTP-only cookies (configurable)
- **Automatic Expiration**: Tokens are automatically validated and expired tokens trigger logout
- **JWT Validation**: Built-in JWT decoding and validation

### Route Protection

- **Middleware Protection**: Next.js middleware protects routes before they load
- **Component-Level Protection**: HOCs and hooks provide additional protection
- **Role-Based Access**: Fine-grained control based on user roles
- **Subscription-Based Access**: Control access based on subscription levels

### Input Validation

- **Form Validation**: Client-side validation for all auth forms
- **Password Strength**: Enforced password requirements
- **Email Validation**: Proper email format validation

## 🎨 Customization

### Styling

All authentication pages use Tailwind CSS and shadcn/ui components. You can customize:

- Colors and themes through CSS variables
- Component layouts by modifying the page components
- Toast notifications by configuring Sonner

### Redirects

Configure redirect behavior:

```tsx
// Custom redirect after login
const { login } = useAuth();
await login(credentials);
router.push('/custom-dashboard');

// Custom redirect for unauthorized access
const ProtectedPage = withAuth(MyComponent, {
  redirectTo: '/custom-login',
});
```

### Error Handling

Customize error messages by modifying the auth service or context:

```tsx
// Custom error handling in auth service
try {
  const response = await AuthService.login(data);
} catch (error) {
  // Custom error handling
  toast.error(getCustomErrorMessage(error));
}
```

## 🔄 API Integration

### Authentication Service

The `AuthService` class handles all API calls:

```tsx
import AuthService from '@/lib/services/auth.service';

// All methods return promises
await AuthService.login(loginData);
await AuthService.register(registerData);
await AuthService.forgotPassword({ email });
await AuthService.resetPassword(token, passwordData);
await AuthService.getProfile();
```

### API Service

The base `ApiService` automatically includes authentication headers:

```tsx
import ApiService from '@/lib/services/api.service';

// Automatically includes Bearer token
const data = await ApiService.get('/protected-endpoint');
const result = await ApiService.post('/protected-endpoint', payload);
```

## 🚨 Troubleshooting

### Common Issues

1. **"Token has expired" errors**
   - Check system time synchronization
   - Verify JWT_SECRET matches backend
   - Check token expiration time in backend

2. **Redirect loops**
   - Ensure middleware patterns don't conflict
   - Check protected route configurations
   - Verify authentication state initialization

3. **Cookie not being set**
   - Check browser security settings
   - Verify HTTPS in production
   - Check sameSite cookie settings

4. **Role-based access not working**
   - Verify user role in token payload
   - Check role matching logic
   - Ensure backend sends correct user data

### Debug Mode

Enable debug mode by adding console logs:

```tsx
// In auth-context.tsx
useEffect(() => {
  console.log('Auth state:', { user, token, loading });
}, [user, token, loading]);
```

## 📱 Mobile Responsiveness

All authentication pages are fully responsive and include:

- Mobile-first design approach
- Touch-friendly interface elements
- Optimized form layouts for small screens
- Proper viewport handling

## 🔮 Future Enhancements

Potential improvements for the authentication system:

1. **Two-Factor Authentication (2FA)**
2. **Social Login Integration** (Google, GitHub, etc.)
3. **Remember Me Functionality**
4. **Session Management Dashboard**
5. **Advanced Password Policies**
6. **Rate Limiting and Brute Force Protection**
7. **Audit Logging**
8. **Email Template Customization**

## 📄 License

This authentication system is part of the Eagle Dashboard project and follows the same licensing terms.