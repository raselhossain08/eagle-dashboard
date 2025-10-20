// types/billing.ts - Enhanced with all missing types
export type BillingInterval = 'month' | 'year' | 'week' | 'day' | 'one_time';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type PaymentProcessor = 'stripe' | 'paddle' | 'braintree' | 'manual';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  trialPeriodDays: number;
  features: string[];
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  metadata?: Record<string, any>;
  limits?: Record<string, any>;
  baseSeats: number;
  pricePerSeat: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  quantity: number;
  mrr: number;
  processor: PaymentProcessor;
  churnReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface TaxDetails {
  rate: number;
  amount: number;
  jurisdiction?: string;
}

export interface DiscountDetails {
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
  taxDetails?: TaxDetails;
  discount?: DiscountDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  logo?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PlansQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubscriptionsQueryParams {
  page?: number;
  pageSize?: number;
  status?: SubscriptionStatus;
  planId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoicesQueryParams {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  search?: string;
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RevenueOverviewData {
  currentMrr: number;
  newMrr: number;
  churnedMrr: number;
  netMrr: number;
  growthRate: number;
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  refunds: number;
  netRevenue: number;
}

export interface MrrTrendData {
  date: string;
  currentMrr: number;
  newMrr: number;
  churnedMrr: number;
  netMrr: number;
}

export interface PlanPerformanceData {
  planName: string;
  subscribers: number;
  revenue: number;
  churnRate: number;
}

export interface ChurnAnalysisData {
  period: string;
  churnRate: number;
  churnedMrr: number;
  churnedCustomers: number;
}

export interface RevenueTimelineData {
  date: string;
  revenue: number;
  recurring: number;
  oneTime: number;
}

export interface RevenueBreakdownData {
  recurringRevenue: number;
  oneTimeRevenue: number;
  refunds: number;
}

// DTOs
export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  trialPeriodDays: number;
  features: string[];
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  baseSeats: number;
  pricePerSeat: number;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export interface CreateSubscriptionDto {
  userId: string;
  planId: string;
  quantity: number;
  processor: PaymentProcessor;
}

export interface UpdateSubscriptionDto {
  quantity?: number;
  status?: SubscriptionStatus;
}

export interface CreateInvoiceDto {
  userId: string;
  subscriptionId?: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  dueDate?: Date;
  taxDetails?: TaxDetails;
  discount?: DiscountDetails;
}

// API Response Types
export interface PlansResponse {
  data: Plan[];
  pagination: PaginationState;
}

export interface SubscriptionsResponse {
  data: Subscription[];
  pagination: PaginationState;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: PaginationState;
}

export interface SubscriptionMetrics {
  totalActive: number;
  totalCanceled: number;
  totalPaused: number;
  upcomingRenewals: number;
  churnRate: number;
  averageLifetime: number;
}

export interface RevenueReportData {
  overview: RevenueOverviewData;
  timeline: RevenueTimelineData[];
  breakdown: RevenueBreakdownData;
}

export interface CohortAnalysisData {
  cohorts: Array<{
    cohort: string;
    data: Array<{
      period: string;
      retention: number;
      revenue: number;
    }>;
  }>;
}

export interface MrrReportData {
  trends: MrrTrendData[];
  current: number;
  growth: number;
  composition: {
    new: number;
    expansion: number;
    reactivation: number;
  };
}