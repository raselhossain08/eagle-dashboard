// hooks/useSubscriptionManagement.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { toast } from 'sonner';

export interface SubscriptionAction {
  subscriptionId: string;
  action: 'pause' | 'cancel' | 'reactivate' | 'resume';
  reason?: string;
  effectiveDate?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreateSubscriptionData {
  subscriberId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  trialDays?: number;
  couponCode?: string;
  customAmount?: number;
}

export interface UpdateSubscriptionData {
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  quantity?: number;
  customAmount?: number;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageLifetimeValue: number;
  churnRate: number;
  retentionRate: number;
}

// Hook to get subscription management statistics
export const useSubscriptionStats = (subscriberId: string) => {
  return useQuery({
    queryKey: ['subscription-stats', subscriberId],
    queryFn: async (): Promise<SubscriptionStats> => {
      return apiClient.get(`/subscribers/${subscriberId}/subscription-stats`);
    },
    enabled: !!subscriberId,
  });
};

// Hook to pause subscription
export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) => {
      return apiClient.post(`/subscriptions/${subscriptionId}/pause`, { reason });
    },
    onSuccess: (_, { subscriptionId }) => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      toast.success('Subscription paused successfully');
    },
    onError: (error) => {
      console.error('Failed to pause subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to pause subscription');
    },
  });
};

// Hook to cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      cancelAtPeriodEnd = true, 
      reason 
    }: { 
      subscriptionId: string; 
      cancelAtPeriodEnd?: boolean; 
      reason?: string 
    }) => {
      return apiClient.post(`/subscriptions/${subscriptionId}/cancel`, { 
        cancelAtPeriodEnd, 
        reason 
      });
    },
    onSuccess: (_, { subscriptionId, cancelAtPeriodEnd }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      toast.success(
        cancelAtPeriodEnd 
          ? 'Subscription will be canceled at period end' 
          : 'Subscription canceled immediately'
      );
    },
    onError: (error) => {
      console.error('Failed to cancel subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    },
  });
};

// Hook to reactivate subscription
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      return apiClient.post(`/subscriptions/${subscriptionId}/reactivate`);
    },
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      toast.success('Subscription reactivated successfully');
    },
    onError: (error) => {
      console.error('Failed to reactivate subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    },
  });
};

// Hook to resume paused subscription
export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      return apiClient.post(`/subscriptions/${subscriptionId}/resume`);
    },
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      toast.success('Subscription resumed successfully');
    },
    onError: (error) => {
      console.error('Failed to resume subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resume subscription');
    },
  });
};

// Hook to create new subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      return apiClient.post('/subscriptions', data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions', data.subscriberId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats', data.subscriberId] });
      toast.success('Subscription created successfully');
    },
    onError: (error) => {
      console.error('Failed to create subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription');
    },
  });
};

// Hook to update subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, data }: { subscriptionId: string; data: UpdateSubscriptionData }) => {
      return apiClient.patch(`/subscriptions/${subscriptionId}`, data);
    },
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    },
  });
};

// Hook to get subscription history with advanced filtering
export const useSubscriptionHistory = (
  subscriberId: string, 
  filters?: {
    status?: string;
    billingCycle?: string;
    dateRange?: { start: string; end: string };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  return useQuery({
    queryKey: ['subscription-history', subscriberId, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && 'start' in value && 'end' in value) {
            searchParams.append('startDate', value.start);
            searchParams.append('endDate', value.end);
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      const url = `/subscribers/${subscriberId}/subscription-history${queryString ? `?${queryString}` : ''}`;
      return apiClient.get(url);
    },
    enabled: !!subscriberId,
  });
};

// Hook to export subscription data
export const useExportSubscriptions = () => {
  return useMutation({
    mutationFn: async ({ 
      subscriberId, 
      format = 'csv',
      includeHistory = true 
    }: { 
      subscriberId: string; 
      format?: 'csv' | 'xlsx' | 'json';
      includeHistory?: boolean;
    }) => {
      const searchParams = new URLSearchParams();
      if (format) searchParams.append('format', format);
      if (includeHistory) searchParams.append('includeHistory', 'true');
      const queryString = searchParams.toString();
      const exportUrl = `/subscribers/${subscriberId}/subscriptions/export${queryString ? `?${queryString}` : ''}`;
      
      // Use fetch directly for file download
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${exportUrl}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscriptions-${subscriberId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
    onSuccess: () => {
      toast.success('Subscriptions exported successfully');
    },
    onError: (error) => {
      console.error('Export failed:', error);
      toast.error('Failed to export subscriptions');
    },
  });
};

// Hook to get available subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      return apiClient.get('/subscription-plans');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to preview subscription changes
export const usePreviewSubscriptionChange = () => {
  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      changes 
    }: { 
      subscriptionId: string; 
      changes: UpdateSubscriptionData 
    }) => {
      return apiClient.post(`/subscriptions/${subscriptionId}/preview-change`, changes);
    },
    onError: (error) => {
      console.error('Failed to preview subscription change:', error);
      toast.error('Failed to preview changes');
    },
  });
};