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
  MetricsParams
} from '@/types/system';

class SystemService {
  private baseUrl = '/api/system';

  // Health monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('Failed to fetch system health');
    return response.json();
  }

  async getSystemStats(): Promise<SystemStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) throw new Error('Failed to fetch system stats');
    return response.json();
  }

  async getSystemMetrics(params: MetricsParams): Promise<any> {
    const query = new URLSearchParams(params as any);
    const response = await fetch(`${this.baseUrl}/metrics?${query}`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  }

  // Settings management
  async getSettings(category?: string): Promise<SystemSettings> {
    const url = category ? `${this.baseUrl}/settings?category=${category}` : `${this.baseUrl}/settings`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  }

  async getSetting(key: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/settings/${key}`);
    if (!response.ok) throw new Error('Failed to fetch setting');
    return response.json();
  }

  async updateSetting(key: string, value: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/settings/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    if (!response.ok) throw new Error('Failed to update setting');
    return response.json();
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    const response = await fetch(`${this.baseUrl}/settings/feature-flags`);
    if (!response.ok) throw new Error('Failed to fetch feature flags');
    return response.json();
  }

  async toggleFeatureFlag(key: string, enabled: boolean): Promise<any> {
    const response = await fetch(`${this.baseUrl}/settings/feature-flags/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    if (!response.ok) throw new Error('Failed to toggle feature flag');
    return response.json();
  }

  // Webhook operations
  async createWebhookEndpoint(data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const response = await fetch(`${this.baseUrl}/webhooks/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create webhook endpoint');
    return response.json();
  }

  async triggerWebhook(event: string, payload: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhooks/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload })
    });
    if (!response.ok) throw new Error('Failed to trigger webhook');
    return response.json();
  }

  async getWebhookStats(endpointId?: string): Promise<WebhookStats> {
    const url = endpointId 
      ? `${this.baseUrl}/webhooks/endpoints/${endpointId}/stats`
      : `${this.baseUrl}/webhooks/stats`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch webhook stats');
    return response.json();
  }

  async retryFailedWebhooks(endpointId?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/webhooks/retry-failed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointId })
    });
    if (!response.ok) throw new Error('Failed to retry webhooks');
    return response.json();
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