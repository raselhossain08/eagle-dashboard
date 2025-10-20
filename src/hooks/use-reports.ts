import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/lib/services/reports.service'
import { useDashboardStore } from '@/store/dashboard-store'
import { RevenueReportData, CohortData, GoalPerformanceData, DeviceBreakdownData, CohortAnalysisParams } from '@/types'

// Revenue Report Hook
export const useRevenueReport = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['reports', 'revenue', dateRange],
    queryFn: () => reportsService.getRevenueReport(dateRange),
    staleTime: 5 * 60 * 1000,
  })
}

// Cohort Analysis Hook
export const useCohortAnalysis = (params: Omit<CohortAnalysisParams, 'startDate' | 'endDate'>) => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['reports', 'cohorts', { ...params, dateRange }],
    queryFn: () => reportsService.getCohortAnalysis({
      ...params,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    staleTime: 10 * 60 * 1000,
  })
}

// Goal Performance Hook
export const useGoalPerformance = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['reports', 'goals', 'performance', dateRange],
    queryFn: () => reportsService.getGoalPerformance(dateRange),
    staleTime: 5 * 60 * 1000,
  })
}

// Device Breakdown Hook
export const useDeviceBreakdown = () => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['reports', 'devices', 'breakdown', dateRange],
    queryFn: () => reportsService.getDeviceBreakdown(dateRange),
    staleTime: 10 * 60 * 1000,
  })
}

// Conversion Funnel Hook
export const useConversionFunnel = (funnelId?: string) => {
  const { dateRange } = useDashboardStore()
  
  return useQuery({
    queryKey: ['reports', 'funnel', dateRange, funnelId],
    queryFn: () => reportsService.getConversionFunnel({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      funnelId,
    }),
    staleTime: 2 * 60 * 1000,
  })
}