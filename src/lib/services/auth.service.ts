// lib/api/auth.service.ts
import { LoginCredentials, LoginResponse, TokenResponse, User, Session, SecurityEvent } from '@/types/auth';

export class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  constructor(private client: ApiClient) {}

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        twoFactorCode: credentials.twoFactorCode,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async verify2FA(userId: string, code: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, code }),
    });

    if (!response.ok) {
      throw new Error('2FA verification failed');
    }

    return response.json();
  }

  async setup2FA(userId: string): Promise<{ qrCode: string; secret: string }> {
    const response = await fetch(`${this.baseURL}/auth/setup-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('2FA setup failed');
    }

    return response.json();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      throw new Error('Password change failed');
    }
  }

  async validateSession(): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Session validation failed');
    }

    return response.json();
  }

  async getActiveSessions(): Promise<Session[]> {
    const response = await fetch(`${this.baseURL}/auth/sessions`, {
      headers: {
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  }

  async terminateSession(sessionId?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/sessions/${sessionId || ''}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
    });

    if (!response.ok) {
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