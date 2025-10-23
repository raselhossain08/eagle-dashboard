export interface DateRange {
  from: Date;
  to: Date;
}

export interface MrrTrend {
  month: string;
  mrr: number;
  newSubscriptions: number;
  churned: number;
  growth: number;
}

export interface MrrReportData {
  currentMrr: number;
  growth: number;
  trends: MrrTrend[];
  totalSubscriptions: number;
  activeSubscriptions: number;
}

export interface TimelineData {
  period: string;
  revenue: number;
  transactions: number;
}

export interface BreakdownData {
  name: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  timelineData: TimelineData[];
  breakdownData: BreakdownData[];
}

export interface CohortData {
  period: string;
  customers: number;
  retention: Record<number, number>;
}

export interface CohortAnalysisData {
  cohorts: CohortData[];
}

export interface DashboardStats {
  activeSubscriptions: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  newCustomers: number;
  totalPlans: number;
  pendingInvoices: number;
}

export interface PlanPerformance {
  _id: string;
  planName: string;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

export interface StatusBreakdown {
  count: number;
  amount: number;
  percentage: number;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  statusBreakdown: Record<string, StatusBreakdown>;
}

export interface SubscriptionAnalytics {
  period: string;
  newSubscriptions: number;
  activeSubscriptions: number;
}

export interface BillingActivity {
  id: string;
  type: 'subscription' | 'invoice';
  action: string;
  description: string;
  user: string;
  amount: number;
  date: Date;
  status: string;
}

export interface ReportExportParams {
  from?: string;
  to?: string;
  format?: 'xlsx' | 'csv' | 'pdf';
  filters?: string;
  includeDetails?: boolean;
}