// src/hooks/useSystem.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService } from '@/lib/api/system';
import { useSystemStore } from '@/stores/system-store';

// Health monitoring
export const useSystemHealth = () => {
  const updateSystemHealth = useSystemStore((state) => state.updateSystemHealth);
  
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const health = await systemService.getSystemHealth();
      updateSystemHealth(health);
      return health;
    },
    refetchInterval: 30000, // 30 seconds
  });
};

export const useSystemStats = () => {
  const updateSystemStats = useSystemStore((state) => state.updateSystemStats);
  
  return useQuery({
    queryKey: ['system', 'stats'],
    queryFn: async () => {
      const stats = await systemService.getSystemStats();
      updateSystemStats(stats);
      return stats;
    },
    refetchInterval: 60000, // 1 minute
  });
};

// Settings management
export const useSystemSettings = (category?: string) => {
  return useQuery({
    queryKey: ['system', 'settings', category],
    queryFn: () => systemService.getSettings(category),
  });
};

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['system', 'feature-flags'],
    queryFn: () => systemService.getFeatureFlags(),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      systemService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'settings'] });
    },
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      systemService.toggleFeatureFlag(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'feature-flags'] });
    },
  });
};

// Webhook operations
export const useWebhookStats = (endpointId?: string) => {
  return useQuery({
    queryKey: ['system', 'webhooks', 'stats', endpointId],
    queryFn: () => systemService.getWebhookStats(endpointId),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useCreateWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: systemService.createWebhookEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'webhooks'] });
    },
  });
};

// Maintenance operations
export const useRunCleanup = () => {
  return useMutation({
    mutationFn: systemService.runCleanup,
  });
};

export const useCreateBackup = () => {
  return useMutation({
    mutationFn: systemService.createBackup,
  });
};