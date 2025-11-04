import { apiClient } from './client';

export interface ConversionFunnelParams {
  startDate: Date;
  endDate: Date;
  steps?: string[];
}

export interface ConversionFunnelData {
  step: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  averageOrderValue: number;
  transactions: number;
  trends: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface CohortAnalysisParams {
  type?: 'weekly' | 'monthly';
  periods?: number;
}

export interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
  revenue: number[];
}

export interface GoalPerformanceData {
  goal: string;
  completions: number;
  conversionRate: number;
  value: number;
  trends: Array<{
    date: string;
    completions: number;
  }>;
}

export interface DeviceBreakdownData {
  device: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
}

export interface OSBreakdownData {
  os: string;
  sessions: number;
  bounceRate: number;
  avgDuration: number;
}

export interface BrowserBreakdownData {
  browser: string;
  sessions: number;
  bounceRate: number;
  avgDuration: number;
}

export interface CustomReportData {
  id: string;
  name: string;
  type: string;
  description: string;
  data: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
  insights: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export class ReportsService {
  async getConversionFunnel(params: ConversionFunnelParams): Promise<ConversionFunnelData[]> {
    return apiClient.get('/analytics/reports/funnel', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      steps: params.steps,
    });
  }

  async getRevenueReport(params: { startDate: Date; endDate: Date }): Promise<RevenueReportData> {
    return apiClient.get('/analytics/reports/revenue', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getProductRevenueBreakdown(params: { startDate: Date; endDate: Date }) {
    return apiClient.get('/analytics/reports/revenue/products', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getCohortAnalysis(params: CohortAnalysisParams): Promise<CohortData[]> {
    return apiClient.get('/analytics/reports/cohorts', {
      type: params.type || 'weekly',
      periods: params.periods || 12,
    });
  }

  async getGoalPerformance(params: { startDate: Date; endDate: Date }): Promise<GoalPerformanceData[]> {
    return apiClient.get('/analytics/reports/goals/performance', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getDeviceBreakdown(params: { startDate: Date; endDate: Date }): Promise<DeviceBreakdownData[]> {
    return apiClient.get('/analytics/reports/devices/breakdown', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getOperatingSystemBreakdown(params: { startDate: Date; endDate: Date }): Promise<OSBreakdownData[]> {
    return apiClient.get('/analytics/reports/devices/os-breakdown', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getBrowserBreakdown(params: { startDate: Date; endDate: Date }): Promise<BrowserBreakdownData[]> {
    return apiClient.get('/analytics/reports/devices/browser-breakdown', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getCustomReportById(reportId: string): Promise<CustomReportData> {
    return apiClient.get(`/reports/custom/${reportId}`);
  }

  async exportCustomReport(reportId: string, format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    return apiClient.download(`/reports/export/${reportId}?format=${format}`);
  }
}

export const reportsService = new ReportsService();