// lib/api/discount-performance.service.ts
import { apiClient } from './api-client';
import { Discount } from '@/types/discounts';

export interface DiscountPerformanceData {
  discount: Discount;
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalRevenue: number;
  redemptionRate: number;
  averageOrderValue: number;
  conversionRate?: number;
  peakUsagePeriod?: {
    period: string;
    count: number;
  };
  recentRedemptions?: Array<{
    id: string;
    userId: string;
    discountAmount: number;
    orderAmount: number;
    redeemedAt: Date;
  }>;
  revenueImpact: {
    directRevenue: number;
    incrementalRevenue: number;
    discountCost: number;
    roi: number;
  };
  geographicBreakdown?: Array<{
    country: string;
    redemptions: number;
    revenue: number;
  }>;
  campaignPerformance?: {
    campaignName?: string;
    campaignContribution: number;
    crossCampaignUsage: number;
  };
}

export interface DiscountValidationData {
  code: string;
  customerEmail?: string;
  orderAmount?: number;
  planIds?: string[];
  customerCountry?: string;
  isNewCustomer?: boolean;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discount?: Discount;
  discountedAmount: number;
  error?: string;
  warnings?: string[];
  recommendations?: string[];
}

export class DiscountPerformanceService {
  private baseUrl = '/discounts';

  async getDiscountPerformance(id: string): Promise<DiscountPerformanceData> {
    return await apiClient.get<DiscountPerformanceData>(`${this.baseUrl}/${id}/performance`);
  }

  async validateDiscountCode(data: DiscountValidationData): Promise<DiscountValidationResult> {
    return await apiClient.post<DiscountValidationResult>(`${this.baseUrl}/validate`, data);
  }

  async getDiscountRedemptionHistory(id: string, params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{
    data: Array<{
      id: string;
      userId: string;
      userEmail?: string;
      discountAmount: number;
      orderAmount: number;
      finalAmount: number;
      currency: string;
      redeemedAt: Date;
      ipAddress?: string;
      userAgent?: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);

    const url = `${this.baseUrl}/${id}/redemptions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await apiClient.get(url);
  }

  async getDiscountAnalytics(id: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    timeline: Array<{
      date: string;
      redemptions: number;
      revenue: number;
      discountAmount: number;
    }>;
    comparison: {
      previousPeriod: {
        redemptions: number;
        revenue: number;
        discountAmount: number;
      };
      growth: {
        redemptions: number;
        revenue: number;
        efficiency: number;
      };
    };
    predictions: {
      expectedRedemptions: number;
      expectedRevenue: number;
      recommendedEndDate?: string;
    };
  }> {
    return await apiClient.get(`${this.baseUrl}/${id}/analytics?period=${period}`);
  }

  async generateDiscountReport(id: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${this.baseUrl}/${id}/report?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const discountPerformanceService = new DiscountPerformanceService();