import { apiClient } from '../api/client'

export interface ConversionFunnelParams {
  startDate: Date
  endDate: Date
  funnelId?: string
}

export interface CohortAnalysisParams {
  startDate: Date
  endDate: Date
  period: 'day' | 'week' | 'month'
  metric: 'retention' | 'revenue' | 'conversion'
}

export interface RevenueReportData {
  totalRevenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  averageOrderValue: number
  transactions: number
  revenueByDate: Array<{ date: string; revenue: number }>
  revenueByProduct: Array<{ product: string; revenue: number }>
}

export interface CohortData {
  cohort: string
  size: number
  data: Array<{ period: number; value: number }>
}

export interface GoalPerformanceData {
  goal: string
  completions: number
  conversionRate: number
  value: number
  trend: number
}

export interface DeviceBreakdownData {
  device: string
  sessions: number
  users: number
  bounceRate: number
  conversionRate: number
  avgSessionDuration: number
}

export interface OSBreakdownData {
  os: string
  sessions: number
  bounceRate: number
  avgDuration: number
}

export interface BrowserBreakdownData {
  browser: string
  sessions: number
  bounceRate: number
  avgDuration: number
}

export class ReportsService {
  constructor(private client: typeof apiClient) {}

  async getConversionFunnel(params: ConversionFunnelParams): Promise<any[]> {
    return this.client.get<any[]>('/analytics/reports/funnel', params)
  }

  async getRevenueReport(params: any): Promise<RevenueReportData> {
    return this.client.get<RevenueReportData>('/analytics/reports/revenue', params)
  }

  async getCohortAnalysis(params: CohortAnalysisParams): Promise<CohortData[]> {
    return this.client.get<CohortData[]>('/analytics/reports/cohorts', params)
  }

  async getGoalPerformance(params: any): Promise<GoalPerformanceData[]> {
    return this.client.get<GoalPerformanceData[]>('/analytics/reports/goals/performance', params)
  }

  async getDeviceBreakdown(params: any): Promise<DeviceBreakdownData[]> {
    return this.client.get<DeviceBreakdownData[]>('/analytics/reports/devices/breakdown', params)
  }

  async getOperatingSystemBreakdown(params: any): Promise<OSBreakdownData[]> {
    return this.client.get<OSBreakdownData[]>('/analytics/reports/devices/os-breakdown', params)
  }

  async getBrowserBreakdown(params: any): Promise<BrowserBreakdownData[]> {
    return this.client.get<BrowserBreakdownData[]>('/analytics/reports/devices/browser-breakdown', params)
  }
}

export const reportsService = new ReportsService(apiClient)