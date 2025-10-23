// app/dashboard/billing/invoices/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Send, Check, FileText, User, Calendar } from 'lucide-react';
import { useInvoice, useMarkInvoiceAsPaid, useVoidInvoice, useSendInvoice, useDownloadInvoice } from '@/hooks/use-invoices';
import { useUser } from '@/hooks/use-users';
import Link from 'next/link';
import { formatCurrency, formatDate, isInvoiceOverdue } from '@/lib/utils';
import { toast } from 'sonner';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId);
  
  // Extract customer info from the invoice data since it's populated
  const customer = invoice?.userId && typeof invoice.userId === 'object' ? invoice.userId as any : null;
  
  // Mutations
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const voidMutation = useVoidInvoice();
  const sendMutation = useSendInvoice();
  const downloadMutation = useDownloadInvoice();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices' },
    { label: invoice?.invoiceNumber || 'Loading...', href: '#', active: true }
  ];

  const handleDownload = async () => {
    try {
      const blob = await downloadMutation.mutateAsync(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        amount: invoice?.amountDue || 0,
        date: new Date(),
      });
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
    }
  };

  const isLoading = invoiceLoading;

  if (isLoading) {
    return (
      <BillingDashboardShell
        title="Loading..."
        description="Loading invoice details"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </BillingDashboardShell>
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
    <BillingDashboardShell
      title={invoice.invoiceNumber}
      description={`Invoice for ${customer?.firstName} ${customer?.lastName}` || 'Invoice details'}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={downloadMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {invoice.status === 'draft' && (
            <Button variant="outline" onClick={handleSend} disabled={sendMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          {invoice.status === 'open' && (
            <Button onClick={handleMarkPaid} disabled={markAsPaidMutation.isPending}>
              <Check className="h-4 w-4 mr-2" />
              Mark Paid
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
                  isInvoiceOverdue(invoice) ? 'destructive' : 'outline'
                }>
                  {isInvoiceOverdue(invoice) ? 'overdue' : invoice.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Created on {formatDate(invoice.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-medium mb-3">Bill To</h3>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    {customer ? (
                      <>
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
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Customer information not available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Invoice Date</h4>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(invoice.createdAt)}
                  </div>
                </div>
                {invoice.dueDate && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Due Date</h4>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                )}
              </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-medium mb-3">Line Items</h3>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-right p-3 font-medium">Quantity</th>
                          <th className="text-right p-3 font-medium">Unit Price</th>
                          <th className="text-right p-3 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.lineItems.map((item, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.unitPrice, invoice.currency)}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.amount, invoice.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.amountDue, invoice.currency)}</span>
                    </div>
                    {invoice.taxDetails && (
                      <div className="flex justify-between">
                        <span>Tax ({invoice.taxDetails.rate}%):</span>
                        <span>{formatCurrency(invoice.taxDetails.amount, invoice.currency)}</span>
                      </div>
                    )}
                    {invoice.discount && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(invoice.discount.value, invoice.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.amountDue, invoice.currency)}</span>
                    </div>
                    {invoice.amountPaid > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                      </div>
                    )}
                    {invoice.amountPaid < invoice.amountDue && (
                      <div className="flex justify-between font-bold">
                        <span>Amount Due:</span>
                        <span>
                          {formatCurrency(invoice.amountDue - invoice.amountPaid, invoice.currency)}
                        </span>
                      </div>
                    )}
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
                <CardTitle className="text-sm">Invoice Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadMutation.isPending ? 'Downloading...' : 'Download PDF'}
                </Button>
                {invoice.status === 'draft' && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMutation.isPending ? 'Sending...' : 'Send to Customer'}
                  </Button>
                )}
                {invoice.status === 'open' && (
                  <Button 
                    className="w-full" 
                    onClick={handleMarkPaid}
                    disabled={markAsPaidMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {markAsPaidMutation.isPending ? 'Processing...' : 'Mark as Paid'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      isInvoiceOverdue(invoice) ? 'destructive' : 'outline'
                    }>
                      {isInvoiceOverdue(invoice) ? 'overdue' : invoice.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Amount Due</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Amount Paid</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </span>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-sm">Paid On</span>
                      <span className="text-sm">{formatDate(invoice.paidAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    );
  }