"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueReport } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";
import { DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-react";

const mockRevenueData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Apr', value: 61000 },
  { name: 'May', value: 55000 },
  { name: 'Jun', value: 72000 },
  { name: 'Jul', value: 68000 },
  { name: 'Aug', value: 79000 },
  { name: 'Sep', value: 82000 },
  { name: 'Oct', value: 78000 },
  { name: 'Nov', value: 91000 },
  { name: 'Dec', value: 95000 },
];

const mockRevenueTypeData = [
  { name: "Recurring", value: 65, color: "#3b82f6" },
  { name: "One-time", value: 25, color: "#ef4444" },
  { name: "Services", value: 10, color: "#10b981" },
];

const mockAOVData = [
  { date: '2024-01-01', value: 142.50 },
  { date: '2024-01-02', value: 156.80 },
  { date: '2024-01-03', value: 138.20 },
  { date: '2024-01-04', value: 162.40 },
  { date: '2024-01-05', value: 148.90 },
  { date: '2024-01-06', value: 171.20 },
  { date: '2024-01-07', value: 165.80 },
];

const mockProductPerformance = [
  { name: "Premium Plan", value: 45000 },
  { name: "Pro Plan", value: 32000 },
  { name: "Basic Plan", value: 15000 },
  { name: "Add-on Services", value: 8000 },
  { name: "Consulting", value: 5000 },
];

export default function RevenuePage() {
  const { dateRange } = useDashboardStore();
  const { data: revenueData, isLoading } = useRevenueReport(dateRange);

  return (
    <DashboardShell
      title="Revenue Reports"
      description="Comprehensive revenue analytics and insights"
    >
      <div className="space-y-6">
        {/* Revenue Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$324.8K</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$42.5K</div>
              <p className="text-xs text-muted-foreground">
                +8.7% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                +184 this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Revenue Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart
            data={mockRevenueData}
            title="Monthly Revenue"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            isLoading={isLoading}
          />
          <DonutChart
            data={mockRevenueTypeData}
            title="Revenue by Type"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
        </div>

        {/* Secondary Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            data={mockAOVData}
            title="Average Order Value Trend"
            valueFormatter={(value) => `$${value.toFixed(2)}`}
            isLoading={isLoading}
          />
          <BarChart
            data={mockProductPerformance}
            title="Revenue by Product"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            orientation="horizontal"
            isLoading={isLoading}
          />
        </div>

        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                <div>Product</div>
                <div className="text-right">Revenue</div>
                <div className="text-right">Customers</div>
                <div className="text-right">Avg. Revenue/Customer</div>
              </div>
              {[
                { product: "Premium Plan", revenue: 185000, customers: 1250, avgRevenue: 148.00 },
                { product: "Pro Plan", revenue: 98000, customers: 890, avgRevenue: 110.11 },
                { product: "Basic Plan", revenue: 32000, customers: 520, avgRevenue: 61.54 },
                { product: "Add-on Services", revenue: 12500, customers: 450, avgRevenue: 27.78 },
                { product: "Consulting", revenue: 8500, customers: 85, avgRevenue: 100.00 },
              ].map((item, index) => (
                <div key={item.product} className="grid grid-cols-4 gap-4 items-center py-2 border-b">
                  <div className="font-medium">{item.product}</div>
                  <div className="text-right">${item.revenue.toLocaleString()}</div>
                  <div className="text-right">{item.customers.toLocaleString()}</div>
                  <div className="text-right">${item.avgRevenue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}