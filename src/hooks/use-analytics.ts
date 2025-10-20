import { useQuery } from '@tanstack/react-query';
import { analyticsService, OverviewStats, EventTrendsParams, EventTrendsData } from '@/lib/api/analytics.service';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const useOverviewStats = (dateRange: DateRange) => {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () => analyticsService.getOverviewStats(dateRange.startDate, dateRange.endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEventTrends = (params: EventTrendsParams) => {
  return useQuery<EventTrendsData[]>({
    queryKey: ['analytics', 'events', 'trends', params],
    queryFn: () => analyticsService.getEventTrends(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRealTimeUsers = (refreshInterval = 30000) => {
  return useQuery<number>({
    queryKey: ['analytics', 'realtime', 'users'],
    queryFn: () => analyticsService.getRealTimeActiveUsers(),
    refetchInterval: refreshInterval,
    staleTime: 0,
  });
};