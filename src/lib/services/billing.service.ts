// lib/services/billing.service.ts
import { 
  RevenueOverviewData, 
  MrrTrendData, 
  RevenueBreakdownData, 
  DateRange,
  SubscriptionMetrics,
  RevenueReportData,
  ChurnAnalysisData,
  PlanPerformanceData
} from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class BillingService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getRevenueOverview(dateRange?: DateRange): Promise<RevenueOverviewData> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/revenue/overview?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue overview');
    }

    return response.json();
  }

  async getMrrTrends(period: 'monthly' | 'weekly' = 'monthly', dateRange?: DateRange): Promise<MrrTrendData[]> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/revenue/mrr-trends?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch MRR trends');
    }

    return response.json();
  }

  async getRevenueBreakdown(dateRange?: DateRange): Promise<RevenueBreakdownData> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/revenue/breakdown?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue breakdown');
    }

    return response.json();
  }

  async getSubscriptionMetrics(dateRange?: DateRange): Promise<SubscriptionMetrics> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    // Temporary: Using billing/plans/subscription-metrics until separate controller is working
    const response = await fetch(`${this.baseURL}/billing/plans/subscription-metrics?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription metrics');
    }

    return response.json();
  }

  async getChurnAnalysis(dateRange?: DateRange): Promise<ChurnAnalysisData[]> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/analytics/churn?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch churn analysis');
    }

    return response.json();
  }

  async getPlanPerformance(dateRange?: DateRange): Promise<PlanPerformanceData[]> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/analytics/plan-performance?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan performance');
    }

    return response.json();
  }

  async getRevenueReport(
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    dateRange?: DateRange
  ): Promise<RevenueReportData> {
    const params = new URLSearchParams();
    params.append('type', type);
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/reports/revenue?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue report');
    }

    return response.json();
  }

  async getSubscriptionAnalytics(dateRange?: DateRange) {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    const response = await fetch(`${this.baseURL}/billing/analytics/subscriptions?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription analytics');
    }

    return response.json();
  }
}