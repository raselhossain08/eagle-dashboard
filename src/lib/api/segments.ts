// lib/api/segments.ts
import { UserSegment, CreateUserSegmentDto, UpdateUserSegmentDto, SegmentUsersResponse } from '@/types/segments';

export class SegmentsService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async getSegments(): Promise<UserSegment[]> {
    const response = await fetch(`${this.baseURL}/users/segments`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch segments');
    }

    return response.json();
  }

  static async getSegment(id: string): Promise<UserSegment> {
    const response = await fetch(`${this.baseURL}/users/segments/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch segment');
    }

    return response.json();
  }

  static async createSegment(data: CreateUserSegmentDto): Promise<UserSegment> {
    const response = await fetch(`${this.baseURL}/users/segments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create segment');
    }

    return response.json();
  }

  static async updateSegment(id: string, data: UpdateUserSegmentDto): Promise<UserSegment> {
    const response = await fetch(`${this.baseURL}/users/segments/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update segment');
    }

    return response.json();
  }

  static async deleteSegment(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/users/segments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete segment');
    }
  }

  static async getSegmentUsers(id: string, page = 1, limit = 10): Promise<SegmentUsersResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${this.baseURL}/users/segments/${id}/users?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch segment users');
    }

    return response.json();
  }
}