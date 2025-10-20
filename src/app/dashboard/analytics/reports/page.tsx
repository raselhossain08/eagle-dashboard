"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useDashboardStore } from "@/store/dashboard-store";
import { useRevenueReport, useDeviceBreakdown } from "@/hooks/use-reports";
import { useMemo } from "react";

export default function ReportsPage() {
  const { dateRange } = useDashboardStore();

  // Fetch real backend data
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(dateRange);
  const { data: deviceData, isLoading: deviceLoading } = useDeviceBreakdown(dateRange);

  // Transform revenue trends for the chart
  const revenueChartData = useMemo(() => {
    if (revenueData?.trends && revenueData.trends.length > 0) {
      return revenueData.trends.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.revenue
      }));
    }
    return [];
  }, [revenueData]);

  // Transform device data for the donut chart
  const deviceChartData = useMemo(() => {
    if (deviceData && deviceData.length > 0) {
      const total = deviceData.reduce((sum, device) => sum + device.sessions, 0);
      const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
      
      return deviceData.map((device, index) => ({
        name: device.device.charAt(0).toUpperCase() + device.device.slice(1),
        value: Math.round((device.sessions / total) * 100),
        color: colors[index % colors.length]
      }));
    }
    return [];
  }, [deviceData]);

  return (
    <DashboardShell
      title="Reports"
      description="Comprehensive analytics reports"
    >
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData ? `$${revenueData.totalRevenue.toLocaleString()}` : '$0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueLoading ? 'Loading...' : 'Current period'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AOV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData ? `$${revenueData.averageOrderValue.toFixed(2)}` : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Average order value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData ? revenueData.transactions.toLocaleString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BarChart
            data={revenueChartData}
            title="Revenue Trends"
            valueFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            isLoading={revenueLoading}
          />
          <DonutChart
            data={deviceChartData}
            title="Device Distribution"
            valueFormatter={(value) => `${value}%`}
            isLoading={deviceLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}