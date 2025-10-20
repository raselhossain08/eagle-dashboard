"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useDashboardStore } from "@/store/dashboard-store";

const mockRevenueData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Apr', value: 61000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 72000 },
];

const mockDeviceData = [
  { name: "Desktop", value: 55, color: "#3b82f6" },
  { name: "Mobile", value: 35, color: "#ef4444" },
  { name: "Tablet", value: 10, color: "#10b981" },
];

export default function ReportsPage() {
  const { dateRange } = useDashboardStore();

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
              <div className="text-2xl font-bold">$324,000</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AOV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$156.42</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,071</div>
              <p className="text-xs text-muted-foreground">
                +12.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BarChart
            data={mockRevenueData}
            title="Monthly Revenue"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <DonutChart
            data={mockDeviceData}
            title="Device Distribution"
            valueFormatter={(value) => `${value}%`}
          />
        </div>
      </div>
    </DashboardShell>
  );
}