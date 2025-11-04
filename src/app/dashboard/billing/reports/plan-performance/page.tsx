// app/dashboard/billing/reports/plan-performance/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Download, FileText, Users, DollarSign, TrendingUp, RefreshCw, BarChart3, Target, AlertCircle, CheckCircle, Activity, Eye, EyeOff, Award, Zap, PieChart, TrendingDown } from 'lucide-react';
import { usePlanPerformance, useExportRevenueReport, useRefreshBillingReports, useDashboardStats } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';
import { ErrorBoundary } from '@/components/error-boundary';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { toast } from 'sonner';

export default function PlanPerformancePage() {
  const [dateRange, setDateRange] = useState('90d');
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

  // Real-time plan performance data fetching with comprehensive error handling
  const {
    data: planData,
    isLoading: isPlanLoading,
    error: planError,
    refetch: refetchPlanData,
    isRefetching: isPlanRefetching
  } = usePlanPerformance(dateRangeValue);

  // Dashboard statistics integration
  const {
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError
  } = useDashboardStats();

  // Export functionality
  const planExportMutation = useExportRevenueReport();

  // Global refresh functionality
  const refreshMutation = useRefreshBillingReports();

  // Enhanced loading and error states
  const isRefreshing = isPlanLoading || isPlanRefetching || refreshMutation.isPending || isStatsLoading;
  const hasError = planError || statsError;

  // Manual refresh function with comprehensive error handling
  const handleRefresh = useCallback(async () => {
    try {
      setLastRefresh(new Date());
      toast("Refreshing plan performance analytics...");
      
      await Promise.all([
        refetchPlanData(),
        refreshMutation.mutateAsync()
      ]);
      
      toast.success("Plan performance analytics have been successfully updated.");
    } catch (error) {
      console.error('Error refreshing plan performance data:', error);
      toast.error("Failed to update plan performance data. Please try again.");
    }
  }, [refetchPlanData, refreshMutation]);

  // Auto-refresh functionality with intelligent intervals
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000); // Refresh every minute when auto-refresh is enabled
    
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  // Enhanced plan performance metrics with advanced business intelligence
  const planMetrics = useMemo(() => {
    if (!planData || !Array.isArray(planData) || planData.length === 0) {
      return {
        totalPlans: 0,
        totalSubscriptions: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        averageRevenue: 0,
        bestPerformingPlan: null,
        worstPerformingPlan: null,
        conversionRate: 0,
        churnRate: 0,
        growthRate: 0,
        healthScore: 'good' as const,
        marketShare: []
      };
    }

    const totalSubscriptions = planData.reduce((sum, plan) => sum + (plan.totalSubscriptions || 0), 0);
    const totalRevenue = planData.reduce((sum, plan) => sum + (plan.totalRevenue || 0), 0);
    const activeSubscriptions = planData.reduce((sum, plan) => sum + (plan.activeSubscriptions || 0), 0);
    
    const conversionRate = totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0;
    const churnRate = totalSubscriptions > 0 ? ((totalSubscriptions - activeSubscriptions) / totalSubscriptions) * 100 : 0;
    const averageRevenue = planData.length > 0 ? totalRevenue / planData.length : 0;

    // Find best and worst performing plans
    const bestPerformingPlan = planData.reduce((best, current) => 
      (current.totalRevenue || 0) > (best.totalRevenue || 0) ? current : best
    );

    const worstPerformingPlan = planData.reduce((worst, current) => 
      (current.totalRevenue || 0) < (worst.totalRevenue || 0) ? current : worst
    );

    // Calculate health score based on conversion rate and revenue
    let healthScore: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (conversionRate > 80 && totalRevenue > averageRevenue * planData.length) healthScore = 'excellent';
    else if (conversionRate < 40) healthScore = 'critical';
    else if (conversionRate < 60) healthScore = 'warning';

    // Calculate market share for each plan
    const marketShare = planData.map(plan => ({
      ...plan,
      marketSharePercent: totalSubscriptions > 0 ? (plan.totalSubscriptions / totalSubscriptions) * 100 : 0,
      revenueSharePercent: totalRevenue > 0 ? (plan.totalRevenue / totalRevenue) * 100 : 0
    }));

    return {
      totalPlans: planData.length,
      totalSubscriptions,
      totalRevenue,
      activeSubscriptions,
      averageRevenue,
      bestPerformingPlan,
      worstPerformingPlan,
      conversionRate,
      churnRate,
      growthRate: 0, // To be calculated when trend data is available
      healthScore,
      marketShare
    };
  }, [planData]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Plan Performance', href: '#', active: true }
  ];

  const handleExport = () => {
    planExportMutation.mutate({
      from: dateRangeValue.from.toISOString().split('T')[0],
      to: dateRangeValue.to.toISOString().split('T')[0],
      format: 'xlsx',
      includeDetails: true
    });
  };

  if (hasError) {
    return (
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Plan Performance Analytics"
          description="Revenue and growth analysis by subscription plan"
          breadcrumbs={breadcrumbs}
        >
          <ErrorBoundary>
            <ApiErrorHandler 
              error={planError || statsError} 
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
        title="Plan Performance Analytics"
        description="Comprehensive revenue and growth analysis by subscription plan"
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
              disabled={planExportMutation.isPending || isRefreshing}
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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    Plan Performance Analytics Dashboard
                  </span>
                </div>
                <Badge variant={planMetrics?.healthScore === 'excellent' ? 'default' : 
                              planMetrics?.healthScore === 'good' ? 'secondary' :
                              planMetrics?.healthScore === 'warning' ? 'outline' : 'destructive'}>
                  {planMetrics?.healthScore === 'excellent' ? 'Excellent Performance' :
                   planMetrics?.healthScore === 'good' ? 'Good Performance' :
                   planMetrics?.healthScore === 'warning' ? 'Needs Optimization' : 'Critical Issues'}
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
            {/* Enhanced Plan Performance Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isRefreshing ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))
              ) : (
                <>
                  {/* Total Plans */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Plans</CardTitle>
                      <FileText className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {planMetrics?.totalPlans || 0}
                      </div>
                      <p className="text-xs text-purple-600 font-medium">
                        Active subscription plans
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Revenue */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${planMetrics?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        From all subscription plans
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Subscriptions */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Subscriptions</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {planMetrics?.totalSubscriptions?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        All subscription sign-ups
                      </p>
                    </CardContent>
                  </Card>

                  {/* Conversion Rate */}
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/10" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Conversion Rate</CardTitle>
                      <Target className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        {planMetrics?.conversionRate?.toFixed(1) || '0.0'}%
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">
                        Active subscription rate
                      </p>
                    </CardContent>
                  </Card>

                  {/* Additional metrics for detailed view */}
                  {showDetails && (
                    <>
                      {/* Average Revenue */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Revenue/Plan</CardTitle>
                          <BarChart3 className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                            ${planMetrics?.averageRevenue?.toFixed(2) || '0.00'}
                          </div>
                          <p className="text-xs text-orange-600 font-medium">
                            Per subscription plan
                          </p>
                        </CardContent>
                      </Card>

                      {/* Churn Rate */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Churn Rate</CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                            {planMetrics?.churnRate?.toFixed(1) || '0.0'}%
                          </div>
                          <p className="text-xs text-red-600 font-medium">
                            Subscription cancellation rate
                          </p>
                        </CardContent>
                      </Card>

                      {/* Best Performing Plan */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Top Performer</CardTitle>
                          <Award className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100 truncate">
                            {planMetrics?.bestPerformingPlan?.planName || 'N/A'}
                          </div>
                          <p className="text-xs text-yellow-600 font-medium">
                            Highest revenue generator
                          </p>
                        </CardContent>
                      </Card>

                      {/* Health Score */}
                      <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/10 dark:to-teal-800/10" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Health Score</CardTitle>
                          {planMetrics?.healthScore === 'excellent' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                           planMetrics?.healthScore === 'good' ? <CheckCircle className="h-4 w-4 text-blue-600" /> :
                           planMetrics?.healthScore === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                           <AlertCircle className="h-4 w-4 text-red-600" />}
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="text-lg font-bold text-teal-900 dark:text-teal-100 capitalize">
                            {planMetrics?.healthScore || 'Good'}
                          </div>
                          <Progress 
                            value={
                              planMetrics?.healthScore === 'excellent' ? 100 :
                              planMetrics?.healthScore === 'good' ? 75 :
                              planMetrics?.healthScore === 'warning' ? 50 : 25
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

          {/* Plan Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance Details</CardTitle>
              <CardDescription>
                Detailed performance metrics for each subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : planData && planData.length > 0 ? (
                <div className="space-y-4">
                  {planData.map((plan, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-sm text-muted-foreground">Plan ID: {plan._id}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{plan.totalSubscriptions}</div>
                          <div className="text-xs text-muted-foreground">Total Subscriptions</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{plan.activeSubscriptions}</div>
                          <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatCurrency(plan.totalRevenue)}</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {plan.totalSubscriptions > 0 ? ((plan.activeSubscriptions / plan.totalSubscriptions) * 100).toFixed(1) : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Active Rate</div>
                        </div>
                        
                        <div>
                          <Progress 
                            value={planMetrics?.totalSubscriptions ? (plan.totalSubscriptions / planMetrics.totalSubscriptions) * 100 : 0} 
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {planMetrics?.totalSubscriptions ? ((plan.totalSubscriptions / planMetrics.totalSubscriptions) * 100).toFixed(1) : 0}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No plan performance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {!isRefreshing && planData && planData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {planData
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 3)
                    .map((plan, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.activeSubscriptions} active subscriptions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(plan.totalRevenue)}</div>
                          <div className="text-sm text-muted-foreground">revenue</div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Best Conversion Rate</span>
                    <span className="font-medium">
                      {planData
                        .reduce((best, current) => 
                          (current.activeSubscriptions / (current.totalSubscriptions || 1)) > 
                          (best.activeSubscriptions / (best.totalSubscriptions || 1)) ? current : best
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Highest Revenue</span>
                    <span className="font-medium">
                      {planData
                        .reduce((highest, current) => 
                          current.totalRevenue > highest.totalRevenue ? current : highest
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Most Popular</span>
                    <span className="font-medium">
                      {planData
                        .reduce((popular, current) => 
                          current.totalSubscriptions > popular.totalSubscriptions ? current : popular
                        ).planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Revenue per Plan</span>
                    <span className="font-medium">
                      ${planMetrics?.averageRevenue?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </ErrorBoundary>
      </BillingDashboardShell>
    </div>
  );
}