// lib/auth/token-storage.service.ts
import { AuthService } from '@/lib/services/auth.service';
import { CookiesService } from './cookies.service';

export class TokenStorageService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static refreshTimeout: NodeJS.Timeout | null = null;

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      // Use session cookie for access token (expires when browser closes)
      CookiesService.setSessionToken(this.ACCESS_TOKEN_KEY, accessToken);
      
      // Use long-lived secure cookie for refresh token (7 days)
      CookiesService.setSecureToken(this.REFRESH_TOKEN_KEY, refreshToken, 7 * 24 * 60 * 60); // 7 days in seconds
      
      this.scheduleTokenRefresh(accessToken);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return CookiesService.getCookie(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return CookiesService.getCookie(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      CookiesService.removeCookie(this.ACCESS_TOKEN_KEY);
      CookiesService.removeCookie(this.REFRESH_TOKEN_KEY);
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