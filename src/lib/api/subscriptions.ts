// lib/api/subscriptions.ts
import { TokenStorageService } from '@/lib/auth/token-storage.service';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused' | 'pending';
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  amount: number;
  currency: string;
  paymentMethod?: {
    type: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  nextBillingDate?: string;
  trial?: {
    isTrialPeriod: boolean;
    trialEndDate?: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  isActive: boolean;
  trialDays?: number;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  userId: string;
  planId: string;
  billingCycle: string;
  startDate?: string;
  paymentMethodId?: string;
  couponCode?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  billingCycle?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
    currency: string;
  };
  churnRate: number;
  averageLifetimeValue: number;
  conversionRate: number;
  trialConversions: number;
  subscriptionsByStatus: { status: string; count: number }[];
  subscriptionsByPlan: { planName: string; count: number; revenue: number }[];
}

export class SubscriptionsService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async getUserSubscriptions(userId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
  } = {}): Promise<{ subscriptions: Subscription[]; totalCount: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', userId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.planId) queryParams.append('planId', params.planId);

    const response = await fetch(`${this.baseURL}/billing/subscriptions?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscriptions');
    }

    const data = await response.json();
    return {
      subscriptions: data.data || [],
      totalCount: data.meta?.total || 0,
      totalPages: data.meta?.totalPages || 0,
    };
  }

  static async getSubscription(id: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscription');
    }

    return response.json();
  }

  static async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create subscription');
    }

    return response.json();
  }

  static async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update subscription');
    }

    return response.json();
  }

  static async cancelSubscription(id: string, immediate: boolean = false, reason?: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/cancel?immediate=${immediate}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ churnReason: reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cancel subscription');
    }

    return response.json();
  }

  static async pauseSubscription(id: string, pauseUntil?: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/pause`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ pauseUntil }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to pause subscription');
    }

    return response.json();
  }

  static async resumeSubscription(id: string): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/resume`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to resume subscription');
    }

    return response.json();
  }

  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${this.baseURL}/billing/plans`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscription plans');
    }

    const data = await response.json();
    return data.data || [];
  }

  static async getSubscriptionMetrics(userId?: string): Promise<SubscriptionMetrics> {
    const url = userId 
      ? `${this.baseURL}/billing/metrics/user/${userId}`
      : `${this.baseURL}/billing/metrics`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscription metrics');
    }

    return response.json();
  }

  static async getSubscriptionInvoices(subscriptionId: string): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${subscriptionId}/invoices`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscription invoices');
    }

    const data = await response.json();
    return data.data || [];
  }
}