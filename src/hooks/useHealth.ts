import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '@/lib/api/health';
import { HealthMetrics, HealthHistory } from '@/types/health';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['health', 'system'],
    queryFn: () => healthService.getSystemHealth(),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useHealthHistory = () => {
  return useQuery({
    queryKey: ['health', 'history'],
    queryFn: () => healthService.getHealthHistory(),
  });
};

export const useHealthPing = () => {
  return useQuery({
    queryKey: ['health', 'ping'],
    queryFn: () => healthService.ping(),
  });
};

export const useRefreshHealth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => healthService.getSystemHealth(),
    onSuccess: (data) => {
      queryClient.setQueryData(['health', 'system'], data);
    },
  });
};