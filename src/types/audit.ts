export interface AuditLog {
  id: string;
  action: string;
  adminUserId: string;
  adminUserEmail: string;
  adminUserRole: string;
  resourceType?: string;
  resourceId?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
  timestamp: Date;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  adminUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  status?: 'success' | 'failure' | 'error';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AuditFilters {
  adminUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  status?: 'success' | 'failure' | 'error';
  dateRange: DateRange;
  search?: string;
}

export interface ActivityOverviewData {
  totalLogs: number;
  successfulActions: number;
  failedActions: number;
  uniqueAdmins: number;
  mostActiveAdmin: string;
  riskScore: number;
  trendsData: {
    period: string;
    count: number;
    status: 'success' | 'failure' | 'error';
  }[];
}

export interface AdminActivitySummary {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  actionsCount: number;
  successRate: number;
  lastActive: Date;
  riskScore: number;
}

export interface SystemHealthData {
  systemLoad: number;
  errorRate: number;
  averageResponseTime: number;
  activeAdmins: number;
  criticalActions: number;
  securityAlerts: number;
}

export interface RiskAssessmentData {
  overallRiskScore: number;
  riskFactors: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    count: number;
  }>;
  recommendations: string[];
}