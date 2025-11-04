// app/dashboard/billing/invoices/overdue/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { InvoicesTable } from '@/components/billing/invoices-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Send, DollarSign, Calendar, Mail, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { useInvoices, useMarkInvoiceAsPaid, useVoidInvoice, useSendInvoice, useDownloadInvoice } from '@/hooks/use-invoices';
import { formatCurrency, isInvoiceOverdue, cn } from '@/lib/utils';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';
import { toast } from 'sonner';

export default function OverdueInvoicesPage() {
  // State management
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'send' | 'void' | 'markPaid' | null;
    invoiceIds: string[];
  }>({
    isOpen: false,
    type: null,
    invoiceIds: [],
  });

  // Enhanced API query for overdue invoices with proper filtering
  const { data: invoicesData, isLoading, error, refetch } = useInvoices({ 
    status: 'open',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    pageSize: 100 // Get more overdue invoices for analysis
  });
  
  // Mutations
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const voidMutation = useVoidInvoice();
  const sendMutation = useSendInvoice();
  const downloadMutation = useDownloadInvoice();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices' },
    { label: 'Overdue', href: '#', active: true }
  ];

  // Enhanced overdue filtering with real-time data
  const overdueInvoices = useMemo(() => {
    if (!invoicesData?.data) return [];
    return invoicesData.data.filter(invoice => isInvoiceOverdue(invoice));
  }, [invoicesData?.data]);

  // Overdue analytics with memoization for performance
  const overdueAnalytics = useMemo(() => {
    const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
    
    const averageOverdueDays = overdueInvoices.length > 0 
      ? overdueInvoices.reduce((sum, invoice) => {
          if (!invoice.dueDate) return sum;
          const dueDate = typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;
          const overdueDays = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.max(0, overdueDays);
        }, 0) / overdueInvoices.length
      : 0;

    const rangeCounts = {
      under100: overdueInvoices.filter(inv => inv.amountDue < 10000).length,
      between100And500: overdueInvoices.filter(inv => inv.amountDue >= 10000 && inv.amountDue < 50000).length,
      over500: overdueInvoices.filter(inv => inv.amountDue >= 50000).length,
    };

    return { totalOverdue, averageOverdueDays, rangeCounts };
  }, [overdueInvoices]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(overdueInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  // Single invoice actions
  const handleMarkPaid = async (invoiceId: string, amount: number) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        amount,
        date: new Date(),
      });
      toast.success('Invoice marked as paid');
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark invoice as paid';
      toast.error(errorMessage);
    }
  };

  const handleVoid = async (invoiceId: string) => {
    try {
      await voidMutation.mutateAsync(invoiceId);
      toast.success('Invoice voided successfully');
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to void invoice';
      toast.error(errorMessage);
    }
  };

  const handleSend = async (invoiceId: string) => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      toast.success('Reminder sent successfully');
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reminder';
      toast.error(errorMessage);
    }
  };

  const handleDownload = async (invoiceId: string) => {
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
  };

  // Bulk actions
  const handleBulkSendReminders = async () => {
    if (selectedInvoices.length === 0) return;
    
    setBulkActionLoading(true);
    let successful = 0;
    let failed = 0;

    for (const invoiceId of selectedInvoices) {
      try {
        await sendMutation.mutateAsync(invoiceId);
        successful++;
      } catch (error) {
        failed++;
      }
    }

    setBulkActionLoading(false);
    setSelectedInvoices([]);
    setConfirmDialog({ isOpen: false, type: null, invoiceIds: [] });
    
    if (successful > 0) {
      toast.success(`Successfully sent ${successful} reminder(s)`);
    }
    if (failed > 0) {
      toast.error(`Failed to send ${failed} reminder(s)`);
    }
    
    refetch();
  };

  const handleBulkVoid = async () => {
    if (selectedInvoices.length === 0) return;
    
    setBulkActionLoading(true);
    let successful = 0;
    let failed = 0;

    for (const invoiceId of selectedInvoices) {
      try {
        await voidMutation.mutateAsync(invoiceId);
        successful++;
      } catch (error) {
        failed++;
      }
    }

    setBulkActionLoading(false);
    setSelectedInvoices([]);
    setConfirmDialog({ isOpen: false, type: null, invoiceIds: [] });
    
    if (successful > 0) {
      toast.success(`Successfully voided ${successful} invoice(s)`);
    }
    if (failed > 0) {
      toast.error(`Failed to void ${failed} invoice(s)`);
    }
    
    refetch();
  };

  const openBulkConfirmation = (type: 'send' | 'void' | 'markPaid') => {
    setConfirmDialog({
      isOpen: true,
      type,
      invoiceIds: selectedInvoices,
    });
  };

  return (
    <ErrorBoundary>
      <BillingDashboardShell
        title="Overdue Invoices"
        description="Manage and track overdue customer invoices"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            {selectedInvoices.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openBulkConfirmation('send')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Reminders ({selectedInvoices.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => openBulkConfirmation('void')}
                  disabled={bulkActionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Void Selected
                </Button>
              </>
            )}
            <Button 
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
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
                  <h4 className="font-medium mb-1">Failed to load overdue invoices</h4>
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
          {overdueInvoices.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedInvoices.length === overdueInvoices.length && overdueInvoices.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium">
                      {selectedInvoices.length > 0 
                        ? `${selectedInvoices.length} of ${overdueInvoices.length} selected`
                        : `Select all ${overdueInvoices.length} overdue invoices`
                      }
                    </span>
                  </div>
                  {selectedInvoices.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Total selected: {formatCurrency(
                        overdueInvoices
                          .filter(inv => selectedInvoices.includes(inv.id))
                          .reduce((sum, inv) => sum + inv.amountDue, 0)
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Summary with Loading States */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">
                  Total Overdue
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-red-800">
                    {formatCurrency(overdueAnalytics.totalOverdue)}
                  </div>
                )}
                {isLoading ? (
                  <Skeleton className="h-3 w-32" />
                ) : (
                  <p className="text-xs text-red-600">
                    Across {overdueInvoices.length} invoices
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Invoices
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{overdueInvoices.length}</div>
                )}
                {isLoading ? (
                  <Skeleton className="h-3 w-24" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Overdue Days
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{Math.round(overdueAnalytics.averageOverdueDays)}</div>
                )}
                {isLoading ? (
                  <Skeleton className="h-3 w-28" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Days overdue on average
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Analytics */}
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-28" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {overdueAnalytics.rangeCounts.under100} under $100
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {overdueAnalytics.rangeCounts.between100And500} $100-$500
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {overdueAnalytics.rangeCounts.over500} over $500
              </Badge>
            </div>
          )}

          {/* Overdue Invoices Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : overdueInvoices.length > 0 ? (
            <InvoicesTable
              data={overdueInvoices}
              pagination={{ page: 1, pageSize: 20, total: overdueInvoices.length }}
              filters={{ status: 'open' }}
              onFiltersChange={() => {}}
              onMarkPaid={handleMarkPaid}
              onVoid={handleVoid}
              onSend={handleSend}
              onDownload={handleDownload}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Overdue Invoices</h3>
                <p className="text-muted-foreground mb-6">
                  Great job! All invoices are up to date and paid on time.
                </p>
                <Button onClick={() => window.location.href = '/dashboard/billing/invoices'}>
                  View All Invoices
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bulk Action Confirmation Dialog */}
          <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => 
            setConfirmDialog({ ...confirmDialog, isOpen: open })
          }>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmDialog.type === 'send' && 'Send Reminders'}
                  {confirmDialog.type === 'void' && 'Void Invoices'}
                  {confirmDialog.type === 'markPaid' && 'Mark as Paid'}
                </DialogTitle>
                <DialogDescription>
                  {confirmDialog.type === 'send' && 
                    `Send payment reminders for ${confirmDialog.invoiceIds.length} overdue invoice(s)?`
                  }
                  {confirmDialog.type === 'void' && 
                    `This will void ${confirmDialog.invoiceIds.length} invoice(s). This action cannot be undone.`
                  }
                  {confirmDialog.type === 'markPaid' && 
                    `Mark ${confirmDialog.invoiceIds.length} invoice(s) as paid?`
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
                    if (confirmDialog.type === 'send') handleBulkSendReminders();
                    if (confirmDialog.type === 'void') handleBulkVoid();
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
                      {confirmDialog.type === 'send' && 'Send Reminders'}
                      {confirmDialog.type === 'void' && 'Void Invoices'}
                      {confirmDialog.type === 'markPaid' && 'Mark as Paid'}
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