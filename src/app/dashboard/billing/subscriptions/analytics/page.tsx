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
import { TrendingUp, Users, DollarSign, TrendingDown, Calendar, RefreshCw } from 'lucide-react';

import { useChurnAnalysis, usePlanPerformance, useSubscriptionAnalytics } from '@/hooks/use-billing';
import { DateRange } from '@/types/billing';

export default function SubscriptionAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [metric, setMetric] = useState<'subscribers' | 'revenue' | 'churnRate'>('subscribers');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate actual date range
  const getDateRangeFromString = (range: string): DateRange => {
    const to = new Date();
    let from = new Date();
    
    switch (range) {
      case '7d':
        from.setDate(to.getDate() - 7);
        break;
      case '30d':
        from.setDate(to.getDate() - 30);
        break;
      case '90d':
        from.setDate(to.getDate() - 90);
        break;
      case '1y':
        from.setFullYear(to.getFullYear() - 1);
        break;
      default:
        from.setDate(to.getDate() - 30);
    }
    
    return { from, to };
  };

  const actualDateRange = getDateRangeFromString(dateRange);
  
  // Disable automatic fetching and refetching
  const { data: churnData, isLoading: churnLoading, refetch: refetchChurn } = useChurnAnalysis(actualDateRange, {
    enabled: false, // Disable automatic fetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  
  const { data: planPerformanceData, isLoading: planLoading, refetch: refetchPlan } = usePlanPerformance(actualDateRange, {
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  
  const { data: subscriptionAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useSubscriptionAnalytics(actualDateRange, {
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const isLoading = churnLoading || planLoading || analyticsLoading;

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchChurn(),
        refetchPlan(),
        refetchAnalytics(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions' },
    { label: 'Analytics', href: '#', active: true }
  ];

  // Use real analytics data with fallbacks
  const analyticsStats = (subscriptionAnalytics as any) || {
    totalSubscribers: 0,
    activeSubscribers: 0,
    churnedThisMonth: 0,
    growthRate: 0,
    totalMrr: 0,
    averageLifetime: 0,
    renewalRate: 0,
    expansionMrr: 0,
  };

  // Check if data has been loaded
  const hasData = subscriptionAnalytics !== undefined;

  return (
    <div className="flex min-h-screen">
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
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button variant="outline">Export Report</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Data Load Notice */}
          {!hasData && !isLoading && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Analytics data is ready to load
                    </p>
                    <p className="text-sm text-blue-700">
                      Click "Refresh Data" button above to load the latest subscription analytics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
            <ChurnAnalysisChart data={(churnData as any) || []} />
            
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
                  data={(planPerformanceData as any) || []} 
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