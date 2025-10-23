import { apiClient } from './api-client';

export interface SecurityAlert {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description?: string;
  userId?: string;
  adminUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolvedNotes?: string;
  dismissed: boolean;
  dismissedBy?: string;
  dismissedAt?: string;
  active: boolean;
  source: 'system' | 'manual' | 'api' | 'audit';
  tags?: string[];
  riskScore?: number;
  detectionMethod?: string;
  recommendations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySession {
  _id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  device?: string;
  browser?: string;
  platform?: string;
  isActive: boolean;
  lastActivity: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  loginMethod?: 'password' | '2fa' | 'sso' | 'api_key';
  isSuspicious: boolean;
  suspiciousReasons?: string[];
  riskScore?: number;
  isBlocked: boolean;
  blockedBy?: string;
  blockedAt?: string;
  blockedReason?: string;
  terminatedAt?: string;
  terminatedBy?: string;
  terminatedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityDashboard {
  alertStats: {
    total: number;
    high: number;
    medium: number;
    low: number;
    critical: number;
    resolved: number;
    dismissed: number;
    active: number;
  };
  sessionStats: {
    total: number;
    active: number;
    suspicious: number;
    blocked: number;
  };
  recentAlerts: SecurityAlert[];
  activeSessions: SecuritySession[];
  alertTrends: any[];
  topThreats: any[];
  generatedAt: string;
}

export interface SecurityHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  metrics: {
    recentAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    activeSessions: number;
    suspiciousSessions: number;
  };
  recommendations: string[];
}

class SecurityService {
  private baseUrl = '/security';

  // Dashboard
  async getDashboard(days: number = 30): Promise<SecurityDashboard> {
    return await apiClient.get(`${this.baseUrl}/dashboard?days=${days}`);
  }

  async getHealth(): Promise<SecurityHealth> {
    return await apiClient.get(`${this.baseUrl}/health`);
  }

  // Security Alerts
  async getAlerts(params: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    adminUserId?: string;
    resolved?: boolean;
    dismissed?: boolean;
    active?: boolean;
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    search?: string;
  } = {}): Promise<{
    alerts: SecurityAlert[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return await apiClient.get(`${this.baseUrl}/alerts?${searchParams}`);
  }

  async getAlert(id: string): Promise<SecurityAlert> {
    return await apiClient.get(`${this.baseUrl}/alerts/${id}`);
  }

  async createAlert(alert: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    description?: string;
    userId?: string;
    adminUserId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    metadata?: Record<string, any>;
    source?: 'system' | 'manual' | 'api' | 'audit';
    tags?: string[];
    riskScore?: number;
  }): Promise<SecurityAlert> {
    return await apiClient.post(`${this.baseUrl}/alerts`, alert);
  }

  async resolveAlert(id: string, resolvedNotes: string): Promise<SecurityAlert> {
    return await apiClient.patch(`${this.baseUrl}/alerts/${id}/resolve`, {
      resolvedNotes,
    });
  }

  async dismissAlert(id: string): Promise<SecurityAlert> {
    return await apiClient.patch(`${this.baseUrl}/alerts/${id}/dismiss`, {});
  }

  async deleteAlert(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/alerts/${id}`);
  }

  // Security Sessions
  async getSessions(params: {
    page?: number;
    limit?: number;
    userId?: string;
    isActive?: boolean;
    isSuspicious?: boolean;
    isBlocked?: boolean;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    sessions: SecuritySession[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return await apiClient.get(`${this.baseUrl}/sessions?${searchParams}`);
  }

  async terminateSession(sessionId: string, reason?: string): Promise<SecuritySession> {
    return await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/terminate`, {
      reason,
    });
  }

  async blockSession(sessionId: string, reason?: string): Promise<SecuritySession> {
    return await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/block`, {
      reason,
    });
  }

  // Analytics
  async getAlertsAnalytics(from: string, to: string): Promise<SecurityDashboard> {
    return await apiClient.get(
      `${this.baseUrl}/analytics/alerts?from=${from}&to=${to}`
    );
  }

  async getSessionsAnalytics(from: string, to: string): Promise<{
    sessions: SecuritySession[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await apiClient.get(
      `${this.baseUrl}/analytics/sessions?from=${from}&to=${to}`
    );
  }

  // Automated Security
  async detectAnomalies(): Promise<{
    message: string;
    alertsCreated: number;
    alerts: SecurityAlert[];
  }> {
    return await apiClient.post(`${this.baseUrl}/detect-anomalies`);
  }
}

export const securityService = new SecurityService();