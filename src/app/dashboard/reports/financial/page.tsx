'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { DataTable } from '@/components/reports/DataTable';
import { useRevenueReport, useSubscriptionReport, useExportUserReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Percent, BarChart3, ArrowUp, ArrowDown, Minus, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { FinancialErrorBoundary } from './error-boundary';

function FinancialReportsContent() {
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
    isLoading: revenueLoading, 
    error: revenueError,
    refetch: refetchRevenue
  } = useRevenueReport(revenueParams);
  
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscriptions
  } = useSubscriptionReport(revenueParams);

  const exportMutation = useExportUserReport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportMutation.mutateAsync({
        reportType: 'financial' as any,
        params: revenueParams,
        format
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetchRevenue();
    refetchSubscriptions();
  };

  const hasError = revenueError || subscriptionError;
  const isLoading = revenueLoading || subscriptionLoading;

  // Calculate summary metrics
  const totalRevenue = revenueData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const totalSubscriptions = revenueData?.reduce((sum: number, item: any) => sum + item.subscriptions, 0) || 0;
  const avgGrowthRate = revenueData?.length ? 
    revenueData.reduce((sum: number, item: any) => sum + item.growth, 0) / revenueData.length : 0;
  
  const totalMRR = subscriptionData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
  const avgSubscriptionGrowth = subscriptionData?.length ?
    subscriptionData.reduce((sum: number, item: any) => sum + item.growth, 0) / subscriptionData.length : 0;

  const tableColumns = [
    { key: 'period', label: 'Date' },
    { key: 'revenue', label: 'Revenue', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'Transactions' },
    { key: 'growth', label: 'Growth %', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Financial Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Revenue analytics, subscription metrics, and financial performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Real-time Data Status */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{hasError ? 'Connection Error' : 'Live Financial Data'}</span>
        </div>
        <span>•</span>
        <span>Auto-refresh: 5min</span>
        <span>•</span>
        <span>Period: {dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` : 
          'Last 30 days'
        }</span>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load financial data: {(revenueError || subscriptionError)?.message}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : hasError ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {avgGrowthRate >= 0 ? 
                    <ArrowUp className="w-3 h-3 mr-1 text-green-500" /> :
                    <ArrowDown className="w-3 h-3 mr-1 text-red-500" />
                  }
                  {avgGrowthRate > 0 ? '+' : ''}{avgGrowthRate.toFixed(1)}% from last period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Monthly MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : hasError ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {avgSubscriptionGrowth >= 0 ? 
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> :
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  }
                  {avgSubscriptionGrowth > 0 ? '+' : ''}{avgSubscriptionGrowth.toFixed(1)}% growth rate
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : hasError ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalSubscriptions.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3 h-3 mr-1 text-purple-500" />
                  Total for selected period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4 text-orange-500" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : hasError ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${totalSubscriptions > 0 ? (totalRevenue / totalSubscriptions).toFixed(0) : '0'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {(totalRevenue / Math.max(totalSubscriptions, 1)) >= 100 ?
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> :
                    <Percent className="w-3 h-3 mr-1 text-orange-500" />
                  }
                  Per transaction
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart 
        data={revenueData || []} 
        isLoading={revenueLoading}
        title="Revenue Trend Analysis"
        description="Daily revenue performance and growth trends"
      />

      {/* Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Details</CardTitle>
            <CardDescription>
              Daily revenue breakdown and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading revenue data...
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <DataTable 
                data={revenueData} 
                columns={tableColumns}
                searchable={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
            <CardDescription>
              MRR trends and subscription growth analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading subscription data...
              </div>
            ) : subscriptionData && subscriptionData.length > 0 ? (
              <DataTable 
                data={subscriptionData.map((item: any) => ({
                  ...item,
                  revenue: Math.round(item.revenue) // Format MRR as whole numbers
                }))} 
                columns={[
                  { key: 'period', label: 'Period' },
                  { key: 'revenue', label: 'MRR', format: (value: number) => `$${value.toLocaleString()}` },
                  { key: 'subscriptions', label: 'New Subs' },
                  { key: 'growth', label: 'Growth %', format: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
                ]}
                searchable={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subscription data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Revenue Insights
            </CardTitle>
            <CardDescription>Key performance indicators and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : hasError ? (
              <p className="text-muted-foreground">Unable to load revenue insights</p>
            ) : revenueData && revenueData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  {avgGrowthRate >= 0 ? 
                    <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" /> :
                    <TrendingDown className="w-4 h-4 mt-0.5 text-red-500" />
                  }
                  <span>Revenue trend: <strong>{avgGrowthRate > 0 ? 'Growing' : avgGrowthRate < 0 ? 'Declining' : 'Stable'}</strong> at {Math.abs(avgGrowthRate).toFixed(1)}% rate</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Peak revenue day: <strong>${Math.max(...(revenueData?.map((d: any) => d.revenue) || [0])).toLocaleString()}</strong> maximum daily revenue</span>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Average daily revenue: <strong>${(totalRevenue / (revenueData?.length || 1)).toFixed(0)}</strong> per day</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Analysis period: <strong>{revenueData?.length || 0}</strong> days of financial data</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No revenue insights available for the selected period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Business Performance
            </CardTitle>
            <CardDescription>Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : hasError ? (
              <p className="text-muted-foreground">Unable to load business performance metrics</p>
            ) : subscriptionData && subscriptionData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  {avgSubscriptionGrowth >= 0 ? 
                    <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" /> :
                    <TrendingDown className="w-4 h-4 mt-0.5 text-red-500" />
                  }
                  <span>MRR growth rate: <strong>{avgSubscriptionGrowth > 0 ? '+' : ''}{avgSubscriptionGrowth.toFixed(1)}%</strong> {avgSubscriptionGrowth >= 10 ? '(Excellent)' : avgSubscriptionGrowth >= 5 ? '(Good)' : '(Needs improvement)'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Revenue predictability: <strong>{totalMRR > 0 ? 'High' : 'Low'}</strong> (${totalMRR.toLocaleString()} MRR base)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Transaction volume: <strong>{totalSubscriptions.toLocaleString()}</strong> transactions processed</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Revenue efficiency: <strong>${(totalRevenue / Math.max(totalSubscriptions, 1)).toFixed(2)}</strong> average per transaction</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No business performance data available for the selected period</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FinancialReportsPage() {
  return (
    <FinancialErrorBoundary>
      <FinancialReportsContent />
    </FinancialErrorBoundary>
  );
}