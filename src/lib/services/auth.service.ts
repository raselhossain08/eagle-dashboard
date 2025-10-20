// lib/services/auth.service.ts
import { LoginCredentials, LoginResponse, TokenResponse, User, Session, SecurityEvent } from '@/types/auth';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';
import { apiClient } from '@/lib/api/api-client';

export class AuthService {
  constructor() {}

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('AuthService: Making login request');
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        twoFactorCode: credentials.twoFactorCode,
      });

      console.log('AuthService: Login response received');
      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      TokenStorageService.clearTokens();
      SessionStorageService.clearUserSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if API call fails
      TokenStorageService.clearTokens();
      SessionStorageService.clearUserSession();
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>('/auth/refresh', { refreshToken });
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  }

  async verify2FA(userId: string, code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', { userId, code });
      return response;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw new Error('2FA verification failed');
    }
  }

  async setup2FA(userId: string): Promise<{ qrCode: string; secret: string }> {
    try {
      const response = await apiClient.post<{ qrCode: string; secret: string }>('/auth/setup-2fa', { userId });
      return response;
    } catch (error) {
      console.error('2FA setup error:', error);
      throw new Error('2FA setup failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error('Password change failed');
    }
  }

  async validateSession(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/validate');
      return response;
    } catch (error) {
      console.error('Session validation error:', error);
      throw new Error('Session validation failed');
    }
  }

  async getActiveSessions(): Promise<Session[]> {
    try {
      const response = await apiClient.get<Session[]>('/auth/sessions');
      return response;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  async terminateSession(sessionId?: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId || ''}`);
    } catch (error) {
      console.error('Terminate session error:', error);
      throw new Error('Failed to terminate session');
    }
  }
}

// API Client
export class ApiClient {
  async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Handle token refresh or logout
      TokenStorageService.clearTokens();
      SessionStorageService.clearUserSession();
      window.location.href = '/login';
    }

    return response;
  }
}