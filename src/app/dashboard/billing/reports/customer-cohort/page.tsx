// app/dashboard/billing/reports/customer-cohort/page.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, Users, TrendingUp, Calendar, RefreshCw, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useCustomerCohort, useExportCohortReport } from '@/hooks/use-billing-reports';
import { ErrorBoundary } from '@/components/error-boundary';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { toast } from 'sonner';

export default function CustomerCohortPage() {
  const [cohortType, setCohortType] = useState<'weekly' | 'monthly'>('monthly');
  const [periods, setPeriods] = useState(12);
  const [showPercentages, setShowPercentages] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { 
    data: cohortData, 
    isLoading, 
    error,
    refetch: refetchCohortData,
    isRefetching
  } = useCustomerCohort(cohortType, periods);

  const exportCohortMutation = useExportCohortReport();

  // Memoized calculations for cohort statistics
  const cohortStatistics = useMemo(() => {
    if (!cohortData || cohortData.length === 0) {
      return {
        totalCohorts: 0,
        avgRetention: 0,
        latestCohortSize: 0,
        latestCohortPeriod: 'No data',
        totalCustomers: 0,
        bestPerformingCohort: null,
        retentionTrend: 'No data'
      };
    }

    const totalCohorts = cohortData.length;
    const totalCustomers = cohortData.reduce((sum: number, cohort: any) => sum + cohort.customers, 0);
    
    // Calculate average retention for first period (index 1)
    const validRetentions = cohortData
      .filter((cohort: any) => cohort.retention?.[1] !== undefined)
      .map((cohort: any) => cohort.retention[1]);
    const avgRetention = validRetentions.length > 0 
      ? validRetentions.reduce((sum, val) => sum + val, 0) / validRetentions.length 
      : 0;

    // Find best performing cohort
    const bestPerformingCohort = cohortData.reduce((best: any, current: any) => 
      (current.retention?.[1] || 0) > (best.retention?.[1] || 0) ? current : best
    );

    // Latest cohort info
    const latestCohort = cohortData[cohortData.length - 1];
    
    // Calculate retention trend (comparing first 3 periods vs last 3 periods)
    const firstThreeAvg = cohortData.slice(0, 3)
      .reduce((sum, cohort: any) => sum + (cohort.retention?.[1] || 0), 0) / Math.min(3, cohortData.length);
    const lastThreeAvg = cohortData.slice(-3)
      .reduce((sum, cohort: any) => sum + (cohort.retention?.[1] || 0), 0) / Math.min(3, cohortData.length);
    
    const retentionTrend = lastThreeAvg > firstThreeAvg ? 'Improving' : 
                          lastThreeAvg < firstThreeAvg ? 'Declining' : 'Stable';

    return {
      totalCohorts,
      avgRetention: Number(avgRetention.toFixed(1)),
      latestCohortSize: latestCohort?.customers || 0,
      latestCohortPeriod: latestCohort?.period || 'No data',
      totalCustomers,
      bestPerformingCohort,
      retentionTrend
    };
  }, [cohortData]);

  // Handle data refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLastRefresh(new Date());
      await refetchCohortData();
      toast.success('Customer cohort data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh cohort data');
    }
  }, [refetchCohortData]);

  // Handle export functionality
  const handleExport = useCallback(async () => {
    try {
      await exportCohortMutation.mutateAsync({
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        format: 'xlsx',
        includeDetails: true
      });
      toast.success('Cohort report exported successfully');
    } catch (error) {
      toast.error('Failed to export cohort report');
    }
  }, [exportCohortMutation]);

  // Handle period type change
  const handleCohortTypeChange = useCallback((value: 'weekly' | 'monthly') => {
    setCohortType(value);
    toast.info(`Cohort analysis switched to ${value} view`);
  }, []);

  // Handle period count change
  const handlePeriodsChange = useCallback((value: string) => {
    setPeriods(parseInt(value));
    toast.info(`Analysis period updated to ${value} periods`);
  }, []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Customer Cohort', href: '#', active: true }
  ];

  if (error) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen">
          <BillingDashboardShell
            title="Customer Cohort Analysis"
            description="Customer retention and lifetime value analysis"
            breadcrumbs={breadcrumbs}
          >
            <ApiErrorHandler 
              error={error}
              onRetry={handleRefresh}
              variant="page"
              fallbackMessage="Unable to load customer cohort data. This could be due to server issues or connectivity problems."
            />
          </BillingDashboardShell>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Customer Cohort Analysis"
          description="Customer retention and lifetime value analysis with real-time insights"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2 flex-wrap">
              <Select value={cohortType} onValueChange={handleCohortTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periods.toString()} onValueChange={handlePeriodsChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Periods</SelectItem>
                  <SelectItem value="12">12 Periods</SelectItem>
                  <SelectItem value="24">24 Periods</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowPercentages(!showPercentages)}
                size="sm"
              >
                {showPercentages ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {showPercentages ? 'Hide %' : 'Show %'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefetching}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                disabled={exportCohortMutation.isPending}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportCohortMutation.isPending ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          }
        >
        <div className="space-y-6">
          {/* Real-time Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={error ? 'destructive' : 'default'} className="gap-1">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                {error ? 'Disconnected' : 'Live Data'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {cohortStatistics.totalCustomers.toLocaleString()} Total Customers
              </span>
            </div>
          </div>

          {/* Enhanced Cohort Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cohortStatistics.totalCohorts}</div>
                    <p className="text-xs text-muted-foreground">
                      Customer groups analyzed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Retention</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${
                      cohortStatistics.avgRetention >= 70 ? 'text-green-500' :
                      cohortStatistics.avgRetention >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cohortStatistics.avgRetention}%</div>
                    <p className="text-xs text-muted-foreground">
                      First period retention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Cohort</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cohortStatistics.latestCohortSize}</div>
                    <p className="text-xs text-muted-foreground">
                      {cohortStatistics.latestCohortPeriod}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Retention Trend</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${
                      cohortStatistics.retentionTrend === 'Improving' ? 'text-green-500' :
                      cohortStatistics.retentionTrend === 'Declining' ? 'text-red-500' : 'text-blue-500'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cohortStatistics.retentionTrend}</div>
                    <p className="text-xs text-muted-foreground">
                      Overall trajectory
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Enhanced Cohort Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cohort Retention Analysis</CardTitle>
                  <CardDescription>
                    Real-time customer retention rates by cohort period
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!isLoading && cohortData && (
                    <Badge variant="outline">
                      {cohortData.length} cohorts
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              ) : cohortData && cohortData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold">Cohort Period</th>
                        <th className="text-left p-3 font-semibold">Customers</th>
                        {Array.from({ length: Math.min(periods, 12) }, (_, i) => (
                          <th key={i} className="text-center p-3 font-semibold">
                            {cohortType === 'monthly' ? `Month ${i}` : `Week ${i}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((cohort: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-muted/25 transition-colors">
                          <td className="p-3 font-medium">{cohort.period}</td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {cohort.customers.toLocaleString()}
                            </Badge>
                          </td>
                          {Array.from({ length: Math.min(periods, 12) }, (_, i) => (
                            <td key={i} className="p-3 text-center">
                              {cohort.retention?.[i] !== undefined ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span 
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      cohort.retention[i] >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
                                      cohort.retention[i] >= 50 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      cohort.retention[i] >= 25 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-red-100 text-red-800 border border-red-200'
                                    }`}
                                  >
                                    {showPercentages ? `${cohort.retention[i].toFixed(1)}%` : 
                                     Math.round((cohort.retention[i] / 100) * cohort.customers)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cohort Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    There's no customer cohort data to display. This could be because there are no subscriptions yet or the data is still being processed.
                  </p>
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Cohort Insights */}
          {!isLoading && cohortData && cohortData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Retention Performance
                  </CardTitle>
                  <CardDescription>Key insights from cohort analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Best Performing Cohort</span>
                    <Badge variant="default">
                      {cohortStatistics.bestPerformingCohort?.period || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Best Retention Rate</span>
                    <span className="font-semibold text-green-600">
                      {cohortStatistics.bestPerformingCohort?.retention?.[1]?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Cohort Size</span>
                    <span className="font-semibold">
                      {Math.round(cohortStatistics.totalCustomers / cohortStatistics.totalCohorts).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Retention Health</span>
                    <Badge variant={
                      cohortStatistics.retentionTrend === 'Improving' ? 'default' :
                      cohortStatistics.retentionTrend === 'Declining' ? 'destructive' : 'secondary'
                    }>
                      {cohortStatistics.retentionTrend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analysis Summary
                  </CardTitle>
                  <CardDescription>Current analysis parameters and scope</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Customers</span>
                    <span className="font-semibold">
                      {cohortStatistics.totalCustomers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Analysis Period</span>
                    <span className="font-semibold">
                      {cohortData[0]?.period} - {cohortData[cohortData.length - 1]?.period}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cohort Type</span>
                    <Badge variant="outline" className="capitalize">
                      {cohortType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Display Mode</span>
                    <Badge variant="outline">
                      {showPercentages ? 'Percentages' : 'Absolute Numbers'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </BillingDashboardShell>
    </div>
    </ErrorBoundary>
  );
}