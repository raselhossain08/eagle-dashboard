// hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { 
  AnalyticsService, 
  UserAnalytics, 
  GrowthAnalytics, 
  EngagementAnalytics, 
  DemographicAnalytics 
} from '@/lib/api/analytics';

export const useUserAnalytics = (timeRange: string = '30d') => {
  return useQuery<UserAnalytics, Error>({
    queryKey: ['analytics', 'users', timeRange],
    queryFn: () => AnalyticsService.getUserAnalytics(timeRange),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useGrowthAnalytics = (timeRange: string = '12m') => {
  return useQuery<GrowthAnalytics, Error>({
    queryKey: ['analytics', 'growth', timeRange],
    queryFn: () => AnalyticsService.getGrowthAnalytics(timeRange),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useEngagementAnalytics = (timeRange: string = '30d') => {
  return useQuery<EngagementAnalytics, Error>({
    queryKey: ['analytics', 'engagement', timeRange],
    queryFn: () => AnalyticsService.getEngagementAnalytics(timeRange),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useDemographicAnalytics = () => {
  return useQuery<DemographicAnalytics, Error>({
    queryKey: ['analytics', 'demographics'],
    queryFn: () => AnalyticsService.getDemographicAnalytics(),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

export const useExportAnalytics = () => {
  return {
    exportAnalytics: async (type: string, timeRange: string = '30d') => {
      try {
        const blob = await AnalyticsService.exportAnalytics(type, timeRange);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    }
  };
};