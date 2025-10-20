// lib/auth/token-storage.service.ts
import { AuthService } from '@/lib/services/auth.service';

export class TokenStorageService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static refreshTimeout: NodeJS.Timeout | null = null;

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      this.scheduleTokenRefresh(accessToken);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      this.cancelTokenRefresh();
    }
  }

  static isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  static isTokenExpired(token: string): boolean {
    return !this.isTokenValid(token);
  }

  static getTokenExpiry(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  static scheduleTokenRefresh(token: string): void {
    this.cancelTokenRefresh();
    
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return;

    const refreshTime = expiry.getTime() - Date.now() - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      this.refreshTimeout = setTimeout(async () => {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          try {
            const authService = new AuthService();
            const tokens = await authService.refreshToken(refreshToken);
            this.setTokens(tokens.accessToken, tokens.refreshToken);
          } catch (error) {
            this.clearTokens();
            window.location.href = '/login';
          }
        }
      }, refreshTime);
    }
  }

  static cancelTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}