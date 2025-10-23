// src/hooks/useWebhooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookService } from '@/lib/api/webhooks';

// Webhook Events
export const useWebhookEvents = (params: {
  page?: number;
  limit?: number;
  status?: string;
  event?: string;
  endpointId?: string;
}) => {
  return useQuery({
    queryKey: ['webhooks', 'events', params],
    queryFn: () => webhookService.getEvents(params),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useWebhookEvent = (id: string) => {
  return useQuery({
    queryKey: ['webhooks', 'events', id],
    queryFn: () => webhookService.getEvent(id),
    enabled: !!id,
  });
};

export const useRetryWebhookEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: webhookService.retryEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};

// Webhook Endpoints
export const useWebhookEndpoints = (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['webhooks', 'endpoints', params],
    queryFn: () => webhookService.getEndpoints(params),
  });
};

export const useWebhookEndpoint = (id: string) => {
  return useQuery({
    queryKey: ['webhooks', 'endpoints', id],
    queryFn: () => webhookService.getEndpoint(id),
    enabled: !!id,
  });
};

export const useCreateWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: webhookService.createEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};

export const useUpdateWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      webhookService.updateEndpoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};

export const useDeleteWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: webhookService.deleteEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};

export const useTestWebhookEndpoint = () => {
  return useMutation({
    mutationFn: webhookService.testEndpoint,
  });
};

// Webhook Logs
export const useWebhookLogs = (params: {
  page?: number;
  limit?: number;
  status?: string;
  endpointId?: string;
}) => {
  return useQuery({
    queryKey: ['webhooks', 'logs', params],
    queryFn: () => webhookService.getLogs(params),
    refetchInterval: 30000, // 30 seconds
  });
};

// Webhook Stats
export const useWebhookStats = () => {
  return useQuery({
    queryKey: ['webhooks', 'stats'],
    queryFn: () => webhookService.getStats(),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useWebhookEndpointStats = (id: string) => {
  return useQuery({
    queryKey: ['webhooks', 'endpoints', id, 'stats'],
    queryFn: () => webhookService.getEndpointStats(id),
    enabled: !!id,
    refetchInterval: 30000, // 30 seconds
  });
};

// Webhook Operations
export const useTriggerWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ event, payload }: { event: string; payload: any }) =>
      webhookService.triggerWebhook(event, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};

export const useRetryFailedWebhooks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: webhookService.retryFailedWebhooks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] });
    },
  });
};