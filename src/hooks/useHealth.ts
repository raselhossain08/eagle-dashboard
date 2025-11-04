import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '@/lib/api/health';
import { HealthMetrics, HealthHistory, Alert } from '@/types/health';
import { useCallback } from 'react';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['health', 'system'],
    queryFn: () => healthService.getSystemHealth(),
    refetchInterval: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 20000, // Consider data stale after 20 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useHealthHistory = (limit?: number) => {
  return useQuery({
    queryKey: ['health', 'history', limit],
    queryFn: () => healthService.getHealthHistory(limit),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 45000, // Consider data stale after 45 seconds
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useHealthPing = () => {
  return useQuery({
    queryKey: ['health', 'ping'],
    queryFn: () => healthService.ping(),
    refetchInterval: 10000, // 10 seconds
    retry: 1,
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['health', 'metrics'],
    queryFn: () => healthService.getSystemMetrics(),
    refetchInterval: 15000, // 15 seconds
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useHealthAlerts = () => {
  return useQuery({
    queryKey: ['health', 'alerts'],
    queryFn: () => healthService.getAlerts(),
    refetchInterval: 30000, // 30 seconds
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 20000, // Consider data stale after 20 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useRefreshHealth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Refresh all health-related data in parallel
      const [healthData, metricsData, alertsData] = await Promise.all([
        healthService.getSystemHealth(),
        healthService.getSystemMetrics(),
        healthService.getAlerts(),
      ]);
      return { healthData, metricsData, alertsData };
    },
    onSuccess: ({ healthData, metricsData, alertsData }) => {
      // Update query cache with fresh data
      queryClient.setQueryData(['health', 'system'], healthData);
      queryClient.setQueryData(['health', 'metrics'], metricsData);
      queryClient.setQueryData(['health', 'alerts'], alertsData);
      
      // Invalidate and refetch history data
      queryClient.invalidateQueries({ queryKey: ['health', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['health', 'ping'] });
    },
    onError: (error) => {
      console.error('Failed to refresh health data:', error);
      // Optionally show toast notification
    },
  });
};

// Additional hooks for specific health components
export const useHealthMetricsWithCache = () => {
  const queryClient = useQueryClient();

  return {
    ...useSystemMetrics(),
    prefetchData: useCallback(() => {
      queryClient.prefetchQuery({
        queryKey: ['health', 'metrics'],
        queryFn: () => healthService.getSystemMetrics(),
        staleTime: 10000,
      });
    }, [queryClient]),
  };
};

export const useHealthAlertsWithActions = () => {
  const queryClient = useQueryClient();
  const alertsQuery = useHealthAlerts();

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    // This would typically make an API call to acknowledge the alert
    // For now, we'll update the local state
    const currentData = queryClient.getQueryData<Alert[]>(['health', 'alerts']);
    if (currentData) {
      const updatedData = currentData.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      queryClient.setQueryData(['health', 'alerts'], updatedData);
    }
  }, [queryClient]);

  return {
    ...alertsQuery,
    acknowledgeAlert,
  };
};