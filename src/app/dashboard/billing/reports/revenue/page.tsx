// app/dashboard/billing/reports/revenue/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { RevenueTimelineChart } from '@/components/billing/revenue-timeline-chart';
import { RevenueBreakdownChart } from '@/components/billing/revenue-breakdown-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Calendar, DollarSign, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { useRevenueReport, useExportRevenueReport } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';

export default function RevenueReportsPage() {
  const [dateRange, setDateRange] = useState('90d');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize date range calculation to prevent infinite re-renders
  const dateRangeValue = useMemo(() => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'ytd':
        start.setMonth(0);
        start.setDate(1);
        break;
      default:
        start.setDate(now.getDate() - 90);
        break;
    }
    
    return { from: start, to: now };
  }, [dateRange]);

  const { data: revenueData, isLoading, error, refetch: refetchRevenue } = useRevenueReport(dateRangeValue, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
  const exportRevenueMutation = useExportRevenueReport();

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchRevenue();
    } catch (error) {
      console.error('Error refreshing revenue data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Revenue', href: '#', active: true }
  ];

  const handleExport = () => {
    exportRevenueMutation.mutate({
      from: dateRangeValue.from.toISOString().split('T')[0],
      to: dateRangeValue.to.toISOString().split('T')[0],
      format: 'xlsx',
      includeDetails: true
    });
  };

  const calculateGrowthRate = () => {
    if (!revenueData?.timelineData || revenueData.timelineData.length < 2) return 0;
    const current = revenueData.timelineData[revenueData.timelineData.length - 1];
    const previous = revenueData.timelineData[revenueData.timelineData.length - 2];
    if (!previous?.revenue || previous.revenue === 0) return 0;
    return ((current.revenue - previous.revenue) / previous.revenue * 100);
  };

  // Adapt timeline data for chart component
  const adaptedTimelineData = revenueData?.timelineData?.map(item => ({
    date: item.period,
    revenue: item.revenue,
    recurring: Math.round(item.revenue * 0.8), // Estimate recurring portion
    oneTime: Math.round(item.revenue * 0.2), // Estimate one-time portion
  })) || [];

  // Adapt breakdown data for chart component
  const adaptedBreakdownData = {
    recurringRevenue: revenueData?.breakdownData?.reduce((sum, item) => sum + (item.revenue * 0.8), 0) || 0,
    oneTimeRevenue: revenueData?.breakdownData?.reduce((sum, item) => sum + (item.revenue * 0.2), 0) || 0,
    refunds: 0, // No refund data from current API
  };

  if (error) {
    return (
      <div className="flex min-h-screen">

        <BillingDashboardShell
          title="Revenue Reports"
          description="Comprehensive revenue analysis and financial insights"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center text-red-600 py-8">
            Failed to load revenue data. Please try again.
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

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
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportRevenueMutation.isPending || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueData?.totalRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {calculateGrowthRate() >= 0 ? '+' : ''}{calculateGrowthRate().toFixed(1)}% from last period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{revenueData?.totalTransactions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Revenue transactions processed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(revenueData?.averageTransactionValue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average per transaction
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {calculateGrowthRate() >= 0 ? '+' : ''}{calculateGrowthRate().toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Period-over-period growth
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueTimelineChart 
              data={adaptedTimelineData}
              period={chartPeriod}
              isLoading={isLoading}
            />
            <RevenueBreakdownChart 
              data={adaptedBreakdownData}
              period={dateRangeValue}
              isLoading={isLoading}
            />
          </div>

          {/* Additional Metrics */}
          {!isLoading && revenueData && (
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
                    <span className="text-sm">Current Period Growth</span>
                    <span className={`font-medium ${calculateGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateGrowthRate() >= 0 ? '+' : ''}{calculateGrowthRate().toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue Per Transaction</span>
                    <span className="font-medium">
                      {formatCurrency(revenueData?.averageTransactionValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(revenueData?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Transactions</span>
                    <span className="font-medium">{revenueData?.totalTransactions || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                  <CardDescription>
                    Breakdown by revenue type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {revenueData?.breakdownData?.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.revenue)}</span>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      No breakdown data available
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(revenueData?.totalRevenue || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading state for additional metrics */}
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </BillingDashboardShell>
    </div>
  );
}