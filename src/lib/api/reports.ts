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
import { TokenStorageService } from '@/lib/auth/token-storage.service';

class ReportsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  private reportsEndpoint = '/reports';

  private getAuthHeaders(): HeadersInit {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleApiResponse(response: any) {
    // Handle both wrapped ({success, data, message}) and direct responses
    if (response && typeof response === 'object' && 'success' in response) {
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      return response.data;
    }
    return response;
  }

  // Financial reports
  async getRevenueReport(params: RevenueReportParams): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/revenue?${new URLSearchParams(params as any)}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Revenue report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  }

  async getRevenueMetrics(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/revenue/metrics?${new URLSearchParams({ startDate, endDate })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Revenue metrics request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      throw error;
    }
  }

  async getRevenueTrends(
    startDate: string, 
    endDate: string, 
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/revenue/trends?${new URLSearchParams({ startDate, endDate, groupBy })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Revenue trends request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  }

  async getProductRevenue(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/revenue/products?${new URLSearchParams({ startDate, endDate })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Product revenue request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching product revenue:', error);
      throw error;
    }
  }

  async getSubscriptionReport(params: RevenueReportParams): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/subscriptions?${new URLSearchParams({ startDate: params.startDate, endDate: params.endDate })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Subscription report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching subscription report:', error);
      throw error;
    }
  }

  // User reports
  async getUserActivityReport(params: ActivityReportParams): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/user-activity?${new URLSearchParams({ startDate: params.startDate, endDate: params.endDate })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`User activity report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching user activity report:', error);
      throw error;
    }
  }

  async getUserAcquisitionReport(params: ActivityReportParams): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/user-acquisition?${new URLSearchParams({ startDate: params.startDate, endDate: params.endDate })}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`User acquisition report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching user acquisition report:', error);
      throw error;
    }
  }

  async getUserRetentionReport(params: ActivityReportParams & { cohortType?: 'weekly' | 'monthly' }): Promise<any> {
    try {
      const queryParams = {
        startDate: params.startDate,
        endDate: params.endDate,
        cohortType: params.cohortType || 'monthly',
      };
      
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/user-retention?${new URLSearchParams(queryParams)}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`User retention report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching user retention report:', error);
      throw error;
    }
  }

  // Dashboard overview
  async getDashboardOverview(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const queryString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : '';
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/overview${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dashboard overview request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  async getRecentReports(limit?: number): Promise<any> {
    try {
      const params: any = {};
      if (limit) params.limit = limit.toString();
      
      const queryString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : '';
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/recent${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Recent reports request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  }

  // Custom reports
  async generateCustomReport(config: CustomReportConfig): Promise<CustomReport> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/custom`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generate custom report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  async getCustomReport(reportId: string): Promise<CustomReport> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/custom/${reportId}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get custom report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching custom report:', error);
      throw error;
    }
  }

  async updateCustomReport(reportId: string, config: CustomReportConfig): Promise<CustomReport> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/custom/${reportId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update custom report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error updating custom report:', error);
      throw error;
    }
  }

  async deleteCustomReport(reportId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/custom/${reportId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete custom report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error deleting custom report:', error);
      throw error;
    }
  }

  // Templates
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/templates`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get report templates request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw error;
    }
  }

  async createReportTemplate(templateData: any): Promise<ReportTemplate> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/templates`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create report template request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return this.handleApiResponse(data);
    } catch (error) {
      console.error('Error creating report template:', error);
      throw error;
    }
  }

  // Export functionality
  async exportReport(reportId: string, format: ExportFormat): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}${this.reportsEndpoint}/export/${reportId}?format=${format}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export report request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
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