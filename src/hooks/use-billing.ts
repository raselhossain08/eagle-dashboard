import { useQuery } from '@tanstack/react-query';
import { BillingService } from '@/lib/services/billing.service';
import { DateRange } from '@/types/billing';
import { useState } from 'react';

const billingService = new BillingService();

// Default date range - last 30 days
const getDefaultDateRange = (): DateRange => ({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date()
});

export function useBillingOverview(initialDateRange?: DateRange) {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange || getDefaultDateRange());

  const query = useQuery({
    queryKey: ['billing', 'overview', dateRange],
    queryFn: () => billingService.getRevenueOverview(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mrrTrendsQuery = useQuery({
    queryKey: ['billing', 'mrr-trends', dateRange],
    queryFn: () => billingService.getMrrTrends('monthly', dateRange),
    staleTime: 5 * 60 * 1000,
  });

  const revenueBreakdownQuery = useQuery({
    queryKey: ['billing', 'revenue-breakdown', dateRange],
    queryFn: () => billingService.getRevenueBreakdown(dateRange),
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data ? {
      overview: query.data,
      mrrTrends: mrrTrendsQuery.data || [],
      revenueBreakdown: revenueBreakdownQuery.data
    } : undefined,
    isLoading: query.isLoading || mrrTrendsQuery.isLoading || revenueBreakdownQuery.isLoading,
    error: query.error || mrrTrendsQuery.error || revenueBreakdownQuery.error,
    dateRange,
    setDateRange,
  };
}

export function useBillingMetrics(dateRange?: DateRange) {
  return useQuery({
    queryKey: ['billing', 'metrics', dateRange],
    queryFn: () => billingService.getSubscriptionMetrics(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChurnAnalysis(dateRange?: DateRange, options?: any) {
  return useQuery({
    queryKey: ['billing', 'churn-analysis', dateRange],
    queryFn: () => billingService.getChurnAnalysis(dateRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePlanPerformance(dateRange?: DateRange, options?: any) {
  return useQuery({
    queryKey: ['billing', 'plan-performance', dateRange],
    queryFn: () => billingService.getPlanPerformance(dateRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSubscriptionAnalytics(dateRange?: DateRange, options?: any) {
  return useQuery({
    queryKey: ['billing', 'subscription-analytics', dateRange],
    queryFn: () => billingService.getSubscriptionAnalytics(dateRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRevenueReport(
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
  dateRange?: DateRange
) {
  return useQuery({
    queryKey: ['billing', 'revenue-report', type, dateRange],
    queryFn: () => billingService.getRevenueReport(type, dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

// Alias for backwards compatibility
export const useBilling = useBillingOverview;