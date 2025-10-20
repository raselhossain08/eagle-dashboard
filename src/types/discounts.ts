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
  budget?: number;
  revenueGoal?: number;
  conversionGoal?: number;
  utmSource?: string;
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
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
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  discountIds: string[];
  channels: string[];
  targetAudience: string[];
  budget?: number;
  revenueGoal?: number;
  conversionGoal?: number;
  utmSource?: string;
}

export interface ValidateDiscountDto {
  code: string;
  userId?: string;
  orderAmount: number;
  currency: string;
  planId?: string;
  productId?: string;
  country?: string;
  email?: string;
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
}

export interface DiscountFilters {
  search?: string;
  isActive?: boolean;
  type?: string;
  campaignId?: string;
}

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
  topPerformingDiscounts: Discount[];
  recentRedemptions: Redemption[];
}