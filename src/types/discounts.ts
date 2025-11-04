// types/discounts.ts
export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'first_period' | 'recurring';
  value: number;
  currency: string;
  duration: 'once' | 'forever' | 'repeating';
  durationInMonths?: number;
  applicablePlans: string[];
  applicableProducts: string[];
  maxRedemptions: number;
  timesRedeemed: number;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  newCustomersOnly: boolean;
  eligibleCountries: string[];
  eligibleEmailDomains: string[];
  minAmount: number;
  maxAmount?: number;
  isStackable: boolean;
  priority: number;
  maxUsesPerCustomer: number;
  campaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'promotional' | 'affiliate' | 'referral' | 'loyalty' | 'winback';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  discountIds: string[];
  channels: string[];
  targetAudience: string[];
  targetSegments?: string[];
  targetCountries?: string[];
  budget?: number;
  budgetSpent?: number;
  revenueGoal?: number;
  conversionGoal?: number;
  // UTM tracking fields
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  // Performance metrics
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  performanceMetrics?: Record<string, any>;
  metadata?: Record<string, any>;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Redemption {
  id: string;
  discountId: string;
  userId: string;
  code: string;
  discountAmount: number;
  orderAmount: number;
  finalAmount: number;
  currency: string;
  ipAddress?: string;
  userAgent?: string;
  invoiceId?: string;
  subscriptionId?: string;
  campaignId?: string;
  redeemedAt: Date;
  createdAt: Date;
}

export interface CreateDiscountDto {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'first_period' | 'recurring';
  value: number;
  currency: string;
  duration: 'once' | 'forever' | 'repeating';
  durationInMonths?: number;
  applicablePlans: string[];
  applicableProducts: string[];
  maxRedemptions: number;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  newCustomersOnly: boolean;
  eligibleCountries: string[];
  eligibleEmailDomains: string[];
  minAmount: number;
  maxAmount?: number;
  isStackable: boolean;
  priority: number;
  maxUsesPerCustomer: number;
  campaignId?: string;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  type: 'promotional' | 'affiliate' | 'referral' | 'loyalty' | 'winback';
  startDate: string; // Send as ISO string to backend
  endDate?: string;
  isActive?: boolean; // Optional with default
  discountIds?: string[]; // Optional, can be empty array
  channels?: string[];
  targetAudience?: string[];
  targetCountries?: string[];
  budget?: number;
  revenueGoal?: number;
  conversionGoal?: number;
  // UTM tracking fields to match backend exactly
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface ValidateDiscountDto {
  code: string;
  customerEmail?: string;
  orderAmount?: number;
  currency?: string;
  planId?: string;
  productIds?: string[];
  customerCountry?: string;
  isNewCustomer?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  discount?: Discount;
  discountedAmount: number;
  error?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface DiscountFilters {
  search?: string;
  isActive?: boolean;
  type?: string;
  status?: string;
  campaignId?: string;
  sortBy?: DiscountSortBy;
  sortOrder?: 'asc' | 'desc';
}

export type DiscountSortBy = 'createdAt' | 'code' | 'timesRedeemed' | 'validUntil' | 'type';

export interface CampaignFilters {
  search?: string;
  isActive?: boolean;
  type?: string;
}

export interface RedemptionFilters {
  search?: string;
  dateRange?: DateRange;
  discountId?: string;
  campaignId?: string;
}

export interface DiscountsOverviewData {
  totalDiscounts: number;
  activeDiscounts: number;
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  conversionRate: number;
  averageDiscountValue: number;
  topPerformingCode: string;
  topPerformingDiscounts?: Discount[];
  recentRedemptions?: Redemption[];
}