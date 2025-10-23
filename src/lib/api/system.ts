// src/lib/api/system.ts
import {
  SystemHealth,
  SystemStats,
  SystemSettings,
  FeatureFlags,
  WebhookEndpoint,
  WebhookStats,
  BackupResult,
  CleanupResult,
  MaintenanceSchedule,
  MetricsParams,
} from '@/types/system';
import { apiClient } from '@/lib/api/client';

class SystemService {
  // apiClient already includes API prefix; controller uses 'system' base
  private baseUrl = '/system';

  // Health monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    return await apiClient.get<SystemHealth>(`${this.baseUrl}/health`);
  }

  async getSystemStats(): Promise<SystemStats> {
    return await apiClient.get<SystemStats>(`${this.baseUrl}/stats`);
  }

  async getSystemMetrics(params: MetricsParams): Promise<any> {
    return await apiClient.get<any>(`${this.baseUrl}/metrics?${new URLSearchParams(params as any)}`);
  }

  // Settings management
  async getSettings(category?: string): Promise<SystemSettings> {
    const url = category ? `${this.baseUrl}/settings?category=${category}` : `${this.baseUrl}/settings`;
    return await apiClient.get<SystemSettings>(url);
  }

  async getSetting(key: string): Promise<any> {
    return await apiClient.get<any>(`${this.baseUrl}/settings/${key}`);
  }

  async updateSetting(key: string, value: any): Promise<any> {
    return await apiClient.post<any>(`${this.baseUrl}/settings/${key}`, { value });
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    return await apiClient.get<FeatureFlags>(`${this.baseUrl}/settings/feature-flags`);
  }

  async toggleFeatureFlag(key: string, enabled: boolean): Promise<any> {
    return await apiClient.post<any>(`${this.baseUrl}/settings/feature-flags/${key}`, { enabled });
  }

  // Webhook operations
  async createWebhookEndpoint(data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    return await apiClient.post<WebhookEndpoint>(`${this.baseUrl}/webhooks/endpoints`, data);
  }

  async triggerWebhook(event: string, payload: any): Promise<any> {
    return await apiClient.post<any>(`${this.baseUrl}/webhooks/trigger`, { event, payload });
  }

  async getWebhookStats(endpointId?: string): Promise<WebhookStats> {
    const url = endpointId ? `${this.baseUrl}/webhooks/endpoints/${endpointId}/stats` : `${this.baseUrl}/webhooks/stats`;
    return await apiClient.get<WebhookStats>(url);
  }

  async retryFailedWebhooks(endpointId?: string): Promise<any> {
    return await apiClient.post<any>(`${this.baseUrl}/webhooks/retry-failed`, { endpointId });
  }

  // Maintenance operations
  async runCleanup(): Promise<CleanupResult> {
    const response = await fetch(`${this.baseUrl}/maintenance/cleanup`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to run cleanup');
    return response.json();
  }

  async createBackup(): Promise<BackupResult> {
    const response = await fetch(`${this.baseUrl}/backup`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to create backup');
    return response.json();
  }

  async restoreBackup(backupId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId })
    });
    if (!response.ok) throw new Error('Failed to restore backup');
    return response.json();
  }

  async getMaintenanceSchedule(): Promise<MaintenanceSchedule> {
    const response = await fetch(`${this.baseUrl}/maintenance/schedule`);
    if (!response.ok) throw new Error('Failed to fetch maintenance schedule');
    return response.json();
  }
}

export const systemService = new SystemService();