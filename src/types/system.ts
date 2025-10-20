// src/types/system.ts
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: 'connected' | 'disconnected';
  version: string;
  lastCheck: string;
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingWebhooks: number;
  failedWebhooks: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface SystemActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface MaintenanceStatus {
  mode: 'active' | 'inactive';
  scheduled: boolean;
  nextMaintenance: string;
  progress?: number;
}

export interface SystemSettings {
  [key: string]: any;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
  successRate: number;
}

export interface WebhookEvent {
  id: string;
  endpointId: string;
  event: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  createdAt: string;
  lastAttempt?: string;
}

export interface WebhookStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
}

export interface BackupResult {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
}

export interface CleanupResult {
  cleanedItems: number;
  freedSpace: number;
  duration: number;
  timestamp: string;
}

export interface MaintenanceSchedule {
  tasks: ScheduledTask[];
  nextRun: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'paused';
}

export interface MetricsParams {
  timeframe: '1h' | '24h' | '7d' | '30d';
  metric: string;
}