import { API_BASE_URL } from '@/lib/config'
import { AuthCookieService } from '@/lib/auth/cookie-service'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedUsers {
  data: User[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

class UsersService {
  private baseUrl = `${API_BASE_URL}/users`

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        // Return a fallback user object
        console.warn(`User ${id} not found, returning fallback`)
        return {
          id: id,
          email: 'unknown@example.com',
          firstName: 'Unknown',
          lastName: 'User',
          name: 'Unknown User',
          status: 'active' as const,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching user:', error)
      // Return fallback user
      return {
        id: id,
        email: 'unknown@example.com',
        firstName: 'Unknown',
        lastName: 'User',
        name: 'Unknown User',
        status: 'active' as const,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
  } = {}): Promise<PaginatedUsers> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.search) searchParams.append('search', params.search)
      if (params.status) searchParams.append('status', params.status)

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        // Return empty result as fallback
        console.warn('Users endpoint not available, returning empty result')
        return {
          data: [],
          meta: {
            currentPage: params.page || 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: params.limit || 10
          }
        }
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      // Return empty result as fallback
      return {
        data: [],
        meta: {
          currentPage: params.page || 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: params.limit || 10
        }
      }
    }
  }
}

export const usersService = new UsersService()