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

export class AnalyticsService {
  constructor(private client: typeof apiClient) {}

  // Overview Analytics
  async getOverviewStats(startDate: Date, endDate: Date): Promise<OverviewStats> {
    return this.client.get<OverviewStats>('/analytics/overview', {
      startDate,
      endDate,
    })
  }

  // Event Analytics
  async trackEvent(event: any): Promise<void> {
    return this.client.post<void>('/analytics/track', event)
  }

  async trackPageView(pageView: any): Promise<void> {
    return this.client.post<void>('/analytics/pageview', pageView)
  }

  async getEventTrends(params: EventTrendsParams): Promise<EventTrendsData[]> {
    return this.client.get<EventTrendsData[]>('/analytics/events/trends', params)
  }

  // Page Analytics
  async getTopPages(params: TopPagesParams): Promise<TopPagesData[]> {
    return this.client.get<TopPagesData[]>('/analytics/pages/top', params)
  }

  // Channel Analytics
  async getChannelPerformance(params: DateRangeParams): Promise<ChannelPerformanceData[]> {
    return this.client.get<ChannelPerformanceData[]>('/analytics/channels/performance', params)
  }

  // Geographic Analytics
  async getGeographicDistribution(params: DateRangeParams): Promise<GeographicData[]> {
    return this.client.get<GeographicData[]>('/analytics/geo/distribution', params)
  }

  // Real-time Analytics
  async getRealTimeActiveUsers(minutes: number = 30): Promise<number> {
    return this.client.get<number>('/analytics/realtime/active-users', { minutes })
  }

  // Funnel Analytics
  async createFunnel(params: any): Promise<any> {
    return this.client.post('/analytics/funnels/create', params)
  }

  async getFunnelTimeAnalysis(params: any): Promise<any[]> {
    return this.client.get('/analytics/funnels/time-analysis', params)
  }

  async getSegmentPerformance(params: any): Promise<any[]> {
    return this.client.get('/analytics/funnels/segment-performance', params)
  }
}

export const analyticsService = new AnalyticsService(apiClient)