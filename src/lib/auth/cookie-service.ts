export class CookieService {
  /**
   * Set a cookie with the given name, value, and options
   */
  static setCookie(name: string, value: string, options: {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}): void {
    if (typeof document === 'undefined') return; // Server-side check

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    } else {
      cookieString += `; path=/`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.httpOnly) {
      cookieString += `; httponly`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null; // Server-side check

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Delete a cookie by setting its expiration to the past
   */
  static deleteCookie(name: string, options: {
    domain?: string;
    path?: string;
  } = {}): void {
    this.setCookie(name, '', {
      expires: new Date(0),
      domain: options.domain,
      path: options.path || '/'
    });
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
  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {}; // Server-side check

    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(';');

    for (let cookie of cookieStrings) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  /**
   * Clear all cookies
   */
  static clearAllCookies(): void {
    const cookies = this.getAllCookies();
    for (const name in cookies) {
      this.deleteCookie(name);
    }
  }
}

// Auth-specific cookie methods
export class AuthCookieService extends CookieService {
  private static readonly ACCESS_TOKEN_KEY = 'eagle_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'eagle_refresh_token';
  private static readonly USER_SESSION_KEY = 'eagle_user_session';

  /**
   * Set access token in cookie
   */
  static setAccessToken(token: string): void {
    this.setCookie(this.ACCESS_TOKEN_KEY, token, {
      maxAge: 15 * 60, // 15 minutes (same as JWT_EXPIRES_IN)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  /**
   * Get access token from cookie
   * Check multiple possible cookie names for compatibility
   */
  static getAccessToken(): string | null {
    // Check our standard cookie name first
    let token = this.getCookie(this.ACCESS_TOKEN_KEY);
    
    // If not found, check for other common cookie names
    if (!token) {
      const alternativeNames = ['accessToken', 'access_token', 'jwt_token', 'token'];
      for (const name of alternativeNames) {
        token = this.getCookie(name);
        if (token) {
          console.log(`🔑 Found access token in cookie: ${name}`);
          break;
        }
      }
    }
    
    return token;
  }

  /**
   * Set refresh token in cookie
   */
  static setRefreshToken(token: string): void {
    this.setCookie(this.REFRESH_TOKEN_KEY, token, {
      maxAge: 7 * 24 * 60 * 60, // 7 days (same as REFRESH_TOKEN_EXPIRES_IN)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  /**
   * Get refresh token from cookie
   * Check multiple possible cookie names for compatibility
   */
  static getRefreshToken(): string | null {
    // Check our standard cookie name first
    let token = this.getCookie(this.REFRESH_TOKEN_KEY);
    
    // If not found, check for other common cookie names
    if (!token) {
      const alternativeNames = ['refreshToken', 'refresh_token'];
      for (const name of alternativeNames) {
        token = this.getCookie(name);
        if (token) {
          console.log(`🔑 Found refresh token in cookie: ${name}`);
          break;
        }
      }
    }
    
    return token;
  }

  /**
   * Set both access and refresh tokens
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Clear all authentication tokens
   */
  static clearTokens(): void {
    this.deleteCookie(this.ACCESS_TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
    this.deleteCookie(this.USER_SESSION_KEY);
  }

  /**
   * Set user session data
   */
  static setUserSession(user: any): void {
    try {
      const userString = JSON.stringify(user);
      this.setCookie(this.USER_SESSION_KEY, userString, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    } catch (error) {
      console.error('Failed to set user session in cookie:', error);
    }
  }

  /**
   * Get user session data
   * Check multiple possible cookie names for compatibility
   */
  static getUserSession(): any {
    try {
      // Check our standard cookie name first
      let userString = this.getCookie(this.USER_SESSION_KEY);
      
      // If not found, check for other common cookie names
      if (!userString) {
        const alternativeNames = ['userSession', 'user_session'];
        for (const name of alternativeNames) {
          userString = this.getCookie(name);
          if (userString) {
            console.log(`👤 Found user session in cookie: ${name}`);
            break;
          }
        }
      }
      
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Failed to parse user session from cookie:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    this.clearTokens();
    // Also clear any other auth-related data
    localStorage.removeItem('pending2FAUser');
    sessionStorage.clear();
  }
}