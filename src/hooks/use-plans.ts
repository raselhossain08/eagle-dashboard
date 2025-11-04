// hooks/use-plans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams } from '@/types/billing';
import { PlansService } from '@/lib/services/plans.service';

const plansService = new PlansService();

export const usePlans = (params: PlansQueryParams = {}) => {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => plansService.getPlans(params),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data (React Query v4+)
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchOnMount: true, // Always refetch on mount
    refetchInterval: 30 * 1000, // Auto refresh every 30 seconds
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => plansService.getPlanById(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePlanDto) => plansService.createPlan(data),
    onSuccess: () => {
      // Remove all cached data and refetch immediately
      queryClient.removeQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
    onError: () => {
      // Still refresh to get current state from database
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => 
      plansService.updatePlan(id, data),
    onSuccess: () => {
      // Remove all cached data and refetch immediately
      queryClient.removeQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
    onError: () => {
      // Still refresh to get current state from database
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => plansService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useTogglePlanStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      plansService.togglePlanStatus(id, isActive),
    onSuccess: () => {
      // Aggressive cache clearing and refetching
      queryClient.removeQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
    onError: () => {
      // Still refresh to get current state from database
      queryClient.refetchQueries({ queryKey: ['plans'] });
    },
  });
};

export const useTogglePlanVisibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) => 
      plansService.togglePlanVisibility(id, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const usePlanStatistics = (id: string) => {
  return useQuery({
    queryKey: ['plans', id, 'statistics'],
    queryFn: () => plansService.getPlanStatistics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const usePlanSubscriptionHistory = (id: string) => {
  return useQuery({
    queryKey: ['plans', id, 'subscription-history'],
    queryFn: () => plansService.getPlanSubscriptionHistory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Additional hooks for discount codes functionality
export const useActivePlans = () => {
  return useQuery({
    queryKey: ['plans', 'active'],
    queryFn: () => plansService.getPlans({ isActive: true, limit: 100 }),
    staleTime: 15 * 60 * 1000, // 15 minutes - active plans are stable
    select: (data) => data.data || [], // Extract just the plans array
  });
};

export const useActiveSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['plans', 'subscription', 'active'],
    queryFn: () => plansService.getPlans({ isActive: true, category: 'subscription', limit: 100 }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    select: (data) => data.data?.filter(plan => plan.isActive) || [], // Filter active subscription plans
  });
};