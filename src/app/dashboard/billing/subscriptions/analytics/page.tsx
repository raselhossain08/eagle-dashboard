// app/dashboard/billing/subscriptions/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { ChurnAnalysisChart } from '@/components/billing/churn-analysis-chart';
import { PlanPerformanceChart } from '@/components/billing/plan-performance-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, DollarSign, TrendingDown, Calendar } from 'lucide-react';

export default function SubscriptionAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [metric, setMetric] = useState<'subscribers' | 'revenue' | 'churnRate'>('subscribers');

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions' },
    { label: 'Analytics', href: '#', active: true }
  ];

  // Mock data - replace with actual API calls
  const churnData = [
    { period: 'Jan', churnRate: 2.1, churnedMrr: 45000, churnedCustomers: 5 },
    { period: 'Feb', churnRate: 1.8, churnedMrr: 38000, churnedCustomers: 4 },
    { period: 'Mar', churnRate: 2.3, churnedMrr: 52000, churnedCustomers: 6 },
    { period: 'Apr', churnRate: 1.9, churnedMrr: 41000, churnedCustomers: 4 },
  ];

  const planPerformanceData = [
    { planName: 'Starter', subscribers: 45, revenue: 45000, churnRate: 2.1 },
    { planName: 'Pro', subscribers: 28, revenue: 84000, churnRate: 1.4 },
    { planName: 'Enterprise', subscribers: 12, revenue: 36000, churnRate: 0.8 },
    { planName: 'Basic', subscribers: 65, revenue: 32500, churnRate: 2.8 },
  ];

  const analyticsStats = {
    totalSubscribers: 150,
    activeSubscribers: 142,
    churnedThisMonth: 8,
    growthRate: 12.5,
    totalMrr: 197500,
    averageLifetime: 18,
    renewalRate: 95.2,
    expansionMrr: 25000,
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
        title="Subscription Analytics"
        description="Deep insights into your subscription metrics and performance"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsStats.growthRate}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(analyticsStats.totalMrr / 100).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +${(analyticsStats.expansionMrr / 100).toLocaleString()} expansion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renewal Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.renewalRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last quarter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Lifetime</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsStats.averageLifetime}m</div>
                <p className="text-xs text-muted-foreground">
                  Customer lifetime value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChurnAnalysisChart data={churnData} />
            
            <Card>
              <CardHeader>
                <CardTitle>Plan Performance</CardTitle>
                <CardDescription>
                  <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscribers">Subscribers</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="churnRate">Churn Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanPerformanceChart 
                  data={planPerformanceData} 
                  metric={metric}
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Health</CardTitle>
                <CardDescription>
                  Overall subscription metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Active Subscriptions</span>
                  <span className="font-medium">{analyticsStats.activeSubscribers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Churned This Month</span>
                  <span className="font-medium text-red-600">{analyticsStats.churnedThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Growth</span>
                  <span className="font-medium text-green-600">+{analyticsStats.growthRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expansion MRR</span>
                  <span className="font-medium text-green-600">
                    +${(analyticsStats.expansionMrr / 100).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Analysis</CardTitle>
                <CardDescription>
                  Customer retention and loyalty metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Retention</span>
                  <span className="font-medium">94.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quarterly Retention</span>
                  <span className="font-medium">88.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Retention</span>
                  <span className="font-medium">76.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lifetime Value</span>
                  <span className="font-medium">$2,450</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    </div>
  );
}