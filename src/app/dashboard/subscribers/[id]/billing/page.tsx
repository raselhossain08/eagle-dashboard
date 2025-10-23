// app/dashboard/subscribers/[id]/billing/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriber } from '@/hooks/useSubscribers';
import {
  useSubscriberBillingSummary,
  useSubscriberInvoices,
  useSubscriberPaymentMethods,
  useDownloadInvoice,
  useRemovePaymentMethod,
  useUpdatePaymentMethod
} from '@/hooks/useBilling';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function BillingPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: subscriber, isLoading: subscriberLoading } = useSubscriber(id);
  const { data: billingSummary, isLoading: summaryLoading } = useSubscriberBillingSummary(id);
  const { data: invoicesData, isLoading: invoicesLoading } = useSubscriberInvoices(id, { 
    page: 1, 
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useSubscriberPaymentMethods(id);
  
  const downloadInvoice = useDownloadInvoice();
  const removePaymentMethod = useRemovePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();

  const getInvoiceStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      void: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoice.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      await removePaymentMethod.mutateAsync({ userId: id, paymentMethodId });
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await updatePaymentMethod.mutateAsync({ 
        userId: id, 
        paymentMethodId, 
        updates: { isDefault: true } 
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const isLoading = subscriberLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Saved payment methods and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethodsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading payment methods...</span>
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {method.brand} •••• {method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {method.expMonth && method.expYear && `Expires ${method.expMonth}/${method.expYear}`}
                        {method.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default
                          </Badge>
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
                        <DropdownMenuItem onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payment methods found
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
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>
              Recent billing activity and totals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading summary...</span>
              </div>
            ) : billingSummary ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Total Spent</div>
                    <div className="text-2xl font-bold">
                      ${billingSummary.totalSpent.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Lifetime Value</div>
                    <div className="text-2xl font-bold">
                      ${billingSummary.lifetimeValue.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Monthly MRR</div>
                    <div className="text-lg font-semibold">
                      ${billingSummary.currentMrr.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Avg Monthly Spend</div>
                    <div className="text-lg font-semibold">
                      ${billingSummary.averageMonthlySpend.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subscription Status:</span>
                    <Badge variant={billingSummary.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                      {billingSummary.subscriptionStatus}
                    </Badge>
                  </div>
                  {billingSummary.lastPaymentDate && (
                    <div className="flex justify-between text-sm">
                      <span>Last Payment:</span>
                      <span>{new Date(billingSummary.lastPaymentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {billingSummary.nextBillingDate && (
                    <div className="flex justify-between text-sm">
                      <span>Next Billing:</span>
                      <span>{new Date(billingSummary.nextBillingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No billing summary available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              Recent invoices and payment receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading invoices...</span>
              </div>
            ) : invoicesData && invoicesData.invoices.length > 0 ? (
              <div className="space-y-4">
                {invoicesData.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
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
                          ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </div>
                        <Badge className={getInvoiceStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {invoicesData.totalPages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline">
                      Load More Invoices
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found for this subscriber
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}