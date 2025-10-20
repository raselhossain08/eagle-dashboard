// lib/auth/cookies.service.ts
export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class CookiesService {
  private static isServer = typeof window === 'undefined';

  /**
   * Set a cookie with the given name, value, and options
   */
  static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (this.isServer) return;

    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax'
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += `; secure`;
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (this.isServer) return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
  }

  /**
   * Remove a cookie by name
   */
  static removeCookie(name: string, path: string = '/', domain?: string): void {
    if (this.isServer) return;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Check if a cookie exists
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): { [key: string]: string } {
    if (this.isServer) return {};

    const cookies: { [key: string]: string } = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  /**
   * Clear all cookies (only works for same path and domain)
   */
  static clearAllCookies(path: string = '/', domain?: string): void {
    if (this.isServer) return;

    const cookies = this.getAllCookies();
    Object.keys(cookies).forEach(name => {
      this.removeCookie(name, path, domain);
    });
  }

  /**
   * Set a secure token cookie with appropriate security settings
   */
  static setSecureToken(name: string, token: string, expiresIn?: number): void {
    const options: CookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    if (expiresIn) {
      options.maxAge = expiresIn;
    }

    this.setCookie(name, token, options);
  }

  /**
   * Set a session token cookie (expires when browser closes)
   */
  static setSessionToken(name: string, token: string): void {
    const options: CookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // No expires or maxAge means it's a session cookie
    };

    this.setCookie(name, token, options);
  }
}