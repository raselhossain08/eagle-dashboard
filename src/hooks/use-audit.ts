import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService } from '@/lib/services/audit.service';
import { AuditQueryParams, DateRange } from '@/types/audit';

export const useAuditLogs = (params: AuditQueryParams) => {
  return useQuery({
    queryKey: ['audit', 'logs', params],
    queryFn: () => auditService.getAuditLogs(params),
    staleTime: 1 * 60 * 1000, // 1 minute
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSystemActivity = (days?: number) => {
  return useQuery({
    queryKey: ['audit', 'system', days],
    queryFn: () => auditService.getSystemActivity(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivityOverview = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['audit', 'overview', dateRange],
    queryFn: () => auditService.getActivityOverview(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActivityTrends = (params: { groupBy: 'hour' | 'day' | 'week' | 'month'; dateRange: DateRange }) => {
  return useQuery({
    queryKey: ['audit', 'trends', params],
    queryFn: () => auditService.getActivityTrends(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRiskAssessment = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['audit', 'risk-assessment', dateRange],
    queryFn: () => auditService.getRiskAssessment(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// System health metrics hook
export const useSystemHealthMetrics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['audit', 'system-health', dateRange],
    queryFn: () => auditService.getSystemHealthMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};