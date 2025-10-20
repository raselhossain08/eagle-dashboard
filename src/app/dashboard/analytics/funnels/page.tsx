"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { useConversionFunnel } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";

const mockFunnelData = [
  { step: "Visited Site", count: 10000, conversionRate: 100, dropOff: 0 },
  { step: "Viewed Product", count: 4500, conversionRate: 45, dropOff: 55 },
  { step: "Added to Cart", count: 900, conversionRate: 9, dropOff: 80 },
  { step: "Started Checkout", count: 450, conversionRate: 4.5, dropOff: 50 },
  { step: "Completed Purchase", count: 300, conversionRate: 3, dropOff: 33 },
];

const mockFunnelTrends = [
  { date: '2024-01-01', value: 2.8 },
  { date: '2024-01-02', value: 3.1 },
  { date: '2024-01-03', value: 2.9 },
  { date: '2024-01-04', value: 3.2 },
  { date: '2024-01-05', value: 3.5 },
  { date: '2024-01-06', value: 3.3 },
  { date: '2024-01-07', value: 3.4 },
];

export default function FunnelsPage() {
  const { dateRange } = useDashboardStore();
  const { data: funnelData, isLoading } = useConversionFunnel({
    ...dateRange,
    steps: ["Visited Site", "Viewed Product", "Added to Cart", "Started Checkout", "Completed Purchase"]
  });

  return (
    <DashboardShell
      title="Funnel Analysis"
      description="Track user conversion through funnels"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart 
          data={mockFunnelData}
          isLoading={isLoading}
        />
        <TimeSeriesChart
          data={mockFunnelTrends}
          title="Overall Conversion Rate Trend"
          valueFormatter={(value) => `${value}%`}
          isLoading={isLoading}
        />
      </div>
    </DashboardShell>
  );
}