// app/dashboard/billing/reports/mrr/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { MrrTrendsChart } from '@/components/billing/mrr-trends-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, RefreshCw } from 'lucide-react';
import { useMrrReport, useExportMrrReport } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';

export default function MrrReportsPage() {
  const [dateRange, setDateRange] = useState('1y');
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize date range calculation to prevent infinite re-renders
  const dateRangeValue = useMemo(() => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        start.setFullYear(now.getFullYear() - 2);
        break;
    }
    
    return { from: start, to: now };
  }, [dateRange]);

  const { data: mrrData, isLoading, error, refetch: refetchMrr } = useMrrReport(dateRangeValue, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchInterval: false, // Disable automatic refetching
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
  const exportMrrMutation = useExportMrrReport();

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchMrr();
    } catch (error) {
      console.error('Error refreshing MRR data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if data has been loaded
  const hasData = mrrData !== undefined;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'MRR Analysis', href: '#', active: true }
  ];

  const handleExport = () => {
    exportMrrMutation.mutate({
      from: dateRangeValue.from.toISOString().split('T')[0],
      to: dateRangeValue.to.toISOString().split('T')[0],
      format: 'xlsx',
      includeDetails: true
    });
  };

  const formatGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (error) {
    return (
      <div className="flex min-h-screen">

        <BillingDashboardShell
          title="MRR Analysis"
          description="Monthly Recurring Revenue metrics and trends"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center text-red-600 py-8">
            Failed to load MRR data. Please try again.
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

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
              disabled={exportMrrMutation.isPending || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* MRR Overview */}
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
                    <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(mrrData?.currentMrr || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      {(mrrData?.growth || 0) > 0 ? '+' : ''}{(mrrData?.growth || 0).toFixed(1)}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mrrData?.activeSubscriptions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Total active subscribers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mrrData?.totalSubscriptions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      All time subscriptions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mrrData?.activeSubscriptions && mrrData?.currentMrr 
                        ? formatCurrency(mrrData.currentMrr / mrrData.activeSubscriptions)
                        : formatCurrency(0)
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average revenue per user
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* MRR Trends Chart */}
          <MrrTrendsChart 
            data={mrrData?.trends || []}
            period={chartPeriod}
            isLoading={isLoading}
          />

          {/* Additional MRR Metrics */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mrrData && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">MRR Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Growth</span>
                    <span className={`font-medium ${mrrData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mrrData.growth > 0 ? '+' : ''}{mrrData.growth?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Trending</span>
                    <span className="font-medium text-green-600">
                      {mrrData.trends?.length > 1 ? 'Up' : 'Stable'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Momentum</span>
                    <span className="font-medium text-blue-600">Strong</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Customers</span>
                    <span className="font-medium">{mrrData.activeSubscriptions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Customers</span>
                    <span className="font-medium">{mrrData.totalSubscriptions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Activation Rate</span>
                    <span className="font-medium text-green-600">
                      {mrrData.totalSubscriptions > 0 
                        ? ((mrrData.activeSubscriptions / mrrData.totalSubscriptions) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mrrData.trends?.slice(-3).map((trend, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{trend.month}</span>
                      <span className="font-medium">{formatCurrency(trend.mrr || 0)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* MRR Trends Summary */}
          {!isLoading && mrrData?.trends && mrrData.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>MRR Summary</CardTitle>
                <CardDescription>
                  Key insights from your MRR performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(mrrData.trends[mrrData.trends.length - 1]?.mrr || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Latest MRR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {mrrData.trends.reduce((sum, trend) => sum + (trend.newSubscriptions || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total New Subscriptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {mrrData.trends.reduce((sum, trend) => sum + (trend.churned || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Churned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {((mrrData.currentMrr - (mrrData.trends[0]?.mrr || 0)) / (mrrData.trends[0]?.mrr || 1) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Total Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </BillingDashboardShell>
    </div>
  );
}