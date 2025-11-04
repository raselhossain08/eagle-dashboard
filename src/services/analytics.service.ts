import { apiClient } from '@/lib/api/api-client';

// Type definitions
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface OverviewStats {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  pageViews?: number; // Legacy support
  bounceRate: number;
  avgSessionDuration?: number; // Legacy support
  averageSessionDuration?: number;
  newUsers: number;
  returningUsers: number;
  uniqueVisitors?: number;
  conversionRate?: number;
  growth?: {
    users: number;
    sessions: number;
    pageViews: number;
    bounceRate: number;
  };
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
  events?: number;
  users?: number;
  sessions?: number;
  event?: string;
  count?: number;
}

export interface EventStatistic {
  event: string;
  count: number;
  uniqueUsers: number;
}

export interface EventDetail {
  event: string;
  count: number;
  uniqueUsers: number;
  conversionRate: number;
  avgValue: number;
}

export interface TopPage {
  path: string;
  views: number;
  uniqueViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface GeographicData {
  country: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  events: number;
  timestamp: string;
  bounceRate: number;
  avgPageLoad: number;
  newVisitors: number;
  conversionRate: number;
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

// Analytics API endpoints configuration
const ANALYTICS_ENDPOINTS = {
  overview: '/analytics/overview',
  eventTrends: '/analytics/events/trends',
  eventStatistics: '/analytics/events/statistics',
  eventDetails: '/analytics/events/details',
  channelPerformance: '/analytics/channels/performance',
  topPages: '/analytics/pages/top',
  geoDistribution: '/analytics/geo/distribution',
  realTimeUsers: '/analytics/realtime/active-users',
  realTimeMetrics: '/analytics/realtime/metrics',
  realTimeActivityFeed: '/analytics/realtime/activity-feed',
  realTimeHotspots: '/analytics/realtime/hotspots',
  deviceBreakdown: '/analytics/reports/devices/breakdown',
  revenue: '/analytics/reports/revenue',
  users: '/analytics/users',
  growth: '/analytics/growth',
  engagement: '/analytics/engagement',
  demographics: '/analytics/demographics',
  track: '/analytics/track',
  pageView: '/analytics/pageview',
  dataCounts: '/analytics/data/counts',
  clearData: '/analytics/data/clear',
  export: '/analytics/export'
};

// Mock data generators for development/fallback
const generateMockOverviewStats = (): OverviewStats => ({
  totalUsers: Math.floor(Math.random() * 10000) + 5000,
  totalSessions: Math.floor(Math.random() * 15000) + 8000,
  totalPageViews: Math.floor(Math.random() * 50000) + 25000,
  pageViews: Math.floor(Math.random() * 50000) + 25000, // Legacy support
  bounceRate: Math.random() * 0.4 + 0.3,
  avgSessionDuration: Math.random() * 180 + 120,
  averageSessionDuration: Math.random() * 180 + 120,
  newUsers: Math.floor(Math.random() * 3000) + 1500,
  returningUsers: Math.floor(Math.random() * 7000) + 3500,
  uniqueVisitors: Math.floor(Math.random() * 8000) + 4000,
  conversionRate: Math.random() * 0.05 + 0.02,
  growth: {
    users: (Math.random() - 0.5) * 0.4,
    sessions: (Math.random() - 0.5) * 0.4,
    pageViews: (Math.random() - 0.5) * 0.4,
    bounceRate: (Math.random() - 0.5) * 0.2,
  },
});

const generateMockEventTrends = (days: number = 30): EventTrend[] => {
  const trends: EventTrend[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      events: Math.floor(Math.random() * 1000) + 500,
      users: Math.floor(Math.random() * 500) + 250,
      sessions: Math.floor(Math.random() * 800) + 400,
    });
  }
  
  return trends;
};

const generateMockChannelData = (): ChannelData[] => [
  { name: 'Organic Search', value: 45, color: '#8884d8' },
  { name: 'Direct', value: 25, color: '#82ca9d' },
  { name: 'Social Media', value: 15, color: '#ffc658' },
  { name: 'Referral', value: 10, color: '#ff7300' },
  { name: 'Email', value: 5, color: '#0088fe' },
];

const generateMockTopPages = (limit: number = 10): TopPage[] => {
  const pages = [
    '/dashboard',
    '/analytics',
    '/contracts',
    '/users',
    '/settings',
    '/reports',
    '/campaigns',
    '/support',
    '/billing',
    '/integrations',
  ];
  
  return pages.slice(0, limit).map((path, index) => ({
    path,
    views: Math.floor(Math.random() * 5000) + 1000 - (index * 200),
    uniqueViews: Math.floor(Math.random() * 3000) + 500 - (index * 150),
    bounceRate: Math.random() * 0.4 + 0.3,
    avgTimeOnPage: Math.random() * 300 + 60,
  }));
};

const generateMockDeviceBreakdown = (): DeviceBreakdown[] => [
  {
    device: 'Desktop',
    sessions: Math.floor(Math.random() * 5000) + 3000,
    users: Math.floor(Math.random() * 3000) + 2000,
    bounceRate: Math.random() * 0.4 + 0.3,
    avgSessionDuration: Math.random() * 200 + 180,
    conversionRate: Math.random() * 0.05 + 0.03,
  },
  {
    device: 'Mobile',
    sessions: Math.floor(Math.random() * 4000) + 2500,
    users: Math.floor(Math.random() * 2500) + 1800,
    bounceRate: Math.random() * 0.5 + 0.4,
    avgSessionDuration: Math.random() * 150 + 90,
    conversionRate: Math.random() * 0.04 + 0.02,
  },
  {
    device: 'Tablet',
    sessions: Math.floor(Math.random() * 1000) + 500,
    users: Math.floor(Math.random() * 800) + 400,
    bounceRate: Math.random() * 0.4 + 0.35,
    avgSessionDuration: Math.random() * 180 + 120,
    conversionRate: Math.random() * 0.04 + 0.025,
  },
];

const generateMockRevenueData = (): RevenueData => {
  const totalRevenue = Math.floor(Math.random() * 100000) + 50000;
  const recurringRevenue = Math.floor(totalRevenue * 0.7);
  const oneTimeRevenue = totalRevenue - recurringRevenue;
  const transactions = Math.floor(Math.random() * 500) + 200;
  
  const trends = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      transactions: Math.floor(Math.random() * 20) + 5,
    });
  }
  
  return {
    totalRevenue,
    recurringRevenue,
    oneTimeRevenue,
    averageOrderValue: totalRevenue / transactions,
    transactions,
    trends,
  };
};

const generateMockEventStatistics = (): EventStatistic[] => {
  const eventTypes = [
    'page_view', 'click', 'form_submit', 'login', 'logout', 'purchase', 
    'add_to_cart', 'search', 'download', 'video_play', 'signup', 'contact'
  ];
  
  return eventTypes.map(event => ({
    event,
    count: Math.floor(Math.random() * 5000) + 100,
    uniqueUsers: Math.floor(Math.random() * 1000) + 50,
  }));
};

const generateMockEventDetails = (limit: number = 10): EventDetail[] => {
  const eventTypes = [
    'page_view', 'click', 'form_submit', 'login', 'logout', 'purchase', 
    'add_to_cart', 'search', 'download', 'video_play', 'signup', 'contact',
    'share', 'like', 'comment', 'subscribe', 'newsletter_signup'
  ];
  
  return eventTypes.slice(0, limit).map(event => ({
    event,
    count: Math.floor(Math.random() * 5000) + 100,
    uniqueUsers: Math.floor(Math.random() * 1000) + 50,
    conversionRate: Math.random() * 15 + 2, // 2-17%
    avgValue: event === 'purchase' ? Math.random() * 200 + 50 : 0,
  }));
};

// Analytics Service Class
export class AnalyticsService {
  static async getOverviewStats(dateRange: DateRange): Promise<OverviewStats> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.overview}?${params.toString()}`;
      const response = await apiClient.get<OverviewStats>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for overview stats');
      return generateMockOverviewStats();
    }
  }

  static async getEventTrends(
    dateRange: DateRange,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<EventTrend[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        groupBy,
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.eventTrends}?${params.toString()}`;
      const response = await apiClient.get<EventTrend[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for event trends');
      const days = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      return generateMockEventTrends(Math.min(days, 30));
    }
  }

  static async getChannelPerformance(dateRange: DateRange): Promise<ChannelData[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.channelPerformance}?${params.toString()}`;
      const response = await apiClient.get<ChannelData[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for channel performance');
      return generateMockChannelData();
    }
  }

  static async getTopPages(
    dateRange: DateRange,
    limit: number = 10
  ): Promise<TopPage[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        limit: limit.toString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.topPages}?${params.toString()}`;
      const response = await apiClient.get<TopPage[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for top pages');
      return generateMockTopPages(limit);
    }
  }

  static async getGeographicDistribution(dateRange: DateRange): Promise<GeographicData[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.geoDistribution}?${params.toString()}`;
      const response = await apiClient.get<GeographicData[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for geographic distribution');
      return [
        { country: 'United States', users: 4500, sessions: 6800, bounceRate: 0.35 },
        { country: 'Canada', users: 1200, sessions: 1800, bounceRate: 0.32 },
        { country: 'United Kingdom', users: 800, sessions: 1200, bounceRate: 0.38 },
        { country: 'Germany', users: 600, sessions: 900, bounceRate: 0.34 },
        { country: 'Australia', users: 400, sessions: 650, bounceRate: 0.36 },
      ];
    }
  }

  static async getRealTimeActiveUsers(minutes: number = 5): Promise<number> {
    try {
      const params = new URLSearchParams({ 
        minutes: minutes.toString() 
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.realTimeUsers}?${params.toString()}`;
      const response = await apiClient.get<{ activeUsers: number } | number>(endpoint);
      return typeof response === 'number' ? response : response.activeUsers;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for real-time users');
      return Math.floor(Math.random() * 100) + 20;
    }
  }

  static async getRealTimeMetrics(minutes: number = 5): Promise<RealTimeMetrics> {
    try {
      const params = new URLSearchParams({ 
        minutes: minutes.toString() 
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.realTimeMetrics}?${params.toString()}`;
      const response = await apiClient.get<RealTimeMetrics>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for real-time metrics');
      return {
        activeUsers: Math.floor(Math.random() * 100) + 20,
        pageViews: Math.floor(Math.random() * 500) + 100,
        events: Math.floor(Math.random() * 200) + 50,
        timestamp: new Date().toISOString(),
        bounceRate: Math.random() * 40 + 30, // 30-70%
        avgPageLoad: Math.random() * 2 + 1, // 1-3 seconds
        newVisitors: Math.random() * 60 + 20, // 20-80%
        conversionRate: Math.random() * 5 + 1, // 1-6%
      };
    }
  }

  static async getRealTimeActivityFeed(minutes: number = 30, limit: number = 20): Promise<Array<{
    user: string;
    action: string;
    page: string;
    time: string;
    country: string;
    timestamp: string;
  }>> {
    try {
      const params = new URLSearchParams({ 
        minutes: minutes.toString(),
        limit: limit.toString()
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.realTimeActivityFeed}?${params.toString()}`;
      const response = await apiClient.get<Array<{
        user: string;
        action: string;
        page: string;
        time: string;
        country: string;
        timestamp: string;
      }>>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for real-time activity feed');
      
      const mockActivities = [];
      const actions = ['viewed', 'clicked', 'signed up', 'downloaded', 'searched', 'logged in', 'purchased', 'shared'];
      const pages = ['/dashboard', '/analytics', '/contracts', '/users', '/settings', '/reports', '/campaigns', '/support'];
      const countries = ['US', 'CA', 'UK', 'DE', 'AU', 'FR', 'JP', 'BR', 'IN', 'SG'];
      const users = ['Anonymous User', 'John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'Alex P.', 'Emma W.', 'David L.'];

      const now = new Date();
      for (let i = 0; i < Math.min(limit, 20); i++) {
        const timestamp = new Date(now.getTime() - (Math.random() * minutes * 60 * 1000));
        const timeAgo = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
        
        let timeString;
        if (timeAgo < 60) {
          timeString = 'Just now';
        } else if (timeAgo < 3600) {
          timeString = `${Math.floor(timeAgo / 60)}m ago`;
        } else {
          timeString = `${Math.floor(timeAgo / 3600)}h ago`;
        }

        mockActivities.push({
          user: users[Math.floor(Math.random() * users.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          page: pages[Math.floor(Math.random() * pages.length)],
          time: timeString,
          country: countries[Math.floor(Math.random() * countries.length)],
          timestamp: timestamp.toISOString(),
        });
      }

      return mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  static async getRealTimeHotspots(limit: number = 10): Promise<Array<{
    page: string;
    percentage: number;
    users: number;
  }>> {
    try {
      const params = new URLSearchParams({ 
        limit: limit.toString()
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.realTimeHotspots}?${params.toString()}`;
      const response = await apiClient.get<Array<{
        page: string;
        percentage: number;
        users: number;
      }>>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for real-time hotspots');
      
      const pages = [
        '/dashboard',
        '/analytics',
        '/contracts',
        '/users',
        '/settings',
        '/reports',
        '/campaigns',
        '/support',
        '/billing',
        '/integrations',
        '/profile',
        '/notifications',
        '/security',
        '/documentation',
        '/feedback'
      ];

      const hotspots = pages.slice(0, limit).map((page, index) => {
        const basePercentage = Math.max(5, 50 - (index * 4) + (Math.random() * 10 - 5));
        return {
          page,
          percentage: Math.round(basePercentage),
          users: Math.floor(basePercentage * 2) + Math.floor(Math.random() * 20),
        };
      });

      // Normalize percentages to ensure they add up to reasonable values
      const totalPercentage = hotspots.reduce((sum, hotspot) => sum + hotspot.percentage, 0);
      if (totalPercentage > 100) {
        const factor = 100 / totalPercentage;
        hotspots.forEach(hotspot => {
          hotspot.percentage = Math.round(hotspot.percentage * factor);
        });
      }

      return hotspots.sort((a, b) => b.percentage - a.percentage);
    }
  }

  static async getDeviceBreakdown(dateRange: DateRange): Promise<DeviceBreakdown[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.deviceBreakdown}?${params.toString()}`;
      const response = await apiClient.get<DeviceBreakdown[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for device breakdown');
      return generateMockDeviceBreakdown();
    }
  }

  static async getRevenueAnalytics(dateRange: DateRange): Promise<RevenueData> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.revenue}?${params.toString()}`;
      const response = await apiClient.get<RevenueData>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for revenue analytics');
      return generateMockRevenueData();
    }
  }

  static async getUserAnalytics(timeRange: string = '30d') {
    try {
      const params = new URLSearchParams({ timeRange });
      const endpoint = `${ANALYTICS_ENDPOINTS.users}?${params.toString()}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for user analytics');
      return {
        totalUsers: Math.floor(Math.random() * 10000) + 5000,
        newUsers: Math.floor(Math.random() * 3000) + 1500,
        activeUsers: Math.floor(Math.random() * 7000) + 3500,
        churnRate: Math.random() * 0.1 + 0.05,
      };
    }
  }

  static async getGrowthAnalytics(timeRange: string = '12m') {
    try {
      const params = new URLSearchParams({ timeRange });
      const endpoint = `${ANALYTICS_ENDPOINTS.growth}?${params.toString()}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for growth analytics');
      return {
        userGrowthRate: (Math.random() - 0.3) * 0.5,
        revenueGrowthRate: (Math.random() - 0.2) * 0.4,
        engagementGrowthRate: (Math.random() - 0.4) * 0.3,
      };
    }
  }

  static async getEngagementAnalytics(timeRange: string = '30d') {
    try {
      const params = new URLSearchParams({ timeRange });
      const endpoint = `${ANALYTICS_ENDPOINTS.engagement}?${params.toString()}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for engagement analytics');
      return {
        avgSessionDuration: Math.random() * 300 + 120,
        pagesPerSession: Math.random() * 5 + 2,
        bounceRate: Math.random() * 0.4 + 0.3,
        returnVisitorRate: Math.random() * 0.3 + 0.4,
      };
    }
  }

  static async getDemographicAnalytics() {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.demographics);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for demographic analytics');
      return {
        ageGroups: [
          { range: '18-24', users: 1200, percentage: 15 },
          { range: '25-34', users: 3200, percentage: 40 },
          { range: '35-44', users: 2400, percentage: 30 },
          { range: '45-54', users: 800, percentage: 10 },
          { range: '55+', users: 400, percentage: 5 },
        ],
        genderDistribution: [
          { gender: 'Male', users: 4500, percentage: 56 },
          { gender: 'Female', users: 3500, percentage: 44 },
        ],
      };
    }
  }

  static async trackEvent(eventData: {
    eventType: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    sessionId?: string;
    userId?: string;
    metadata?: any;
  }) {
    try {
      const response = await apiClient.post(ANALYTICS_ENDPOINTS.track, eventData);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, event tracking failed:', eventData);
      return { success: false, error: error.message };
    }
  }

  static async trackPageView(pageViewData: {
    path: string;
    title: string;
    referrer?: string;
    sessionId?: string;
    userId?: string;
    loadTime?: number;
    metadata?: any;
  }) {
    try {
      const response = await apiClient.post(ANALYTICS_ENDPOINTS.pageView, pageViewData);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, page view tracking failed:', pageViewData);
      return { success: false, error: error.message };
    }
  }

  static async getDataCounts() {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.dataCounts);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for data counts');
      return {
        totalEvents: Math.floor(Math.random() * 100000) + 50000,
        totalPageViews: Math.floor(Math.random() * 200000) + 100000,
        totalUsers: Math.floor(Math.random() * 10000) + 5000,
        totalSessions: Math.floor(Math.random() * 15000) + 8000,
      };
    }
  }

  static async clearAllData() {
    try {
      const response = await apiClient.delete(ANALYTICS_ENDPOINTS.clearData);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, cannot clear data');
      throw error;
    }
  }

  static async getEventStatistics(dateRange: DateRange): Promise<EventStatistic[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.eventStatistics}?${params.toString()}`;
      const response = await apiClient.get<EventStatistic[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for event statistics');
      return generateMockEventStatistics();
    }
  }

  static async getEventDetails(
    dateRange: DateRange,
    limit: number = 10
  ): Promise<EventDetail[]> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        limit: limit.toString(),
      });

      const endpoint = `${ANALYTICS_ENDPOINTS.eventDetails}?${params.toString()}`;
      const response = await apiClient.get<EventDetail[]>(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data for event details');
      return generateMockEventDetails(limit);
    }
  }

  static async exportAnalytics(type: string, timeRange: string = '30d') {
    try {
      const params = new URLSearchParams({ type, timeRange });
      const endpoint = `${ANALYTICS_ENDPOINTS.export}?${params.toString()}`;
      
      // Note: The API client doesn't support responseType: 'blob' like axios
      // You might need to handle blob responses differently or extend the API client
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.warn('Analytics API unavailable, cannot export data');
      throw error;
    }
  }
}

// Export singleton instance for compatibility
export const analyticsService = AnalyticsService;
export default AnalyticsService;