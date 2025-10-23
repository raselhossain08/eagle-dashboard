// app/dashboard/billing/invoices/overdue/page.tsx
'use client';

import React from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { InvoicesTable } from '@/components/billing/invoices-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Send, DollarSign, Calendar } from 'lucide-react';
import { useInvoices, useMarkInvoiceAsPaid, useVoidInvoice, useSendInvoice, useDownloadInvoice } from '@/hooks/use-invoices';
import { formatCurrency, isInvoiceOverdue } from '@/lib/utils';
import { toast } from 'sonner';

export default function OverdueInvoicesPage() {
  const { data: invoicesData, isLoading, error } = useInvoices({ status: 'open' });
  
  // Debug logging
  console.log('Overdue invoices data:', invoicesData);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  
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

  // Filter overdue invoices
  const overdueInvoices = invoicesData?.data?.filter(invoice => isInvoiceOverdue(invoice)) || [];

  const handleMarkPaid = async (invoiceId: string, amount: number) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        amount,
        date: new Date(),
      });
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
    }
  };

  const handleVoid = async (invoiceId: string) => {
    try {
      await voidMutation.mutateAsync(invoiceId);
      toast.success('Invoice voided successfully');
    } catch (error) {
      toast.error('Failed to void invoice');
    }
  };

  const handleSend = async (invoiceId: string) => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
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
      toast.error('Failed to download invoice');
    }
  };

  // Calculate overdue totals
  const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  const averageOverdueDays = overdueInvoices.length > 0 
    ? overdueInvoices.reduce((sum, invoice) => {
        if (!invoice.dueDate) return sum;
        const dueDate = typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;
        const overdueDays = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + overdueDays;
      }, 0) / overdueInvoices.length
    : 0;

  return (
    <BillingDashboardShell
      title="Overdue Invoices"
      description="Manage and track overdue customer invoices"
      breadcrumbs={breadcrumbs}
      actions={
        <Button variant="outline">
          <Send className="h-4 w-4 mr-2" />
          Send Reminders
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Error handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load overdue invoices
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Total Overdue
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">
                {formatCurrency(totalOverdue)}
              </div>
              <p className="text-xs text-red-600">
                Across {overdueInvoices.length} invoices
              </p>
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
              <div className="text-2xl font-bold">{overdueInvoices.length}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
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
              <div className="text-2xl font-bold">{Math.round(averageOverdueDays)}</div>
              <p className="text-xs text-muted-foreground">
                Days overdue on average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {overdueInvoices.filter(inv => inv.amountDue < 10000).length} under $100
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {overdueInvoices.filter(inv => inv.amountDue >= 10000 && inv.amountDue < 50000).length} $100-$500
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {overdueInvoices.filter(inv => inv.amountDue >= 50000).length} over $500
          </Badge>
        </div>

        {/* Overdue Invoices Table */}
        {overdueInvoices.length > 0 ? (
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
              <AlertTriangle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Overdue Invoices</h3>
              <p className="text-muted-foreground mb-6">
                Great job! All invoices are up to date and paid on time.
              </p>
              <Button>View All Invoices</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </BillingDashboardShell>
  );
}