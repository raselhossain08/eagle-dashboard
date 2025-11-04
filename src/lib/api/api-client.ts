// lib/api/api-client.ts
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { AuthCookieService } from '@/lib/auth/cookie-service';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Try to get token from TokenStorageService first (primary), then fallback to AuthCookieService
    let token = TokenStorageService.getAccessToken();
    if (!token) {
      token = AuthCookieService.getAccessToken();
    }
    
    const headers = new Headers({
      ...this.defaultHeaders,
      ...options.headers as HeadersInit,
    });

    // Add Authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('🔑 ApiClient: Added Authorization header with token');
    } else {
      console.log('⚠️ ApiClient: No access token found for request');
    }

    // For Next.js API routes, use relative URLs. For backend API, use full URL.
    const url = endpoint.startsWith('/api/') 
      ? endpoint // Next.js API route - use as is
      : `${this.baseURL}${endpoint}`; // Backend API - prepend baseURL
    
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
    };

    try {
      console.log('ApiClient: Making request to:', url, '(endpoint:', endpoint, ')');
      const response = await fetch(url, config);
      console.log('ApiClient: Response status:', response.status);

      if (response.status === 401) {
        console.log('ApiClient: 401 Unauthorized');
        
        // Clear authentication data on 401
        TokenStorageService.clearTokens();
        AuthCookieService.clearAuthData();
        
        // Don't redirect to login - just throw error and let components handle it
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.warn('Failed to parse error response as JSON:', jsonError);
        }
        
        const errorMessage = errorData.message || 
                           errorData.error || 
                           'Authentication failed';
        
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.warn('Failed to parse error response as JSON:', jsonError);
        }
        
        const errorMessage = errorData.message || 
                           errorData.error || 
                           `HTTP error! status: ${response.status}`;
        
        console.error('ApiClient: HTTP error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json();
      console.log('ApiClient: Response data received');
      return responseData;
    } catch (error) {
      console.error('ApiClient: Request failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Export the class for backwards compatibility
export { ApiClient };