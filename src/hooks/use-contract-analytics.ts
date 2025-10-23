import { useQuery } from '@tanstack/react-query'
import { contractsService } from '@/lib/api/contracts.service'
import { DateRange, TemplatePerformance, ComplianceMetrics } from '@/lib/types/contracts'

export const useContractAnalytics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['contracts', 'analytics', dateRange],
    queryFn: () => contractsService.getContractAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTemplatePerformance = (dateRange: DateRange) => {
  return useQuery<TemplatePerformance[]>({
    queryKey: ['contracts', 'templates', 'performance', dateRange],
    queryFn: () => contractsService.getTemplatePerformance(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useComplianceMetrics = (dateRange: DateRange) => {
  return useQuery<ComplianceMetrics>({
    queryKey: ['contracts', 'compliance', 'metrics', dateRange],
    queryFn: () => contractsService.getComplianceMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}