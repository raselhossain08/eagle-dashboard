import { apiClient } from '../api/client'
import {
  OverviewStats,
  EventTrendsData,
  TopPagesData,
  ChannelPerformanceData,
  GeographicData,
  EventTrendsParams,
  TopPagesParams,
  DateRangeParams,
} from '@/types'
import axios from 'axios'

// Create and configure analytics API instance
const createAnalyticsApi = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || '/api/analytics',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Analytics API Error:', error);
      return Promise.reject(error);
    }
  );

  return api;
};

// Lazy initialization of analytics API instance
let _analyticsApi: ReturnType<typeof createAnalyticsApi> | null = null;

const getAnalyticsApi = () => {
  if (!_analyticsApi) {
    _analyticsApi = createAnalyticsApi();
  }
  return _analyticsApi;
};

// Type definitions
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export interface EventTrend {
  date: string;
  events: number;
  users: number;
  sessions: number;
}

export interface TopPage {
  path: string;
  views: number;
  uniqueViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  events: number;
  timestamp: string;
}

export interface DeviceBreakdown {
  device: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
}

export interface RevenueData {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  averageOrderValue: number;
  transactions: number;
  trends: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

// Enhanced Analytics Service Class
export class AnalyticsService {
  constructor(private client: typeof apiClient) {}

  // Original instance-based methods
  async getOverviewStats(startDate: Date, endDate: Date): Promise<OverviewStats> {
    return this.client.get<OverviewStats>('/analytics/overview', {
      startDate,
      endDate,
    })
  }

  async trackEvent(event: any): Promise<void> {
    return this.client.post<void>('/analytics/track', event)
  }

  async trackPageView(pageView: any): Promise<void> {
    return this.client.post<void>('/analytics/pageview', pageView)
  }

  async getEventTrends(params: EventTrendsParams): Promise<EventTrendsData[]> {
    return this.client.get<EventTrendsData[]>('/analytics/events/trends', params)
  }

  async getTopPages(params: TopPagesParams): Promise<TopPagesData[]> {
    return this.client.get<TopPagesData[]>('/analytics/pages/top', params)
  }

  async getChannelPerformance(params: DateRangeParams): Promise<ChannelPerformanceData[]> {
    return this.client.get<ChannelPerformanceData[]>('/analytics/channels/performance', params)
  }

  async getGeographicDistribution(params: DateRangeParams): Promise<GeographicData[]> {
    return this.client.get<GeographicData[]>('/analytics/geo/distribution', params)
  }

  async getRealTimeActiveUsers(minutes: number = 30): Promise<number> {
    return this.client.get<number>('/analytics/realtime/active-users', { minutes })
  }

  async createFunnel(params: any): Promise<any> {
    return this.client.post('/analytics/funnels/create', params)
  }

  async getFunnelTimeAnalysis(params: any): Promise<any[]> {
    return this.client.get('/analytics/funnels/time-analysis', params)
  }

  async getSegmentPerformance(params: any): Promise<any[]> {
    return this.client.get('/analytics/funnels/segment-performance', params)
  }

  // Enhanced static methods with axios instance
  static async getEnhancedOverviewStats(dateRange: DateRange): Promise<OverviewStats> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };

    const response = await getAnalyticsApi().get('/overview', { params });
    return response.data;
  }

  static async getEnhancedEventTrends(
    dateRange: DateRange,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<EventTrend[]> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      groupBy,
    };

    const response = await getAnalyticsApi().get('/events/trends', { params });
    return response.data;
  }

  static async getEnhancedChannelPerformance(dateRange: DateRange): Promise<ChannelData[]> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };

    const response = await getAnalyticsApi().get('/channels/performance', { params });
    return response.data;
  }

  static async getEnhancedTopPages(
    dateRange: DateRange,
    limit: number = 10
  ): Promise<TopPage[]> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      limit,
    };

    const response = await getAnalyticsApi().get('/pages/top', { params });
    return response.data;
  }

  static async getEnhancedGeographicDistribution(dateRange: DateRange): Promise<GeographicData[]> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };

    const response = await getAnalyticsApi().get('/geo/distribution', { params });
    return response.data;
  }

  static async getEnhancedRealTimeActiveUsers(minutes: number = 5): Promise<number> {
    const params = { minutes };
    const response = await getAnalyticsApi().get('/realtime/active-users', { params });
    return response.data.activeUsers;
  }

  static async getEnhancedRealTimeMetrics(minutes: number = 5): Promise<RealTimeMetrics> {
    const params = { minutes };
    const response = await getAnalyticsApi().get('/realtime/metrics', { params });
    return response.data;
  }

  static async getEnhancedDeviceBreakdown(dateRange: DateRange): Promise<DeviceBreakdown[]> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };

    const response = await getAnalyticsApi().get('/reports/devices/breakdown', { params });
    return response.data;
  }

  static async getEnhancedRevenueAnalytics(dateRange: DateRange): Promise<RevenueData> {
    const params = {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    };

    const response = await getAnalyticsApi().get('/reports/revenue', { params });
    return response.data;
  }

  static async getEnhancedUserAnalytics(timeRange: string = '30d') {
    const params = { timeRange };
    const response = await getAnalyticsApi().get('/users', { params });
    return response.data;
  }

  static async getEnhancedGrowthAnalytics(timeRange: string = '12m') {
    const params = { timeRange };
    const response = await getAnalyticsApi().get('/growth', { params });
    return response.data;
  }

  static async getEnhancedEngagementAnalytics(timeRange: string = '30d') {
    const params = { timeRange };
    const response = await getAnalyticsApi().get('/engagement', { params });
    return response.data;
  }

  static async getEnhancedDemographicAnalytics() {
    const response = await getAnalyticsApi().get('/demographics');
    return response.data;
  }

  static async trackEnhancedEvent(eventData: {
    eventType: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    sessionId?: string;
    userId?: string;
    metadata?: any;
  }) {
    const response = await getAnalyticsApi().post('/track', eventData);
    return response.data;
  }

  static async trackEnhancedPageView(pageViewData: {
    path: string;
    title: string;
    referrer?: string;
    sessionId?: string;
    userId?: string;
    loadTime?: number;
    metadata?: any;
  }) {
    const response = await getAnalyticsApi().post('/pageview', pageViewData);
    return response.data;
  }

  static async getEnhancedDataCounts() {
    const response = await getAnalyticsApi().get('/data/counts');
    return response.data;
  }

  static async clearEnhancedAllData() {
    const response = await getAnalyticsApi().delete('/data/clear');
    return response.data;
  }

  static async exportEnhancedAnalytics(type: string, timeRange: string = '30d') {
    const params = { type, timeRange };
    const response = await getAnalyticsApi().get('/export', { params });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService(apiClient)
