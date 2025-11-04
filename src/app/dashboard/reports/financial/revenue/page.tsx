'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { DataTable } from '@/components/reports/DataTable';
import { useRevenueReport, useExportUserReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { TrendingUp, DollarSign, BarChart3, Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import RevenueErrorBoundary from '@/components/errors/RevenueErrorBoundary';


export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const revenueParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { 
    data: revenueData, 
    isLoading, 
    error: revenueError, 
    refetch: refetchRevenueData,
    isRefetching
  } = useRevenueReport(revenueParams);

  const exportMutation = useExportUserReport();

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      await exportMutation.mutateAsync({
        reportType: 'activity', // Use activity as the base type for revenue exports
        params: revenueParams,
        format,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetchRevenueData();
  };

  const tableColumns = [
    { key: 'period', label: 'Period' },
    { key: 'revenue', label: 'Revenue', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'Transactions' },
    { key: 'growth', label: 'Growth', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
  ];

  // Calculate metrics
  const totalRevenue = revenueData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const totalTransactions = revenueData?.reduce((sum: number, item: any) => sum + item.subscriptions, 0) || 0;
  const avgDailyRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;
  const peakRevenue = Math.max(...(revenueData?.map((d: any) => d.revenue) || [0]));
  const latestGrowth = revenueData?.[revenueData.length - 1]?.growth || 0;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <RevenueErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
              {isLoading || isRefetching ? (
                <Badge variant="secondary" className="animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              ) : revenueError ? (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              ) : (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Real-time revenue analysis and trends from API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportControls onExport={handleExport} />
          </div>
        </div>

        {/* Error Alert */}
        {revenueError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load revenue data</AlertTitle>
            <AlertDescription>
              {revenueError instanceof Error ? revenueError.message : 'Unable to fetch revenue analytics. Please try refreshing the page.'}
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    {latestGrowth > 0 && (
                      <Badge variant="secondary" className="text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{latestGrowth}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For selected period from API
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Daily Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    ${avgDailyRevenue.toFixed(0)}
                    <Badge variant="outline" className={avgDailyRevenue > 1000 ? 'text-green-600' : avgDailyRevenue > 500 ? 'text-yellow-600' : 'text-gray-600'}>
                      {avgDailyRevenue > 1000 ? 'High' : avgDailyRevenue > 500 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily average from real data
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    ${peakRevenue.toLocaleString()}
                    <div className={`w-2 h-2 rounded-full ${peakRevenue > avgDailyRevenue * 2 ? 'bg-green-500' : peakRevenue > avgDailyRevenue * 1.5 ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Highest single day revenue
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-18" />
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${latestGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {latestGrowth > 0 ? '+' : ''}{latestGrowth}%
                    {latestGrowth >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 rotate-180 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Latest period growth trend
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Revenue Trend
                  {revenueData?.length && (
                    <Badge variant="outline">
                      {revenueData.length} data points
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Daily revenue performance from real API data
                </CardDescription>
              </div>
              {!isLoading && revenueData?.length > 0 && (
                <Button
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh Chart
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {revenueError ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-red-600 mb-2">Chart Loading Failed</p>
                <p className="text-muted-foreground mb-4">Unable to load revenue chart data</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <RevenueChart 
                data={revenueData || []} 
                isLoading={isLoading}
                title="Revenue Performance"
                description="Real-time revenue analysis"
              />
            )}
          </CardContent>
        </Card>

        {/* Detailed Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Revenue Data
                  {revenueData?.length && (
                    <Badge variant="outline">
                      {revenueData.length} records
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Detailed revenue metrics from real API endpoints
                </CardDescription>
              </div>
              {!isLoading && revenueData?.length > 0 && (
                <Button
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span className="text-muted-foreground">Loading revenue data from API...</span>
                </div>
                {/* Loading skeleton for table */}
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex space-x-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : revenueError ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-red-600 mb-2">Failed to Load Data</p>
                <p className="text-muted-foreground mb-4">
                  {revenueError instanceof Error ? revenueError.message : 'Unable to fetch revenue data'}
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Displaying {revenueData.length} revenue data points from API
                  </p>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Real Data
                  </Badge>
                </div>
                <DataTable 
                  data={revenueData.map((item: any) => ({
                    ...item,
                    period: item.period || format(new Date(item.date || Date.now()), 'MMM dd, yyyy')
                  }))} 
                  columns={tableColumns}
                  searchable={true}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No Revenue Data</p>
                <p className="text-sm text-muted-foreground mb-4">
                  No revenue data available for the selected date range
                </p>
                <Button onClick={() => setDateRange({ from: addDays(new Date(), -90), to: new Date() })} variant="outline">
                  Try Larger Date Range
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary and Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Revenue Summary
                <Badge variant="outline" className={totalRevenue > 50000 ? 'text-green-600' : totalRevenue > 25000 ? 'text-yellow-600' : 'text-gray-600'}>
                  {totalRevenue > 50000 ? 'High' : totalRevenue > 25000 ? 'Medium' : 'Low'}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time revenue metrics from API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span>Total Revenue:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        ${totalRevenue.toLocaleString()}
                      </span>
                      {latestGrowth > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Daily:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        ${avgDailyRevenue.toFixed(2)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${avgDailyRevenue > 1000 ? 'bg-green-500' : avgDailyRevenue > 500 ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value:</span>
                    <span className="font-semibold">
                      ${avgOrderValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Growth Rate:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${latestGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {latestGrowth > 0 ? '+' : ''}{latestGrowth}%
                      </span>
                      <div className={`w-2 h-2 rounded-full ${latestGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Performance Insights
                <Badge variant="secondary">
                  {revenueData?.length || 0} Data Points
                </Badge>
              </CardTitle>
              <CardDescription>AI-powered revenue analytics from real data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${latestGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>Revenue trend: <strong>{latestGrowth >= 0 ? 'Positive' : 'Negative'}</strong> growth ({latestGrowth}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span>Peak revenue: <strong>${peakRevenue.toLocaleString()}</strong> highest single day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span>Total transactions: <strong>{totalTransactions.toLocaleString()}</strong> processed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${avgDailyRevenue > 1000 ? 'bg-green-500' : avgDailyRevenue > 500 ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    <span>Revenue consistency: <strong>{avgDailyRevenue > 0 ? 'Active' : 'No activity'}</strong> (${avgDailyRevenue.toFixed(0)}/day)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Performance status: <strong>{latestGrowth > 5 ? 'Excellent' : latestGrowth > 0 ? 'Good' : 'Needs attention'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>API data coverage: <strong>{revenueData?.length || 0} periods</strong> analyzed</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RevenueErrorBoundary>
  );
}