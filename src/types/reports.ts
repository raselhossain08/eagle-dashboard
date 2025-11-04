export interface ReportsOverview {
  totalRevenue: number;
  revenueGrowth: number;
  activeSubscriptions: number;
  churnRate: number;
  totalUsers: number;
  userGrowth: number;
}

export interface QuickMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'number' | 'percentage';
}

// Enhanced Dashboard Types
export interface DashboardOverview {
  overview: ReportsOverview;
  quickMetrics: QuickMetric[];
  analytics: {
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
  };
}

export interface ReportListItem {
  id: string;
  name: string;
  type: 'financial' | 'user' | 'custom';
  createdAt: string;
  updatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  size?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'financial' | 'user' | 'custom';
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

// API Params Types
export interface RevenueReportParams {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
  currency?: string;
}

export interface ActivityReportParams {
  startDate: string;
  endDate: string;
  metrics: string[];
  segmentBy?: string;
}

export interface CustomReportConfig {
  name: string;
  dataSource: string;
  filters: Record<string, any>;
  metrics: string[];
  dimensions: string[];
  chartType?: string;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv';

// Response Types
export interface RevenueReport {
  period: string;
  revenue: number;
  subscriptions: number;
  growth: number;
}

export interface ActivityReport {
  date: string;
  activeUsers: number;
  sessions: number;
  engagementRate: number;
}

export interface CustomReport {
  id: string;
  name: string;
  data: any[];
  config: CustomReportConfig;
  createdAt: string;
}