// lib/api/discounts.service.ts
import { apiClient } from './api-client';
import { Discount, CreateDiscountDto, ValidateDiscountDto, ValidationResult, DiscountsOverviewData } from '@/types/discounts';

export interface DiscountsResponse {
  data: Discount[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BulkGenerationResult {
  codes: string[];
  discounts: Discount[];
}

export interface DiscountPerformance {
  discount: Discount;
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalRevenue: number;
  redemptionRate: number;
  averageOrderValue: number;
}

export class DiscountsService {
  private baseUrl = '/discounts';

  async getDiscounts(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    type?: string;
    campaignId?: string;
  } = {}): Promise<DiscountsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.type) searchParams.append('type', params.type);
    if (params.campaignId) searchParams.append('campaignId', params.campaignId);

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return await apiClient.get<DiscountsResponse>(url);
  }

  async getDiscountById(id: string): Promise<Discount> {
    return await apiClient.get<Discount>(`${this.baseUrl}/${id}`);
  }

  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    return await apiClient.post<Discount>(this.baseUrl, data);
  }

  async updateDiscount(id: string, data: Partial<CreateDiscountDto>): Promise<Discount> {
    return await apiClient.patch<Discount>(`${this.baseUrl}/${id}`, data);
  }

  async deactivateDiscount(id: string): Promise<Discount> {
    return this.updateDiscount(id, { isActive: false });
  }

  async validateDiscount(data: ValidateDiscountDto): Promise<ValidationResult> {
    return await apiClient.post<ValidationResult>(`${this.baseUrl}/validate`, data);
  }

  async getDiscountsOverview(): Promise<DiscountsOverviewData> {
    return await apiClient.get<DiscountsOverviewData>(`${this.baseUrl}/overview`);
  }

  async getActiveDiscounts(): Promise<Discount[]> {
    return await apiClient.get<Discount[]>(`${this.baseUrl}/active`);
  }

  async generateBulkDiscounts(template: CreateDiscountDto, count: number, prefix?: string): Promise<BulkGenerationResult> {
    return await apiClient.post<BulkGenerationResult>(`${this.baseUrl}/bulk-generate`, {
      template,
      count,
      prefix
    });
  }

  async getDiscountPerformance(id: string): Promise<DiscountPerformance> {
    return await apiClient.get<DiscountPerformance>(`${this.baseUrl}/${id}/performance`);
  }

  async exportDiscounts(params: { format?: 'csv' | 'excel'; filters?: any } = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (params.format) searchParams.append('format', params.format);
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/export${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Get auth token
    const token = localStorage.getItem('access_token');
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
}

export const discountsService = new DiscountsService();