// hooks/use-subscriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Subscription, SubscriptionsQueryParams } from '@/types/billing';
import { SubscriptionsService } from '@/lib/services/subscriptions.service';

const subscriptionsService = new SubscriptionsService();

export const useSubscriptions = (params: SubscriptionsQueryParams = {}) => {
  return useQuery({
    queryKey: ['subscriptions', JSON.stringify(params)],
    queryFn: () => subscriptionsService.getSubscriptions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Failed to fetch subscriptions')) {
        return failureCount < 2;
      }
      return failureCount < 3;
    },
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsService.getSubscriptionById(id),
    enabled: !!id,
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, immediate, reason }: { id: string; immediate?: boolean; reason?: string }) =>
      subscriptionsService.cancelSubscription(id, immediate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: Date }) =>
      subscriptionsService.pauseSubscription(id, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscriptionsService.resumeSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};