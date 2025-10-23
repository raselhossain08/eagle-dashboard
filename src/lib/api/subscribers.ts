// lib/api/subscribers.ts (Real API Integration)
import { 
  SubscriberProfile, 
  Subscription, 
  Activity, 
  SubscriberParams, 
  SubscriberResponse 
} from '@/types/subscribers';

class SubscribersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSubscribers(params?: SubscriberParams): Promise<SubscriberResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('q', params.search);
    if (params?.filters?.status?.length) {
      searchParams.set('status', params.filters.status[0]); // Take first status for simplicity
    }

    const response = await this.fetchWithAuth(`${this.baseUrl}/subscribers?${searchParams}`);
    
    return {
      subscribers: response.data,
      totalCount: response.pagination.total,
      page: response.pagination.page,
      totalPages: response.pagination.pages,
    };
  }

  async getSubscriber(id: string): Promise<SubscriberProfile> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${id}`);
  }

  async updateSubscriber(id: string, data: Partial<SubscriberProfile>): Promise<SubscriberProfile> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscriber(id: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/subscribers/${id}`, {
      method: 'DELETE',
    });
  }

  async searchSubscribers(query: string): Promise<SubscriberProfile[]> {
    const searchParams = new URLSearchParams({ q: query });
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/search?${searchParams}`);
  }

  async getTopSubscribers(limit = 10): Promise<SubscriberProfile[]> {
    const searchParams = new URLSearchParams({ limit: limit.toString() });
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/top?${searchParams}`);
  }

  async getSubscriberGrowth(days = 30): Promise<any> {
    const searchParams = new URLSearchParams({ days: days.toString() });
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/growth?${searchParams}`);
  }

  async getSubscriberAnalytics(): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/analytics`);
  }

  // Subscription related methods
  async getSubscriberSubscriptions(subscriberId: string): Promise<Subscription[]> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/subscriptions`);
  }

  async createSubscription(subscriberId: string, subscriptionData: any): Promise<Subscription> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateSubscription(subscriptionId: string, data: any): Promise<Subscription> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Activity related methods
  async getSubscriberActivities(subscriberId: string, page = 1, limit = 20): Promise<{ data: Activity[]; pagination: any }> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/activities?${searchParams}`);
  }

  async createActivity(subscriberId: string, activityData: any): Promise<Activity> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Segment related methods
  async getSegments(): Promise<any[]> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments`);
  }

  async getSegment(segmentId: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}`);
  }

  async createSegment(segmentData: any): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments`, {
      method: 'POST',
      body: JSON.stringify(segmentData),
    });
  }

  async updateSegment(segmentId: string, data: any): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSegment(segmentId: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}`, {
      method: 'DELETE',
    });
  }

  async getSubscribersInSegment(segmentId: string): Promise<SubscriberProfile[]> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}/subscribers`);
  }

  // Billing related methods
  async getSubscriberBillingSummary(subscriberId: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/billing-summary`);
  }

  async getSubscriberInvoices(subscriberId: string, page = 1, limit = 10): Promise<any> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/invoices?${searchParams}`);
  }

  async getSubscriberPaymentMethods(subscriberId: string): Promise<any[]> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/payment-methods`);
  }

  // Profile management methods
  async getSubscriberProfileSummary(subscriberId: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/profile-summary`);
  }

  async updateKycStatus(subscriberId: string, kycStatus: string, notes?: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/${subscriberId}/kyc-status`, {
      method: 'PATCH',
      body: JSON.stringify({ kycStatus, notes }),
    });
  }

  // Export functionality
  async exportSubscribers(format: string, fields: string[], subscriberIds?: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/subscribers/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        format,
        fields,
        subscriberIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const subscribersService = new SubscribersService();