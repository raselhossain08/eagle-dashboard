import { useQuery } from '@tanstack/react-query';
import { reportsService, ConversionFunnelParams, CohortAnalysisParams } from '@/lib/api/reports.service';

export const useConversionFunnel = (params: ConversionFunnelParams) => {
  return useQuery({
    queryKey: ['reports', 'conversion-funnel', params],
    queryFn: () => reportsService.getConversionFunnel(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.startDate && !!params.endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRevenueReport = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsService.getRevenueReport(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCohortAnalysis = (params: CohortAnalysisParams) => {
  return useQuery({
    queryKey: ['reports', 'cohorts', params],
    queryFn: () => reportsService.getCohortAnalysis(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGoalPerformance = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'goals', params],
    queryFn: () => reportsService.getGoalPerformance(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDeviceBreakdown = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'devices', params],
    queryFn: () => reportsService.getDeviceBreakdown(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOperatingSystemBreakdown = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'os-breakdown', params],
    queryFn: () => reportsService.getOperatingSystemBreakdown(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBrowserBreakdown = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'browser-breakdown', params],
    queryFn: () => reportsService.getBrowserBreakdown(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductRevenueBreakdown = (params: { startDate: Date; endDate: Date }) => {
  return useQuery({
    queryKey: ['reports', 'product-revenue', params],
    queryFn: () => reportsService.getProductRevenueBreakdown(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCustomReport = (reportId: string) => {
  return useQuery({
    queryKey: ['reports', 'custom-detail', reportId],
    queryFn: () => reportsService.getCustomReportById(reportId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!reportId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};