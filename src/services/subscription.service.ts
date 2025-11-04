import { TokenStorageService } from '@/lib/auth/token-storage.service';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'paused' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  mrr: number;
  metadata: {
    subscriptionType?: string;
    autoRenewal?: boolean;
    planChangeHistory?: Array<{
      oldPlanId: string;
      newPlanId: string;
      oldMrr: number;
      newMrr: number;
      changedAt: string;
      reason?: string;
      prorate: boolean;
    }>;
    adminUpdates?: Array<{
      updatedAt: string;
      changes: any;
      adminNotes?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  features: string[];
  isActive: boolean;
  isVisible: boolean;
  trialPeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  averageLifetime: number;
  totalRevenue: number;
  subscriptionsByPlan: Array<{
    planId: string;
    planName: string;
    count: number;
    revenue: number;
  }>;
  subscriptionsByStatus: Array<{
    status: string;
    count: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    newSubscriptions: number;
    canceledSubscriptions: number;
    netGrowth: number;
    revenue: number;
  }>;
}

class SubscriptionService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Get all subscriptions with filters
  static async getSubscriptions(params: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
    planId?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.status) searchParams.append('status', params.status);
    if (params.planId) searchParams.append('planId', params.planId);

    const response = await fetch(`${this.baseURL}/billing/subscriptions?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscriptions');
    }

    return response.json();
  }

  // Get subscription by ID
  static async getSubscriptionById(id: string): Promise<{ subscription: Subscription }> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subscription');
    }

    return response.json();
  }

  // Update subscription
  static async updateSubscription(id: string, data: Partial<Subscription>): Promise<{ subscription: Subscription }> {
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

  // Admin update subscription (override restrictions)
  static async adminUpdateSubscription(
    id: string,
    data: {
      status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'paused';
      planId?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      autoRenewal?: boolean;
      mrr?: number;
      metadata?: any;
      adminNotes?: string;
    },
  ): Promise<{ subscription: Subscription }> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/admin-update`, {
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

  // Change subscription plan
  static async changeSubscriptionPlan(
    id: string,
    data: {
      newPlanId: string;
      prorate?: boolean;
      effectiveDate?: Date;
      reason?: string;
    },
  ): Promise<{ subscription: Subscription }> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/change-plan`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to change subscription plan');
    }

    return response.json();
  }

  // Toggle auto-renewal
  static async toggleAutoRenewal(id: string, autoRenewal: boolean): Promise<{ subscription: Subscription }> {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/auto-renewal`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ autoRenewal }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to toggle auto-renewal');
    }

    return response.json();
  }

  // Cancel subscription
  static async cancelSubscription(
    id: string,
    data: { immediate?: boolean; churnReason?: string } = {},
  ): Promise<{ subscription: Subscription }> {
    const searchParams = new URLSearchParams();
    if (data.immediate) searchParams.append('immediate', 'true');

    const response = await fetch(`${this.baseURL}/billing/subscriptions/${id}/cancel?${searchParams}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ churnReason: data.churnReason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cancel subscription');
    }

    return response.json();
  }

  // Pause subscription
  static async pauseSubscription(id: string, pauseUntil: Date): Promise<{ subscription: Subscription }> {
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

  // Resume subscription
  static async resumeSubscription(id: string): Promise<{ subscription: Subscription }> {
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

  // Get subscription metrics
  static async getSubscriptionMetrics(from?: Date, to?: Date): Promise<SubscriptionMetrics> {
    const searchParams = new URLSearchParams();
    if (from) searchParams.append('from', from.toISOString());
    if (to) searchParams.append('to', to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/plans/subscription-metrics?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get subscription metrics');
    }

    return response.json();
  }

  // Get upcoming renewals
  static async getUpcomingRenewals(days: number = 7) {
    const response = await fetch(`${this.baseURL}/billing/subscriptions/upcoming-renewals?days=${days}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get upcoming renewals');
    }

    return response.json();
  }

  // Get all plans
  static async getPlans(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isVisible?: boolean;
  } = {}): Promise<{ plans: Plan[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.isVisible !== undefined) searchParams.append('isVisible', params.isVisible.toString());

    const response = await fetch(`${this.baseURL}/billing/plans?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch plans');
    }

    return response.json();
  }

  // Get plan by ID
  static async getPlanById(id: string): Promise<{ plan: Plan }> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch plan');
    }

    return response.json();
  }

  // Create plan
  static async createPlan(data: {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    intervalCount: number;
    features: string[];
    trialPeriodDays?: number;
    isVisible?: boolean;
  }): Promise<{ plan: Plan }> {
    const response = await fetch(`${this.baseURL}/billing/plans`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create plan');
    }

    return response.json();
  }

  // Update plan
  static async updatePlan(id: string, data: Partial<Plan>): Promise<{ plan: Plan }> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update plan');
    }

    return response.json();
  }

  // Delete plan
  static async deletePlan(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete plan');
    }

    return response.json();
  }


}

export const SubscriptionAPI = SubscriptionService;