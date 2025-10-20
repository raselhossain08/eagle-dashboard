import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { analyticsService } from '@/lib/services/analytics.service'
import { useDashboardStore } from '@/store/dashboard-store'
import { OverviewStats, EventTrendsData, TopPagesData, ChannelPerformanceData, GeographicData, EventTrendsParams } from '@/types'

// Overview Stats Hook
export const useOverviewStats = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () => analyticsService.getOverviewStats(dateRange.startDate, dateRange.endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false // Don't retry on client errors
      }
      return failureCount < 3
    },
  })
}

// Event Trends Hook
export const useEventTrends = (params: Omit<EventTrendsParams, 'startDate' | 'endDate'>) => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['analytics', 'events', 'trends', { ...params, dateRange }],
    queryFn: () => analyticsService.getEventTrends({
      ...params,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  })
}

// Real-time Users Hook
export const useRealTimeUsers = (refreshInterval: number = 30000) => {
  return useQuery({
    queryKey: ['analytics', 'realtime', 'users'],
    queryFn: () => analyticsService.getRealTimeActiveUsers(30),
    refetchInterval: refreshInterval,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

// Top Pages Hook
export const useTopPages = (limit: number = 10) => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['analytics', 'pages', 'top', dateRange, limit],
    queryFn: () => analyticsService.getTopPages({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit,
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Channel Performance Hook
export const useChannelPerformance = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['analytics', 'channels', 'performance', dateRange],
    queryFn: () => analyticsService.getChannelPerformance(dateRange),
    staleTime: 10 * 60 * 1000,
  })
}

// Geographic Distribution Hook
export const useGeographicDistribution = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['analytics', 'geo', 'distribution', dateRange],
    queryFn: () => analyticsService.getGeographicDistribution(dateRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Event Tracking Mutation
export const useTrackEvent = () => {
  return useMutation({
    mutationFn: analyticsService.trackEvent,
    onError: (error: any) => {
      console.error('Failed to track event:', error)
    },
  })
}

// Page View Tracking Mutation
export const useTrackPageView = () => {
  return useMutation({
    mutationFn: analyticsService.trackPageView,
    onError: (error: any) => {
      console.error('Failed to track page view:', error)
    },
  })
}