import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '@/lib/api/health';
import { HealthMetrics, HealthHistory, Alert } from '@/types/health';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['health', 'system'],
    queryFn: () => healthService.getSystemHealth(),
    refetchInterval: 30000, // 30 seconds
    retry: 2,
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};

export const useHealthHistory = (limit?: number) => {
  return useQuery({
    queryKey: ['health', 'history', limit],
    queryFn: () => healthService.getHealthHistory(limit),
    refetchInterval: 60000, // 1 minute
  });
};

export const useHealthPing = () => {
  return useQuery({
    queryKey: ['health', 'ping'],
    queryFn: () => healthService.ping(),
    refetchInterval: 10000, // 10 seconds
  });
};

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['health', 'metrics'],
    queryFn: () => healthService.getSystemMetrics(),
    refetchInterval: 15000, // 15 seconds
  });
};

export const useHealthAlerts = () => {
  return useQuery({
    queryKey: ['health', 'alerts'],
    queryFn: () => healthService.getAlerts(),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useRefreshHealth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => healthService.getSystemHealth(),
    onSuccess: (data) => {
      queryClient.setQueryData(['health', 'system'], data);
      // Also refresh related queries
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
};