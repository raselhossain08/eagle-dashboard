// lib/api/redemptions.service.ts
import { apiClient } from './api-client';
import { Redemption, RedemptionFilters, DateRange } from '@/types/discounts';
import { TokenStorageService } from '@/lib/auth/token-storage.service';

export interface RedemptionsResponse {
  redemptions: Redemption[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RedemptionStats {
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalRevenue: number;
  averageDiscount: number;
  conversionRate: number;
  averageOrderValue: number;
  topDiscounts: Array<{
    discount: any;
    redemptions: number;
    totalDiscount: number;
  }>;
  topChannels: Array<{
    channel: string;
    redemptions: number;
  }>;
  topCodes: Array<{
    code: string;
    redemptions: number;
  }>;
  conversionFunnel: Array<{
    step: string;
    count: number;
  }>;
}

export interface SuspiciousActivity {
  type: 'multiple_ips' | 'bulk_redemptions' | 'unusual_pattern' | 'high_value_new_user';
  count: number;
  details: string;
  redemptions: Redemption[];
  fraudScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class RedemptionsService {
  private baseUrl = '/discounts/redemptions';

  async getRedemptions(params: {
    page?: number;
    limit?: number;
    discountId?: string;
    userId?: string;
    campaignId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<RedemptionsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.discountId) searchParams.append('discountId', params.discountId);
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.campaignId) searchParams.append('campaignId', params.campaignId);
    if (params.startDate) searchParams.append('startDate', params.startDate.toISOString());
    if (params.endDate) searchParams.append('endDate', params.endDate.toISOString());
    if (params.search) searchParams.append('search', params.search);

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return await apiClient.get<RedemptionsResponse>(url);
  }

  async getRedemptionById(id: string): Promise<Redemption> {
    return await apiClient.get<Redemption>(`${this.baseUrl}/${id}`);
  }

  async getRedemptionStats(dateRange: DateRange): Promise<RedemptionStats> {
    const searchParams = new URLSearchParams();
    searchParams.append('startDate', dateRange.from.toISOString());
    searchParams.append('endDate', dateRange.to.toISOString());

    return await apiClient.get<RedemptionStats>(`${this.baseUrl}/stats?${searchParams.toString()}`);
  }

  async getSuspiciousRedemptions(): Promise<SuspiciousActivity[]> {
    return await apiClient.get<SuspiciousActivity[]>(`${this.baseUrl}/suspicious`);
  }

  async exportRedemptions(params: {
    startDate: Date;
    endDate: Date;
    format?: 'csv' | 'excel';
    filters?: RedemptionFilters;
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    searchParams.append('startDate', params.startDate.toISOString());
    searchParams.append('endDate', params.endDate.toISOString());
    
    if (params.format) searchParams.append('format', params.format);
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/export?${searchParams.toString()}`;
    
    // Get auth token
    const token = TokenStorageService.getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${errorText}`);
    }

    return await response.blob();
  }

  async flagRedemption(id: string, reason: string): Promise<void> {
    return await apiClient.post(`${this.baseUrl}/${id}/flag`, { reason });
  }

  async blockSuspiciousActivity(criteria: {
    ipAddress?: string;
    userId?: string;
    pattern?: string;
  }): Promise<void> {
    return await apiClient.post(`${this.baseUrl}/block`, criteria);
  }
}

export const redemptionsService = new RedemptionsService();