// app/dashboard/subscribers/[id]/billing/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  CreditCard,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriber } from '@/hooks/useSubscribers';
import {
  useSubscriberBillingSummary,
  useSubscriberInvoices,
  useSubscriberPaymentMethods,
  useDownloadInvoice,
  useRemovePaymentMethod,
  useUpdatePaymentMethod,
  useMarkInvoicePaid,
  useVoidInvoice,
  useSendInvoice
} from '@/hooks/useBilling';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { RoleBasedAccess } from '@/components/role-based-access';
import { ErrorBoundary } from '@/components/error-boundary';
import { toast } from 'sonner';

export default function BillingPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Mock user role - replace with actual auth
  const userRole = 'super_admin';
  const requiredRoles = ['super_admin', 'finance_admin', 'support'];
  
  // State management
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isInvoiceActionDialogOpen, setIsInvoiceActionDialogOpen] = useState(false);
  const [invoiceAction, setInvoiceAction] = useState<'mark-paid' | 'void' | 'send' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(new Set());
  const [processingInvoices, setProcessingInvoices] = useState<Set<string>>(new Set());
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [methodToRemove, setMethodToRemove] = useState<any>(null);
  const [removingPaymentMethod, setRemovingPaymentMethod] = useState(false);
  
  // API hooks with proper error handling
  const { 
    data: subscriber, 
    isLoading: subscriberLoading, 
    error: subscriberError, 
    refetch: refetchSubscriber 
  } = useSubscriber(id);
  
  const { 
    data: billingSummary, 
    isLoading: summaryLoading, 
    error: summaryError, 
    refetch: refetchSummary 
  } = useSubscriberBillingSummary(id);
  
  const { 
    data: invoicesData, 
    isLoading: invoicesLoading, 
    error: invoicesError, 
    refetch: refetchInvoices 
  } = useSubscriberInvoices(id, { 
    page: currentPage, 
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const { 
    data: paymentMethods, 
    isLoading: paymentMethodsLoading, 
    error: paymentMethodsError, 
    refetch: refetchPaymentMethods 
  } = useSubscriberPaymentMethods(id);
  
  // Action hooks
  const downloadInvoice = useDownloadInvoice();
  const removePaymentMethod = useRemovePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const markInvoicePaid = useMarkInvoicePaid();
  const voidInvoice = useVoidInvoice();
  const sendInvoice = useSendInvoice();

  const getInvoiceStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      voided: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const getInvoiceStatusIcon = (status: string) => {
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      open: Eye,
      failed: XCircle,
      voided: XCircle,
      overdue: AlertCircle,
      draft: FileText,
    };
    const Icon = icons[status as keyof typeof icons] || icons.draft;
    return <Icon className="h-4 w-4" />;
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoice.mutateAsync(invoiceId);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error("Failed to download invoice", {
        description: error?.message || "Please try again later"
      });
    }
  };

  const handleInvoiceAction = async (invoiceId: string, action: 'mark-paid' | 'void' | 'send') => {
    try {
      switch (action) {
        case 'mark-paid':
          await markInvoicePaid.mutateAsync({ 
            invoiceId, 
            amount: invoicesData?.invoices.find(inv => inv.id === invoiceId)?.amount || 0 
          });
          toast.success("Invoice marked as paid");
          break;
        case 'void':
          await voidInvoice.mutateAsync(invoiceId);
          toast.success("Invoice voided successfully");
          break;
        case 'send':
          await sendInvoice.mutateAsync(invoiceId);
          toast.success("Invoice sent successfully");
          break;
      }
      setIsInvoiceActionDialogOpen(false);
      setSelectedInvoice(null);
      setInvoiceAction(null);
      refetchInvoices();
    } catch (error: any) {
      console.error(`${action} failed:`, error);
      toast.error(`Failed to ${action} invoice`, {
        description: error?.message || "Please try again later"
      });
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      await removePaymentMethod.mutateAsync({ userId: id, paymentMethodId });
      toast.success("Payment method removed successfully");
      setIsRemoveDialogOpen(false);
      setSelectedPaymentMethod(null);
      refetchPaymentMethods();
    } catch (error: any) {
      console.error('Remove failed:', error);
      toast.error("Failed to remove payment method", {
        description: error?.message || "Please try again later"
      });
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await updatePaymentMethod.mutateAsync({ 
        userId: id, 
        paymentMethodId, 
        updates: { isDefault: true } 
      });
      toast.success("Default payment method updated");
      refetchPaymentMethods();
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error("Failed to update payment method", {
        description: error?.message || "Please try again later"
      });
    }
  };

  // Additional handler functions for enhanced invoice management
  const handleSendInvoice = async (invoiceId: string) => {
    setProcessingInvoices(prev => new Set([...prev, invoiceId]));
    try {
      await sendInvoice.mutateAsync(invoiceId);
      toast.success("Invoice sent successfully");
    } catch (error: any) {
      console.error('Send failed:', error);
      toast.error("Failed to send invoice", {
        description: error?.message || "Please try again later"
      });
    } finally {
      setProcessingInvoices(prev => {
        const updated = new Set(prev);
        updated.delete(invoiceId);
        return updated;
      });
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    setProcessingInvoices(prev => new Set([...prev, invoiceId]));
    try {
      const invoice = invoicesData?.invoices.find(inv => inv.id === invoiceId);
      await markInvoicePaid.mutateAsync({ 
        invoiceId, 
        amount: invoice?.amount || 0 
      });
      toast.success("Invoice marked as paid");
      refetchInvoices();
    } catch (error: any) {
      console.error('Mark as paid failed:', error);
      toast.error("Failed to mark invoice as paid", {
        description: error?.message || "Please try again later"
      });
    } finally {
      setProcessingInvoices(prev => {
        const updated = new Set(prev);
        updated.delete(invoiceId);
        return updated;
      });
    }
  };

  const handleVoidInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setShowVoidDialog(true);
  };

  const confirmVoidInvoice = async () => {
    if (!selectedInvoice) return;
    
    setProcessingInvoices(prev => new Set([...prev, selectedInvoice]));
    try {
      await voidInvoice.mutateAsync(selectedInvoice);
      toast.success("Invoice voided successfully");
      refetchInvoices();
      setShowVoidDialog(false);
      setSelectedInvoice(null);
    } catch (error: any) {
      console.error('Void failed:', error);
      toast.error("Failed to void invoice", {
        description: error?.message || "Please try again later"
      });
    } finally {
      setProcessingInvoices(prev => {
        const updated = new Set(prev);
        updated.delete(selectedInvoice);
        return updated;
      });
    }
  };

  const confirmRemovePaymentMethod = async () => {
    if (!methodToRemove) return;
    
    setRemovingPaymentMethod(true);
    try {
      await removePaymentMethod.mutateAsync(methodToRemove.id);
      toast.success("Payment method removed successfully");
      refetchPaymentMethods();
      setShowRemoveDialog(false);
      setMethodToRemove(null);
    } catch (error: any) {
      console.error('Remove failed:', error);
      toast.error("Failed to remove payment method", {
        description: error?.message || "Please try again later"
      });
    } finally {
      setRemovingPaymentMethod(false);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const isLoading = subscriberLoading || summaryLoading;

  // Early return for loading state
  if (isLoading) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <LoadingSkeleton />
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  // Error state
  if (subscriberError) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <ApiErrorHandler 
              error={subscriberError}
              onRetry={refetchSubscriber}
              variant="page"
              fallbackMessage="Failed to load subscriber billing information"
            />
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  if (!subscriber) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Subscriber Not Found</h2>
              <p className="text-muted-foreground text-center mb-6">
                The subscriber you're looking for could not be found or you don't have permission to view their billing information.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/subscribers">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subscribers
                  </Button>
                </Link>
                <Button onClick={() => refetchSubscriber()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/subscribers/${id}`}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Billing Information</h1>
                <p className="text-muted-foreground">
                  Payment methods and billing history for {subscriber?.firstName} {subscriber?.lastName}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(summaryLoading || invoicesLoading || paymentMethodsLoading) && (
                <Button variant="ghost" size="sm" disabled>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => {
                  refetchSummary();
                  refetchInvoices();
                  refetchPaymentMethods();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Methods */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Saved payment methods and billing details
                  </CardDescription>
                </div>
                {paymentMethodsError && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetchPaymentMethods()}
                    className="text-red-500 hover:text-red-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethodsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                ) : paymentMethodsError ? (
                  <ApiErrorHandler 
                    error={paymentMethodsError}
                    onRetry={() => refetchPaymentMethods()}
                    variant="card"
                    fallbackMessage="Failed to load payment methods"
                  />
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {method.brand?.toUpperCase()} •••• {method.last4}
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.expMonth && method.expYear && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!method.isDefault && (
                            <DropdownMenuItem 
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedPaymentMethod(method.id);
                              setIsRemoveDialogOpen(true);
                            }}
                            disabled={removePaymentMethod.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No payment methods</h3>
                    <p className="text-sm">This subscriber doesn't have any saved payment methods</p>
                  </div>
                )}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Billing Summary</CardTitle>
                  <CardDescription>
                    Recent billing activity and totals
                  </CardDescription>
                </div>
                {summaryError && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetchSummary()}
                    className="text-red-500 hover:text-red-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {summaryLoading ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : summaryError ? (
                  <ApiErrorHandler 
                    error={summaryError}
                    onRetry={() => refetchSummary()}
                    variant="card"
                    fallbackMessage="Failed to load billing summary"
                  />
                ) : billingSummary ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Total Spent
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ${billingSummary.totalSpent.toFixed(2)}
                        </div>
                      </div>
                      <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Lifetime Value
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${billingSummary.lifetimeValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <RefreshCw className="h-4 w-4 text-purple-600" />
                          Monthly MRR
                        </div>
                        <div className="text-lg font-semibold text-purple-600">
                          ${billingSummary.currentMrr.toFixed(2)}
                        </div>
                      </div>
                      <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          Avg Monthly
                        </div>
                        <div className="text-lg font-semibold text-orange-600">
                          ${billingSummary.averageMonthlySpend.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Subscription Status:</span>
                        <Badge 
                          variant={billingSummary.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                          className={billingSummary.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {billingSummary.subscriptionStatus}
                        </Badge>
                      </div>
                      {billingSummary.lastPaymentDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Last Payment:
                          </span>
                          <span className="font-medium">
                            {new Date(billingSummary.lastPaymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {billingSummary.nextBillingDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next Billing:
                          </span>
                          <span className="font-medium">
                            {new Date(billingSummary.nextBillingDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No billing summary</h3>
                    <p className="text-sm">Billing information is not yet available for this subscriber</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice History */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>
                    Recent invoices and payment receipts
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {invoicesError && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => refetchInvoices()}
                      className="text-red-500 hover:text-red-600"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="space-x-2 flex">
                          <Skeleton className="w-16 h-8 rounded" />
                          <Skeleton className="w-8 h-8 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : invoicesError ? (
                  <ApiErrorHandler 
                    error={invoicesError}
                    onRetry={() => refetchInvoices()}
                    variant="card"
                    fallbackMessage="Failed to load invoices"
                  />
                ) : invoicesData?.invoices?.length ? (
                  <div className="space-y-4">
                    {invoicesData.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-600'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-600'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {invoice.status === 'paid' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : invoice.status === 'pending' ? (
                              <Clock className="h-5 w-5" />
                            ) : invoice.status === 'overdue' ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">
                              Invoice #{(invoice as any).invoiceNumber || invoice.id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Issued: {new Date((invoice as any).issueDate || invoice.createdAt).toLocaleDateString()}
                              {(invoice as any).dueDate && (
                                <span> • Due: {new Date((invoice as any).dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">
                              ${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase() || 'USD'}
                            </div>
                            <Badge variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'overdue' ? 'destructive' : 
                              'secondary'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={processingInvoices.has(invoice.id)}>
                                {processingInvoices.has(invoice.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                disabled={downloadingInvoices.has(invoice.id)}
                              >
                                {downloadingInvoices.has(invoice.id) ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSendInvoice(invoice.id)}
                                disabled={processingInvoices.has(invoice.id)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              {invoice.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  disabled={processingInvoices.has(invoice.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {invoice.status !== 'voided' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleVoidInvoice(invoice.id)}
                                    disabled={processingInvoices.has(invoice.id)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Void Invoice
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {/* Enhanced Pagination */}
                    {invoicesData.totalPages > 1 && (
                      <div className="flex justify-center items-center pt-6 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInvoicesPage(prev => Math.max(1, prev - 1))}
                          disabled={invoicesPage === 1 || invoicesLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-4">
                          Page {invoicesPage} of {invoicesData.totalPages}
                          {invoicesData.total && ` (${invoicesData.total} total)`}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInvoicesPage(prev => Math.min(invoicesData.totalPages, prev + 1))}
                          disabled={invoicesPage === invoicesData.totalPages || invoicesLoading}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No invoices found</h3>
                    <p className="text-sm mb-4">This subscriber doesn't have any invoices yet</p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Confirmation Dialogs */}
          <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this payment method? This action cannot be undone.
                  {methodToRemove?.isDefault && (
                    <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-sm rounded">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      This is the default payment method. Removing it will require setting a new default.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={removingPaymentMethod}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmRemovePaymentMethod}
                  disabled={removingPaymentMethod}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {removingPaymentMethod ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove Payment Method'
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
                  Are you sure you want to void this invoice? This action cannot be undone and will 
                  mark the invoice as cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmVoidInvoice}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Void Invoice
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </RoleBasedAccess>
      </ErrorBoundary>
    );
  };