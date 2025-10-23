export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type ServiceStatusType = 'up' | 'down' | 'degraded';

export interface ServiceStatus {
  name: string;
  status: ServiceStatusType;
  responseTime?: number;
  details: Record<string, any>;
}

export interface SystemMetrics {
  memory: {
    heap: number;
    rss: number;
    total: number;
    used: number;
    usagePercentage?: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  timestamp: string;
}

export interface HealthMetrics {
  overall: HealthStatus;
  services: ServiceStatus[];
  systemMetrics: SystemMetrics;
  lastCheck: string;
  healthScore: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HealthHistory {
  timestamp: string;
  overall: HealthStatus;
  healthScore: number;
  services: {
    name: string;
    status: ServiceStatusType;
  }[];
}

export interface PingResponse {
  status: 'ok';
  timestamp: string;
  message: string;
}