// app/dashboard/billing/invoices/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { InvoicesTable } from '@/components/billing/invoices-table';
import { InvoiceFilters } from '@/components/billing/invoice-filters';
import { Button } from '@/components/ui/button';
import { Plus, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useInvoices, useMarkInvoiceAsPaid, useVoidInvoice, useSendInvoice, useDownloadInvoice } from '@/hooks/use-invoices';
import { InvoiceStatus } from '@/types/billing';
import { toast } from 'sonner';
import { isInvoiceOverdue } from '@/lib/utils';

import Link from 'next/link';

export default function InvoicesPage() {
  const [filters, setFilters] = useState({
    status: undefined as InvoiceStatus | undefined,
    search: '',
    page: 1,
    pageSize: 10,
  });

  const { data: invoicesData, isLoading, error } = useInvoices(filters);
  
  // Debug logging
  console.log('Invoices data:', invoicesData);
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
    { label: 'Invoices', href: '/dashboard/billing/invoices', active: true }
  ];

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

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
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
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

  // Calculate invoice statistics
  const invoiceStats = {
    total: invoicesData?.data?.length || 0,
    draft: invoicesData?.data?.filter(i => i.status === 'draft').length || 0,
    open: invoicesData?.data?.filter(i => i.status === 'open').length || 0,
    paid: invoicesData?.data?.filter(i => i.status === 'paid').length || 0,
    overdue: invoicesData?.data?.filter(i => isInvoiceOverdue(i)).length || 0,
  };

  return (
    <BillingDashboardShell
      title="Invoices"
      description="Manage and track customer invoices"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/dashboard/billing/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
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
                  Failed to load invoices
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Filters */}
        <InvoiceFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalCount={invoicesData?.pagination?.total}
          filteredCount={invoicesData?.data?.length}
        />

        {/* Invoice Statistics */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{invoiceStats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold">{invoiceStats.draft}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold">{invoiceStats.open}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{invoiceStats.paid}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{invoiceStats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
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
      </div>
    </BillingDashboardShell>
  );
}