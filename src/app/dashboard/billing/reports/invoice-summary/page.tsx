// app/dashboard/billing/reports/invoice-summary/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useInvoiceSummary } from '@/hooks/use-billing-reports';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from '@/types/billing-reports';

export default function InvoiceSummaryPage() {
  const [dateRange, setDateRange] = useState('30d');

  // Calculate date range based on selection
  const getDateRange = (): DateRange => {
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
      default:
        start.setDate(now.getDate() - 30);
        break;
    }
    
    return { from: start, to: now };
  };

  const { data: invoiceSummary, isLoading, error } = useInvoiceSummary(getDateRange());

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Reports', href: '/dashboard/billing/reports' },
    { label: 'Invoice Summary', href: '#', active: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'void': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FileText className="h-4 w-4" />;
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'draft': return <Calendar className="h-4 w-4" />;
      case 'void': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen">
        <BillingDashboardShell
          title="Invoice Summary"
          description="Invoice status and payment tracking"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center text-red-600 py-8">
            Failed to load invoice summary data. Please try again.
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BillingDashboardShell
        title="Invoice Summary"
        description="Invoice status and payment tracking"
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
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Invoice Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
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
                    <div className="text-2xl font-bold">{invoiceSummary?.totalInvoices || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Generated in period
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
                      Invoice value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {invoiceSummary?.statusBreakdown?.paid?.percentage?.toFixed(1) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Invoices paid
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Breakdown</CardTitle>
              <CardDescription>
                Distribution of invoices by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div>
                          <Skeleton className="h-4 w-16 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : invoiceSummary?.statusBreakdown ? (
                <div className="space-y-4">
                  {Object.entries(invoiceSummary.statusBreakdown).map(([status, data]: [string, any]) => (
                    <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{status}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.count} invoices • {data.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(data.amount)}</div>
                        <Progress 
                          value={data.percentage} 
                          className="w-20 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No invoice data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          {!isLoading && invoiceSummary && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Collection Rate</span>
                    <span className="font-medium text-green-600">
                      {invoiceSummary.statusBreakdown?.paid?.percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Outstanding Amount</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(invoiceSummary.statusBreakdown?.open?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Invoice Value</span>
                    <span className="font-medium">
                      {formatCurrency((invoiceSummary.totalAmount || 0) / (invoiceSummary.totalInvoices || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Processed Invoices</span>
                    <span className="font-medium">
                      {((invoiceSummary.statusBreakdown?.paid?.count || 0) + 
                        (invoiceSummary.statusBreakdown?.void?.count || 0))} / {invoiceSummary.totalInvoices}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Most Common Status</span>
                    <span className="font-medium">
                      <Badge variant="outline" className="capitalize">
                        {Object.entries(invoiceSummary.statusBreakdown || {})
                          .reduce((max: { status: string; data: any }, [status, data]: [string, any]) => 
                            (data.count > (max.data?.count || 0)) ? { status, data } : max, 
                            { status: '', data: { count: 0 } }
                          ).status || 'N/A'}
                      </Badge>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Value Paid</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoiceSummary.statusBreakdown?.paid?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Collection</span>
                    <span className="font-medium text-yellow-600">
                      {invoiceSummary.statusBreakdown?.open?.count || 0} invoices
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Processing Status</span>
                    <span className="font-medium text-blue-600">
                      {invoiceSummary.totalInvoices > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common invoice management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>View All Invoices</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Payment Reports</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Overdue Invoices</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Download className="h-6 w-6" />
                  <span>Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </BillingDashboardShell>
    </div>
  );
}