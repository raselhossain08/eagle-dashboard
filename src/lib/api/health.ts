import { HealthMetrics, PingResponse, HealthHistory, ServiceStatus, SystemMetrics, Alert } from '@/types/health';

class HealthService {
  private baseURL = '/api/health';

  async getSystemHealth(): Promise<HealthMetrics> {
    const response = await fetch(`${this.baseURL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch system health');
    }
    return response.json();
  }

  async ping(): Promise<PingResponse> {
    const response = await fetch(`${this.baseURL}/ping`);
    if (!response.ok) {
      throw new Error('Failed to ping health endpoint');
    }
    return response.json();
  }

  async getHealthHistory(limit?: number): Promise<HealthHistory[]> {
    const queryString = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${this.baseURL}/history${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch health history');
    }
    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${this.baseURL}/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch system metrics');
    }
    return response.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${this.baseURL}/alerts`);
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    return response.json();
  }

  // Legacy methods for backward compatibility
  async getDatabaseHealth(): Promise<ServiceStatus> {
    const health = await this.getSystemHealth();
    const dbService = health.services.find(s => s.name === 'database');
    return dbService || {
      name: 'database',
      status: 'down',
      details: { error: 'Service not found' }
    };
  }

  async getRedisHealth(): Promise<ServiceStatus> {
    const health = await this.getSystemHealth();
    const redisService = health.services.find(s => s.name === 'redis');
    return redisService || {
      name: 'redis',
      status: 'down',
      details: { error: 'Service not found' }
    };
  }

  async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    const metrics = await this.getSystemMetrics();
    return metrics.memory;
  }

  async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    const metrics = await this.getSystemMetrics();
    return metrics.disk;
  }
}

export const healthService = new HealthService();