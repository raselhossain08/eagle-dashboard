import { apiClient } from './api-client';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  user: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.accessToken) {
        AuthCookieService.setTokens(response.accessToken, response.refreshToken);
        AuthCookieService.setUserSession(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearTokens();
      this.clearUser();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken
      });

      if (response.accessToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  // Verify 2FA
  async verify2FA(code: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', { code });
      
      if (response.accessToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        this.setUser(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '2FA verification failed';
      return { success: false, error: errorMessage };
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  }

  // Token management
  private setTokens(accessToken: string, refreshToken?: string): void {
    AuthCookieService.setAccessToken(accessToken);
    if (refreshToken) {
      AuthCookieService.setRefreshToken(refreshToken);
    }
  }

  private clearTokens(): void {
    AuthCookieService.clearTokens();
  }

  getAccessToken(): string | null {
    return AuthCookieService.getAccessToken();
  }

  private getRefreshToken(): string | null {
    return AuthCookieService.getRefreshToken();
  }

  // User management
  private setUser(user: AuthUser): void {
    AuthCookieService.setUserSession(user);
  }

  private clearUser(): void {
    AuthCookieService.clearTokens(); // This also clears user session
  }

  getCurrentUser(): AuthUser | null {
    return AuthCookieService.getUserSession();
  }

  // Check authentication status
  isAuthenticated(): boolean {
    return AuthCookieService.isAuthenticated();
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}

export const authService = new AuthService();
export { AuthService };