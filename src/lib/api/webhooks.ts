// src/lib/api/webhooks.ts
import { apiClient } from './client';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  timeout: number;
  maxRetries: number;
  deliveryMode: string;
  headers?: Record<string, string>;
  successCount: number;
  failureCount: number;
  lastDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebhookEvent {
  id: string;
  event: string;
  payload: Record<string, any>;
  endpointId: {
    id: string;
    name: string;
    url: string;
  };
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attemptCount: number;
  lastAttempt?: string;
  nextRetry?: string;
  deliveredAt?: string;
  responseCode?: number;
  responseBody?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebhookLog {
  id: string;
  endpointId: {
    id: string;
    name: string;
    url: string;
  };
  event: string;
  status: number;
  statusText: string;
  attempts: number;
  duration: number;
  createdAt: string;
  payload: Record<string, any>;
  response: string;
}

class WebhookService {
  // apiClient.baseURL already includes the API prefix (e.g. /api/v1)
  // Controller in backend uses 'system/webhooks' so compose endpoint relative to that
  private baseUrl = '/system/webhooks';

  // Events
  async getEvents(params: {
    page?: number;
    limit?: number;
    status?: string;
    event?: string;
    endpointId?: string;
  }): Promise<{
    events: WebhookEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.event) query.append('event', params.event);
    if (params.endpointId) query.append('endpointId', params.endpointId);

    const response = await apiClient.get<{
      events: WebhookEvent[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.baseUrl}/events?${query}`);
    return response;
  }

  async getEvent(id: string): Promise<WebhookEvent> {
  const response = await apiClient.get<WebhookEvent>(`${this.baseUrl}/events/${id}`);
  return response;
  }

  async retryEvent(id: string): Promise<{ retried: boolean }> {
  const response = await apiClient.post<{ retried: boolean }>(`${this.baseUrl}/events/${id}/retry`);
  return response;
  }

  // Endpoints
  async getEndpoints(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    endpoints: WebhookEndpoint[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);

    const response = await apiClient.get<{
      endpoints: WebhookEndpoint[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.baseUrl}/endpoints?${query}`);
    return response;
  }

  async getEndpoint(id: string): Promise<WebhookEndpoint> {
  const response = await apiClient.get<WebhookEndpoint>(`${this.baseUrl}/endpoints/${id}`);
  return response;
  }

  async createEndpoint(data: {
    name: string;
    url: string;
    events: string[];
    secret: string;
    isActive?: boolean;
    timeout?: number;
    maxRetries?: number;
    deliveryMode?: string;
    headers?: Record<string, string>;
  }): Promise<WebhookEndpoint> {
  const response = await apiClient.post<WebhookEndpoint>(`${this.baseUrl}/endpoints`, data);
  return response;
  }

  async updateEndpoint(id: string, data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
  const response = await apiClient.put<WebhookEndpoint>(`${this.baseUrl}/endpoints/${id}`, data);
  return response;
  }

  async deleteEndpoint(id: string): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(`${this.baseUrl}/endpoints/${id}`);
  return response;
  }

  async testEndpoint(id: string): Promise<{
    success: boolean;
    message: string;
    response?: any;
  }> {
  const response = await apiClient.post<{ success: boolean; message: string; response?: any }>(`${this.baseUrl}/endpoints/${id}/test`);
  return response;
  }

  // Logs
  async getLogs(params: {
    page?: number;
    limit?: number;
    status?: string;
    endpointId?: string;
  }): Promise<{
    logs: WebhookLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      totalLogs: number;
      successCount: number;
      failureCount: number;
      averageDuration: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.endpointId) query.append('endpointId', params.endpointId);

    const response = await apiClient.get<{
      logs: WebhookLog[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      stats: {
        totalLogs: number;
        successCount: number;
        failureCount: number;
        averageDuration: number;
      };
    }>(`${this.baseUrl}/logs?${query}`);
    return response;
  }

  // Stats
  async getStats(): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    recentEvents: any[];
    endpointStats: any[];
  }> {
    const response = await apiClient.get<{
      total: number;
      successful: number;
      failed: number;
      pending: number;
      successRate: number;
      recentEvents: any[];
      endpointStats: any[];
    }>(`${this.baseUrl}/stats`);
    return response;
  }

  async getEndpointStats(id: string): Promise<{
    endpoint: WebhookEndpoint;
    totalEvents: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryRate: number;
  }> {
    const response = await apiClient.get<{
      endpoint: WebhookEndpoint;
      totalEvents: number;
      delivered: number;
      failed: number;
      pending: number;
      deliveryRate: number;
    }>(`${this.baseUrl}/endpoints/${id}/stats`);
    return response;
  }

  // Operations
  async triggerWebhook(event: string, payload: any): Promise<{
    queued: number;
    endpoints: string[];
  }> {
  const response = await apiClient.post<{ queued: number; endpoints: string[] }>(`${this.baseUrl}/trigger`, { event, payload });
  return response;
  }

  async retryFailedWebhooks(endpointId?: string): Promise<{ retried: number }> {
  const response = await apiClient.post<{ retried: number }>(`${this.baseUrl}/retry-failed`, { endpointId });
  return response;
  }
}

export const webhookService = new WebhookService();