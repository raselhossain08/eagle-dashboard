import { HealthMetrics, PingResponse, HealthHistory, ServiceStatus, SystemMetrics } from '@/types/health';

class HealthService {
  private baseURL = '/api';

  async getSystemHealth(): Promise<HealthMetrics> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('Failed to fetch system health');
    }
    return response.json();
  }

  async ping(): Promise<PingResponse> {
    const response = await fetch(`${this.baseURL}/health/ping`);
    if (!response.ok) {
      throw new Error('Failed to ping health endpoint');
    }
    return response.json();
  }

  async getHealthHistory(): Promise<HealthHistory[]> {
    const response = await fetch(`${this.baseURL}/health/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch health history');
    }
    return response.json();
  }

  async getDatabaseHealth(): Promise<ServiceStatus> {
    const response = await fetch(`${this.baseURL}/health/database`);
    if (!response.ok) {
      throw new Error('Failed to fetch database health');
    }
    return response.json();
  }

  async getRedisHealth(): Promise<ServiceStatus> {
    const response = await fetch(`${this.baseURL}/health/redis`);
    if (!response.ok) {
      throw new Error('Failed to fetch redis health');
    }
    return response.json();
  }

  async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    const response = await fetch(`${this.baseURL}/health/memory`);
    if (!response.ok) {
      throw new Error('Failed to fetch memory metrics');
    }
    return response.json();
  }

  async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    const response = await fetch(`${this.baseURL}/health/disk`);
    if (!response.ok) {
      throw new Error('Failed to fetch disk metrics');
    }
    return response.json();
  }
}

export const healthService = new HealthService();