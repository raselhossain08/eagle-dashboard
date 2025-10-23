// hooks/useActivity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityService } from '@/lib/api/activity';
import type { 
  UserActivity,
  ActivityMetrics,
  ActivityFilters 
} from '@/lib/api/activity';

export const useUserActivity = (userId: string, filters: ActivityFilters = {}) => {
  return useQuery({
    queryKey: ['activity', userId, filters],
    queryFn: () => ActivityService.getUserActivity(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActivityTimeline = (userId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['activity', 'timeline', userId, days],
    queryFn: () => ActivityService.getActivityTimeline(userId, days),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivityMetrics = (userId: string) => {
  return useQuery({
    queryKey: ['activity', 'metrics', userId],
    queryFn: () => ActivityService.getActivityMetrics(userId),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useActivityAnalytics = (userId: string, timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['activity', 'analytics', userId, timeRange],
    queryFn: () => ActivityService.getActivityAnalytics(userId, timeRange),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSystemActivity = (days: number = 7) => {
  return useQuery({
    queryKey: ['activity', 'system', days],
    queryFn: () => ActivityService.getSystemActivity(days),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};