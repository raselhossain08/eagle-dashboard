import { AuthCookieService } from "@/lib/auth/cookie-service";

/**
 * Demo authentication helper for testing analytics connection
 * This sets temporary demo tokens to test the backend connection
 */
export function setDemoAuthTokens() {
  // Use a properly formatted JWT token structure
  // Header: {"alg":"HS256","typ":"JWT"}
  // Payload: {"userId":"demo-user-id","email":"admin@example.com","role":"super-admin","iat":1729449291,"exp":1729450191}
  const demoAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6InN1cGVyLWFkbWluIiwiaWF0IjoxNzI5NDQ5MjkxLCJleHAiOjE3MzE5NTMyOTF9.demo-signature-replace-with-backend-secret";
  const demoRefreshToken = "demo-refresh-token-12345";
  
  // Demo user session
  const demoUser = {
    id: "demo-user-id",
    email: "admin@example.com",
    firstName: "Demo",
    lastName: "Admin",
    role: "super-admin",
    isActive: true,
    isTwoFactorEnabled: false
  };

  // Set tokens and user session in cookies
  AuthCookieService.setTokens(demoAccessToken, demoRefreshToken);
  AuthCookieService.setUserSession(demoUser);

  console.log("🎭 Demo authentication tokens set:", {
    accessToken: `${demoAccessToken.substring(0, 50)}...`,
    user: demoUser.email,
    role: demoUser.role
  });

  return {
    accessToken: demoAccessToken,
    refreshToken: demoRefreshToken,
    user: demoUser
  };
}

/**
 * Clear all authentication tokens
 */
export function clearAuthTokens() {
  AuthCookieService.clearAuthData();
  console.log("🧹 Authentication tokens cleared");
}

/**
 * Check current authentication status
 */
export function checkAuthStatus() {
  const isAuthenticated = AuthCookieService.isAuthenticated();
  const token = AuthCookieService.getAccessToken();
  const user = AuthCookieService.getUserSession();

  console.log("🔍 Authentication Status Check:", {
    isAuthenticated,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    userEmail: user?.email || 'No user',
    userRole: user?.role || 'No role'
  });

  return {
    isAuthenticated,
    token,
    user
  };
}