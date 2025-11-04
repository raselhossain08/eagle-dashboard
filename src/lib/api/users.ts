// lib/api/users.ts
import { User, UsersResponse, CreateUserDto, UpdateUserDto } from '@/types/users';
import { TokenStorageService } from '@/lib/auth/token-storage.service';

export class UsersService {
  // Default to backend configuration used by eagle-backend (port 5000, apiPrefix /api/v1)
  // Production should override this via NEXT_PUBLIC_API_URL
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sort?: string;
  } = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    const data = await response.json();
    
    // Transform backend response to match frontend interface
    // Handle both possible response structures
    return {
      users: data.users || data.data || [],
      totalCount: data.total || data.meta?.total || 0,
      page: data.page || data.meta?.page || 1,
      pageSize: data.pageSize || data.meta?.limit || 10,
      totalPages: data.totalPages || data.meta?.totalPages || 0,
    };
  }

  static async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user');
    }

    return response.json();
  }

  static async createUser(data: CreateUserDto): Promise<User> {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create user');
    }

    return response.json();
  }

  static async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update user');
    }

    return response.json();
  }

  static async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update user status');
    }

    return response.json();
  }

  static async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete user');
    }
  }

  static async getUserMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    userGrowthRate: number;
  }> {
    const response = await fetch(`${this.baseURL}/users/metrics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user metrics');
    }

    return response.json();
  }

  static async getUserAnalytics(timeRange: string = '30d'): Promise<any> {
    const response = await fetch(`${this.baseURL}/analytics/users?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user analytics');
    }

    return response.json();
  }
}