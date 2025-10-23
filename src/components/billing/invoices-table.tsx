import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Send, Check, X, MoreHorizontal, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Invoice, PaginationState, InvoiceStatus } from '@/types/billing';
import { formatCurrency, formatDate, isInvoiceOverdue } from '@/lib/utils';
import Link from 'next/link';

interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  dateRange?: { from: Date; to: Date };
  page?: number;
  pageSize?: number;
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
  const getStatusBadge = (invoice: Invoice) => {
    const isOverdue = isInvoiceOverdue(invoice);
    
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    const statusConfig = {
      draft: { variant: "outline" as const, label: "Draft" },
      open: { variant: "default" as const, label: "Open" },
      paid: { variant: "default" as const, label: "Paid" },
      void: { variant: "secondary" as const, label: "Void" },
      uncollectible: { variant: "destructive" as const, label: "Uncollectible" },
    };
    
    const config = statusConfig[invoice.status];
    
    if (invoice.status === 'paid') {
      return (
        <Badge variant={config.variant} className="bg-green-500 hover:bg-green-600 text-white">
          {config.label}
        </Badge>
      );
    }
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCustomerDisplay = (invoice: Invoice) => {
    if (invoice.userId && typeof invoice.userId === 'object') {
      const user = invoice.userId as any;
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        return user.email;
      }
    }
    
    if (typeof invoice.userId === 'string') {
      return `User #${invoice.userId.slice(0, 8)}`;
    }
    
    return 'Unknown User';
  };

  const getCustomerEmail = (invoice: Invoice) => {
    if (invoice.userId && typeof invoice.userId === 'object') {
      const user = invoice.userId as any;
      return user.email;
    }
    return null;
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
                <div className="flex flex-col">
                  <span>{invoice.invoiceNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getCustomerDisplay(invoice)}
                  </span>
                  {getCustomerEmail(invoice) && (
                    <span className="text-xs text-muted-foreground">
                      {getCustomerEmail(invoice)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(invoice.amountDue, invoice.currency)}
                </div>
                {invoice.amountPaid > 0 && (
                  <div className="text-sm text-green-600">
                    Paid: {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </div>
                )}
                {invoice.amountPaid < invoice.amountDue && invoice.amountPaid > 0 && (
                  <div className="text-sm text-orange-600">
                    Due: {formatCurrency(invoice.amountDue - invoice.amountPaid, invoice.currency)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(invoice)}
              </TableCell>
              <TableCell>
                {invoice.dueDate ? (
                  <div className={`${isInvoiceOverdue(invoice) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(invoice.dueDate)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {invoice.paidAt ? (
                  <span className="text-green-600">
                    {formatDate(invoice.paidAt)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/dashboard/billing/invoices/${invoice.id}`}>
                    <Button variant="outline" size="sm" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(invoice.id)}
                    title="Download PDF"
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
                          title="Send Invoice"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {invoice.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkPaid(invoice.id, invoice.amountDue - invoice.amountPaid)}
                          title="Mark as Paid"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVoid(invoice.id)}
                        title="Void Invoice"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="flex flex-col items-center">
            <div className="text-lg font-medium mb-2">No invoices found</div>
            <div className="text-sm">
              {filters.status || filters.search 
                ? 'Try adjusting your filters to see more results'
                : 'Create your first invoice to get started'
              }
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.total > 0 && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === pagination.page;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, page: pageNum })}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {(pagination.totalPages || 0) > 5 && (
                <span className="text-muted-foreground px-2">...</span>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: pagination.page + 1 })}
              disabled={pagination.page >= (pagination.totalPages || 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}