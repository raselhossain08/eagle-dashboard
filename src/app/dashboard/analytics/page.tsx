"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useOverviewStats, useEventTrends } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";

const mockChannelData = [
  { name: "Organic Search", value: 45, color: "#3b82f6" },
  { name: "Direct", value: 25, color: "#ef4444" },
  { name: "Social Media", value: 15, color: "#10b981" },
  { name: "Email", value: 10, color: "#f59e0b" },
  { name: "Referral", value: 5, color: "#8b5cf6" },
];

const mockEventTrends = [
  { date: '2024-01-01', value: 100, category: 'Page View' },
  { date: '2024-01-01', value: 45, category: 'Sign Up' },
  { date: '2024-01-02', value: 120, category: 'Page View' },
  { date: '2024-01-02', value: 50, category: 'Sign Up' },
  { date: '2024-01-03', value: 90, category: 'Page View' },
  { date: '2024-01-03', value: 40, category: 'Sign Up' },
];

export default function AnalyticsPage() {
  const { dateRange } = useDashboardStore();
  const { data: overviewData, isLoading } = useOverviewStats(dateRange);
  const { data: eventTrends, isLoading: trendsLoading } = useEventTrends({
    ...dateRange,
    groupBy: 'day'
  });

  return (
    <DashboardShell
      title="Analytics"
      description="Detailed analytics and insights"
    >
      <div className="space-y-6">
        <OverviewCards 
          data={overviewData || null}
          isLoading={isLoading}
          dateRange={dateRange}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={mockEventTrends}
            title="Event Trends"
            valueFormatter={(value) => value.toLocaleString()}
            showLegend={true}
            isLoading={trendsLoading}
          />
          <DonutChart
            data={mockChannelData}
            title="Traffic Channels"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}