// app/dashboard/billing/invoices/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { InvoicesTable } from '@/components/billing/invoices-table';
import { Button } from '@/components/ui/button';
import { Plus, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useInvoices } from '@/hooks/use-invoices';
import { InvoiceStatus } from '@/types/billing';

export default function InvoicesPage() {
  const [filters, setFilters] = useState({
    status: undefined as InvoiceStatus | undefined,
    search: '',
  });

  const { data: invoicesData, isLoading } = useInvoices(filters);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Invoices', href: '/dashboard/billing/invoices', active: true }
  ];

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleMarkPaid = async (invoiceId: string, amount: number) => {
    // Implementation for marking invoice as paid
    console.log('Mark invoice as paid:', invoiceId, amount);
  };

  const handleVoid = async (invoiceId: string) => {
    // Implementation for voiding invoice
    console.log('Void invoice:', invoiceId);
  };

  const handleSend = async (invoiceId: string) => {
    // Implementation for sending invoice
    console.log('Send invoice:', invoiceId);
  };

  const handleDownload = async (invoiceId: string) => {
    // Implementation for downloading invoice
    console.log('Download invoice:', invoiceId);
  };

  // Calculate invoice statistics
  const invoiceStats = {
    total: invoicesData?.data.length || 0,
    draft: invoicesData?.data.filter(i => i.status === 'draft').length || 0,
    open: invoicesData?.data.filter(i => i.status === 'open').length || 0,
    paid: invoicesData?.data.filter(i => i.status === 'paid').length || 0,
    overdue: invoicesData?.data.filter(i => 
      i.status === 'open' && i.dueDate && new Date(i.dueDate) < new Date()
    ).length || 0,
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title="Invoices"
        description="Manage and track customer invoices"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        }
      >
        <div className="space-y-6">
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
    </div>
  );
}