// lib/services/customers.service.ts
import { User } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class CustomersService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getCustomers(params: CustomerQueryParams = {}): Promise<{ data: User[]; pagination: PaginationState }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Return empty data as fallback instead of throwing
        console.warn('Failed to fetch customers, returning empty data');
        return {
          data: [],
          pagination: {
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            total: 0,
            totalPages: 0,
          }
        };
      }

      const result = await response.json();
      
      // Handle different response formats from backend
      if (result.data && result.meta) {
        // Backend uses meta for pagination
        return {
          data: result.data.map(this.mapUserToCustomer),
          pagination: {
            page: result.meta.page || params.page || 1,
            pageSize: result.meta.limit || params.pageSize || 10,
            total: result.meta.total || 0,
            totalPages: result.meta.totalPages || 0,
          }
        };
      } else if (Array.isArray(result)) {
        // Backend returns array directly
        return {
          data: result.map(this.mapUserToCustomer),
          pagination: {
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            total: result.length,
            totalPages: 1,
          }
        };
      } else {
        // Fallback
        return {
          data: [],
          pagination: {
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            total: 0,
            totalPages: 0,
          }
        };
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return empty data as fallback
      return {
        data: [],
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          total: 0,
          totalPages: 0,
        }
      };
    }
  }

  async getCustomerById(id: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const user = await response.json();
      return this.mapUserToCustomer(user);
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  private mapUserToCustomer(user: any): User {
    return {
      id: user._id || user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '', 
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status || 'active',
      role: user.role || 'customer',
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    };
  }
}