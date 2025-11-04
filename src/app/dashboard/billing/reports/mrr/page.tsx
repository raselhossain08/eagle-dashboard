// app/dashboard/billing/reports/mrr/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { MrrTrendsChart } from '@/components/billing/mrr-trends-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, RefreshCw, BarChart3, Target, AlertCircle, CheckCircle, Activity, Eye, EyeOff } from 'lucide-react';
import { useMrrReport, useExportMrrReport, useRefreshBillingReports, useDashboardStats } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';
import { ErrorBoundary } from '@/components/error-boundary';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { toast } from 'sonner';

export default function MrrReportsPage() {
  const [dateRange, setDateRange] = useState('1y');
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

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
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        start.setFullYear(now.getFullYear() - 2);
        break;
      case 'all':
      default:
        start.setFullYear(now.getFullYear() - 3);
        break;
    }
    
    return { from: start, to: now };
  }, [dateRange]);

  // Real-time MRR data fetching with comprehensive error handling
  const {
    data: mrrData,
    isLoading: isMrrLoading,
    error: mrrError,
    refetch: refetchMrrData,
    isRefetching: isMrrRefetching
  } = useMrrReport(dateRangeValue);

  // Dashboard statistics integration
  const {
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError
  } = useDashboardStats();

  // Export functionality
  const mrrExportMutation = useExportMrrReport();

  // Global refresh functionality
  const refreshMutation = useRefreshBillingReports();

  // Enhanced loading and error states
  const isRefreshing = isMrrLoading || isMrrRefetching || refreshMutation.isPending || isStatsLoading;
  const hasError = mrrError || statsError;

  // Manual refresh function with comprehensive error handling
  const handleRefresh = async () => {
    try {
      setLastRefresh(new Date());
      toast("Refreshing MRR analytics and dashboard statistics...");
      
      await Promise.all([
        refetchMrrData(),
        refreshMutation.mutateAsync()
      ]);
      
      toast.success("MRR analytics have been successfully updated.");
    } catch (error) {
      console.error('Error refreshing MRR data:', error);
      toast.error("Failed to update MRR data. Please try again.");
    }
  };

  // Auto-refresh functionality with intelligent intervals
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // Refresh every minute when auto-refresh is enabled
    
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  // Enhanced MRR metrics with advanced business intelligence
  const mrrMetrics = useMemo(() => {
    if (!mrrData?.trends || !Array.isArray(mrrData.trends) || mrrData.trends.length === 0) {
      return {
        currentMrr: mrrData?.currentMrr || 0,
        previousMrr: 0,
        growthRate: mrrData?.growth || 0,
        totalRevenue: 0,
        totalSubscriptions: mrrData?.totalSubscriptions || 0,
        avgRevenuePerUser: 0,
        quarterlyGrowth: 0,
        yearlyGrowth: 0,
        churnRate: 0,
        growthTrend: 'stable' as const,
        healthScore: 'good' as const,
        projectedAnnualRevenue: (mrrData?.currentMrr || 0) * 12,
        netRevenueRetention: 100
      };
    }

    const sortedData = [...mrrData.trends].sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    const currentMrr = mrrData.currentMrr || sortedData[sortedData.length - 1]?.mrr || 0;
    const previousMrr = sortedData[sortedData.length - 2]?.mrr || 0;
    const threeMonthsAgoMrr = sortedData[Math.max(0, sortedData.length - 4)]?.mrr || 0;
    const twelveMonthsAgoMrr = sortedData[Math.max(0, sortedData.length - 13)]?.mrr || 0;

    const monthlyGrowthRate = mrrData.growth || (previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0);
    const quarterlyGrowth = threeMonthsAgoMrr > 0 ? ((currentMrr - threeMonthsAgoMrr) / threeMonthsAgoMrr) * 100 : 0;
    const yearlyGrowth = twelveMonthsAgoMrr > 0 ? ((currentMrr - twelveMonthsAgoMrr) / twelveMonthsAgoMrr) * 100 : 0;

    // Calculate growth trend
    const recentValues = sortedData.slice(-6).map(d => d.mrr || 0);
    const growthTrend = recentValues.length >= 2 
      ? recentValues[recentValues.length - 1] > recentValues[0] ? 'growing' : 'declining'
      : 'stable';

    // Calculate health score based on multiple factors
    let healthScore: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (monthlyGrowthRate > 10) healthScore = 'excellent';
    else if (monthlyGrowthRate < -5) healthScore = 'critical';
    else if (monthlyGrowthRate < 0) healthScore = 'warning';

    const projectedAnnualRevenue = currentMrr * 12;
    const totalSubscriptions = dashboardStats?.activeSubscriptions || mrrData.totalSubscriptions || 0;
    const avgRevenuePerUser = totalSubscriptions > 0 ? currentMrr / totalSubscriptions : 0;

    // Calculate total revenue from trend data
    const totalRevenue = sortedData.reduce((sum, point) => sum + (point.mrr || 0), 0);

    return {
      currentMrr,
      previousMrr,
      growthRate: monthlyGrowthRate,
      totalRevenue,
      totalSubscriptions,
      avgRevenuePerUser,
      quarterlyGrowth,
      yearlyGrowth,
      churnRate: 0, // To be implemented when churn data is available
      growthTrend,
      healthScore,
      projectedAnnualRevenue,
      netRevenueRetention: 100 + monthlyGrowthRate // Simplified NRR calculation
    };
  }, [mrrData, dashboardStats]);

  // Check if data has been loaded
  const hasData = mrrData !== undefined;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'MRR Analysis', href: '#', active: true }
  ];

  const handleExport = () => {
    mrrExportMutation.mutate({
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

  if (hasError) {
    return (
      <div className="flex min-h-screen">

        <BillingDashboardShell
          title="MRR Analysis"
          description="Monthly Recurring Revenue metrics and trends"
          breadcrumbs={breadcrumbs}
        >
          <ErrorBoundary>
            <ApiErrorHandler 
              error={mrrError || statsError} 
              onRetry={handleRefresh}
            />
          </ErrorBoundary>
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
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="2y">Last 2 years</SelectItem>
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
              disabled={mrrExportMutation.isPending || isRefreshing}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      >
        <ErrorBoundary>
          <div className="space-y-6">
            {/* Real-time Status Banner */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    MRR Analytics Dashboard
                  </span>
                </div>
                <Badge variant={mrrMetrics?.healthScore === 'excellent' ? 'default' : 
                              mrrMetrics?.healthScore === 'good' ? 'secondary' :
                              mrrMetrics?.healthScore === 'warning' ? 'outline' : 'destructive'}>
                  {mrrMetrics?.healthScore === 'excellent' ? 'Excellent Growth' :
                   mrrMetrics?.healthScore === 'good' ? 'Healthy Growth' :
                   mrrMetrics?.healthScore === 'warning' ? 'Needs Attention' : 'Critical'}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    id="auto-refresh"
                  />
                  <label htmlFor="auto-refresh" className="text-sm text-gray-600 dark:text-gray-300">
                    Auto-refresh
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Enhanced MRR Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isRefreshing ? (
                Array.from({ length: 8 }).map((_, index) => (
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
                  {/* Current MRR */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Current MRR</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        ${mrrMetrics?.currentMrr?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {mrrMetrics?.growthRate && mrrMetrics.growthRate !== 0 ? (
                          <>
                            <TrendingUp className={`h-3 w-3 ${mrrMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`} />
                            <p className={`text-xs font-medium ${mrrMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mrrMetrics.growthRate > 0 ? '+' : ''}{mrrMetrics.growthRate.toFixed(1)}% this month
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500">No change this month</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projected Annual Revenue */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Annual Projection</CardTitle>
                      <Target className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${mrrMetrics?.projectedAnnualRevenue?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'}
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        Based on current MRR
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Subscriptions */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Subscriptions</CardTitle>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {mrrMetrics?.totalSubscriptions?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-purple-600 font-medium">
                        Active subscribers
                      </p>
                    </CardContent>
                  </Card>

                  {/* ARPU */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">ARPU</CardTitle>
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        ${mrrMetrics?.avgRevenuePerUser?.toFixed(2) || '0.00'}
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">
                        Average revenue per user
                      </p>
                    </CardContent>
                  </Card>

                  {/* Quarterly Growth */}
                  {showDetails && (
                    <>
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Quarterly Growth</CardTitle>
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                            {mrrMetrics?.quarterlyGrowth ? `${mrrMetrics.quarterlyGrowth > 0 ? '+' : ''}${mrrMetrics.quarterlyGrowth.toFixed(1)}%` : '0.0%'}
                          </div>
                          <p className="text-xs text-orange-600 font-medium">
                            Past 3 months
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/10 dark:to-teal-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Yearly Growth</CardTitle>
                          <BarChart3 className="h-4 w-4 text-teal-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                            {mrrMetrics?.yearlyGrowth ? `${mrrMetrics.yearlyGrowth > 0 ? '+' : ''}${mrrMetrics.yearlyGrowth.toFixed(1)}%` : '0.0%'}
                          </div>
                          <p className="text-xs text-teal-600 font-medium">
                            Past 12 months
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/10 dark:to-rose-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">Growth Trend</CardTitle>
                          <Activity className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-rose-900 dark:text-rose-100 capitalize">
                            {mrrMetrics?.growthTrend || 'Stable'}
                          </div>
                          <p className="text-xs text-rose-600 font-medium">
                            6-month trend
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Health Score</CardTitle>
                          {mrrMetrics?.healthScore === 'excellent' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                           mrrMetrics?.healthScore === 'good' ? <CheckCircle className="h-4 w-4 text-blue-600" /> :
                           mrrMetrics?.healthScore === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                           <AlertCircle className="h-4 w-4 text-red-600" />}
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-amber-900 dark:text-amber-100 capitalize">
                            {mrrMetrics?.healthScore || 'Good'}
                          </div>
                          <Progress 
                            value={
                              mrrMetrics?.healthScore === 'excellent' ? 100 :
                              mrrMetrics?.healthScore === 'good' ? 75 :
                              mrrMetrics?.healthScore === 'warning' ? 50 : 25
                            }
                            className="mt-2"
                          />
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              )}
          </div>

          {/* MRR Trends Chart */}
          <MrrTrendsChart 
            data={mrrData?.trends || []}
            period={chartPeriod}
            isLoading={isRefreshing}
          />

          {/* Additional MRR Metrics */}
          {isRefreshing ? (
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
          {!isRefreshing && mrrData?.trends && mrrData.trends.length > 0 && (
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
        </ErrorBoundary>
      </BillingDashboardShell>
    </div>
  );
}