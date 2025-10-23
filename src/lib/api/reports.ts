import { 
  RevenueReport, 
  ActivityReport, 
  CustomReport, 
  ReportTemplate,
  RevenueReportParams,
  ActivityReportParams,
  CustomReportConfig,
  ExportFormat
} from '@/types/reports';
import { apiClient } from './client';

class ReportsService {
  private baseURL = '/reports';

  // Financial reports
  async getRevenueReport(params: RevenueReportParams): Promise<any> {
    const response = await apiClient.get(`${this.baseURL}/revenue`, params);
    return (response as any)?.data || response; // Handle both wrapped and unwrapped responses
  }

  async getRevenueMetrics(startDate: string, endDate: string): Promise<any> {
    return apiClient.get(`${this.baseURL}/revenue/metrics`, {
      startDate,
      endDate,
    });
  }

  async getRevenueTrends(
    startDate: string, 
    endDate: string, 
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<any> {
    return apiClient.get(`${this.baseURL}/revenue/trends`, {
      startDate,
      endDate,
      groupBy,
    });
  }

  async getProductRevenue(startDate: string, endDate: string): Promise<any> {
    return apiClient.get(`${this.baseURL}/revenue/products`, {
      startDate,
      endDate,
    });
  }

  async getSubscriptionReport(params: RevenueReportParams): Promise<any> {
    const response = await apiClient.get(`${this.baseURL}/subscriptions`, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return (response as any)?.data || response; // Handle both wrapped and unwrapped responses
  }

  // User reports
  async getUserActivityReport(params: ActivityReportParams): Promise<any> {
    return apiClient.get(`${this.baseURL}/user-activity`, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }

  async getUserAcquisitionReport(params: ActivityReportParams): Promise<any> {
    return apiClient.get(`${this.baseURL}/user-acquisition`, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }

  async getUserRetentionReport(params: ActivityReportParams & { cohortType?: 'weekly' | 'monthly' }): Promise<any> {
    return apiClient.get(`${this.baseURL}/user-retention`, {
      startDate: params.startDate,
      endDate: params.endDate,
      cohortType: params.cohortType || 'monthly',
    });
  }

  // Dashboard overview
  async getDashboardOverview(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get(`${this.baseURL}/overview`, params);
  }

  async getRecentReports(limit?: number): Promise<any> {
    const params: any = {};
    if (limit) params.limit = limit;
    
    return apiClient.get(`${this.baseURL}/recent`, params);
  }

  // Custom reports
  async generateCustomReport(config: CustomReportConfig): Promise<CustomReport> {
    return apiClient.post(`${this.baseURL}/custom`, config);
  }

  async getCustomReport(reportId: string): Promise<CustomReport> {
    return apiClient.get(`${this.baseURL}/custom/${reportId}`);
  }

  async updateCustomReport(reportId: string, config: CustomReportConfig): Promise<CustomReport> {
    return apiClient.put(`${this.baseURL}/custom/${reportId}`, config);
  }

  async deleteCustomReport(reportId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.baseURL}/custom/${reportId}`);
  }

  // Templates
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return apiClient.get(`${this.baseURL}/templates`);
  }

  async createReportTemplate(templateData: any): Promise<ReportTemplate> {
    return apiClient.post(`${this.baseURL}/templates`, templateData);
  }

  // Export functionality
  async exportReport(reportId: string, format: ExportFormat): Promise<Blob> {
    return apiClient.download(`${this.baseURL}/export/${reportId}?format=${format}`);
  }

  // Legacy method for backward compatibility
  async getRevenueReportLegacy(params: RevenueReportParams): Promise<RevenueReport[]> {
    const response = await fetch(
      `/api/reports?type=revenue&${new URLSearchParams(params as any)}`
    );
    if (!response.ok) throw new Error('Failed to fetch revenue report');
    return response.json();
  }
}

export const reportsService = new ReportsService();