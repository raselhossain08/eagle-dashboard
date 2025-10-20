import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { funnelService } from '@/lib/services/funnel.service'
import { useDashboardStore } from '@/store/dashboard-store'
import { FunnelData, CreateFunnelParams, FunnelTimeAnalysisParams, SegmentPerformanceParams } from '@/types'

// Get All Funnels
export const useFunnels = () => {
  return useQuery({
    queryKey: ['funnels'],
    queryFn: () => funnelService.getAllFunnels(),
    staleTime: 5 * 60 * 1000,
  })
}

// Get Funnel by ID
export const useFunnel = (funnelId: string) => {
  return useQuery({
    queryKey: ['funnels', funnelId],
    queryFn: () => funnelService.getFunnelById(funnelId),
    enabled: !!funnelId,
    staleTime: 2 * 60 * 1000,
  })
}

// Create Funnel Mutation
export const useCreateFunnel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: CreateFunnelParams) => funnelService.createFunnel(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] })
    },
    onError: (error: any) => {
      console.error('Failed to create funnel:', error)
    },
  })
}

// Funnel Time Analysis
export const useFunnelTimeAnalysis = (funnelId: string, groupBy: 'hour' | 'day' | 'week' = 'day') => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['funnels', funnelId, 'time-analysis', dateRange, groupBy],
    queryFn: () => funnelService.getFunnelTimeAnalysis({
      funnelId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      groupBy,
    }),
    enabled: !!funnelId,
    staleTime: 2 * 60 * 1000,
  })
}

// Segment Performance
export const useSegmentPerformance = (funnelId: string, segments: string[] = []) => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['funnels', funnelId, 'segment-performance', dateRange, segments],
    queryFn: () => funnelService.getSegmentPerformance({
      funnelId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      segments,
    }),
    enabled: !!funnelId && segments.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

// Delete Funnel Mutation
export const useDeleteFunnel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (funnelId: string) => funnelService.deleteFunnel(funnelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] })
    },
    onError: (error: any) => {
      console.error('Failed to delete funnel:', error)
    },
  })
}