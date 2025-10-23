// hooks/useSubscriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionsService } from '@/lib/api/subscriptions';
import type { 
  CreateSubscriptionDto, 
  UpdateSubscriptionDto,
  Subscription,
  SubscriptionMetrics 
} from '@/lib/api/subscriptions';

export const useUserSubscriptions = (userId: string, params: {
  page?: number;
  limit?: number;
  status?: string;
  planId?: string;
} = {}) => {
  return useQuery({
    queryKey: ['subscriptions', userId, params],
    queryFn: () => SubscriptionsService.getUserSubscriptions(userId, params),
    enabled: !!userId,
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => SubscriptionsService.getSubscription(id),
    enabled: !!id,
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => SubscriptionsService.getSubscriptionPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSubscriptionMetrics = (userId?: string) => {
  return useQuery({
    queryKey: ['subscriptions', 'metrics', userId],
    queryFn: () => SubscriptionsService.getSubscriptionMetrics(userId),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionDto) => SubscriptionsService.createSubscription(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'metrics'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionDto }) => 
      SubscriptionsService.updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'metrics'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, immediate, reason }: { id: string; immediate?: boolean; reason?: string }) => 
      SubscriptionsService.cancelSubscription(id, immediate, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'metrics'] });
    },
  });
};

export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, pauseUntil }: { id: string; pauseUntil?: string }) => 
      SubscriptionsService.pauseSubscription(id, pauseUntil),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'metrics'] });
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SubscriptionsService.resumeSubscription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'metrics'] });
    },
  });
};

export const useSubscriptionInvoices = (subscriptionId: string) => {
  return useQuery({
    queryKey: ['subscriptions', subscriptionId, 'invoices'],
    queryFn: () => SubscriptionsService.getSubscriptionInvoices(subscriptionId),
    enabled: !!subscriptionId,
  });
};