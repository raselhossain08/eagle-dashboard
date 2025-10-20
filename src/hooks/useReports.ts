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