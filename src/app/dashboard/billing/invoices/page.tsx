// app/dashboard/billing/invoices/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { InvoicesTable } from '@/components/billing/invoices-table';
import { InvoiceFilters } from '@/components/billing/invoice-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw, Download, Send, XCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useInvoices, useMarkInvoiceAsPaid, useVoidInvoice, useSendInvoice, useDownloadInvoice } from '@/hooks/use-invoices';
import { InvoiceStatus, DateRange } from '@/types/billing';
import { toast } from 'sonner';
import { isInvoiceOverdue, formatCurrency } from '@/lib/utils';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';

export default function InvoicesPage() {
  // Enhanced state management
  const [filters, setFilters] = useState({
    status: undefined as InvoiceStatus | undefined,
    search: '',
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    dateRange: undefined as DateRange | undefined,
  });

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'send' | 'void' | 'download' | null;
    invoiceIds: string[];
  }>({
    isOpen: false,
    type: null,
    invoiceIds: [],
  });

  // Enhanced API query with real-time updates
  const { data: invoicesData, isLoading, error, refetch, isFetching } = useInvoices(filters);
  
  // Mutations with enhanced error handling
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const voidMutation = useVoidInvoice();
  const sendMutation = useSendInvoice();
  const downloadMutation = useDownloadInvoice();

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!bulkActionLoading && !isFetching) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, bulkActionLoading, isFetching]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices', active: true }
  ];

  // Enhanced filter handling with real-time updates
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset to first page on filter change
    }));
    setSelectedInvoices([]); // Clear selections on filter change
  }, []);

  // Selection handlers for bulk operations
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoicesData?.data?.map(inv => inv.id) || []);
    } else {
      setSelectedInvoices([]);
    }
  }, [invoicesData?.data]);

  const handleSelectInvoice = useCallback((invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  }, []);

  // Enhanced single invoice actions with professional error handling
  const handleMarkPaid = useCallback(async (invoiceId: string, amount: number) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        amount,
        date: new Date(),
      });
      toast.success('Invoice marked as paid');
      refetch(); // Refresh data after action
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark invoice as paid';
      toast.error(errorMessage);
    }
  }, [markAsPaidMutation, refetch]);

  const handleVoid = useCallback(async (invoiceId: string) => {
    try {
      await voidMutation.mutateAsync(invoiceId);
      toast.success('Invoice voided successfully');
      refetch(); // Refresh data after action
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to void invoice';
      toast.error(errorMessage);
    }
  }, [voidMutation, refetch]);

  const handleSend = useCallback(async (invoiceId: string) => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      toast.success('Invoice sent successfully');
      refetch(); // Refresh data after action
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invoice';
      toast.error(errorMessage);
    }
  }, [sendMutation, refetch]);

  const handleDownload = useCallback(async (invoiceId: string) => {
    try {
      const blob = await downloadMutation.mutateAsync(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download invoice';
      toast.error(errorMessage);
    }
  }, [downloadMutation]);

  // Bulk operation handlers
  const handleBulkAction = useCallback(async (action: 'send' | 'void' | 'download') => {
    if (selectedInvoices.length === 0) return;
    
    setBulkActionLoading(true);
    let successful = 0;
    let failed = 0;

    for (const invoiceId of selectedInvoices) {
      try {
        if (action === 'send') {
          await sendMutation.mutateAsync(invoiceId);
        } else if (action === 'void') {
          await voidMutation.mutateAsync(invoiceId);
        } else if (action === 'download') {
          const blob = await downloadMutation.mutateAsync(invoiceId);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoiceId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        successful++;
      } catch (error) {
        failed++;
      }
    }

    setBulkActionLoading(false);
    setSelectedInvoices([]);
    setConfirmDialog({ isOpen: false, type: null, invoiceIds: [] });
    
    if (successful > 0) {
      const actionPastTense = action === 'send' ? 'sent' : action === 'void' ? 'voided' : 'downloaded';
      toast.success(`Successfully ${actionPastTense} ${successful} invoice(s)`);
    }
    if (failed > 0) {
      const actionPastTense = action === 'send' ? 'send' : action === 'void' ? 'void' : 'download';
      toast.error(`Failed to ${actionPastTense} ${failed} invoice(s)`);
    }
    
    if (action !== 'download') {
      refetch(); // Refresh data after modifying actions
    }
  }, [selectedInvoices, sendMutation, voidMutation, downloadMutation, refetch]);

  const openBulkConfirmation = useCallback((type: 'send' | 'void' | 'download') => {
    setConfirmDialog({
      isOpen: true,
      type,
      invoiceIds: selectedInvoices,
    });
  }, [selectedInvoices]);

  // Enhanced invoice statistics with memoization and real-time calculation
  const invoiceStats = useMemo(() => {
    if (!invoicesData?.data) {
      return {
        total: 0,
        draft: 0,
        open: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        overdueAmount: 0,
      };
    }

    const invoices = invoicesData.data;
    
    return {
      total: invoices.length,
      draft: invoices.filter(i => i.status === 'draft').length,
      open: invoices.filter(i => i.status === 'open').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => isInvoiceOverdue(i)).length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amountPaid, 0),
      overdueAmount: invoices.filter(i => isInvoiceOverdue(i)).reduce((sum, inv) => sum + inv.amountDue, 0),
    };
  }, [invoicesData?.data]);

  // Enhanced pagination metadata
  const paginationInfo = useMemo(() => {
    const pagination = invoicesData?.pagination;
    if (!pagination) return null;

    return {
      ...pagination,
      hasNextPage: pagination.page < (pagination.totalPages || Math.ceil(pagination.total / pagination.pageSize)),
      hasPrevPage: pagination.page > 1,
      startItem: ((pagination.page - 1) * pagination.pageSize) + 1,
      endItem: Math.min(pagination.page * pagination.pageSize, pagination.total),
    };
  }, [invoicesData?.pagination]);

  return (
    <ErrorBoundary>
      <BillingDashboardShell
        title="Invoices"
        description="Manage and track customer invoices with real-time data"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            {selectedInvoices.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openBulkConfirmation('send')}
                  disabled={bulkActionLoading}
                  size="sm"
                >
                  {bulkActionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send ({selectedInvoices.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openBulkConfirmation('download')}
                  disabled={bulkActionLoading}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => openBulkConfirmation('void')}
                  disabled={bulkActionLoading}
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Void
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={isLoading || isFetching}
              size="sm"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Link href="/dashboard/billing/invoices/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Professional Error Handling */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <h4 className="font-medium mb-1">Failed to load invoices</h4>
                  <p className="text-sm">
                    <ApiErrorHandler error={error} />
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => refetch()}
                  >
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Selection Controls */}
          {invoicesData?.data && invoicesData.data.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedInvoices.length === invoicesData.data.length && invoicesData.data.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium">
                      {selectedInvoices.length > 0 
                        ? `${selectedInvoices.length} of ${invoicesData.data.length} selected`
                        : `Select all ${invoicesData.data.length} invoices`
                      }
                    </span>
                    {paginationInfo && (
                      <Badge variant="outline">
                        Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.total}
                      </Badge>
                    )}
                  </div>
                  {selectedInvoices.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Total selected: {formatCurrency(
                        invoicesData.data
                          .filter(inv => selectedInvoices.includes(inv.id))
                          .reduce((sum, inv) => sum + inv.amountDue, 0)
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Invoice Filters */}
          <InvoiceFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={invoicesData?.pagination?.total}
            filteredCount={invoicesData?.data?.length}
          />

          {/* Enhanced Invoice Statistics with Loading States */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Total Invoices */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{invoiceStats.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(invoiceStats.totalAmount)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Draft Invoices */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Draft</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{invoiceStats.draft}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Invoices */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold">{invoiceStats.open}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Invoices */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{invoiceStats.paid}</p>
                        <p className="text-xs text-green-600">
                          {formatCurrency(invoiceStats.paidAmount)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-red-600">{invoiceStats.overdue}</p>
                        <p className="text-xs text-red-600">
                          {formatCurrency(invoiceStats.overdueAmount)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Invoices Table */}
          {isLoading && !invoicesData ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <InvoicesTable
              data={invoicesData?.data || []}
              pagination={invoicesData?.pagination || { page: 1, pageSize: 10, total: 0 }}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onMarkPaid={handleMarkPaid}
              onVoid={handleVoid}
              onSend={handleSend}
              onDownload={handleDownload}
              isLoading={isLoading}
            />
          )}

          {/* Bulk Action Confirmation Dialog */}
          <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => 
            setConfirmDialog({ ...confirmDialog, isOpen: open })
          }>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmDialog.type === 'send' && 'Send Invoices'}
                  {confirmDialog.type === 'void' && 'Void Invoices'}
                  {confirmDialog.type === 'download' && 'Download Invoices'}
                </DialogTitle>
                <DialogDescription>
                  {confirmDialog.type === 'send' && 
                    `Send ${confirmDialog.invoiceIds.length} selected invoice(s) to customers?`
                  }
                  {confirmDialog.type === 'void' && 
                    `This will void ${confirmDialog.invoiceIds.length} invoice(s). This action cannot be undone.`
                  }
                  {confirmDialog.type === 'download' && 
                    `Download ${confirmDialog.invoiceIds.length} selected invoice(s) as PDF files?`
                  }
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setConfirmDialog({ isOpen: false, type: null, invoiceIds: [] })}
                  disabled={bulkActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmDialog.type === 'void' ? 'destructive' : 'default'}
                  onClick={() => {
                    if (confirmDialog.type) {
                      handleBulkAction(confirmDialog.type);
                    }
                  }}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmDialog.type === 'send' && 'Send Invoices'}
                      {confirmDialog.type === 'void' && 'Void Invoices'}
                      {confirmDialog.type === 'download' && 'Download Invoices'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </BillingDashboardShell>
    </ErrorBoundary>
  );
}