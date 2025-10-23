// lib/api/subscriptions.service.ts
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionsQueryParams, DateRange } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class SubscriptionsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getSubscriptions(params: SubscriptionsQueryParams = {}): Promise<{ data: Subscription[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.planId) queryParams.append('planId', params.planId);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseURL}/billing/subscriptions?${queryParams}`;
    const headers = this.getAuthHeaders();
    
    console.log('Fetching subscriptions:', { url, headers });

    try {
      const response = await fetch(url, { headers });

      console.log('Subscriptions API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Subscriptions API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url,
          headers
        });
        throw new Error(`Failed to fetch subscriptions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Subscriptions API Result:', result);
      
      // Ensure the response has the expected structure
      return {
        data: result.data || [],
        pagination: {
          page: result.pagination?.page || params.page || 1,
          pageSize: result.pagination?.pageSize || params.pageSize || 10,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.totalPages || 0,
        }
      };
    } catch (error) {
      console.error('Error in getSubscriptions:', error);
      throw error;
    }
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return response.json();
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    return response.json();
  }

  async cancelSubscription(id: string, immediate: boolean = false, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ immediate, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }

  async pauseSubscription(id: string, until: Date): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/pause`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ until }),
    });

    if (!response.ok) {
      throw new Error('Failed to pause subscription');
    }
  }

  async resumeSubscription(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/resume`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to resume subscription');
    }
  }

  async getUpcomingRenewals(days: number = 30): Promise<Subscription[]> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/upcoming-renewals?days=${days}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming renewals');
    }

    return response.json();
  }
}