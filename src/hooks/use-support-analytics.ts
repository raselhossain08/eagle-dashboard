// hooks/use-support-analytics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/lib/api/support';
import { 
  TeamPerformanceData, 
  SupportAnalytics, 
  ResponseTimeAnalytics, 
  TicketVolumeAnalytics,
  CategoryAnalytics,
  SupportReport,
  SupportStats
} from '@/types/support';
import { toast } from 'sonner';

// Query keys for caching
export const supportQueryKeys = {
  all: ['support'] as const,
  analytics: () => [...supportQueryKeys.all, 'analytics'] as const,
  teamPerformance: (startDate?: string, endDate?: string) => 
    [...supportQueryKeys.analytics(), 'team-performance', startDate, endDate] as const,
  supportAnalytics: (startDate?: string, endDate?: string) => 
    [...supportQueryKeys.analytics(), 'support-analytics', startDate, endDate] as const,
  responseTimeAnalytics: (days?: number) => 
    [...supportQueryKeys.analytics(), 'response-time', days] as const,
  ticketVolumeAnalytics: (months?: number) => 
    [...supportQueryKeys.analytics(), 'ticket-volume', months] as const,
  categoryAnalytics: (startDate?: string, endDate?: string) => 
    [...supportQueryKeys.analytics(), 'categories', startDate, endDate] as const,
  stats: () => [...supportQueryKeys.all, 'stats'] as const,
};

// Team Performance Hook
export function useTeamPerformance(
  startDate?: string, 
  endDate?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.teamPerformance(startDate, endDate),
    queryFn: () => supportService.getTeamPerformance({ startDate, endDate }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Support Analytics Hook
export function useSupportAnalytics(
  startDate?: string, 
  endDate?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.supportAnalytics(startDate, endDate),
    queryFn: () => supportService.getSupportAnalytics({ startDate, endDate }),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Response Time Analytics Hook
export function useResponseTimeAnalytics(
  days: number = 7,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.responseTimeAnalytics(days),
    queryFn: () => supportService.getResponseTimeAnalytics(days),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Ticket Volume Analytics Hook
export function useTicketVolumeAnalytics(
  months: number = 6,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.ticketVolumeAnalytics(months),
    queryFn: () => supportService.getTicketVolumeAnalytics(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Category Analytics Hook
export function useCategoryAnalytics(
  startDate?: string, 
  endDate?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.categoryAnalytics(startDate, endDate),
    queryFn: () => supportService.getCategoryAnalytics({ startDate, endDate }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Support Stats Hook
export function useSupportStats(
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: supportQueryKeys.stats(),
    queryFn: () => supportService.getSupportStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Generate Report Mutation Hook
export function useGenerateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, startDate, endDate }: { 
      type: string; 
      startDate?: string; 
      endDate?: string; 
    }) => supportService.generateReport(type, { startDate, endDate }),
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      console.error('Report generation failed:', error);
      toast.error(error?.message || 'Failed to generate report');
    },
  });
}

// Combined Dashboard Hook
export function useSupportDashboard(
  startDate?: string, 
  endDate?: string,
  options?: {
    enabled?: boolean;
    autoRefresh?: boolean;
    refetchInterval?: number;
  }
) {
  const refetchInterval = options?.autoRefresh ? (options?.refetchInterval || 5 * 60 * 1000) : undefined;

  const teamPerformance = useTeamPerformance(startDate, endDate, {
    enabled: options?.enabled,
    refetchInterval,
  });

  const supportAnalytics = useSupportAnalytics(startDate, endDate, {
    enabled: options?.enabled,
    refetchInterval,
  });

  const supportStats = useSupportStats({
    enabled: options?.enabled,
    refetchInterval,
  });

  const responseTimeAnalytics = useResponseTimeAnalytics(7, {
    enabled: options?.enabled,
    refetchInterval,
  });

  const isLoading = teamPerformance.isLoading || supportAnalytics.isLoading || supportStats.isLoading;
  const isError = teamPerformance.isError || supportAnalytics.isError || supportStats.isError;
  
  const error = teamPerformance.error || supportAnalytics.error || supportStats.error;

  const refetchAll = async () => {
    await Promise.all([
      teamPerformance.refetch(),
      supportAnalytics.refetch(),
      supportStats.refetch(),
      responseTimeAnalytics.refetch(),
    ]);
  };

  return {
    teamPerformance: {
      data: teamPerformance.data,
      isLoading: teamPerformance.isLoading,
      error: teamPerformance.error,
      refetch: teamPerformance.refetch,
    },
    supportAnalytics: {
      data: supportAnalytics.data,
      isLoading: supportAnalytics.isLoading,
      error: supportAnalytics.error,
      refetch: supportAnalytics.refetch,
    },
    supportStats: {
      data: supportStats.data,
      isLoading: supportStats.isLoading,
      error: supportStats.error,
      refetch: supportStats.refetch,
    },
    responseTimeAnalytics: {
      data: responseTimeAnalytics.data,
      isLoading: responseTimeAnalytics.isLoading,
      error: responseTimeAnalytics.error,
      refetch: responseTimeAnalytics.refetch,
    },
    isLoading,
    isError,
    error,
    refetchAll,
  };
}

// Utility Hook for Auto-Refresh Management
export function useAutoRefresh(callback: () => Promise<void>, interval: number, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['auto-refresh', interval, enabled],
    queryFn: callback,
    enabled,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
}