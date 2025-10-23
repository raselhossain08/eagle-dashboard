import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/lib/api/reports';
import { 
  RevenueReportParams, 
  ActivityReportParams, 
  CustomReportConfig 
} from '@/types/reports';

export const useRevenueReport = (params: RevenueReportParams) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsService.getRevenueReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubscriptionReport = (params: RevenueReportParams) => {
  return useQuery({
    queryKey: ['reports', 'subscriptions', params],
    queryFn: () => reportsService.getSubscriptionReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserActivityReport = (params: ActivityReportParams) => {
  return useQuery({
    queryKey: ['reports', 'user-activity', params],
    queryFn: () => reportsService.getUserActivityReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserAcquisitionReport = (params: ActivityReportParams) => {
  return useQuery({
    queryKey: ['reports', 'user-acquisition', params],
    queryFn: () => reportsService.getUserAcquisitionReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserRetentionReport = (params: ActivityReportParams & { cohortType?: 'weekly' | 'monthly' }) => {
  return useQuery({
    queryKey: ['reports', 'user-retention', params],
    queryFn: () => reportsService.getUserRetentionReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['reports', 'templates'],
    queryFn: () => reportsService.getReportTemplates(),
  });
};

export const useCustomReport = (config: CustomReportConfig) => {
  return useQuery({
    queryKey: ['reports', 'custom', config],
    queryFn: () => reportsService.generateCustomReport(config),
    enabled: !!config.name,
  });
};

export const useDashboardOverview = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'dashboard-overview', startDate, endDate],
    queryFn: () => reportsService.getDashboardOverview(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentReports = (limit?: number) => {
  return useQuery({
    queryKey: ['reports', 'recent', limit],
    queryFn: () => reportsService.getRecentReports(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes cache for recent reports
  });
};