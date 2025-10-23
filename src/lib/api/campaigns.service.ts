// lib/api/campaigns.service.ts
import { apiClient } from './api-client';
import { Campaign, CreateCampaignDto } from '@/types/discounts';

export interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CampaignPerformanceResponse {
  campaign: Campaign;
  performance: {
    totalRedemptions: number;
    totalRevenue: number;
    totalDiscountAmount: number;
    conversionRate: number;
    roi: number;
    budgetUtilization: number;
  };
  topDiscounts: Array<{ discount: any; redemptions: number }>;
  dailyPerformance: Array<{ date: string; redemptions: number; revenue: number }>;
}

export interface CampaignsOverviewResponse {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  budgetSpent: number;
  averageROI: number;
  topPerformingCampaign: string | null;
}

export class CampaignsService {
  private baseUrl = '/api/discounts/campaigns';

  async getCampaigns(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    type?: string;
  } = {}): Promise<CampaignsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.type) searchParams.append('type', params.type);

    const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return await apiClient.get<CampaignsResponse>(url);
  }

  async getCampaignById(id: string): Promise<Campaign> {
    return await apiClient.get<Campaign>(`${this.baseUrl}/${id}`);
  }

  async getCampaignPerformance(id: string): Promise<CampaignPerformanceResponse> {
    return await apiClient.get<CampaignPerformanceResponse>(`${this.baseUrl}/${id}/performance`);
  }

  async getCampaignsOverview(): Promise<CampaignsOverviewResponse> {
    return await apiClient.get<CampaignsOverviewResponse>(`${this.baseUrl}/analytics/overview`);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return await apiClient.get<Campaign[]>(`${this.baseUrl}/active`);
  }

  async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    return await apiClient.post<Campaign>(this.baseUrl, data);
  }

  async updateCampaign(id: string, data: Partial<CreateCampaignDto>): Promise<Campaign> {
    return await apiClient.patch<Campaign>(`${this.baseUrl}/${id}`, data);
  }

  async archiveCampaign(id: string): Promise<Campaign> {
    return await apiClient.post<Campaign>(`${this.baseUrl}/${id}/archive`);
  }

  async addDiscountToCampaign(campaignId: string, discountId: string): Promise<Campaign> {
    return await apiClient.post<Campaign>(`${this.baseUrl}/${campaignId}/discounts/${discountId}`);
  }
}

export const campaignsService = new CampaignsService();