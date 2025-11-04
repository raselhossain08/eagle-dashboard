// hooks/use-billing-reports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingReportsService } from '@/lib/services/billing-reports.service';
import { 
  MrrReportData, 
  RevenueReportData, 
  CohortAnalysisData,
  CustomerCohortData,
  DashboardStats,
  PlanPerformance,
  InvoiceSummary,
  SubscriptionAnalytics,
  BillingActivity,
  ReportExportParams,
  DateRange
} from '@/types/billing-reports';

const billingReportsService = new BillingReportsService();

// Dashboard Stats Hook
export const useDashboardStats = (options?: any) => {
  return useQuery<DashboardStats>({
    queryKey: ['billing-reports', 'dashboard-stats'],
    queryFn: () => billingReportsService.getDashboardStats(),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Recent Activity Hook
export const useRecentActivity = (limit: number = 10, options?: any) => {
  return useQuery<BillingActivity[]>({
    queryKey: ['billing-reports', 'recent-activity', limit],
    queryFn: () => billingReportsService.getRecentActivity(limit),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useMrrReport = (dateRange?: DateRange, options?: any) => {
  return useQuery<MrrReportData>({
    queryKey: ['billing-reports', 'mrr', dateRange],
    queryFn: () => billingReportsService.getMrrReport(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Always enabled for automatic fetching
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic interval refetching
    ...options,
  });
};

export const useRevenueReport = (dateRange: DateRange, options?: any) => {
  return useQuery<RevenueReportData>({
    queryKey: ['billing-reports', 'revenue', dateRange],
    queryFn: () => billingReportsService.getRevenueReport(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic interval refetching
    ...options,
  });
};

export const useCohortAnalysis = (type: 'weekly' | 'monthly') => {
  return useQuery<CohortAnalysisData>({
    queryKey: ['billing-reports', 'cohort-analysis', type],
    queryFn: () => billingReportsService.getCohortAnalysis(type),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Customer Cohort Hook
export const useCustomerCohort = (type: 'weekly' | 'monthly' = 'monthly', periods: number = 12) => {
  return useQuery<CustomerCohortData[]>({
    queryKey: ['billing-reports', 'customer-cohort', type, periods],
    queryFn: () => billingReportsService.getCustomerCohort(type, periods),
    staleTime: 30 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

// Plan Performance Hook
export const usePlanPerformance = (dateRange?: DateRange) => {
  return useQuery<PlanPerformance[]>({
    queryKey: ['billing-reports', 'plan-performance', dateRange],
    queryFn: () => billingReportsService.getPlanPerformance(dateRange),
    staleTime: 15 * 60 * 1000,
  });
};

// Invoice Summary Hook
export const useInvoiceSummary = (dateRange?: DateRange) => {
  return useQuery<InvoiceSummary>({
    queryKey: ['billing-reports', 'invoice-summary', dateRange],
    queryFn: () => billingReportsService.getInvoiceSummary(dateRange),
    staleTime: 10 * 60 * 1000,
  });
};

// Subscription Analytics Hook
export const useSubscriptionAnalytics = (dateRange?: DateRange) => {
  return useQuery<SubscriptionAnalytics[]>({
    queryKey: ['billing-reports', 'subscription-analytics', dateRange],
    queryFn: () => billingReportsService.getSubscriptionAnalytics(dateRange),
    staleTime: 15 * 60 * 1000,
  });
};

export const useExportRevenueReport = () => {
  return useMutation({
    mutationFn: (params: ReportExportParams) => billingReportsService.exportRevenueReport(params),
    onSuccess: (data) => {
      // Download the file
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

export const useExportSubscriptionsReport = () => {
  return useMutation({
    mutationFn: (params: ReportExportParams) => billingReportsService.exportSubscriptionsReport(params),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

export const useExportInvoicesReport = () => {
  return useMutation({
    mutationFn: (params: ReportExportParams) => billingReportsService.exportInvoicesReport(params),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

export const useExportMrrReport = () => {
  return useMutation({
    mutationFn: (params: ReportExportParams) => billingReportsService.exportMrrReport(params),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mrr-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

export const useExportCohortReport = () => {
  return useMutation({
    mutationFn: (params: ReportExportParams) => billingReportsService.exportSubscriptionsReport(params),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-cohort-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

// Refresh all billing reports
export const useRefreshBillingReports = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-reports'] });
    },
  });
};