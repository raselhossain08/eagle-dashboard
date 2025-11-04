// hooks/useSubscribers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribersService } from '@/lib/api/subscribers';
import { SubscriberParams, SubscriberProfile } from '@/types/subscribers';

export const useSubscribers = (params?: SubscriberParams) => {
  return useQuery({
    queryKey: ['subscribers', params],
    queryFn: () => subscribersService.getSubscribers(params),
  });
};

export const useSubscriber = (id: string) => {
  return useQuery({
    queryKey: ['subscribers', id],
    queryFn: () => subscribersService.getSubscriber(id),
    enabled: !!id,
  });
};

export const useUpdateSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriberProfile> }) =>
      subscribersService.updateSubscriber(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers', variables.id] });
    },
  });
};

export const useCreateSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => subscribersService.createSubscriber(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscriber-analytics'] });
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribersService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
};

// Segment hooks
export const useSegments = () => {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () => subscribersService.getSegments(),
  });
};

export const useSegment = (id: string) => {
  return useQuery({
    queryKey: ['segments', id],
    queryFn: () => subscribersService.getSegment(id),
    enabled: !!id,
  });
};

export const useSegmentSubscribers = (segmentId: string) => {
  return useQuery({
    queryKey: ['segments', segmentId, 'subscribers'],
    queryFn: () => subscribersService.getSubscribersInSegment(segmentId),
    enabled: !!segmentId,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => subscribersService.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      subscribersService.updateSegment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.invalidateQueries({ queryKey: ['segments', variables.id] });
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribersService.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

// Enhanced segment analytics hooks
export const useSegmentAnalytics = (segmentId: string) => {
  return useQuery({
    queryKey: ['segments', segmentId, 'analytics'],
    queryFn: () => subscribersService.getSegmentAnalytics(segmentId),
    enabled: !!segmentId,
  });
};

export const useSegmentStatistics = (segmentId: string) => {
  return useQuery({
    queryKey: ['segments', segmentId, 'statistics'],
    queryFn: () => subscribersService.getSegmentStatistics(segmentId),
    enabled: !!segmentId,
  });
};

export const useExportSegmentSubscribers = () => {
  return useMutation({
    mutationFn: ({ segmentId, format }: { segmentId: string; format?: string }) =>
      subscribersService.exportSegmentSubscribers(segmentId, format),
  });
};

export const useSendSegmentEmail = () => {
  return useMutation({
    mutationFn: ({ segmentId, emailData }: { segmentId: string; emailData: any }) =>
      subscribersService.sendSegmentEmail(segmentId, emailData),
  });
};