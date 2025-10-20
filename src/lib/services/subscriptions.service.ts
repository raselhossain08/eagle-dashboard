// lib/api/subscriptions.service.ts
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionsQueryParams, DateRange } from '@/types/billing';

export class SubscriptionsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  constructor(private client: ApiClient) {}

  async getSubscriptions(params: SubscriptionsQueryParams = {}): Promise<{ data: Subscription[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.planId) queryParams.append('planId', params.planId);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/billing/subscriptions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  }

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ immediate, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }

  async pauseSubscription(id: string, until: Date): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/pause`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ until }),
    });

    if (!response.ok) {
      throw new Error('Failed to pause subscription');
    }
  }

  async resumeSubscription(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to resume subscription');
    }
  }

  async getUpcomingRenewals(days: number = 30): Promise<Subscription[]> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/upcoming-renewals?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming renewals');
    }

    return response.json();
  }
}