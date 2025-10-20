import { AuditLog, AuditQueryParams, AuditLogsResponse, AdminActivitySummary, SystemHealthData, RiskAssessmentData, ActivityOverviewData } from '@/types/audit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async get(url: string) {
    return this.fetch(url);
  }

  async post(url: string, data: any) {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete(url: string) {
    return this.fetch(url, {
      method: 'DELETE',
    });
  }
}

export class AuditService {
  constructor(private client: ApiClient = new ApiClient()) {}

  // Core audit operations
  async getAuditLogs(params: AuditQueryParams): Promise<AuditLogsResponse> {
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

    return this.client.get(`/audit?${queryParams}`);
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    return this.client.get(`/audit/${id}`);
  }

  async getResourceAudit(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return this.client.get(`/audit/resource/${resourceType}/${resourceId}`);
  }

  // Admin activity
  async getAdminActivity(adminUserId: string, days?: number): Promise<AuditLog[]> {
    const queryParams = days ? `?days=${days}` : '';
    return this.client.get(`/audit/admin/${adminUserId}${queryParams}`);
  }

  async getAdminActivitySummary(dateRange: { from: Date; to: Date }): Promise<AdminActivitySummary[]> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/admin-activity/summary?${queryParams}`);
  }

  // System activity
  async getSystemActivity(days?: number): Promise<any[]> {
    const queryParams = days ? `?days=${days}` : '';
    return this.client.get(`/audit/system/activity${queryParams}`);
  }

  async getSystemHealthMetrics(dateRange: { from: Date; to: Date }): Promise<SystemHealthData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/system/health?${queryParams}`);
  }

  // Analytics and insights
  async getActivityOverview(dateRange: { from: Date; to: Date }): Promise<ActivityOverviewData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/overview?${queryParams}`);
  }

  async getActivityTrends(params: { groupBy: 'hour' | 'day' | 'week' | 'month'; dateRange: { from: Date; to: Date } }): Promise<any[]> {
    const queryParams = new URLSearchParams({
      groupBy: params.groupBy,
      from: params.dateRange.from.toISOString(),
      to: params.dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/trends?${queryParams}`);
  }

  async getRiskAssessment(dateRange: { from: Date; to: Date }): Promise<RiskAssessmentData> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/risk-assessment?${queryParams}`);
  }

  // Advanced Analytics
  async getPredictiveInsights(dateRange: { from: Date; to: Date }): Promise<any> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/predictive?${queryParams}`);
  }

  async getCorrelationAnalysis(dateRange: { from: Date; to: Date }): Promise<any> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/correlation?${queryParams}`);
  }

  async getBehavioralAnalysis(dateRange: { from: Date; to: Date }): Promise<any> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/analytics/behavioral?${queryParams}`);
  }

  // Security Features
  async getAnomalies(dateRange: { from: Date; to: Date }): Promise<any> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    });
    return this.client.get(`/audit/security/anomalies?${queryParams}`);
  }

  async getSessions(activeOnly: boolean = true): Promise<any> {
    const queryParams = activeOnly ? '?activeOnly=true' : '';
    return this.client.get(`/audit/security/sessions${queryParams}`);
  }

  // Compliance
  async getComplianceData(standard?: string): Promise<any> {
    const queryParams = standard ? `?standard=${standard}` : '';
    return this.client.get(`/audit/compliance${queryParams}`);
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

    const response = await fetch(`${API_BASE_URL}/audit/export?${queryParams}`);
    return response.blob();
  }

  // Bulk Operations
  async bulkDeleteLogs(logIds: string[]): Promise<{ deletedCount: number }> {
    return this.client.post('/audit/bulk/delete', { logIds });
  }

  async bulkExportLogs(logIds: string[]): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/audit/bulk/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logIds }),
    });
    return response.blob();
  }

  // Admin operations
  async cleanupOldLogs(retentionDays: number): Promise<{ deletedCount: number }> {
    return this.client.delete(`/audit/cleanup/${retentionDays}`);
  }
}

export const auditService = new AuditService();