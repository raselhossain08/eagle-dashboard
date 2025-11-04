// lib/api/redemption-analytics.ts
import { apiClient } from './client';
import { DateRange } from '@/types/discounts';

export interface RedemptionAnalyticsParams {
  startDate: string;
  endDate: string;
  granularity?: 'day' | 'week' | 'month';
  includeComparison?: boolean;
  discountCodes?: string[];
  channels?: string[];
  countries?: string[];
  minOrderValue?: number;
  maxOrderValue?: number;
}

export interface TopChannel {
  channel: string;
  redemptions: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface TopCode {
  code: string;
  redemptions: number;
  revenue: number;
  discountAmount: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface GeographicData {
  country: string;
  countryCode: string;
  redemptions: number;
  revenue: number;
  averageOrderValue: number;
}

export interface CustomerSegment {
  segment: string;
  customers: number;
  redemptions: number;
  revenue: number;
  averageOrderValue: number;
  retentionRate: number;
}

export interface ConversionFunnelStep {
  step: string;
  count: number;
  rate: number;
  dropOffCount?: number;
  dropOffRate?: number;
}

export interface TimelinePoint {
  date: string;
  redemptions: number;
  revenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  conversionRate: number;
}

export interface RedemptionAnalyticsResponse {
  // Summary metrics
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  averageOrderValue: number;
  averageDiscountAmount: number;
  conversionRate: number;
  uniqueCustomers: number;

  // Growth metrics (when includeComparison is true)
  previousPeriodRedemptions?: number;
  previousPeriodRevenue?: number;
  redemptionGrowthRate?: number;
  revenueGrowthRate?: number;

  // Top performers
  topChannels: TopChannel[];
  topCodes: TopCode[];
  
  // Geographic data
  topCountries: GeographicData[];
  
  // Customer insights
  customerSegments: CustomerSegment[];
  
  // Conversion funnel
  conversionFunnel: ConversionFunnelStep[];
  
  // Timeline data
  timeline: TimelinePoint[];
  
  // Metadata
  dateRange: {
    from: string;
    to: string;
  };
  granularity: string;
  generatedAt: string;
}

export interface RecentRedemption {
  id: string;
  code: string;
  userEmail: string;
  orderValue: number;
  discountAmount: number;
  timestamp: string;
  channel?: string;
  country?: string;
  isNewCustomer: boolean;
}

export interface RealtimeRedemptionsResponse {
  recent: RecentRedemption[];
  totalToday: number;
  revenueToday: number;
  averageOrderValueToday: number;
  lastUpdated: string;
}

export interface ExportParams extends RedemptionAnalyticsParams {
  format: 'csv' | 'excel' | 'json';
  includeDetails?: boolean;
}

export class RedemptionAnalyticsAPI {
  /**
   * Get comprehensive redemption analytics
   */
  static async getAnalytics(params: RedemptionAnalyticsParams): Promise<RedemptionAnalyticsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      // Required parameters
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);
      
      // Optional parameters
      if (params.granularity) {
        searchParams.append('granularity', params.granularity);
      }
      
      if (params.includeComparison !== undefined) {
        searchParams.append('includeComparison', params.includeComparison.toString());
      }
      
      if (params.discountCodes?.length) {
        params.discountCodes.forEach(code => {
          searchParams.append('discountCodes', code);
        });
      }
      
      if (params.channels?.length) {
        params.channels.forEach(channel => {
          searchParams.append('channels', channel);
        });
      }
      
      if (params.countries?.length) {
        params.countries.forEach(country => {
          searchParams.append('countries', country);
        });
      }
      
      if (params.minOrderValue !== undefined) {
        searchParams.append('minOrderValue', params.minOrderValue.toString());
      }
      
      if (params.maxOrderValue !== undefined) {
        searchParams.append('maxOrderValue', params.maxOrderValue.toString());
      }

      const response = await apiClient.get<RedemptionAnalyticsResponse>(
        `/api/discounts/redemptions/analytics?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch redemption analytics:', error);
      throw new Error('Failed to load redemption analytics data');
    }
  }

  /**
   * Get redemption timeline data
   */
  static async getTimeline(params: RedemptionAnalyticsParams): Promise<{
    timeline: TimelinePoint[];
    granularity: string;
    dateRange: { from: string; to: string };
    totalRedemptions: number;
    totalRevenue: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);
      
      if (params.granularity) {
        searchParams.append('granularity', params.granularity);
      }

      const response = await apiClient.get<{
        timeline: TimelinePoint[];
        granularity: string;
        dateRange: { from: string; to: string };
        totalRedemptions: number;
        totalRevenue: number;
      }>(
        `/api/discounts/redemptions/analytics/timeline?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch timeline data:', error);
      throw new Error('Failed to load timeline data');
    }
  }

  /**
   * Get top performing channels
   */
  static async getTopChannels(params: RedemptionAnalyticsParams): Promise<{
    topChannels: TopChannel[];
    dateRange: { from: string; to: string };
    totalRedemptions: number;
    totalRevenue: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<{
        topChannels: TopChannel[];
        dateRange: { from: string; to: string };
        totalRedemptions: number;
        totalRevenue: number;
      }>(
        `/api/discounts/redemptions/analytics/channels?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch channel data:', error);
      throw new Error('Failed to load channel data');
    }
  }

  /**
   * Get top performing discount codes
   */
  static async getTopCodes(params: RedemptionAnalyticsParams): Promise<{
    topCodes: TopCode[];
    dateRange: { from: string; to: string };
    totalRedemptions: number;
    totalRevenue: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<{
        topCodes: TopCode[];
        dateRange: { from: string; to: string };
        totalRedemptions: number;
        totalRevenue: number;
      }>(
        `/api/discounts/redemptions/analytics/codes?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch code data:', error);
      throw new Error('Failed to load discount code data');
    }
  }

  /**
   * Get geographic distribution data
   */
  static async getGeographicData(params: RedemptionAnalyticsParams): Promise<{
    topCountries: GeographicData[];
    dateRange: { from: string; to: string };
    totalRedemptions: number;
    totalRevenue: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<{
        topCountries: GeographicData[];
        dateRange: { from: string; to: string };
        totalRedemptions: number;
        totalRevenue: number;
      }>(
        `/api/discounts/redemptions/analytics/geographic?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch geographic data:', error);
      throw new Error('Failed to load geographic data');
    }
  }

  /**
   * Get customer segments data
   */
  static async getCustomerSegments(params: RedemptionAnalyticsParams): Promise<{
    customerSegments: CustomerSegment[];
    dateRange: { from: string; to: string };
    totalRedemptions: number;
    uniqueCustomers: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<{
        customerSegments: CustomerSegment[];
        dateRange: { from: string; to: string };
        totalRedemptions: number;
        uniqueCustomers: number;
      }>(
        `/api/discounts/redemptions/analytics/segments?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch customer segments:', error);
      throw new Error('Failed to load customer segments data');
    }
  }

  /**
   * Get conversion funnel data
   */
  static async getConversionFunnel(params: RedemptionAnalyticsParams): Promise<{
    conversionFunnel: ConversionFunnelStep[];
    dateRange: { from: string; to: string };
    conversionRate: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<{
        conversionFunnel: ConversionFunnelStep[];
        dateRange: { from: string; to: string };
        conversionRate: number;
      }>(
        `/api/discounts/redemptions/analytics/funnel?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch conversion funnel:', error);
      throw new Error('Failed to load conversion funnel data');
    }
  }

  /**
   * Get real-time redemptions data
   */
  static async getRealtimeRedemptions(params?: {
    limit?: number;
    minutesBack?: number;
  }): Promise<RealtimeRedemptionsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      
      if (params?.minutesBack) {
        searchParams.append('minutesBack', params.minutesBack.toString());
      }

      const response = await apiClient.get<RealtimeRedemptionsResponse>(
        `/api/discounts/redemptions/analytics/realtime?${searchParams.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch real-time redemptions:', error);
      throw new Error('Failed to load real-time data');
    }
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(params: ExportParams): Promise<Blob> {
    try {
      const response = await apiClient.download(
        '/api/discounts/redemptions/analytics/export',
        {
          method: 'POST',
          data: params
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw new Error('Failed to export analytics data');
    }
  }
}

// Helper function to format date for API
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to convert DateRange to API params
export function dateRangeToParams(dateRange: DateRange): { startDate: string; endDate: string } {
  return {
    startDate: formatDateForAPI(dateRange.from),
    endDate: formatDateForAPI(dateRange.to)
  };
}