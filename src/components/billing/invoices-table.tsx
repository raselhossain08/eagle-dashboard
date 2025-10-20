// components/billing/invoices-table.tsx
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Send, Check, X, MoreHorizontal } from 'lucide-react';
import { Invoice, PaginationState, InvoiceStatus } from '@/types/billing';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  dateRange?: { from: Date; to: Date };
}

interface InvoicesTableProps {
  data: Invoice[];
  pagination: PaginationState;
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  onMarkPaid: (invoiceId: string, amount: number) => void;
  onVoid: (invoiceId: string) => void;
  onSend: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
  isLoading?: boolean;
}

export function InvoicesTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onMarkPaid,
  onVoid,
  onSend,
  onDownload,
  isLoading
}: InvoicesTableProps) {
  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      draft: { variant: "outline" as const, label: "Draft" },
      open: { variant: "default" as const, label: "Open" },
      paid: { variant: "default" as const, label: "Paid" },
      void: { variant: "secondary" as const, label: "Void" },
      uncollectible: { variant: "destructive" as const, label: "Uncollectible" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isActionable = (invoice: Invoice) => {
    return invoice.status === 'draft' || invoice.status === 'open';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Paid Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                User #{invoice.userId.slice(0, 8)}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(invoice.amountDue, invoice.currency)}
                </div>
                {invoice.amountPaid > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Paid: {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(invoice.status)}
              </TableCell>
              <TableCell>
                {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
              </TableCell>
              <TableCell>
                {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {isActionable(invoice) && (
                    <>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSend(invoice.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {invoice.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkPaid(invoice.id, invoice.amountDue)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVoid(invoice.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No invoices found.
        </div>
      )}
    </div>
  );
}