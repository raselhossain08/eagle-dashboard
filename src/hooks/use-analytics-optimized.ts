import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AnalyticsService, 
  type DateRange, 
  type OverviewStats, 
  type TimeSeriesData, 
  type ChannelData, 
  type EventTrend, 
  type TopPage, 
  type GeographicData, 
  type RealTimeMetrics, 
  type DeviceBreakdown, 
  type RevenueData 
} from '@/services/analytics.service';
import { useMemo } from 'react';

// Optimized query options
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const FAST_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const SLOW_STALE_TIME = 10 * 60 * 1000; // 10 minutes

// Helper to create cache key
const createCacheKey = (base: string[], dateRange?: DateRange, ...extras: any[]) => {
  const key = [...base];
  if (dateRange) {
    key.push(dateRange.startDate.toISOString(), dateRange.endDate.toISOString());
  }
  key.push(...extras);
  return key;
};

// Core Analytics Hooks - Optimized for performance
export const useOverviewStats = (dateRange: DateRange) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'overview'], dateRange), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
  );

  return useQuery<OverviewStats>({
    queryKey,
    queryFn: () => AnalyticsService.getOverviewStats(dateRange),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
};

export const useEventTrends = (dateRange: DateRange, groupBy: 'day' | 'week' | 'month' = 'day') => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'events', 'trends'], dateRange, groupBy), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime(), groupBy]
  );

  return useQuery<EventTrend[]>({
    queryKey,
    queryFn: () => AnalyticsService.getEventTrends(dateRange, groupBy),
    staleTime: FAST_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
    // Lower priority - load after overview
    select: (data) => data || [],
  });
};

export const useTopPages = (dateRange: DateRange, limit: number = 10) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'pages', 'top'], dateRange, limit), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime(), limit]
  );

  return useQuery<TopPage[]>({
    queryKey,
    queryFn: () => AnalyticsService.getTopPages(dateRange, limit),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
  });
};

export const useChannelPerformance = (dateRange: DateRange) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'channels', 'performance'], dateRange), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
  );

  return useQuery<ChannelData[]>({
    queryKey,
    queryFn: () => AnalyticsService.getChannelPerformance(dateRange),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
  });
};

export const useDeviceBreakdown = (dateRange: DateRange) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'devices', 'breakdown'], dateRange), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
  );

  return useQuery<DeviceBreakdown[]>({
    queryKey,
    queryFn: () => AnalyticsService.getDeviceBreakdown(dateRange),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
  });
};

export const useRevenueAnalytics = (dateRange: DateRange) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'revenue'], dateRange), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
  );

  return useQuery<RevenueData>({
    queryKey,
    queryFn: () => AnalyticsService.getRevenueAnalytics(dateRange),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
  });
};

// Conditional real-time hook - only enabled when needed
export const useRealTimeUsers = (enabled = false, refreshInterval = 60000, minutes = 5) => {
  return useQuery<number>({
    queryKey: ['analytics', 'realtime', 'users', minutes],
    queryFn: () => AnalyticsService.getRealTimeActiveUsers(minutes),
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval : false,
    staleTime: 0,
    enabled: enabled && process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
    // Don't retry real-time queries aggressively
    retry: 1,
  });
};

// Optimized geographic data with longer cache time
export const useGeographicDistribution = (dateRange: DateRange) => {
  const queryKey = useMemo(() => 
    createCacheKey(['analytics', 'geographic', 'distribution'], dateRange), 
    [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
  );

  return useQuery<GeographicData[]>({
    queryKey,
    queryFn: () => AnalyticsService.getGeographicDistribution(dateRange),
    staleTime: SLOW_STALE_TIME, // Longer cache for geographic data
    enabled: !!dateRange.startDate && !!dateRange.endDate,
    placeholderData: (previousData) => previousData,
  });
};

// Optimized user analytics with better caching
export const useUserAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'users', timeRange],
    queryFn: () => AnalyticsService.getUserAnalytics(timeRange),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: (previousData) => previousData,
  });
};

// Batched query invalidation
export const useInvalidateAnalytics = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateOverview: () => queryClient.invalidateQueries({ 
      queryKey: ['analytics', 'overview'],
      refetchType: 'active'
    }),
    invalidateAll: () => queryClient.invalidateQueries({ 
      queryKey: ['analytics'],
      refetchType: 'active'
    }),
    invalidateCharts: () => queryClient.invalidateQueries({ 
      queryKey: ['analytics'],
      predicate: (query) => {
        const key = query.queryKey[1] as string;
        return ['events', 'channels', 'revenue'].includes(key);
      },
      refetchType: 'active'
    }),
  };
};

// Prefetch hook for route transitions
export const usePrefetchAnalytics = () => {
  const queryClient = useQueryClient();
  
  return (dateRange: DateRange) => {
    // Only prefetch critical data
    queryClient.prefetchQuery({
      queryKey: createCacheKey(['analytics', 'overview'], dateRange),
      queryFn: () => AnalyticsService.getOverviewStats(dateRange),
      staleTime: DEFAULT_STALE_TIME,
    });
  };
};

// Event Tracking Hooks - Optimized
export const useTrackEvent = () => {
  const { invalidateOverview } = useInvalidateAnalytics();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof AnalyticsService.trackEvent>[0]) => 
      AnalyticsService.trackEvent(data),
    onSuccess: () => {
      // Only invalidate overview, not all analytics
      invalidateOverview();
    },
    // Don't retry event tracking
    retry: 0,
  });
};

export const useTrackPageView = () => {
  const { invalidateOverview } = useInvalidateAnalytics();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof AnalyticsService.trackPageView>[0]) => 
      AnalyticsService.trackPageView(data),
    onSuccess: () => {
      invalidateOverview();
    },
    retry: 0,
  });
};

// Data Management Hooks
export const useDataCounts = () => {
  return useQuery({
    queryKey: ['analytics', 'data', 'counts'],
    queryFn: () => AnalyticsService.getDataCounts(),
    staleTime: SLOW_STALE_TIME, // Longer cache for counts
    placeholderData: (previousData) => previousData,
  });
};

export const useClearAnalyticsData = () => {
  const { invalidateAll } = useInvalidateAnalytics();
  
  return useMutation({
    mutationFn: () => AnalyticsService.clearAllData(),
    onSuccess: () => {
      invalidateAll();
    },
  });
};

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: ({ type, timeRange }: { type: string; timeRange?: string }) => 
      AnalyticsService.exportAnalytics(type, timeRange),
    // Don't retry exports
    retry: 0,
  });
};