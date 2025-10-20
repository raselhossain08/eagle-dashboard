import { toast } from 'sonner'
import { AuthCookieService } from '@/lib/auth/cookie-service'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | null {
    // First try cookies
    let token = AuthCookieService.getAccessToken()
    
    // If no token in cookies, try localStorage as fallback
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('eagle_access_token') || 
              localStorage.getItem('accessToken') ||
              localStorage.getItem('token')
    }
    
    return token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()
    
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token'
    });
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        
        console.error('❌ API Error Data:', errorData);
        
        if (response.status === 401) {
          // Handle unauthorized access
          throw new HttpError(response.status, 'Authentication required', errorData)
        }
        
        if (response.status === 429) {
          // Handle rate limiting
          throw new HttpError(response.status, 'Rate limit exceeded', errorData)
        }
        
        throw new HttpError(
          response.status,
          `API Error: ${response.status} ${response.statusText}`,
          errorData
        )
      }

      const responseData = await response.json()
      console.log('✅ API Success:', { url, dataKeys: Object.keys(responseData || {}) });
      return responseData
    } catch (error) {
      if (error instanceof HttpError) {
        // Show user-friendly error messages
        this.handleError(error)
        throw error
      }
      
      const networkError = new NetworkError(
        error instanceof Error ? error.message : 'Network request failed'
      )
      this.handleError(networkError)
      throw networkError
    }
  }

  private handleError(error: HttpError | NetworkError) {
    if (error instanceof HttpError) {
      switch (error.status) {
        case 401:
          toast.error('Authentication required. Please sign in again.')
          break
        case 429:
          toast.error('Rate limit exceeded. Please wait before making more requests.')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(`API Error: ${error.message}`)
      }
    } else {
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? new URLSearchParams(this.serializeParams(params)).toString() : ''
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  private serializeParams(params: Record<string, any>): Record<string, string> {
    const serialized: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        continue
      }
      
      if (value instanceof Date) {
        serialized[key] = value.toISOString()
      } else if (Array.isArray(value)) {
        serialized[key] = value.join(',')
      } else {
        serialized[key] = value.toString()
      }
    }
    
    return serialized
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1')