// hooks/use-billing-overview.ts
import { useQuery } from '@tanstack/react-query';
import { RevenueOverviewData, MrrTrendData } from '@/types/billing';

interface BillingOverviewData {
  overview: RevenueOverviewData;
  mrrTrends: MrrTrendData[];
  revenueBreakdown: {
    recurringRevenue: number;
    oneTimeRevenue: number;
    refunds: number;
  };
}

export function useBillingOverview(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['billing-overview', dateRange],
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
          { date: '2024-01', currentMrr: 1150000, newMrr: 120000, churnedMrr: 35000, netMrr: 1115000 },
          { date: '2024-02', currentMrr: 1180000, newMrr: 135000, churnedMrr: 40000, netMrr: 1140000 },
          { date: '2024-03', currentMrr: 1220000, newMrr: 140000, churnedMrr: 42000, netMrr: 1178000 },
          { date: '2024-04', currentMrr: 1250000, newMrr: 150000, churnedMrr: 45000, netMrr: 1205000 },
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