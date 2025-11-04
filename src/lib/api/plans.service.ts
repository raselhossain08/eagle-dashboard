// lib/api/plans.service.ts
import { apiClient } from './api-client';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  priceAmount: number;
  currency: string;
  interval: 'month' | 'year' | 'week' | 'day';
  intervalCount: number;
  trialDays?: number;
  isActive: boolean;
  metadata: {
    category: 'subscription' | 'one-time' | 'usage-based';
    features?: string[];
    maxUsers?: number;
    storage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlansResponse {
  data: Plan[];
  totalCount: number;
  page: number;
  limit: number;
}

export class PlansService {
  private baseUrl = '/public/plans';

  async getPlans(params: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
  } = {}): Promise<PlansResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return await apiClient.get<PlansResponse>(url);
  }

  async getSubscriptionPlans(): Promise<PlansResponse> {
    return await apiClient.get<PlansResponse>(`${this.baseUrl}/subscription`);
  }

  async getPlanById(id: string): Promise<Plan> {
    return await apiClient.get<Plan>(`${this.baseUrl}/${id}`);
  }

  async getActivePlans(): Promise<Plan[]> {
    const response = await this.getPlans({ isActive: true, limit: 100 });
    return response.data;
  }

  async getSubscriptionActivePlans(): Promise<Plan[]> {
    const response = await this.getSubscriptionPlans();
    return response.data.filter(plan => plan.isActive);
  }
}

export const plansService = new PlansService();