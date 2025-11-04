// app/dashboard/billing/reports/invoice-summary/page.tsx
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
import { Download, FileText, DollarSign, Calendar, AlertTriangle, RefreshCw, TrendingUp, Eye, BarChart3, CheckCircle, Clock, XCircle, FileX } from 'lucide-react';
import { useInvoiceSummary, useExportInvoicesReport, useRefreshBillingReports } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';
import { ErrorBoundary } from '@/components/error-boundary';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { toast } from 'sonner';

export default function InvoiceSummaryPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Calculate date range based on selection
  const getDateRange = useCallback((): DateRange => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
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
      default:
        start.setDate(now.getDate() - 30);
        break;
    }
    
    return { from: start, to: now };
  }, [dateRange]);

  const { 
    data: invoiceSummary, 
    isLoading, 
    error,
    refetch: refetchInvoiceSummary,
    isRefetching
  } = useInvoiceSummary(getDateRange());

  const exportInvoicesMutation = useExportInvoicesReport();
  const refreshBillingReportsMutation = useRefreshBillingReports();

  // Enhanced analytics calculations
  const invoiceAnalytics = useMemo(() => {
    if (!invoiceSummary || !invoiceSummary.statusBreakdown) {
      return {
        collectionRate: 0,
        outstandingAmount: 0,
        averageInvoiceValue: 0,
        processedInvoices: 0,
        totalPaidAmount: 0,
        pendingCount: 0,
        mostCommonStatus: 'N/A',
        paymentEfficiency: 0,
        healthScore: 0,
        trendsData: null
      };
    }

    const breakdown = invoiceSummary.statusBreakdown;
    const collectionRate = breakdown.paid?.percentage || 0;
    const outstandingAmount = breakdown.open?.amount || 0;
    const averageInvoiceValue = (invoiceSummary.totalAmount || 0) / (invoiceSummary.totalInvoices || 1);
    const processedInvoices = (breakdown.paid?.count || 0) + (breakdown.void?.count || 0);
    const totalPaidAmount = breakdown.paid?.amount || 0;
    const pendingCount = breakdown.open?.count || 0;
    
    // Find most common status
    const mostCommonStatus = Object.entries(breakdown)
      .reduce((max: { status: string; count: number }, [status, data]: [string, any]) => 
        (data.count > max.count) ? { status, count: data.count } : max, 
        { status: 'N/A', count: 0 }
      ).status;

    // Calculate payment efficiency (paid invoices / total invoices)
    const paymentEfficiency = invoiceSummary.totalInvoices > 0 
      ? ((breakdown.paid?.count || 0) / invoiceSummary.totalInvoices) * 100 
      : 0;

    // Calculate health score based on multiple factors
    const healthScore = Math.min(100, Math.max(0, 
      (collectionRate * 0.4) + 
      (paymentEfficiency * 0.3) + 
      ((invoiceSummary.totalInvoices > 0 ? 100 : 0) * 0.2) +
      (((breakdown.draft?.count || 0) === 0 ? 100 : 50) * 0.1)
    ));

    return {
      collectionRate,
      outstandingAmount,
      averageInvoiceValue,
      processedInvoices,
      totalPaidAmount,
      pendingCount,
      mostCommonStatus,
      paymentEfficiency,
      healthScore,
      trendsData: breakdown
    };
  }, [invoiceSummary]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(async () => {
      await refetchInvoiceSummary();
      setLastRefresh(new Date());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, refetchInvoiceSummary]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLastRefresh(new Date());
      await refetchInvoiceSummary();
      toast.success('Invoice summary data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh invoice data');
    }
  }, [refetchInvoiceSummary]);

  // Handle export functionality
  const handleExport = useCallback(async () => {
    try {
      const currentDateRange = getDateRange();
      await exportInvoicesMutation.mutateAsync({
        from: currentDateRange.from.toISOString(),
        to: currentDateRange.to.toISOString(),
        format: 'xlsx',
        includeDetails: true
      });
      toast.success('Invoice summary report exported successfully');
    } catch (error) {
      toast.error('Failed to export invoice report');
    }
  }, [exportInvoicesMutation, getDateRange]);

  // Handle date range change
  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
    toast.info(`Date range updated to ${value === '7d' ? '7 days' : value === '30d' ? '30 days' : value === '90d' ? '90 days' : value === '6m' ? '6 months' : '1 year'}`);
  }, []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Invoice Summary', href: '#', active: true }
  ];

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'paid': return 'text-green-700 bg-green-50 border-green-200';
      case 'open': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'draft': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'void': return 'text-red-700 bg-red-50 border-red-200';
      case 'overdue': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'open': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'void': return <XCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileX className="h-4 w-4" />;
    }
  }, []);

  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'open': return 'secondary';
      case 'draft': return 'outline';
      case 'void': return 'destructive';
      default: return 'secondary';
    }
  }, []);

  if (error) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen">
          <BillingDashboardShell
            title="Invoice Summary"
            description="Real-time invoice status and payment tracking"
            breadcrumbs={breadcrumbs}
          >
            <ApiErrorHandler 
              error={error}
              onRetry={handleRefresh}
              variant="page"
              fallbackMessage="Unable to load invoice summary data. This could be due to server issues or connectivity problems."
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
          title="Invoice Summary"
          description="Real-time invoice status and payment tracking with analytics"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2 flex-wrap">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto' : 'Manual'}
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
                disabled={exportInvoicesMutation.isPending}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportInvoicesMutation.isPending ? 'Exporting...' : 'Export'}
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
              {autoRefresh && (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Auto-refresh active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Health Score: {invoiceAnalytics.healthScore.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Enhanced Invoice Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoiceSummary?.totalInvoices?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Generated in {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : dateRange === '6m' ? '6 months' : '1 year'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(invoiceSummary?.totalAmount || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total invoice value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${
                      invoiceAnalytics.collectionRate >= 90 ? 'text-green-500' :
                      invoiceAnalytics.collectionRate >= 70 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoiceAnalytics.collectionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Invoices paid
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                    <AlertTriangle className={`h-4 w-4 ${
                      invoiceAnalytics.pendingCount === 0 ? 'text-green-500' :
                      invoiceAnalytics.pendingCount < 10 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(invoiceAnalytics.outstandingAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                      {invoiceAnalytics.pendingCount} pending invoices
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Enhanced Status Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Status Breakdown</CardTitle>
                  <CardDescription>
                    Real-time distribution of invoices by status with analytics
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!isLoading && invoiceSummary && (
                    <Badge variant="outline">
                      {Object.keys(invoiceSummary.statusBreakdown || {}).length} statuses
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-20 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : invoiceSummary?.statusBreakdown ? (
                <div className="space-y-4">
                  {Object.entries(invoiceSummary.statusBreakdown)
                    .sort(([,a], [,b]) => (b as any).count - (a as any).count)
                    .map(([status, data]: [string, any]) => (
                    <div key={status} className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${getStatusColor(status)}`}>
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-white/50">
                          {getStatusIcon(status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize">{status}</span>
                            <Badge variant={getStatusBadgeVariant(status)}>
                              {data.count}
                            </Badge>
                          </div>
                          <div className="text-sm opacity-75">
                            {data.count.toLocaleString()} invoices • {data.percentage.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(data.amount)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={data.percentage} 
                            className="w-24"
                          />
                          <span className="text-xs font-medium">
                            {data.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Invoice Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no invoices in the selected time period. Try adjusting the date range or check back later.
                  </p>
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Analytics Dashboard */}
          {!isLoading && invoiceSummary && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Payment Performance
                  </CardTitle>
                  <CardDescription>Key financial metrics and collection efficiency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Collection Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        invoiceAnalytics.collectionRate >= 90 ? 'text-green-600' :
                        invoiceAnalytics.collectionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {invoiceAnalytics.collectionRate.toFixed(1)}%
                      </span>
                      <Badge variant={
                        invoiceAnalytics.collectionRate >= 90 ? 'default' :
                        invoiceAnalytics.collectionRate >= 70 ? 'secondary' : 'destructive'
                      }>
                        {invoiceAnalytics.collectionRate >= 90 ? 'Excellent' :
                         invoiceAnalytics.collectionRate >= 70 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Outstanding Amount</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(invoiceAnalytics.outstandingAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Invoice Value</span>
                    <span className="font-bold">
                      {formatCurrency(invoiceAnalytics.averageInvoiceValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Efficiency</span>
                    <span className="font-bold text-blue-600">
                      {invoiceAnalytics.paymentEfficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health Score</span>
                      <span className="font-medium">{invoiceAnalytics.healthScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={invoiceAnalytics.healthScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Business Insights
                  </CardTitle>
                  <CardDescription>Invoice analytics and operational metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Most Common Status</span>
                    <Badge variant="outline" className="capitalize">
                      {invoiceAnalytics.mostCommonStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Collected</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(invoiceAnalytics.totalPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Invoices</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-yellow-600">
                        {invoiceAnalytics.pendingCount}
                      </span>
                      {invoiceAnalytics.pendingCount === 0 && (
                        <Badge variant="default">All Clear!</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processing Status</span>
                    <Badge variant={invoiceSummary.totalInvoices > 0 ? 'default' : 'secondary'}>
                      {invoiceSummary.totalInvoices > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Freshness</span>
                    <span className="text-sm text-muted-foreground">
                      {autoRefresh ? 'Real-time' : 'Manual refresh'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Streamline your invoice management workflow
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Live Actions
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span>View All Invoices</span>
                      {invoiceSummary && (
                        <Badge variant="secondary" className="text-xs">
                          {invoiceSummary.totalInvoices}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>All Invoices</DialogTitle>
                      <DialogDescription>
                        Navigate to the complete invoice listing page to view, filter, and manage all invoices.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button>Go to Invoices</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-200"
                  onClick={() => toast.info('Navigating to payment reports...')}
                >
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span>Payment Reports</span>
                  {invoiceSummary && (
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(invoiceAnalytics.totalPaidAmount)}
                    </Badge>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-orange-50 hover:border-orange-200"
                  onClick={() => toast.info('Showing overdue invoices...')}
                >
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <span>Overdue Invoices</span>
                  {invoiceSummary && (
                    <Badge variant="destructive" className="text-xs">
                      {invoiceAnalytics.pendingCount}
                    </Badge>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
                  onClick={handleExport}
                  disabled={exportInvoicesMutation.isPending}
                >
                  <Download className="h-6 w-6 text-purple-600" />
                  <span>
                    {exportInvoicesMutation.isPending ? 'Exporting...' : 'Export Data'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Excel
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </BillingDashboardShell>
    </div>
    </ErrorBoundary>
  );
}