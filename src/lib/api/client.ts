import { toast } from '@/components/ui/sonner'

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
  private token?: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        
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

      return await response.json()
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
          toast({
            title: 'Authentication Error',
            description: 'Please sign in again.',
            variant: 'destructive',
          })
          break
        case 429:
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Please wait before making more requests.',
            variant: 'destructive',
          })
          break
        case 500:
          toast({
            title: 'Server Error',
            description: 'Please try again later.',
            variant: 'destructive',
          })
          break
        default:
          toast({
            title: 'API Error',
            description: error.message,
            variant: 'destructive',
          })
      }
    } else {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
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

export const apiClient = new ApiClient(process.env.EAGLE_ANALYTICS_API_URL || 'http://localhost:8000/api')