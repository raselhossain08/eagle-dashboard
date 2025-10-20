"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { DateRangePicker } from "@/components/date-range-picker";
import { useOverviewStats } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";

const mockTimeSeriesData = [
  { date: '2024-01-01', value: 100 },
  { date: '2024-01-02', value: 120 },
  { date: '2024-01-03', value: 90 },
  { date: '2024-01-04', value: 150 },
  { date: '2024-01-05', value: 180 },
  { date: '2024-01-06', value: 200 },
  { date: '2024-01-07', value: 170 },
];

const mockChannelData = [
  { name: "Organic", value: 45, color: "#3b82f6" },
  { name: "Direct", value: 25, color: "#ef4444" },
  { name: "Social", value: 15, color: "#10b981" },
  { name: "Email", value: 10, color: "#f59e0b" },
  { name: "Referral", value: 5, color: "#8b5cf6" },
];

export default function DashboardPage() {
  const { dateRange, setDateRange } = useDashboardStore();
  const { data: overviewData, isLoading } = useOverviewStats(dateRange);

  const actions = (
    <DateRangePicker
      dateRange={{
        from: dateRange.startDate,
        to: dateRange.endDate,
      }}
      onDateRangeChange={(range) => {
        if (range?.from && range.to) {
          setDateRange({
            startDate: range.from,
            endDate: range.to,
          });
        }
      }}
    />
  );

  return (
    <DashboardShell
      title="Dashboard"
      description="Welcome to your analytics dashboard"
      actions={actions}
    >
      <div className="space-y-6">
        <OverviewCards 
          data={overviewData || null}
          isLoading={isLoading}
          dateRange={dateRange}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={mockTimeSeriesData}
            title="User Sessions"
            valueFormatter={(value) => value.toLocaleString()}
            isLoading={isLoading}
          />
          <DonutChart
            data={mockChannelData}
            title="Traffic Sources"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={mockTimeSeriesData.map(item => ({ ...item, value: item.value * 2.5 }))}
            title="Page Views"
            valueFormatter={(value) => value.toLocaleString()}
            isLoading={isLoading}
          />
          <TimeSeriesChart
            data={mockTimeSeriesData.map(item => ({ ...item, value: item.value * 0.3 }))}
            title="Conversion Rate"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}