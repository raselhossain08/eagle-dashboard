import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { funnelService, CreateFunnelParams, FunnelTimeAnalysisParams, SegmentPerformanceParams } from '@/lib/api/funnel.service';

export const useCreateFunnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: CreateFunnelParams) => funnelService.createFunnel(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
};

export const useFunnelTimeAnalysis = (params: FunnelTimeAnalysisParams) => {
  return useQuery({
    queryKey: ['funnels', 'time-analysis', params],
    queryFn: () => funnelService.getFunnelTimeAnalysis(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.steps?.length && !!params.startDate && !!params.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSegmentPerformance = (params: SegmentPerformanceParams) => {
  return useQuery({
    queryKey: ['funnels', 'segment-performance', params],
    queryFn: () => funnelService.getSegmentPerformance(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.steps?.length && !!params.segmentBy && !!params.startDate && !!params.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};