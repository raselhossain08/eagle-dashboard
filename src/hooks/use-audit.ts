import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { auditService } from '@/lib/services/audit.service';
import { AuditQueryParams, DateRange } from '@/types/audit';

export const useAuditLogs = (params: AuditQueryParams) => {
  return useQuery({
    queryKey: ['audit', 'logs', params],
    queryFn: () => auditService.getAuditLogs(params),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

export const useAuditLogDetails = (id: string) => {
  return useQuery({
    queryKey: ['audit', 'log', id],
    queryFn: () => auditService.getAuditLogById(id),
    enabled: !!id,
  });
};

export const useResourceAudit = (resourceType: string, resourceId: string) => {
  return useQuery({
    queryKey: ['audit', 'resource', resourceType, resourceId],
    queryFn: () => auditService.getResourceAudit(resourceType, resourceId),
    enabled: !!(resourceType && resourceId),
  });
};

export const useAdminActivity = (adminUserId?: string, days?: number) => {
  return useQuery({
    queryKey: ['audit', 'admin', adminUserId, days],
    queryFn: () => auditService.getAdminActivity(adminUserId!, days),
    enabled: !!adminUserId,
  });
};

export const useAdminActivitySummary = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['audit', 'admin-activity', 'summary', dateRange],
    queryFn: () => auditService.getAdminActivitySummary(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};

export const useSystemActivity = (days?: number, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'system', days],
    queryFn: () => auditService.getSystemActivity(days),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useActivityOverview = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'overview', dateRange],
    queryFn: () => auditService.getActivityOverview(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useActivityTrends = (params: { groupBy: 'hour' | 'day' | 'week' | 'month'; dateRange: DateRange }, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'trends', params],
    queryFn: () => auditService.getActivityTrends(params),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useRiskAssessment = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'risk-assessment', dateRange],
    queryFn: () => auditService.getRiskAssessment(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (params: AuditQueryParams) => auditService.exportAuditLogs(params),
  });
};

export const useCleanupOldLogs = () => {
  return useMutation({
    mutationFn: (retentionDays: number) => auditService.cleanupOldLogs(retentionDays),
  });
};

export const useBulkDeleteLogs = () => {
  return useMutation({
    mutationFn: (logIds: string[]) => auditService.bulkDeleteLogs(logIds),
  });
};

export const useBulkExportLogs = () => {
  return useMutation({
    mutationFn: (logIds: string[]) => auditService.bulkExportLogs(logIds),
  });
};

export const useAuditFilterOptions = () => {
  return useQuery({
    queryKey: ['audit', 'filter-options'],
    queryFn: () => auditService.getFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// System health metrics hook
export const useSystemHealthMetrics = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'system-health', dateRange],
    queryFn: () => auditService.getSystemHealthMetrics(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

// Advanced Analytics hooks
export const usePredictiveInsights = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'predictive-insights', dateRange],
    queryFn: () => auditService.getPredictiveInsights(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useCorrelationAnalysis = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'correlation-analysis', dateRange],
    queryFn: () => auditService.getCorrelationAnalysis(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useBehavioralAnalysis = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'behavioral-analysis', dateRange],
    queryFn: () => auditService.getBehavioralAnalysis(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

// Security hooks
export const useAnomalies = (dateRange: DateRange, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'anomalies', dateRange],
    queryFn: () => auditService.getAnomalies(dateRange),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

export const useSessions = (activeOnly: boolean = true, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'sessions', activeOnly],
    queryFn: () => auditService.getSessions(activeOnly),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

// Compliance hook
export const useComplianceData = (standard?: string, options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['audit', 'compliance', standard],
    queryFn: () => auditService.getComplianceData(standard),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ...options,
  });
};

// Resource utilities hooks
export const useResourceTypes = () => {
  return useQuery({
    queryKey: ['audit', 'resource-types'],
    queryFn: () => auditService.getResourceTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useResourceSearch = (type: string, query: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['audit', 'resource-search', type, query, limit],
    queryFn: () => auditService.searchResources(type, query, limit),
    enabled: !!(type && query && query.length >= 2),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};