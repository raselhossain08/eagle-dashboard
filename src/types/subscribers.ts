// types/subscribers.ts
export interface SubscriberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
  };
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_started';
  status: 'active' | 'inactive' | 'pending';
  totalSpent: number;
  lifetimeValue: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'paused' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  subscriberId: string;
  type: 'login' | 'purchase' | 'subscription_change' | 'profile_update' | 'support_ticket';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SubscriberFilters {
  status?: string[];
  kycStatus?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  subscriptionPlan?: string[];
}

export interface SubscriberParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: SubscriberFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubscriberResponse {
  subscribers: SubscriberProfile[];
  totalCount: number;
  page: number;
  totalPages: number;
}