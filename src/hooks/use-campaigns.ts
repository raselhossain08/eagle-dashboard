// hooks/use-campaigns.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/lib/api/campaigns.service';
import { Campaign, CreateCampaignDto } from '@/types/discounts';

export const useCampaigns = (params: any) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignsService.getCampaigns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsService.getCampaignById(id),
    enabled: !!id,
  });
};

export const useCampaignPerformance = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id, 'performance'],
    queryFn: () => campaignsService.getCampaignPerformance(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCampaignsOverview = () => {
  return useQuery({
    queryKey: ['campaigns', 'overview'],
    queryFn: () => campaignsService.getCampaignsOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: () => campaignsService.getActiveCampaigns(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCampaignDto) => campaignsService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCampaignDto> }) =>
      campaignsService.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
    },
  });
};

export const useArchiveCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campaignsService.archiveCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
    },
  });
};

export const useAddDiscountToCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, discountId }: { campaignId: string; discountId: string }) =>
      campaignsService.addDiscountToCampaign(campaignId, discountId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};