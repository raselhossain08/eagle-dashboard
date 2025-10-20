// hooks/use-billing-reports.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { BillingReportsService } from '@/lib/services/billing-reports.service';

const billingReportsService = new BillingReportsService();

export const useMrrReport = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['billing-reports', 'mrr', dateRange],
    queryFn: () => billingReportsService.getMrrReport(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueReport = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['billing-reports', 'revenue', dateRange],
    queryFn: () => billingReportsService.getRevenueReport(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCohortAnalysis = (type: 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: ['billing-reports', 'cohort-analysis', type],
    queryFn: () => billingReportsService.getCohortAnalysis(type),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useExportRevenueReport = () => {
  return useMutation({
    mutationFn: (params: any) => billingReportsService.exportRevenueReport(params),
  });
};

export const useExportSubscriptionsReport = () => {
  return useMutation({
    mutationFn: (params: any) => billingReportsService.exportSubscriptionsReport(params),
  });
};

export const useExportInvoicesReport = () => {
  return useMutation({
    mutationFn: (params: any) => billingReportsService.exportInvoicesReport(params),
  });
};