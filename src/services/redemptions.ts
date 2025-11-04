// services/redemptions.ts - Enhanced Real API Integration
import { apiClient } from '@/lib/api/api-client';
import { DateRange } from '@/types/discounts';

// Enhanced Redemption Interfaces
export interface EnhancedRedemption {
  id: string;
  code: string;
  discountId: string;
  userId: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  redeemedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    platform: string;
    browser: string;
    isMobile: boolean;
  };
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  fraudScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isSuspicious?: boolean;
  fraudFlags?: string[];
  campaignId?: string;
  channelSource?: string;
  referralCode?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    registrationDate: Date;
    orderHistory: number;
    lifetimeValue: number;
  };
  discount?: {
    id: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed' | 'freeShipping';
    value: number;
    minimumAmount?: number;
    maximumDiscount?: number;
  };
  order?: {
    id: string;
    totalAmount: number;
    items: number;
    paymentMethod: string;
    status: string;
  };
}

export interface RedemptionsQueryParams {
  page?: number;
  limit?: number;
  discountId?: string;
  userId?: string;
  campaignId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  status?: 'active' | 'used' | 'expired' | 'blocked';
  sortBy?: 'createdAt' | 'redeemedAt' | 'discountAmount' | 'orderAmount';
  sortOrder?: 'asc' | 'desc';
  includeUser?: boolean;
  includeFraudScore?: boolean;
}

export interface RedemptionsResponse {
  redemptions: EnhancedRedemption[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  metadata: {
    totalValue: number;
    totalDiscounts: number;
    avgOrderValue: number;
    suspiciousCount: number;
    topCountries: string[];
    topChannels: string[];
  };
}

export interface RedemptionStats {
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalRevenue: number;
  averageDiscount: number;
  conversionRate: number;
  averageOrderValue: number;
  growthMetrics: {
    redemptionsGrowth: number;
    revenueGrowth: number;
    conversionGrowth: number;
  };
  topDiscounts: Array<{
    id: string;
    code: string;
    title: string;
    redemptions: number;
    totalDiscount: number;
    revenue: number;
    conversionRate: number;
  }>;
  topChannels: Array<{
    channel: string;
    redemptions: number;
    revenue: number;
    avgOrderValue: number;
  }>;
  topCodes: Array<{
    code: string;
    redemptions: number;
    revenue: number;
    uniqueUsers: number;
  }>;
  conversionFunnel: Array<{
    step: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }>;
  geographicData: Array<{
    country: string;
    redemptions: number;
    revenue: number;
    avgOrderValue: number;
  }>;
  timelineData: Array<{
    date: string;
    redemptions: number;
    revenue: number;
    uniqueUsers: number;
    avgOrderValue: number;
  }>;
}

// Legacy interfaces for backward compatibility
export interface RedemptionAnalyticsResponse {
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  averageOrderValue: number;
  conversionRate: number;
  periodComparison?: {
    current: { redemptions: number; revenue: number; growth: number };
    previous: { redemptions: number; revenue: number; growth: number };
    changePercent: number;
  };
}

export interface TimelineAnalyticsResponse {
  data: Array<{
    date: string;
    redemptions: number;
    revenue: number;
    discountAmount: number;
    conversionRate: number;
  }>;
}

export interface ChannelAnalyticsResponse {
  data: Array<{
    channel: string;
    redemptions: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
  }>;
}

export interface CodeAnalyticsResponse {
  data: Array<{
    code: string;
    redemptions: number;
    revenue: number;
    conversionRate: number;
    discountAmount: number;
  }>;
}

export interface GeographicAnalyticsResponse {
  data: Array<{
    country: string;
    redemptions: number;
    revenue: number;
  }>;
}

export interface CustomerSegmentAnalyticsResponse {
  data: Array<{
    segment: string;
    redemptions: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

export interface ConversionFunnelResponse {
  data: Array<{
    step: string;
    count: number;
    rate: number;
  }>;
}

export interface RecentRedemptionsResponse {
  data: Array<{
    id: string;
    code: string;
    userId: string;
    userEmail?: string;
    orderValue: number;
    discountAmount: number;
    timestamp: string;
    channel?: string;
  }>;
}

// Enhanced Core Redemptions API calls
export async function getRedemptions(params: RedemptionsQueryParams = {}): Promise<RedemptionsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    
    // Add filter parameters
    if (params.discountId) queryParams.set('discountId', params.discountId);
    if (params.userId) queryParams.set('userId', params.userId);
    if (params.campaignId) queryParams.set('campaignId', params.campaignId);
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    
    // Add date range parameters
    if (params.startDate) queryParams.set('startDate', params.startDate.toISOString());
    if (params.endDate) queryParams.set('endDate', params.endDate.toISOString());
    
    // Add sorting parameters
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    // Add inclusion parameters
    if (params.includeUser) queryParams.set('includeUser', String(params.includeUser));
    if (params.includeFraudScore) queryParams.set('includeFraudScore', String(params.includeFraudScore));
    
    const response = await apiClient.get<RedemptionsResponse>(
      `/discounts/redemptions?${queryParams.toString()}`
    );
    
    // Transform dates from strings to Date objects
    response.redemptions = response.redemptions.map(redemption => ({
      ...redemption,
      redeemedAt: new Date(redemption.redeemedAt),
      createdAt: new Date(redemption.createdAt),
      updatedAt: new Date(redemption.updatedAt),
      user: redemption.user ? {
        ...redemption.user,
        registrationDate: new Date(redemption.user.registrationDate)
      } : undefined
    }));
    
    return response;
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    throw new Error('Failed to fetch redemptions data');
  }
}

export async function getRedemptionStats(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<RedemptionStats> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);
    
    const response = await apiClient.get<RedemptionStats>(
      `/discounts/redemptions/stats?${queryParams.toString()}`
    );
    
    return response;
  } catch (error) {
    console.error('Error fetching redemption stats:', error);
    throw new Error('Failed to fetch redemption statistics');
  }
}

export async function getRedemptionById(id: string): Promise<EnhancedRedemption> {
  try {
    const response = await apiClient.get<EnhancedRedemption>(
      `/discounts/redemptions/${id}`
    );
    
    // Transform dates from strings to Date objects
    return {
      ...response,
      redeemedAt: new Date(response.redeemedAt),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      user: response.user ? {
        ...response.user,
        registrationDate: new Date(response.user.registrationDate)
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching redemption details:', error);
    throw new Error('Failed to fetch redemption details');
  }
}

export async function flagRedemption(id: string, flagData: {
  reason: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/discounts/redemptions/${id}/flag`,
      flagData
    );
    
    return response;
  } catch (error) {
    console.error('Error flagging redemption:', error);
    throw new Error('Failed to flag redemption');
  }
}

export async function blockSuspiciousActivity(criteria: {
  ipAddress?: string;
  userId?: string;
  pattern?: string;
  reason?: string;
}): Promise<{ success: boolean; message: string; blockedCount: number }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string; blockedCount: number }>(
      '/discounts/redemptions/block',
      criteria
    );
    
    return response;
  } catch (error) {
    console.error('Error blocking suspicious activity:', error);
    throw new Error('Failed to block suspicious activity');
  }
}

export async function exportRedemptions(params: RedemptionsQueryParams & {
  format?: 'csv' | 'excel' | 'json';
} = {}): Promise<Blob> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'startDate' || key === 'endDate') {
          queryParams.set(key, (value as Date).toISOString());
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
    
    // Set default format if not specified
    if (!queryParams.has('format')) {
      queryParams.set('format', 'csv');
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/discounts/redemptions/export?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting redemptions:', error);
    throw new Error('Failed to export redemptions data');
  }
}

// Core analytics API calls
export async function getAnalytics(params: {
  from: Date;
  to: Date;
  includeComparison?: boolean;
}): Promise<RedemptionAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    includeComparison: String(params.includeComparison || false)
  });
  
  const response = await apiClient.get<RedemptionAnalyticsResponse>(
    `/redemptions/analytics?${queryParams.toString()}`
  );
  
  return response;
}

export async function getTimelineAnalytics(params: {
  from: Date;
  to: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}): Promise<TimelineAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    granularity: params.granularity
  });
  
  return await apiClient.get<TimelineAnalyticsResponse>(
    `/redemptions/analytics/timeline?${queryParams.toString()}`
  );
}

export async function getChannelAnalytics(params: {
  from: Date;
  to: Date;
  limit?: number;
}): Promise<ChannelAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    limit: String(params.limit || 10)
  });
  
  return await apiClient.get<ChannelAnalyticsResponse>(
    `/redemptions/analytics/channels?${queryParams.toString()}`
  );
}

export async function getCodeAnalytics(params: {
  from: Date;
  to: Date;
  limit?: number;
}): Promise<CodeAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    limit: String(params.limit || 10)
  });
  
  return await apiClient.get<CodeAnalyticsResponse>(
    `/redemptions/analytics/codes?${queryParams.toString()}`
  );
}

export async function getGeographicAnalytics(params: {
  from: Date;
  to: Date;
  limit?: number;
}): Promise<GeographicAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    limit: String(params.limit || 10)
  });
  
  return await apiClient.get<GeographicAnalyticsResponse>(
    `/redemptions/analytics/geographic?${queryParams.toString()}`
  );
}

export async function getCustomerSegmentAnalytics(params: {
  from: Date;
  to: Date;
}): Promise<CustomerSegmentAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString()
  });
  
  return await apiClient.get<CustomerSegmentAnalyticsResponse>(
    `/redemptions/analytics/segments?${queryParams.toString()}`
  );
}

export async function getConversionFunnel(params: {
  from: Date;
  to: Date;
}): Promise<ConversionFunnelResponse> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString()
  });
  
  return await apiClient.get<ConversionFunnelResponse>(
    `/redemptions/analytics/funnel?${queryParams.toString()}`
  );
}

export async function getRecentRedemptions(params: {
  limit?: number;
}): Promise<RecentRedemptionsResponse> {
  const queryParams = new URLSearchParams({
    limit: String(params.limit || 10)
  });
  
  return await apiClient.get<RecentRedemptionsResponse>(
    `/redemptions/recent?${queryParams.toString()}`
  );
}

export async function exportAnalytics(params: {
  from: Date;
  to: Date;
  format: 'csv' | 'excel' | 'json';
  includeDetails?: boolean;
  filters?: any;
}): Promise<Blob> {
  const queryParams = new URLSearchParams({
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    format: params.format,
    includeDetails: String(params.includeDetails || false)
  });
  
  if (params.filters) {
    queryParams.set('filters', JSON.stringify(params.filters));
  }
  
  // Note: For blob responses, we need to handle this differently
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/redemptions/analytics/export?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  return await response.blob();
}

export async function searchRedemptions(params: {
  query: string;
  filters: any;
  from: Date;
  to: Date;
  limit?: number;
}): Promise<{ data: any[]; total: number }> {
  const queryParams = new URLSearchParams({
    query: params.query,
    from: params.from.toISOString(),
    to: params.to.toISOString(),
    limit: String(params.limit || 50)
  });
  
  if (params.filters) {
    queryParams.set('filters', JSON.stringify(params.filters));
  }
  
  return await apiClient.get<{ data: any[]; total: number }>(
    `/redemptions/search?${queryParams.toString()}`
  );
}