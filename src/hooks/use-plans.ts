// hooks/use-plans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams } from '@/types/billing';
import { PlansService } from '@/lib/services/plans.service';

const plansService = new PlansService();

export const usePlans = (params: PlansQueryParams = {}) => {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => plansService.getPlans(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => 
      plansService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
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