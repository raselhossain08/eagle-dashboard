// app/dashboard/billing/reports/revenue/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { RevenueTimelineChart } from '@/components/billing/revenue-timeline-chart';
import { RevenueBreakdownChart } from '@/components/billing/revenue-breakdown-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Download, Calendar, DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, BarChart3, Target, AlertCircle, CheckCircle, Activity, Eye, EyeOff, Zap, PieChart, LineChart } from 'lucide-react';
import { useRevenueReport, useExportRevenueReport, useRefreshBillingReports, useDashboardStats } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';
import { ErrorBoundary } from '@/components/error-boundary';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { toast } from 'sonner';

export default function RevenueReportsPage() {
  const [dateRange, setDateRange] = useState('90d');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exportDateRange, setExportDateRange] = useState('current');

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
      case 'ytd':
        start.setMonth(0);
        start.setDate(1);
        break;
      case 'all':
      default:
        start.setFullYear(now.getFullYear() - 3);
        break;
    }
    
    return { from: start, to: now };
  }, [dateRange]);

  // Real-time revenue data fetching with comprehensive error handling
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    error: revenueError,
    refetch: refetchRevenueData,
    isRefetching: isRevenueRefetching
  } = useRevenueReport(dateRangeValue);

  // Dashboard statistics integration
  const {
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError
  } = useDashboardStats();

  // Export functionality
  const revenueExportMutation = useExportRevenueReport();

  // Global refresh functionality
  const refreshMutation = useRefreshBillingReports();

  // Enhanced loading and error states
  const isRefreshing = isRevenueLoading || isRevenueRefetching || refreshMutation.isPending || isStatsLoading;
  const hasError = revenueError || statsError;

  // Manual refresh function with comprehensive error handling
  const handleRefresh = useCallback(async () => {
    try {
      setLastRefresh(new Date());
      toast("Refreshing revenue analytics and dashboard statistics...");
      
      await Promise.all([
        refetchRevenueData(),
        refreshMutation.mutateAsync()
      ]);
      
      toast.success("Revenue analytics have been successfully updated.");
    } catch (error) {
      console.error('Error refreshing revenue data:', error);
      toast.error("Failed to update revenue data. Please try again.");
    }
  }, [refetchRevenueData, refreshMutation]);

  // Auto-refresh functionality with intelligent intervals
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // Refresh every minute when auto-refresh is enabled
    
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  // Enhanced revenue metrics with advanced business intelligence
  const revenueMetrics = useMemo(() => {
    if (!revenueData) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        growthRate: 0,
        revenuePerDay: 0,
        transactionVelocity: 0,
        revenueHealthScore: 'good' as const,
        revenueProjection: 0,
        conversionRate: 0,
        topRevenueSource: null,
        revenueDistribution: [],
        revenueEfficiency: 0
      };
    }

    const totalRevenue = revenueData.totalRevenue || 0;
    const totalTransactions = revenueData.totalTransactions || 0;
    const averageTransactionValue = revenueData.averageTransactionValue || 0;

    // Calculate growth rate
    let growthRate = 0;
    if (revenueData.timelineData && revenueData.timelineData.length >= 2) {
      const current = revenueData.timelineData[revenueData.timelineData.length - 1];
      const previous = revenueData.timelineData[revenueData.timelineData.length - 2];
      if (previous?.revenue && previous.revenue > 0) {
        growthRate = ((current.revenue - previous.revenue) / previous.revenue) * 100;
      }
    }

    // Calculate daily revenue velocity
    const dateRangeDays = Math.ceil((dateRangeValue.to.getTime() - dateRangeValue.from.getTime()) / (1000 * 3600 * 24));
    const revenuePerDay = dateRangeDays > 0 ? totalRevenue / dateRangeDays : 0;
    const transactionVelocity = dateRangeDays > 0 ? totalTransactions / dateRangeDays : 0;

    // Calculate health score
    let revenueHealthScore: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (growthRate > 20 && averageTransactionValue > 100) revenueHealthScore = 'excellent';
    else if (growthRate < -10) revenueHealthScore = 'critical';
    else if (growthRate < 0) revenueHealthScore = 'warning';

    // Calculate projections
    const revenueProjection = totalRevenue * (1 + growthRate / 100) * 12; // Annual projection

    // Find top revenue source
    const topRevenueSource = revenueData.breakdownData?.reduce((max, current) =>
      (current.revenue > max.revenue) ? current : max
    ) || null;

    // Revenue efficiency (revenue per transaction)
    const revenueEfficiency = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionValue,
      growthRate,
      revenuePerDay,
      transactionVelocity,
      revenueHealthScore,
      revenueProjection,
      conversionRate: dashboardStats ? (totalTransactions / (dashboardStats.activeSubscriptions || 1)) * 100 : 0,
      topRevenueSource,
      revenueDistribution: revenueData.breakdownData || [],
      revenueEfficiency
    };
  }, [revenueData, dashboardStats, dateRangeValue]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Revenue Analytics', href: '#', active: true }
  ];

  const handleExport = () => {
    revenueExportMutation.mutate({
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

  if (hasError) {
    return (
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Revenue Analytics Dashboard"
          description="Comprehensive revenue analysis and financial insights"
          breadcrumbs={breadcrumbs}
        >
          <ErrorBoundary>
            <ApiErrorHandler 
              error={revenueError || statsError} 
              onRetry={handleRefresh}
            />
          </ErrorBoundary>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BillingDashboardShell
        title="Revenue Analytics Dashboard"
        description="Comprehensive revenue analysis and financial insights with real-time data"
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
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="all">All time</SelectItem>
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
              disabled={revenueExportMutation.isPending || isRefreshing}
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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Revenue Analytics Dashboard
                  </span>
                </div>
                <Badge variant={revenueMetrics?.revenueHealthScore === 'excellent' ? 'default' : 
                              revenueMetrics?.revenueHealthScore === 'good' ? 'secondary' :
                              revenueMetrics?.revenueHealthScore === 'warning' ? 'outline' : 'destructive'}>
                  {revenueMetrics?.revenueHealthScore === 'excellent' ? 'Excellent Growth' :
                   revenueMetrics?.revenueHealthScore === 'good' ? 'Healthy Revenue' :
                   revenueMetrics?.revenueHealthScore === 'warning' ? 'Needs Attention' : 'Critical Issues'}
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
            {/* Enhanced Revenue Metrics Grid */}
            <div className={`grid gap-4 ${showDetails ? 'md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {isRefreshing ? (
                Array.from({ length: showDetails ? 8 : 4 }).map((_, index) => (
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
                  {/* Total Revenue */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${revenueMetrics?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {revenueMetrics?.growthRate && revenueMetrics.growthRate !== 0 ? (
                          <>
                            {revenueMetrics.growthRate > 0 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                            <p className={`text-xs font-medium ${revenueMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {revenueMetrics.growthRate > 0 ? '+' : ''}{revenueMetrics.growthRate.toFixed(1)}% from last period
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500">No change from last period</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Projection */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Annual Projection</CardTitle>
                      <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        ${revenueMetrics?.revenueProjection?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'}
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        Based on current growth
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Transactions */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Transactions</CardTitle>
                      <Activity className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {revenueMetrics?.totalTransactions?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-purple-600 font-medium">
                        Revenue transactions processed
                      </p>
                    </CardContent>
                  </Card>

                  {/* Average Transaction Value */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Avg Transaction</CardTitle>
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        ${revenueMetrics?.averageTransactionValue?.toFixed(2) || '0.00'}
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">
                        Average per transaction
                      </p>
                    </CardContent>
                  </Card>

                  {/* Additional metrics for detailed view */}
                  {showDetails && (
                    <>
                      {/* Revenue Per Day */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Daily Revenue</CardTitle>
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                            ${revenueMetrics?.revenuePerDay?.toFixed(2) || '0.00'}
                          </div>
                          <p className="text-xs text-orange-600 font-medium">
                            Average per day
                          </p>
                        </CardContent>
                      </Card>

                      {/* Transaction Velocity */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/10 dark:to-teal-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Transaction Velocity</CardTitle>
                          <Zap className="h-4 w-4 text-teal-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                            {revenueMetrics?.transactionVelocity?.toFixed(1) || '0.0'}
                          </div>
                          <p className="text-xs text-teal-600 font-medium">
                            Transactions per day
                          </p>
                        </CardContent>
                      </Card>

                      {/* Top Revenue Source */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/10 dark:to-rose-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">Top Source</CardTitle>
                          <PieChart className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-rose-900 dark:text-rose-100 truncate">
                            {revenueMetrics?.topRevenueSource?.name || 'N/A'}
                          </div>
                          <p className="text-xs text-rose-600 font-medium">
                            Highest revenue source
                          </p>
                        </CardContent>
                      </Card>

                      {/* Health Score */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Revenue Health</CardTitle>
                          {revenueMetrics?.revenueHealthScore === 'excellent' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                           revenueMetrics?.revenueHealthScore === 'good' ? <CheckCircle className="h-4 w-4 text-blue-600" /> :
                           revenueMetrics?.revenueHealthScore === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                           <AlertCircle className="h-4 w-4 text-red-600" />}
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-amber-900 dark:text-amber-100 capitalize">
                            {revenueMetrics?.revenueHealthScore || 'Good'}
                          </div>
                          <Progress 
                            value={
                              revenueMetrics?.revenueHealthScore === 'excellent' ? 100 :
                              revenueMetrics?.revenueHealthScore === 'good' ? 75 :
                              revenueMetrics?.revenueHealthScore === 'warning' ? 50 : 25
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

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueTimelineChart 
              data={adaptedTimelineData}
              period={chartPeriod}
              isLoading={isRefreshing}
            />
            <RevenueBreakdownChart 
              data={adaptedBreakdownData}
              period={dateRangeValue}
              isLoading={isRefreshing}
            />
          </div>

          {/* Enhanced Revenue Analytics Section */}
          {!isRefreshing && revenueData && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Performance Trends */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-900 dark:text-blue-100">Performance Trends</CardTitle>
                  </div>
                  <CardDescription>Key revenue performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <div className="flex items-center gap-2">
                      {revenueMetrics?.growthRate && revenueMetrics.growthRate > 0 ? 
                        <TrendingUp className="h-3 w-3 text-green-600" /> : 
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      }
                      <span className={`font-bold ${revenueMetrics?.growthRate && revenueMetrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {revenueMetrics?.growthRate ? `${revenueMetrics.growthRate > 0 ? '+' : ''}${revenueMetrics.growthRate.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue Velocity</span>
                    <span className="font-medium">
                      ${revenueMetrics?.revenuePerDay?.toFixed(0) || '0'}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Efficiency Score</span>
                    <Badge variant={revenueMetrics?.revenueHealthScore === 'excellent' ? 'default' : 'secondary'}>
                      {revenueMetrics?.revenueHealthScore || 'Good'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Annual Projection</span>
                    <span className="font-medium text-blue-600">
                      ${revenueMetrics?.revenueProjection?.toLocaleString() || '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-green-900 dark:text-green-100">Revenue Sources</CardTitle>
                  </div>
                  <CardDescription>Breakdown by revenue streams</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  {revenueData?.breakdownData?.slice(0, 5).map((item, index) => {
                    const percentage = ((item.revenue / (revenueData?.totalRevenue || 1)) * 100);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate">{item.name}</span>
                          <span className="text-green-700 font-bold">${item.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</div>
                      </div>
                    );
                  }) || (
                    <div className="text-center text-muted-foreground py-6">
                      <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No breakdown data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Analytics */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-purple-900 dark:text-purple-100">Transaction Insights</CardTitle>
                  </div>
                  <CardDescription>Transaction patterns and metrics</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Volume</span>
                    <span className="font-bold text-purple-700">
                      {revenueMetrics?.totalTransactions?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Value</span>
                    <span className="font-medium">
                      ${revenueMetrics?.averageTransactionValue?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Volume</span>
                    <span className="font-medium">
                      {revenueMetrics?.transactionVelocity?.toFixed(1) || '0'} txns/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Peak Source</span>
                    <span className="font-medium text-purple-600 truncate max-w-[100px]">
                      {revenueMetrics?.topRevenueSource?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Health Status</span>
                      {revenueMetrics?.revenueHealthScore === 'excellent' ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        revenueMetrics?.revenueHealthScore === 'good' ? 
                        <CheckCircle className="h-4 w-4 text-blue-600" /> :
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading state for additional metrics */}
          {isRefreshing && (
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
        </ErrorBoundary>
      </BillingDashboardShell>

      {/* Enhanced Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Revenue Report
            </DialogTitle>
            <DialogDescription>
              Download comprehensive revenue analytics and insights for the selected period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={exportDateRange} onValueChange={setExportDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Period</SelectItem>
                    <SelectItem value="last-30">Last 30 Days</SelectItem>
                    <SelectItem value="last-90">Last 90 Days</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Export includes:</strong> Revenue metrics, transaction data, growth analysis, 
                revenue sources breakdown, and performance trends.
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              onClick={handleExport} 
              disabled={revenueExportMutation.isPending}
              className="flex items-center gap-2"
            >
              {revenueExportMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}