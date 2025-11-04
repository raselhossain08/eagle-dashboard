import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AnalyticsService, 
  type DateRange, 
  type OverviewStats, 
  type TimeSeriesData, 
  type ChannelData, 
  type EventTrend, 
  type EventStatistic,
  type EventDetail,
  type TopPage, 
  type GeographicData, 
  type RealTimeMetrics, 
  type DeviceBreakdown, 
  type RevenueData 
} from '@/services/analytics.service';

// Core Analytics Hooks
export const useOverviewStats = (dateRange: DateRange) => {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview', dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: () => AnalyticsService.getOverviewStats(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useEventTrends = (dateRange: DateRange & { groupBy?: 'day' | 'week' | 'month' }) => {
  return useQuery<EventTrend[]>({
    queryKey: ['analytics', 'events', 'trends', dateRange.startDate.toISOString(), dateRange.endDate.toISOString(), dateRange.groupBy || 'day'],
    queryFn: () => AnalyticsService.getEventTrends(dateRange, dateRange.groupBy || 'day'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useEventStatistics = (dateRange: DateRange) => {
  return useQuery<EventStatistic[]>({
    queryKey: ['analytics', 'events', 'statistics', dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: () => AnalyticsService.getEventStatistics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useEventDetails = (dateRange: DateRange & { limit?: number }) => {
  return useQuery<EventDetail[]>({
    queryKey: ['analytics', 'events', 'details', dateRange.startDate.toISOString(), dateRange.endDate.toISOString(), dateRange.limit || 10],
    queryFn: () => AnalyticsService.getEventDetails(dateRange, dateRange.limit || 10),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useTopPages = (dateRange: DateRange, limit: number = 10) => {
  return useQuery<TopPage[]>({
    queryKey: ['analytics', 'pages', 'top', dateRange, limit],
    queryFn: () => AnalyticsService.getTopPages(dateRange, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useChannelPerformance = (dateRange: DateRange) => {
  return useQuery<ChannelData[]>({
    queryKey: ['analytics', 'channels', 'performance', dateRange],
    queryFn: () => AnalyticsService.getChannelPerformance(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useGeographicDistribution = (dateRange: DateRange) => {
  return useQuery<GeographicData[]>({
    queryKey: ['analytics', 'geographic', 'distribution', dateRange],
    queryFn: () => AnalyticsService.getGeographicDistribution(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useRealTimeUsers = (refreshInterval = 30000, minutes = 5) => {
  return useQuery<number>({
    queryKey: ['analytics', 'realtime', 'users', minutes],
    queryFn: () => AnalyticsService.getRealTimeActiveUsers(minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  });
};

export const useRealTimeMetrics = (refreshInterval = 30000, minutes = 5) => {
  return useQuery<RealTimeMetrics>({
    queryKey: ['analytics', 'realtime', 'metrics', minutes],
    queryFn: () => AnalyticsService.getRealTimeMetrics(minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  });
};

export const useRealTimeActivityFeed = (refreshInterval = 30000, limit = 20, minutes = 30) => {
  return useQuery<Array<{
    user: string;
    action: string;
    page: string;
    time: string;
    country: string;
    timestamp: string;
  }>>({
    queryKey: ['analytics', 'realtime', 'activity-feed', minutes, limit],
    queryFn: () => AnalyticsService.getRealTimeActivityFeed(minutes, limit),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  });
};

export const useRealTimeHotspots = (refreshInterval = 30000, limit = 10) => {
  return useQuery<Array<{
    page: string;
    percentage: number;
    users: number;
  }>>({
    queryKey: ['analytics', 'realtime', 'hotspots', limit],
    queryFn: () => AnalyticsService.getRealTimeHotspots(limit),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  });
};

export const useDeviceBreakdown = (dateRange: DateRange) => {
  return useQuery<DeviceBreakdown[]>({
    queryKey: ['analytics', 'devices', 'breakdown', dateRange],
    queryFn: () => AnalyticsService.getDeviceBreakdown(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useRevenueAnalytics = (dateRange: DateRange) => {
  return useQuery<RevenueData>({
    queryKey: ['analytics', 'revenue', dateRange],
    queryFn: () => AnalyticsService.getRevenueAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useUserAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'users', timeRange],
    queryFn: () => AnalyticsService.getUserAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGrowthAnalytics = (timeRange: string = '12m') => {
  return useQuery({
    queryKey: ['analytics', 'growth', timeRange],
    queryFn: () => AnalyticsService.getGrowthAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEngagementAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'engagement', timeRange],
    queryFn: () => AnalyticsService.getEngagementAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDemographicAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'demographics'],
    queryFn: () => AnalyticsService.getDemographicAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Event Tracking Hooks
export const useTrackEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof AnalyticsService.trackEvent>[0]) => AnalyticsService.trackEvent(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useTrackPageView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof AnalyticsService.trackPageView>[0]) => AnalyticsService.trackPageView(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// Data Management Hooks
export const useDataCounts = () => {
  return useQuery({
    queryKey: ['analytics', 'data', 'counts'],
    queryFn: () => AnalyticsService.getDataCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClearAnalyticsData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => AnalyticsService.clearAllData(),
    onSuccess: () => {
      // Invalidate all analytics queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: ({ type, timeRange }: { type: string; timeRange?: string }) => 
      AnalyticsService.exportAnalytics(type, timeRange),
  });
};