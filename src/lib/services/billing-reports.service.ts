// lib/api/billing-reports.service.ts
import { DateRange, MrrTrendData, RevenueReportData, CohortAnalysisData } from '@/types/billing';

export class BillingReportsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  constructor(private client: ApiClient) {}

  async getMrrReport(dateRange?: DateRange): Promise<MrrTrendData[]> {
    const response = await fetch(`${this.baseURL}/billing/reports/mrr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue report');
    }

    return response.json();
  }

  async getCohortAnalysis(type: 'weekly' | 'monthly'): Promise<CohortAnalysisData> {
    const response = await fetch(`${this.baseURL}/billing/reports/cohort-analysis?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cohort analysis');
    }

    return response.json();
  }

  async exportRevenueReport(params: any): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/revenue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export revenue report');
    }

    return response.blob();
  }

  async exportSubscriptionsReport(params: any): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export subscriptions report');
    }

    return response.blob();
  }

  async exportInvoicesReport(params: any): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/reports/export/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to export invoices report');
    }

    return response.blob();
  }
}