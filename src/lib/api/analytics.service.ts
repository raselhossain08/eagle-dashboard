import { apiClient } from './api-client';

export interface OverviewStats {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  returningUsers: number;
}

export interface EventTrendsParams {
  startDate: Date;
  endDate: Date;
  groupBy: 'hour' | 'day' | 'week' | 'month';
  event?: string;
}

export interface EventTrendsData {
  date: string;
  count: number;
  event: string;
}

export interface TopPagesData {
  pageUrl: string;
  views: number;
  uniqueVisitors: number;
}

export interface ChannelPerformanceData {
  channel: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface GeographicData {
  country: string;
  region: string;
  sessions: number;
  users: number;
}

export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
}

export interface TrackEventData {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface PageViewData {
  page: string;
  title?: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
}

export interface RealTimeActivity {
  action: string;
  user: string;
  page: string;
  time: string;
  country: string;
  event: string;
  timestamp: Date;
}

export interface RealTimeHotspot {
  page: string;
  views: number;
  percentage: number;
}

export interface RealTimeMetrics {
  bounceRate: number;
  avgPageLoad: number;
  newVisitors: number;
  conversionRate: number;
}

export class AnalyticsService {
  // Core Analytics API methods
  async getOverviewStats(startDate: Date, endDate: Date): Promise<OverviewStats> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return apiClient.get(`/analytics/overview?${params}`);
  }

  async getEventTrends(params: EventTrendsParams): Promise<EventTrendsData[]> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      groupBy: params.groupBy,
    });
    if (params.event) {
      queryParams.set('event', params.event);
    }
    return apiClient.get(`/analytics/events/trends?${queryParams}`);
  }

  async getTopPages(params: DateRangeParams & { limit?: number }): Promise<TopPagesData[]> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      limit: (params.limit || 10).toString(),
    });
    return apiClient.get(`/analytics/pages/top?${queryParams}`);
  }

  async getChannelPerformance(params: DateRangeParams): Promise<ChannelPerformanceData[]> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
    return apiClient.get(`/analytics/channels/performance?${queryParams}`);
  }

  async getGeographicDistribution(params: DateRangeParams): Promise<GeographicData[]> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
    return apiClient.get(`/analytics/geo/distribution?${queryParams}`);
  }

  async getRealTimeActiveUsers(minutes: number = 5): Promise<number> {
    const params = new URLSearchParams({ minutes: minutes.toString() });
    return apiClient.get(`/analytics/realtime/active-users?${params}`);
  }

  async getAgeDistribution(params: DateRangeParams): Promise<Array<{ name: string; value: number }>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
    return apiClient.get(`/analytics/audience/age-distribution?${queryParams}`);
  }

  // Real-time Analytics methods
  async getRealTimeActivityFeed(limit = 20, minutes = 30): Promise<RealTimeActivity[]> {
    const params = new URLSearchParams({ 
      limit: limit.toString(),
      minutes: minutes.toString()
    });
    return apiClient.get(`/analytics/realtime/activity-feed?${params}`);
  }

  async getRealTimeHotspots(minutes = 10): Promise<RealTimeHotspot[]> {
    const params = new URLSearchParams({ minutes: minutes.toString() });
    return apiClient.get(`/analytics/realtime/hotspots?${params}`);
  }

  async getRealTimeMetrics(minutes = 5): Promise<RealTimeMetrics> {
    const params = new URLSearchParams({ minutes: minutes.toString() });
    return apiClient.get(`/analytics/realtime/metrics?${params}`);
  }

  // Event Tracking methods
  async trackEvent(data: TrackEventData): Promise<void> {
    return apiClient.post('/analytics/track', data);
  }

  async trackPageView(data: PageViewData): Promise<void> {
    return apiClient.post('/analytics/pageview', data);
  }

  async getEventStatistics(params: DateRangeParams): Promise<Array<{
    event: string;
    count: number;
    uniqueUsers: number;
    conversionRate: number;
    avgValue: number;
  }>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
    return apiClient.get(`/analytics/events/statistics?${queryParams.toString()}`);
  }

  async getEventDetails(params: DateRangeParams & { limit?: number }): Promise<Array<{
    event: string;
    count: number;
    uniqueUsers: number;
    conversionRate: number;
    avgValue: number;
    lastSeen: Date;
    topProperties: Array<{ key: string; value: any; count: number }>;
  }>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      limit: (params.limit || 20).toString(),
    });
    return apiClient.get(`/analytics/events/details?${queryParams.toString()}`);
  }
}

export const analyticsService = new AnalyticsService();