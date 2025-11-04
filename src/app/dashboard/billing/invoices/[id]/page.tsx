// app/dashboard/billing/invoices/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Check, 
  FileText, 
  User, 
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Eye,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  useInvoice, 
  useMarkInvoicePaid, 
  useVoidInvoice, 
  useSendInvoice, 
  useDownloadInvoice 
} from '@/hooks/useBilling';
import { useSubscriber } from '@/hooks/useSubscribers';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { RoleBasedAccess } from '@/components/role-based-access';
import { ErrorBoundary } from '@/components/error-boundary';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  // Role-based access control
  const userRole = 'super_admin';
  const requiredRoles = ['super_admin', 'finance_admin', 'billing_admin'];
  
  // State management
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  
  // API hooks with proper error handling
  const { 
    data: invoice, 
    isLoading: invoiceLoading, 
    error: invoiceError,
    refetch: refetchInvoice 
  } = useInvoice(invoiceId);
  
  // Get customer info if available
  const { 
    data: customer, 
    isLoading: customerLoading 
  } = useSubscriber(invoice?.userId || '');
  
  // Mutations
  const markAsPaidMutation = useMarkInvoicePaid();
  const voidMutation = useVoidInvoice();
  const sendMutation = useSendInvoice();
  const downloadMutation = useDownloadInvoice();

  // Helper functions
  const isInvoiceOverdue = (invoice: any) => {
    if (invoice.status === 'paid' || invoice.status === 'voided') return false;
    if (!invoice.dueDate) return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const getInvoiceNumber = (invoice: any) => {
    return `INV-${invoice.id.slice(-8).toUpperCase()}`;
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices' },
    { label: invoice ? getInvoiceNumber(invoice) : 'Loading...', href: '#', active: true }
  ];

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice', {
        description: error?.message || 'Please try again later'
      });
    }
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      toast.success('Invoice sent successfully');
      refetchInvoice();
    } catch (error: any) {
      console.error('Send failed:', error);
      toast.error('Failed to send invoice', {
        description: error?.message || 'Please try again later'
      });
    }
  };

  const handleMarkPaid = () => {
    setShowMarkPaidDialog(true);
  };

  const confirmMarkPaid = async () => {
    try {
      await markAsPaidMutation.mutateAsync({
        invoiceId,
        amount: invoice?.amount || 0,
        date: new Date(),
      });
      toast.success('Invoice marked as paid');
      refetchInvoice();
      setShowMarkPaidDialog(false);
    } catch (error: any) {
      console.error('Mark as paid failed:', error);
      toast.error('Failed to mark invoice as paid', {
        description: error?.message || 'Please try again later'
      });
    }
  };

  const handleVoidInvoice = () => {
    setShowVoidDialog(true);
  };

  const confirmVoidInvoice = async () => {
    try {
      await voidMutation.mutateAsync(invoiceId);
      toast.success('Invoice voided successfully');
      refetchInvoice();
      setShowVoidDialog(false);
    } catch (error: any) {
      console.error('Void failed:', error);
      toast.error('Failed to void invoice', {
        description: error?.message || 'Please try again later'
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const isLoading = invoiceLoading || customerLoading;

  if (isLoading) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <BillingDashboardShell
            title="Loading..."
            description="Loading invoice details"
            breadcrumbs={breadcrumbs}
          >
            <LoadingSkeleton />
          </BillingDashboardShell>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  if (invoiceError) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <BillingDashboardShell
            title="Error Loading Invoice"
            description="Failed to load invoice details"
            breadcrumbs={breadcrumbs}
          >
            <ApiErrorHandler 
              error={invoiceError}
              onRetry={() => refetchInvoice()}
              variant="page"
              fallbackMessage="Failed to load invoice details"
            />
          </BillingDashboardShell>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  if (!invoice) {
    return (
      <BillingDashboardShell
        title="Invoice Not Found"
        description="The requested invoice could not be found"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-12">
          <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/billing/invoices">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </BillingDashboardShell>
    );
  }

  return (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <BillingDashboardShell
          title={getInvoiceNumber(invoice)}
          description={`Invoice for ${customer?.firstName} ${customer?.lastName}` || 'Invoice details'}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownload} 
                disabled={downloadMutation.isPending}
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>
              {invoice.status === 'draft' && (
                <Button 
                  variant="outline" 
                  onClick={handleSend} 
                  disabled={sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              )}
              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                <Button 
                  onClick={handleMarkPaid} 
                  disabled={markAsPaidMutation.isPending}
                >
                  {markAsPaidMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Mark Paid
                </Button>
              )}
              {(invoice.status !== 'paid' && invoice.status !== 'voided') && (
                <Button 
                  variant="destructive" 
                  onClick={handleVoidInvoice} 
                  disabled={voidMutation.isPending}
                >
                  {voidMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Void
                </Button>
              )}
              <Link href="/dashboard/billing/invoices">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          }
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Invoice Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Invoice Details</span>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      isInvoiceOverdue(invoice) ? 'destructive' : 
                      invoice.status === 'overdue' ? 'destructive' :
                      'outline'
                    }>
                      {isInvoiceOverdue(invoice) ? 'overdue' : invoice.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created on {formatDate(invoice.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Bill To
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      {customer ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email}
                          </div>
                          {customer.company && (
                            <div className="text-sm text-muted-foreground">
                              {customer.company}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading customer information...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issue Date
                      </h4>
                      <div className="text-sm">
                        {formatDate(invoice.issueDate || invoice.createdAt)}
                      </div>
                    </div>
                    {invoice.dueDate && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due Date
                        </h4>
                        <div className={`text-sm ${isInvoiceOverdue(invoice) ? 'text-red-600 font-medium' : ''}`}>
                          {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                    )}
                    {invoice.paidDate && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Paid Date
                        </h4>
                        <div className="text-sm text-green-700">
                          {formatDate(invoice.paidDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Invoice Items
                    </h3>
                    {invoice.items && invoice.items.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr className="border-b">
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-right p-3 font-medium">Qty</th>
                              <th className="text-right p-3 font-medium">Unit Price</th>
                              <th className="text-right p-3 font-medium">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.items.map((item, index) => (
                              <tr key={index} className="border-b last:border-b-0 hover:bg-muted/30">
                                <td className="p-3">
                                  <div className="font-medium">{item.description}</div>
                                </td>
                                <td className="p-3 text-right">{item.quantity}</td>
                                <td className="p-3 text-right">
                                  {formatCurrency(item.unitPrice, invoice.currency)}
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {formatCurrency(item.amount, invoice.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No items found for this invoice</p>
                      </div>
                    )}
                  </div>

                  {/* Invoice Summary */}
                  <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-3 bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Total Amount:</span>
                        <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' :
                          isInvoiceOverdue(invoice) ? 'destructive' : 
                          invoice.status === 'overdue' ? 'destructive' :
                          'outline'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Amount Due:</span>
                          <span className={
                            invoice.status === 'paid' ? 'text-green-600' : 
                            isInvoiceOverdue(invoice) ? 'text-red-600' : 
                            'text-foreground'
                          }>
                            {invoice.status === 'paid' ? 
                              formatCurrency(0, invoice.currency) : 
                              formatCurrency(invoice.amount, invoice.currency)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Invoice Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDownload}
                    disabled={downloadMutation.isPending}
                  >
                    {downloadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadMutation.isPending ? 'Downloading...' : 'Download PDF'}
                  </Button>
                  
                  {invoice.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleSend}
                      disabled={sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {sendMutation.isPending ? 'Sending...' : 'Send to Customer'}
                    </Button>
                  )}
                  
                  {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                    <Button 
                      className="w-full" 
                      onClick={handleMarkPaid}
                      disabled={markAsPaidMutation.isPending}
                    >
                      {markAsPaidMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {markAsPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
                    </Button>
                  )}
                  
                  {(invoice.status !== 'paid' && invoice.status !== 'voided') && (
                    <Button 
                      variant="destructive"
                      className="w-full" 
                      onClick={handleVoidInvoice}
                      disabled={voidMutation.isPending}
                    >
                      {voidMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {voidMutation.isPending ? 'Voiding...' : 'Void Invoice'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Invoice Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={
                        invoice.status === 'paid' ? 'default' :
                        isInvoiceOverdue(invoice) || invoice.status === 'overdue' ? 'destructive' : 
                        'outline'
                      }>
                        {isInvoiceOverdue(invoice) && invoice.status !== 'paid' ? 'overdue' : invoice.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Currency</span>
                      <span className="font-medium uppercase">
                        {invoice.currency}
                      </span>
                    </div>
                    
                    {invoice.paidDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Paid On</span>
                        <span className="text-sm text-green-600 font-medium">
                          {formatDate(invoice.paidDate)}
                        </span>
                      </div>
                    )}
                    
                    {invoice.description && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Description</span>
                        <p className="text-sm mt-1">{invoice.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Subscription Link */}
              {invoice.subscriptionId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Related Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/dashboard/subscriptions/${invoice.subscriptionId}`}>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Subscription
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Confirmation Dialogs */}
          <AlertDialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark Invoice as Paid</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to mark this invoice as paid? This action will update the invoice status and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={markAsPaidMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmMarkPaid}
                  disabled={markAsPaidMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {markAsPaidMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Mark as Paid'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Void Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to void this invoice? This action cannot be undone and will mark the invoice as cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={voidMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmVoidInvoice}
                  disabled={voidMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {voidMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Voiding...
                    </>
                  ) : (
                    'Void Invoice'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </BillingDashboardShell>
      </RoleBasedAccess>
    </ErrorBoundary>
  );
}