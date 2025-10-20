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

class ReportsService {
  private baseURL = '/api/reports';

  // Financial reports
  async getRevenueReport(params: RevenueReportParams): Promise<RevenueReport[]> {
    const response = await fetch(
      `${this.baseURL}?type=revenue&${new URLSearchParams(params as any)}`
    );
    if (!response.ok) throw new Error('Failed to fetch revenue report');
    return response.json();
  }

  async getSubscriptionReport(params: RevenueReportParams): Promise<RevenueReport[]> {
    const response = await fetch(`${this.baseURL}/subscriptions?${new URLSearchParams(params as any)}`);
    if (!response.ok) throw new Error('Failed to fetch subscription report');
    return response.json();
  }

  // User reports
  async getUserActivityReport(params: ActivityReportParams): Promise<ActivityReport[]> {
    const response = await fetch(
      `${this.baseURL}?type=user-activity&${new URLSearchParams(params as any)}`
    );
    if (!response.ok) throw new Error('Failed to fetch user activity report');
    return response.json();
  }

  // Custom reports
  async generateCustomReport(config: CustomReportConfig): Promise<CustomReport> {
    const response = await fetch(`${this.baseURL}/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to generate custom report');
    return response.json();
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await fetch(`${this.baseURL}/templates`);
    if (!response.ok) throw new Error('Failed to fetch report templates');
    return response.json();
  }

  // Export functionality
  async exportReport(reportId: string, format: ExportFormat): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/${reportId}?format=${format}`);
    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  }
}

export const reportsService = new ReportsService();