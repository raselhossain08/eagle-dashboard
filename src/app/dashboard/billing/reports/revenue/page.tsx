// app/dashboard/billing/reports/revenue/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { RevenueTimelineChart } from '@/components/billing/revenue-timeline-chart';
import { RevenueBreakdownChart } from '@/components/billing/revenue-breakdown-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useRevenueReport } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';

export default function RevenueReportsPage() {
  const [dateRange, setDateRange] = useState('90d');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data: revenueData, isLoading } = useRevenueReport({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Revenue', href: '#', active: true }
  ];

  // Mock data - replace with actual data from hook
  const timelineData = [
    { date: '2024-01', revenue: 145000, recurring: 120000, oneTime: 25000 },
    { date: '2024-02', revenue: 152000, recurring: 125000, oneTime: 27000 },
    { date: '2024-03', revenue: 168000, recurring: 138000, oneTime: 30000 },
    { date: '2024-04', revenue: 175000, recurring: 142000, oneTime: 33000 },
  ];

  const breakdownData = {
    recurringRevenue: 142000,
    oneTimeRevenue: 33000,
    refunds: 5000,
  };

  const revenueStats = {
    totalRevenue: 175000,
    recurringRevenue: 142000,
    oneTimeRevenue: 33000,
    growthRate: 8.2,
    averageRevenue: 43750,
    customers: 156,
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title="Revenue Reports"
        description="Comprehensive revenue analysis and financial insights"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setChartPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueStats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{revenueStats.growthRate}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recurring Revenue</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueStats.recurringRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {((revenueStats.recurringRevenue / revenueStats.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. per Customer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueStats.averageRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {revenueStats.customers} customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{revenueStats.growthRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly growth
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueTimelineChart 
              data={timelineData}
              period={chartPeriod}
              isLoading={isLoading}
            />
            <RevenueBreakdownChart 
              data={breakdownData}
              period={{
                from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                to: new Date()
              }}
              isLoading={isLoading}
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Key revenue performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Growth</span>
                  <span className="font-medium text-green-600">+{revenueStats.growthRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quarterly Growth</span>
                  <span className="font-medium text-green-600">+24.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Year-over-Year</span>
                  <span className="font-medium text-green-600">+56.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Customer LTV</span>
                  <span className="font-medium">$2,450</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>
                  Breakdown by product and service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Subscription Plans</span>
                  <span className="font-medium">{formatCurrency(125000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">One-time Purchases</span>
                  <span className="font-medium">{formatCurrency(33000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Service Fees</span>
                  <span className="font-medium">{formatCurrency(12000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Revenue</span>
                  <span className="font-medium">{formatCurrency(5000)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    </div>
  );
}