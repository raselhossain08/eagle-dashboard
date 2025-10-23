import { AuditLog, AuditQueryParams, AuditLogsResponse, AdminActivitySummary, SystemHealthData, RiskAssessmentData, ActivityOverviewData, PredictiveInsightData, CorrelationData, BehavioralData, AnomalyResponse, SessionData, ComplianceData } from '@/types/audit';
import { apiClient } from '@/lib/api/client';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class AuditService {

  // Core audit operations
  async getAuditLogs(params: AuditQueryParams): Promise<AuditLogsResponse> {
    const queryParams: Record<string, any> = {};
    
    // Transform frontend params to backend format
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.adminUserId) queryParams.adminUserId = params.adminUserId;
    if (params.action) queryParams.action = params.action;
    if (params.resourceType) queryParams.resourceType = params.resourceType;
    if (params.resourceId) queryParams.resourceId = params.resourceId;
    if (params.status) queryParams.status = params.status;
    
    // Handle date filters
    if (params.startDate) {
      queryParams.startDate = params.startDate instanceof Date 
        ? params.startDate.toISOString() 
        : params.startDate;
    }
    if (params.endDate) {
      queryParams.endDate = params.endDate instanceof Date 
        ? params.endDate.toISOString() 
        : params.endDate;
    }
    
    // Note: Backend doesn't support sortBy/sortOrder, it sorts by timestamp desc by default
    // Note: Backend doesn't support search parameter

    return apiClient.get<AuditLogsResponse>('/audit', queryParams);
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    return apiClient.get<AuditLog>(`/audit/${id}`);
  }

  async getResourceAudit(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(`/audit/resource/${resourceType}/${resourceId}`);
  }

  // Admin activity
  async getAdminActivity(adminUserId: string, days?: number): Promise<AuditLog[]> {
    const params = days ? { days } : {};
    return apiClient.get<AuditLog[]>(`/audit/admin/${adminUserId}`, params);
  }

  async getAdminActivitySummary(dateRange: { from: Date; to: Date }): Promise<AdminActivitySummary[]> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/admin-activity/summary?${queryParams}`);
  }

  // System activity
  async getSystemActivity(days?: number): Promise<any[]> {
    const queryParams = days ? `?days=${days}` : '';
    return apiClient.get(`/audit/system/activity${queryParams}`);
  }

  async getSystemHealthMetrics(dateRange: { from: Date; to: Date }): Promise<SystemHealthData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/system/health?${queryParams}`);
  }

  // Analytics and insights
  async getActivityOverview(dateRange: { from: Date; to: Date }): Promise<ActivityOverviewData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/overview?${queryParams}`);
  }

  async getActivityTrends(params: { groupBy: 'hour' | 'day' | 'week' | 'month'; dateRange: { from: Date; to: Date } }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      groupBy: params.groupBy,
      from: params.dateRange.from.toISOString(),
      to: params.dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/trends?${queryParams}`);
  }

  async getRiskAssessment(dateRange: { from: Date; to: Date }): Promise<RiskAssessmentData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/risk-assessment?${queryParams}`);
  }

  // Advanced Analytics
  async getPredictiveInsights(dateRange: { from: Date; to: Date }): Promise<PredictiveInsightData[]> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/predictive?${queryParams}`);
  }

  async getCorrelationAnalysis(dateRange: { from: Date; to: Date }): Promise<CorrelationData[]> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/correlation?${queryParams}`);
  }

  async getBehavioralAnalysis(dateRange: { from: Date; to: Date }): Promise<BehavioralData[]> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/analytics/behavioral?${queryParams}`);
  }

  // Security Features
  async getAnomalies(dateRange: { from: Date; to: Date }): Promise<AnomalyResponse> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return apiClient.get(`/audit/security/anomalies?${queryParams}`);
  }

  async getSessions(activeOnly: boolean = true): Promise<SessionData[]> {
    const queryParams = activeOnly ? '?activeOnly=true' : '';
    return apiClient.get(`/audit/security/sessions${queryParams}`);
  }

  // Compliance
  async getComplianceData(standard?: string): Promise<ComplianceData> {
    const queryParams = standard ? `?standard=${standard}` : '';
    return apiClient.get(`/audit/compliance${queryParams}`);
  }

  // Export functionality
  async exportAuditLogs(params: AuditQueryParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          queryParams.append(key, value.toISOString());
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return apiClient.download(`/audit/export?${queryParams}`);
  }

  // Bulk Operations
  async bulkDeleteLogs(logIds: string[]): Promise<{ deletedCount: number }> {
    return apiClient.post('/audit/bulk/delete', { logIds });
  }

  async bulkExportLogs(logIds: string[]): Promise<Blob> {
    return apiClient.download('/audit/bulk/export', {
      method: 'POST',
      data: { logIds }
    });
  }

  // Filter options
  async getFilterOptions(): Promise<{
    adminUsers: { id: string; email: string; role: string }[];
    actions: string[];
    resourceTypes: string[];
    statuses: string[];
  }> {
    return apiClient.get('/audit/filters/options');
  }

  // Resource utilities
  async getResourceTypes(): Promise<{ types: string[]; counts: Record<string, number> }> {
    return apiClient.get('/audit/resources/types');
  }

  async searchResources(
    type: string, 
    query: string, 
    limit: number = 10
  ): Promise<{ resources: Array<{ id: string; lastModified: Date; actionCount: number }> }> {
    const queryParams = new URLSearchParams({
      type,
      query,
      limit: limit.toString()
    });
    return apiClient.get(`/audit/resources/search?${queryParams}`);
  }

  // Admin operations
  async cleanupOldLogs(retentionDays: number): Promise<{ deletedCount: number }> {
    return apiClient.delete(`/audit/cleanup/${retentionDays}`);
  }
}

export const auditService = new AuditService();