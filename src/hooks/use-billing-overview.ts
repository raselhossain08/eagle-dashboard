// hooks/use-billing-overview.ts
import { useQuery } from '@tanstack/react-query';
import { RevenueOverviewData, MrrTrendData, RevenueBreakdownData } from '@/types/billing';

interface BillingOverviewData {
  overview: RevenueOverviewData;
  mrrTrends: MrrTrendData[];
  revenueBreakdown: RevenueBreakdownData;
}

export function useBillingOverview(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['billing-overview', dateRange ? JSON.stringify(dateRange) : 'default'],
    queryFn: async (): Promise<BillingOverviewData> => {
      // Mock data - replace with actual API call
      return {
        overview: {
          currentMrr: 1250000,
          newMrr: 150000,
          churnedMrr: 45000,
          netMrr: 1205000,
          growthRate: 3.2,
          totalRevenue: 1450000,
          recurringRevenue: 1205000,
          oneTimeRevenue: 245000,
          refunds: 15000,
          netRevenue: 1435000,
        },
        mrrTrends: [
          { month: '2024-01', mrr: 1150000, newSubscriptions: 120, churned: 35, growth: 2.1 },
          { month: '2024-02', mrr: 1180000, newSubscriptions: 135, churned: 40, growth: 2.6 },
          { month: '2024-03', mrr: 1220000, newSubscriptions: 140, churned: 42, growth: 3.4 },
          { month: '2024-04', mrr: 1250000, newSubscriptions: 150, churned: 45, growth: 2.5 },
        ],
        revenueBreakdown: {
          recurringRevenue: 1205000,
          oneTimeRevenue: 245000,
          refunds: 15000,
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}