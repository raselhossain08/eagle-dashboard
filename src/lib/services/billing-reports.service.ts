// lib/api/billing-reports.service.ts
import { 
  DateRange, 
  MrrReportData, 
  RevenueReportData, 
  CohortAnalysisData,
  CustomerCohortData,
  DashboardStats,
  PlanPerformance,
  InvoiceSummary,
  SubscriptionAnalytics,
  BillingActivity,
  ReportExportParams
} from '@/types/billing-reports';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class BillingReportsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getMrrReport(dateRange?: DateRange): Promise<MrrReportData> {
    const response = await fetch(`${this.baseURL}/billing/reports/mrr`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch MRR report');
    }

    return response.json();
  }

  async getRevenueReport(dateRange: DateRange): Promise<RevenueReportData> {
    const response = await fetch(`${this.baseURL}/billing/reports/revenue`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue report');
    }

    return response.json();
  }

  async getCohortAnalysis(type: 'weekly' | 'monthly'): Promise<CohortAnalysisData> {
    const response = await fetch(`${this.baseURL}/billing/reports/cohort-analysis?type=${type}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cohort analysis');
    }

    return response.json();
  }

  async getCustomerCohort(type: 'weekly' | 'monthly' = 'monthly', periods: number = 12): Promise<CustomerCohortData[]> {
    const response = await fetch(`${this.baseURL}/billing/reports/customer-cohort?type=${type}&periods=${periods}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer cohort');
    }

    return response.json();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseURL}/billing/reports/dashboard-stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  async getPlanPerformance(dateRange?: DateRange): Promise<PlanPerformance[]> {
    const url = new URL(`${this.baseURL}/billing/reports/plan-performance`);
    if (dateRange?.from) url.searchParams.append('startDate', dateRange.from.toISOString());
    if (dateRange?.to) url.searchParams.append('endDate', dateRange.to.toISOString());

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan performance');
    }

    return response.json();
  }

  async getInvoiceSummary(dateRange?: DateRange): Promise<InvoiceSummary> {
    const url = new URL(`${this.baseURL}/billing/reports/invoice-summary`);
    if (dateRange?.from) url.searchParams.append('startDate', dateRange.from.toISOString());
    if (dateRange?.to) url.searchParams.append('endDate', dateRange.to.toISOString());

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice summary');
    }

    return response.json();
  }

  async getSubscriptionAnalytics(dateRange?: DateRange): Promise<SubscriptionAnalytics[]> {
    const url = new URL(`${this.baseURL}/billing/reports/subscription-analytics`);
    if (dateRange?.from) url.searchParams.append('startDate', dateRange.from.toISOString());
    if (dateRange?.to) url.searchParams.append('endDate', dateRange.to.toISOString());

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription analytics');
    }

    return response.json();
  }

  async getRecentActivity(limit: number = 10): Promise<BillingActivity[]> {
    const response = await fetch(`${this.baseURL}/billing/reports/recent-activity?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    return response.json();
  }

  async exportRevenueReport(params: ReportExportParams): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/revenue`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export revenue report');
    }

    return response.blob();
  }

  async exportSubscriptionsReport(params: ReportExportParams): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/subscriptions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export subscriptions report');
    }

    return response.blob();
  }

  async exportInvoicesReport(params: ReportExportParams): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/invoices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export invoices report');
    }

    return response.blob();
  }

  async exportMrrReport(params: ReportExportParams): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/mrr`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export MRR report');
    }

    return response.blob();
  }
}