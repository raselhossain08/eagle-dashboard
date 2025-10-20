// lib/api/api-client.ts
import { CookiesService } from '@/lib/auth/cookies.service';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return CookiesService.getCookie('accessToken');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers = new Headers({
      ...this.defaultHeaders,
      ...options.headers as HeadersInit,
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('ApiClient: Making request to:', url);
      const response = await fetch(url, config);
      console.log('ApiClient: Response status:', response.status);

      if (response.status === 401) {
        console.log('ApiClient: 401 Unauthorized');
        
        // Only redirect to login if this is not a login request
        // and if the user has a token (meaning they were logged in)
        if (!endpoint.includes('/auth/login') && token) {
          console.log('ApiClient: Token expired - clearing tokens and redirecting');
          CookiesService.removeCookie('accessToken');
          CookiesService.removeCookie('refreshToken');
          window.location.href = '/login';
        }
        
        // For login requests or when no token exists, just throw an error
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