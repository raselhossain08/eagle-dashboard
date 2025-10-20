// app/dashboard/billing/reports/mrr/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { MrrTrendsChart } from '@/components/billing/mrr-trends-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { useMrrReport } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';

export default function MrrReportsPage() {
  const [dateRange, setDateRange] = useState('1y');
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const { data: mrrData, isLoading } = useMrrReport({
    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'MRR Analysis', href: '#', active: true }
  ];

  // Mock data - replace with actual data from hook
  const mrrTrends = [
    { date: '2023-05', currentMrr: 85000, newMrr: 12000, churnedMrr: 8000, netMrr: 77000 },
    { date: '2023-06', currentMrr: 92000, newMrr: 15000, churnedMrr: 10000, netMrr: 82000 },
    { date: '2023-07', currentMrr: 105000, newMrr: 18000, churnedMrr: 12000, netMrr: 93000 },
    { date: '2023-08', currentMrr: 115000, newMrr: 20000, churnedMrr: 15000, netMrr: 100000 },
    { date: '2023-09', currentMrr: 125000, newMrr: 22000, churnedMrr: 17000, netMrr: 108000 },
    { date: '2023-10', currentMrr: 135000, newMrr: 25000, churnedMrr: 18000, netMrr: 117000 },
    { date: '2023-11', currentMrr: 145000, newMrr: 28000, churnedMrr: 20000, netMrr: 125000 },
    { date: '2023-12', currentMrr: 155000, newMrr: 30000, churnedMrr: 22000, netMrr: 133000 },
    { date: '2024-01', currentMrr: 165000, newMrr: 32000, churnedMrr: 24000, netMrr: 141000 },
    { date: '2024-02', currentMrr: 175000, newMrr: 35000, churnedMrr: 25000, netMrr: 150000 },
    { date: '2024-03', currentMrr: 185000, newMrr: 38000, churnedMrr: 27000, netMrr: 158000 },
    { date: '2024-04', currentMrr: 197500, newMrr: 40000, churnedMrr: 28500, netMrr: 169000 },
  ];

  const mrrStats = {
    currentMrr: 197500,
    newMrr: 40000,
    churnedMrr: 28500,
    netMrr: 169000,
    growthRate: 8.5,
    customers: 156,
    arpu: 1266,
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
        title="MRR Analysis"
        description="Monthly Recurring Revenue metrics and trends"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* MRR Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mrrStats.currentMrr)}</div>
                <p className="text-xs text-muted-foreground">
                  +{mrrStats.growthRate}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mrrStats.newMrr)}</div>
                <p className="text-xs text-muted-foreground">
                  New subscription revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churned MRR</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mrrStats.churnedMrr)}</div>
                <p className="text-xs text-muted-foreground">
                  Lost subscription revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net MRR</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mrrStats.netMrr)}</div>
                <p className="text-xs text-muted-foreground">
                  Net growth after churn
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MRR Trends Chart */}
          <MrrTrendsChart 
            data={mrrTrends}
            period={chartPeriod}
            isLoading={isLoading}
          />

          {/* Additional MRR Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">MRR Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Growth</span>
                  <span className="font-medium text-green-600">+{mrrStats.growthRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quarterly Growth</span>
                  <span className="font-medium text-green-600">+26.3%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Year-over-Year</span>
                  <span className="font-medium text-green-600">+132.4%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Customers</span>
                  <span className="font-medium">{mrrStats.customers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ARPU</span>
                  <span className="font-medium">{formatCurrency(mrrStats.arpu)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Churn Rate</span>
                  <span className="font-medium text-red-600">2.1%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">MRR Composition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New Business</span>
                  <span className="font-medium">{formatCurrency(32000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expansion</span>
                  <span className="font-medium">{formatCurrency(8000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reactivation</span>
                  <span className="font-medium">{formatCurrency(2000)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MRR Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>MRR Forecast</CardTitle>
              <CardDescription>
                Projected MRR growth based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(210000)}</div>
                  <div className="text-sm text-muted-foreground">Next Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(245000)}</div>
                  <div className="text-sm text-muted-foreground">In 3 Months</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(325000)}</div>
                  <div className="text-sm text-muted-foreground">In 6 Months</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(450000)}</div>
                  <div className="text-sm text-muted-foreground">In 1 Year</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BillingDashboardShell>
    </div>
  );
}