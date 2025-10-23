// lib/services/users.service.ts
import { User } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class UsersService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}): Promise<{ data: User[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }
}