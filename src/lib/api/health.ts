import { HealthMetrics, PingResponse, HealthHistory, ServiceStatus, SystemMetrics, Alert } from '@/types/health';
import { TokenStorageService } from '@/lib/auth/token-storage.service';

class HealthService {
  private baseURL = '/api/health';

  private getAuthHeaders(): HeadersInit {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getSystemHealth(): Promise<HealthMetrics> {
    const response = await fetch(`${this.baseURL}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch system health: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  async ping(): Promise<PingResponse> {
    const response = await fetch(`${this.baseURL}/ping`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ping health endpoint: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  async getHealthHistory(limit?: number): Promise<HealthHistory[]> {
    const queryString = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${this.baseURL}/history${queryString}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch health history: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${this.baseURL}/metrics`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch system metrics: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${this.baseURL}/alerts`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch alerts: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  // Legacy methods for backward compatibility
  async getDatabaseHealth(): Promise<ServiceStatus> {
    try {
      const health = await this.getSystemHealth();
      const dbService = health.services.find(s => s.name === 'database');
      return dbService || {
        name: 'database',
        status: 'down',
        details: { error: 'Service not found in health response' }
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'down',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  async getRedisHealth(): Promise<ServiceStatus> {
    try {
      const health = await this.getSystemHealth();
      const redisService = health.services.find(s => s.name === 'redis');
      return redisService || {
        name: 'redis',
        status: 'down',
        details: { error: 'Service not found in health response' }
      };
    } catch (error) {
      return {
        name: 'redis',
        status: 'down',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    const metrics = await this.getSystemMetrics();
    return metrics.memory;
  }

  async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    const metrics = await this.getSystemMetrics();
    return metrics.disk;
  }

  async getCpuMetrics(): Promise<SystemMetrics['cpu']> {
    const metrics = await this.getSystemMetrics();
    return metrics.cpu;
  }
}

export const healthService = new HealthService();