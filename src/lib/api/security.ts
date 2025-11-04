import { apiClient } from './api-client';

export enum SecurityAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityAlertSource {
  SYSTEM = 'system',
  MANUAL = 'manual',
  API = 'api',
  AUDIT = 'audit',
}

export enum LoginMethod {
  PASSWORD = 'password',
  TWO_FA = '2fa',
  SSO = 'sso',
  API_KEY = 'api_key',
}

export interface SecurityAlert {
  _id: string;
  type: string;
  severity: SecurityAlertSeverity;
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
  source: SecurityAlertSource;
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
  loginMethod?: LoginMethod;
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

export interface SecurityAlertFilters {
  page?: number;
  limit?: number;
  type?: string;
  severity?: SecurityAlertSeverity;
  userId?: string;
  adminUserId?: string;
  resolved?: boolean;
  dismissed?: boolean;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  search?: string;
}

export interface SecuritySessionFilters {
  page?: number;
  limit?: number;
  userId?: string;
  isActive?: boolean;
  isSuspicious?: boolean;
  isBlocked?: boolean;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateSecurityAlertRequest {
  type: string;
  severity: SecurityAlertSeverity;
  message: string;
  description?: string;
  userId?: string;
  adminUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, any>;
  source?: SecurityAlertSource;
  tags?: string[];
  riskScore?: number;
  detectionMethod?: string;
  recommendations?: string[];
}

export interface ResolveSecurityAlertRequest {
  resolvedNotes: string;
  resolvedBy?: string;
}

export interface DismissSecurityAlertRequest {
  dismissedBy?: string;
}

export interface TerminateSessionRequest {
  reason?: string;
}

export interface BlockSessionRequest {
  reason?: string;
}

export interface SecurityAnomalyDetectionResponse {
  message: string;
  alertsCreated: number;
  alerts: SecurityAlert[];
}

class SecurityService {
  private baseUrl = '/security';

  // Dashboard
  async getDashboard(days: number = 30): Promise<SecurityDashboard> {
    try {
      const response = await apiClient.get<SecurityDashboard>(`${this.baseUrl}/dashboard?days=${days}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch security dashboard:', error);
      throw new Error('Unable to load security dashboard data');
    }
  }

  async getHealth(): Promise<SecurityHealth> {
    try {
      const response = await apiClient.get<SecurityHealth>(`${this.baseUrl}/health`);
      return response;
    } catch (error) {
      console.error('Failed to fetch security health:', error);
      throw new Error('Unable to load security health status');
    }
  }

  // Security Alerts
  async getAlerts(params: SecurityAlertFilters = {}): Promise<{
    alerts: SecurityAlert[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const url = searchParams.toString() 
        ? `${this.baseUrl}/alerts?${searchParams}` 
        : `${this.baseUrl}/alerts`;
      
      const response = await apiClient.get<{
        alerts: SecurityAlert[];
        total: number;
        page: number;
        limit: number;
      }>(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      throw new Error('Unable to load security alerts');
    }
  }

  async getAlert(id: string): Promise<SecurityAlert> {
    try {
      if (!id) {
        throw new Error('Alert ID is required');
      }
      const response = await apiClient.get<SecurityAlert>(`${this.baseUrl}/alerts/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch security alert:', error);
      throw new Error('Unable to load security alert details');
    }
  }

  async createAlert(alert: CreateSecurityAlertRequest): Promise<SecurityAlert> {
    try {
      const response = await apiClient.post<SecurityAlert>(`${this.baseUrl}/alerts`, alert);
      return response;
    } catch (error) {
      console.error('Failed to create security alert:', error);
      throw new Error('Unable to create security alert');
    }
  }

  async resolveAlert(id: string, resolvedNotes: string): Promise<SecurityAlert> {
    try {
      if (!id) {
        throw new Error('Alert ID is required');
      }
      if (!resolvedNotes?.trim()) {
        throw new Error('Resolution notes are required');
      }
      
      const response = await apiClient.patch<SecurityAlert>(`${this.baseUrl}/alerts/${id}/resolve`, {
        resolvedNotes: resolvedNotes.trim(),
      });
      return response;
    } catch (error) {
      console.error('Failed to resolve security alert:', error);
      throw new Error('Unable to resolve security alert');
    }
  }

  async dismissAlert(id: string): Promise<SecurityAlert> {
    try {
      if (!id) {
        throw new Error('Alert ID is required');
      }
      
      const response = await apiClient.patch<SecurityAlert>(`${this.baseUrl}/alerts/${id}/dismiss`, {});
      return response;
    } catch (error) {
      console.error('Failed to dismiss security alert:', error);
      throw new Error('Unable to dismiss security alert');
    }
  }

  async deleteAlert(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Alert ID is required');
      }
      
      await apiClient.delete(`${this.baseUrl}/alerts/${id}`);
    } catch (error) {
      console.error('Failed to delete security alert:', error);
      throw new Error('Unable to delete security alert');
    }
  }

  // Security Sessions
  async getSessions(params: SecuritySessionFilters = {}): Promise<{
    sessions: SecuritySession[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const url = searchParams.toString() 
        ? `${this.baseUrl}/sessions?${searchParams}` 
        : `${this.baseUrl}/sessions`;
      
      const response = await apiClient.get<{
        sessions: SecuritySession[];
        total: number;
        page: number;
        limit: number;
      }>(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch security sessions:', error);
      throw new Error('Unable to load security sessions');
    }
  }

  async terminateSession(sessionId: string, reason?: string): Promise<SecuritySession> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      const response = await apiClient.patch<SecuritySession>(`${this.baseUrl}/sessions/${sessionId}/terminate`, {
        reason: reason?.trim() || 'Session terminated by admin',
      });
      return response;
    } catch (error) {
      console.error('Failed to terminate security session:', error);
      throw new Error('Unable to terminate security session');
    }
  }

  async blockSession(sessionId: string, reason?: string): Promise<SecuritySession> {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      const response = await apiClient.patch<SecuritySession>(`${this.baseUrl}/sessions/${sessionId}/block`, {
        reason: reason?.trim() || 'Session blocked by admin',
      });
      return response;
    } catch (error) {
      console.error('Failed to block security session:', error);
      throw new Error('Unable to block security session');
    }
  }

  // Analytics
  async getAlertsAnalytics(from: string, to: string): Promise<SecurityDashboard> {
    try {
      if (!from || !to) {
        throw new Error('Start and end dates are required');
      }
      
      const response = await apiClient.get<SecurityDashboard>(
        `${this.baseUrl}/analytics/alerts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch alerts analytics:', error);
      throw new Error('Unable to load alerts analytics');
    }
  }

  async getSessionsAnalytics(from: string, to: string): Promise<{
    sessions: SecuritySession[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      if (!from || !to) {
        throw new Error('Start and end dates are required');
      }
      
      const response = await apiClient.get<{
        sessions: SecuritySession[];
        total: number;
        page: number;
        limit: number;
      }>(
        `${this.baseUrl}/analytics/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch sessions analytics:', error);
      throw new Error('Unable to load sessions analytics');
    }
  }

  // Automated Security
  async detectAnomalies(): Promise<SecurityAnomalyDetectionResponse> {
    try {
      const response = await apiClient.post<SecurityAnomalyDetectionResponse>(`${this.baseUrl}/detect-anomalies`);
      return response;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      throw new Error('Unable to run anomaly detection');
    }
  }
}

export const securityService = new SecurityService();