// lib/auth/session-storage.service.ts
import { User } from '@/types/auth';

export class SessionStorageService {
  private static readonly USER_SESSION_KEY = 'userSession';
  private static readonly REMEMBER_ME_KEY = 'rememberMe';

  static setUserSession(user: User): void {
    if (typeof window !== 'undefined') {
      const sessionData = {
        user,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(sessionData));
    }
  }

  static getUserSession(): User | null {
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem(this.USER_SESSION_KEY);
      if (sessionData) {
        try {
          const { user, timestamp } = JSON.parse(sessionData);
          // Check if session is still valid (1 hour)
          if (Date.now() - timestamp < 60 * 60 * 1000) {
            return user;
          }
        } catch {
          // Invalid session data
        }
      }
    }
    return null;
  }

  static clearUserSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.USER_SESSION_KEY);
    }
  }

  static isSessionValid(): boolean {
    const user = this.getUserSession();
    return user !== null;
  }

  static getSessionExpiry(): Date | null {
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem(this.USER_SESSION_KEY);
      if (sessionData) {
        try {
          const { timestamp } = JSON.parse(sessionData);
          return new Date(timestamp + 60 * 60 * 1000); // 1 hour from timestamp
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  static setRememberMe(remember: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REMEMBER_ME_KEY, remember.toString());
    }
  }

  static getRememberMe(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    }
    return false;
  }
}