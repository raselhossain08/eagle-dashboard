import { apiClient } from './client';

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
  page: string;
  visits: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface ChannelPerformanceData {
  channel: string;
  sessions: number;
  users: number;
  conversionRate: number;
  revenue: number;
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

export class AnalyticsService {
  async getOverviewStats(startDate: Date, endDate: Date): Promise<OverviewStats> {
    return apiClient.get('/analytics/overview', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  async getEventTrends(params: EventTrendsParams): Promise<EventTrendsData[]> {
    return apiClient.get('/analytics/events/trends', {
      ...params,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getTopPages(params: DateRangeParams): Promise<TopPagesData[]> {
    return apiClient.get('/analytics/pages/top', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getChannelPerformance(params: DateRangeParams): Promise<ChannelPerformanceData[]> {
    return apiClient.get('/analytics/channels/performance', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getGeographicDistribution(params: DateRangeParams): Promise<GeographicData[]> {
    return apiClient.get('/analytics/geo/distribution', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getRealTimeActiveUsers(minutes: number = 5): Promise<number> {
    return apiClient.get('/analytics/realtime/active-users', { minutes });
  }
}

export const analyticsService = new AnalyticsService();