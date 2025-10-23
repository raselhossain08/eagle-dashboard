// hooks/use-redemptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redemptionsService, RedemptionsResponse, RedemptionStats, SuspiciousActivity } from '@/lib/api/redemptions.service';
import { Redemption, RedemptionFilters, DateRange } from '@/types/discounts';

export const useRedemptions = (params: {
  page?: number;
  limit?: number;
  discountId?: string;
  userId?: string;
  campaignId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['redemptions', params],
    queryFn: () => redemptionsService.getRedemptions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useRedemption = (id: string) => {
  return useQuery({
    queryKey: ['redemptions', id],
    queryFn: () => redemptionsService.getRedemptionById(id),
    enabled: !!id,
  });
};

export const useRedemptionStats = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['redemptions', 'stats', dateRange],
    queryFn: () => redemptionsService.getRedemptionStats(dateRange),
    enabled: !!(dateRange.from && dateRange.to),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSuspiciousRedemptions = () => {
  return useQuery({
    queryKey: ['redemptions', 'suspicious'],
    queryFn: () => redemptionsService.getSuspiciousRedemptions(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useExportRedemptions = () => {
  return useMutation({
    mutationFn: (params: {
      startDate: Date;
      endDate: Date;
      format?: 'csv' | 'excel';
      filters?: RedemptionFilters;
    }) => redemptionsService.exportRedemptions(params),
  });
};

export const useFlagRedemption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      redemptionsService.flagRedemption(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'suspicious'] });
    },
  });
};

export const useBlockSuspiciousActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (criteria: {
      ipAddress?: string;
      userId?: string;
      pattern?: string;
    }) => redemptionsService.blockSuspiciousActivity(criteria),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'suspicious'] });
    },
  });
};