import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  analyticsService, 
  OverviewStats, 
  EventTrendsParams, 
  EventTrendsData, 
  TopPagesData,
  ChannelPerformanceData,
  GeographicData,
  DateRangeParams,
  TrackEventData,
  PageViewData,
  RealTimeActivity,
  RealTimeHotspot,
  RealTimeMetrics
} from '@/lib/api/analytics.service';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Core Analytics Hooks
export const useOverviewStats = (dateRange: DateRange) => {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview', dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: () => analyticsService.getOverviewStats(dateRange.startDate, dateRange.endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

export const useEventTrends = (params: EventTrendsParams) => {
  return useQuery<EventTrendsData[]>({
    queryKey: ['analytics', 'events', 'trends', params],
    queryFn: () => analyticsService.getEventTrends(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useTopPages = (params: DateRangeParams & { limit?: number }) => {
  return useQuery<TopPagesData[]>({
    queryKey: ['analytics', 'pages', 'top', params],
    queryFn: () => analyticsService.getTopPages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useChannelPerformance = (params: DateRangeParams) => {
  return useQuery<ChannelPerformanceData[]>({
    queryKey: ['analytics', 'channels', 'performance', params],
    queryFn: () => analyticsService.getChannelPerformance(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useGeographicDistribution = (params: DateRangeParams) => {
  return useQuery<GeographicData[]>({
    queryKey: ['analytics', 'geographic', 'distribution', params],
    queryFn: () => analyticsService.getGeographicDistribution(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useRealTimeUsers = (refreshInterval = 30000, minutes = 5) => {
  return useQuery<number>({
    queryKey: ['analytics', 'realtime', 'users', minutes],
    queryFn: () => analyticsService.getRealTimeActiveUsers(minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: true,
  });
};

export const useRealTimeActivityFeed = (refreshInterval = 30000, limit = 20, minutes = 30) => {
  return useQuery<RealTimeActivity[]>({
    queryKey: ['analytics', 'realtime', 'activity', limit, minutes],
    queryFn: () => analyticsService.getRealTimeActivityFeed(limit, minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: true,
  });
};

export const useRealTimeHotspots = (refreshInterval = 60000, minutes = 10) => {
  return useQuery<RealTimeHotspot[]>({
    queryKey: ['analytics', 'realtime', 'hotspots', minutes],
    queryFn: () => analyticsService.getRealTimeHotspots(minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: true,
  });
};

export const useRealTimeMetrics = (refreshInterval = 30000, minutes = 5) => {
  return useQuery<RealTimeMetrics>({
    queryKey: ['analytics', 'realtime', 'metrics', minutes],
    queryFn: () => analyticsService.getRealTimeMetrics(minutes),
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: true,
  });
};

// Event Tracking Hooks
export const useTrackEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TrackEventData) => analyticsService.trackEvent(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useTrackPageView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PageViewData) => analyticsService.trackPageView(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useEventStatistics = (params: DateRangeParams) => {
  return useQuery({
    queryKey: ['analytics', 'events', 'statistics', params],
    queryFn: () => analyticsService.getEventStatistics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useEventDetails = (params: DateRangeParams & { limit?: number }) => {
  return useQuery({
    queryKey: ['analytics', 'events', 'details', params],
    queryFn: () => analyticsService.getEventDetails(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.startDate && !!params.endDate,
  });
};