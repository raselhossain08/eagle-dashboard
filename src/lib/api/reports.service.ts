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
  startDate: Date;
  endDate: Date;
  period: 'day' | 'week' | 'month';
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

  async getCohortAnalysis(params: CohortAnalysisParams): Promise<CohortData[]> {
    return apiClient.get('/analytics/reports/cohorts', {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      period: params.period,
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
}

export const reportsService = new ReportsService();