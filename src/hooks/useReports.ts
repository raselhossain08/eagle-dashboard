import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/lib/api/reports';
import { 
  RevenueReportParams, 
  ActivityReportParams, 
  CustomReportConfig,
  ExportFormat
} from '@/types/reports';
import { useCallback } from 'react';

export const useRevenueReport = (params: RevenueReportParams) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsService.getRevenueReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};

export const useSubscriptionReport = (params: RevenueReportParams) => {
  return useQuery({
    queryKey: ['reports', 'subscriptions', params],
    queryFn: () => reportsService.getSubscriptionReport(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};

export const useUserActivityReport = (params: ActivityReportParams) => {
  return useQuery({
    queryKey: ['reports', 'user-activity', params],
    queryFn: async () => {
      if (!params.startDate || !params.endDate) {
        throw new Error('Start date and end date are required for user activity report');
      }
      return reportsService.getUserActivityReport(params);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!(params.startDate && params.endDate),
  });
};

export const useUserAcquisitionReport = (params: ActivityReportParams) => {
  return useQuery({
    queryKey: ['reports', 'user-acquisition', params],
    queryFn: async () => {
      if (!params.startDate || !params.endDate) {
        throw new Error('Start date and end date are required for user acquisition report');
      }
      return reportsService.getUserAcquisitionReport(params);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!(params.startDate && params.endDate),
  });
};

export const useUserRetentionReport = (params: ActivityReportParams & { cohortType?: 'weekly' | 'monthly' }) => {
  return useQuery({
    queryKey: ['reports', 'user-retention', params],
    queryFn: async () => {
      if (!params.startDate || !params.endDate) {
        throw new Error('Start date and end date are required for user retention report');
      }
      return reportsService.getUserRetentionReport(params);
    },
    staleTime: 10 * 60 * 1000, // Retention data changes less frequently
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!(params.startDate && params.endDate),
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
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Export mutation for user reports
export const useExportUserReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportType, params, format }: {
      reportType: 'activity' | 'acquisition' | 'retention';
      params: any;
      format: ExportFormat;
    }) => {
      // Generate a temporary report ID based on type and params
      const reportId = `user-${reportType}-${Date.now()}`;
      return reportsService.exportReport(reportId, format);
    },
    onSuccess: () => {
      // Invalidate reports queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      console.error('Export failed:', error);
      throw error;
    },
  });
};

// Mutation hooks for reports operations
export const useRefreshReports = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
      const [overview, recent] = await Promise.all([
        reportsService.getDashboardOverview(startDate, endDate),
        reportsService.getRecentReports(10),
      ]);
      return { overview, recent };
    },
    onSuccess: ({ overview, recent }) => {
      // Update query cache with fresh data
      queryClient.setQueryData(['reports', 'dashboard-overview'], overview);
      queryClient.setQueryData(['reports', 'recent'], recent);
      
      // Invalidate other report queries
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      console.error('Failed to refresh reports:', error);
    },
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format: 'csv' | 'excel' | 'pdf' }) => {
      const blob = await reportsService.exportReport(reportId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onError: (error) => {
      console.error('Failed to export report:', error);
    },
  });
};

// Enhanced hooks with additional features
export const useReportsWithCache = () => {
  const queryClient = useQueryClient();

  return {
    dashboardOverview: useDashboardOverview(),
    recentReports: useRecentReports(5),
    prefetchRevenue: useCallback((params: RevenueReportParams) => {
      queryClient.prefetchQuery({
        queryKey: ['reports', 'revenue', params],
        queryFn: () => reportsService.getRevenueReport(params),
        staleTime: 5 * 60 * 1000,
      });
    }, [queryClient]),
    refreshAll: useRefreshReports(),
    exportReport: useExportReport(),
  };
};

export const useDashboardOverview = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'dashboard-overview', startDate, endDate],
    queryFn: () => reportsService.getDashboardOverview(startDate, endDate),
    staleTime: 3 * 60 * 1000, // 3 minutes for dashboard data
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useRecentReports = (limit?: number) => {
  return useQuery({
    queryKey: ['reports', 'recent', limit],
    queryFn: () => reportsService.getRecentReports(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes cache for recent reports
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
};