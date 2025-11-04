// lib/api/subscribers.ts (Real API Integration)
import { 
  SubscriberProfile, 
  Subscription, 
  Activity, 
  SubscriberParams, 
  SubscriberResponse 
} from '@/types/subscribers';
import { TokenStorageService } from '@/lib/auth/token-storage.service';

interface AnalyticsData {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersLast7Days: number;
  newSubscribersLast30Days: number;
  churnRate: number;
  averageLifetimeValue: number;
  conversionRate: number;
  monthlyRecurringRevenue: number;
  activityData: Array<{
    _id: string;
    count: number;
    percentage: number;
  }>;
  subscriptionBreakdown: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
    percentage: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
    subscribers: number;
  }>;
  churnData: Array<{
    date: string;
    churnRate: number;
    churnedCount: number;
  }>;
}

interface GrowthData {
  date: string;
  newSubscribers: number;
  totalSubscribers: number;
  growthRate: number;
}

class SubscribersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      const token = TokenStorageService.getAccessToken();
      
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
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        
        const error = new Error(errorData.message || `API Error: ${response.status}`);
        (error as any).status = response.status;
        (error as any).data = errorData;
        
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const networkError = new Error('Network error: Unable to connect to the server');
        (networkError as any).status = 0;
        throw networkError;
      }
      throw error;
    }
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

  async createSubscriber(data: any): Promise<SubscriberProfile> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async getSubscriberGrowth(days = 30): Promise<GrowthData[]> {
    try {
      const searchParams = new URLSearchParams({ days: days.toString() });
      const response = await this.fetchWithAuth(`${this.baseUrl}/subscribers/growth?${searchParams}`);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.growthData && Array.isArray(response.growthData)) {
        return response.growthData;
      }
      
      // Fallback to empty array if no valid data
      console.warn('Unexpected growth data format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching subscriber growth:', error);
      throw error;
    }
  }

  async getSubscriberAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await this.fetchWithAuth(`${this.baseUrl}/subscribers/analytics`);
      
      // Ensure all required fields exist with defaults
      const defaultAnalytics: AnalyticsData = {
        totalSubscribers: 0,
        activeSubscribers: 0,
        newSubscribersLast7Days: 0,
        newSubscribersLast30Days: 0,
        churnRate: 0,
        averageLifetimeValue: 0,
        conversionRate: 0,
        monthlyRecurringRevenue: 0,
        activityData: [],
        subscriptionBreakdown: [],
        revenueData: [],
        churnData: [],
      };
      
      return {
        ...defaultAnalytics,
        ...response,
      };
    } catch (error) {
      console.error('Error fetching subscriber analytics:', error);
      throw error;
    }
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
    const response = await this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}/subscribers`);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getSegmentAnalytics(segmentId: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}/analytics`);
  }

  async getSegmentStatistics(segmentId: string): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}/statistics`);
  }

  async exportSegmentSubscribers(segmentId: string, format: string = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/subscribers/segments/${segmentId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error('Segment export failed');
    }

    return response.blob();
  }

  async sendSegmentEmail(segmentId: string, emailData: any): Promise<any> {
    return this.fetchWithAuth(`${this.baseUrl}/subscribers/segments/${segmentId}/send-email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
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
        Authorization: `Bearer ${TokenStorageService.getAccessToken()}`,
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