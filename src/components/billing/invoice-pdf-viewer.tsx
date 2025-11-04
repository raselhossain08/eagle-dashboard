// components/billing/invoice-pdf-viewer.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Share2 } from 'lucide-react';
import { Invoice, User, CompanyDetails } from '@/types/billing';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePdfViewerProps {
  invoice: Invoice;
  customer: User;
  company: CompanyDetails;
  isPreview?: boolean;
}

export function InvoicePdfViewer({ invoice, customer, company, isPreview = false }: InvoicePdfViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Download PDF');
  };

  const handleShare = () => {
    // Implement share logic
    console.log('Share invoice');
  };

  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = invoice.taxDetails?.amount || 0;
  const discountAmount = invoice.discount?.value || 0;
  const total = subtotal + taxAmount - discountAmount;

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="print:pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">INVOICE</CardTitle>
            <CardDescription>{invoice.invoiceNumber}</CardDescription>
          </div>
          {!isPreview && (
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 print:space-y-4">
        {/* Company and Customer Info */}
        <div className="grid grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
          <div>
            <h3 className="font-semibold mb-2">From</h3>
            <div className="text-sm">
              <div className="font-medium">{company.name}</div>
              <div>{company.address}</div>
              <div>{company.city}, {company.state} {company.zipCode}</div>
              <div>{company.country}</div>
              {company.taxId && <div>Tax ID: {company.taxId}</div>}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Bill To</h3>
            <div className="text-sm">
              <div className="font-medium">{customer.firstName} {customer.lastName}</div>
              <div>{customer.email}</div>
              {customer.company && <div>{customer.company}</div>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-4 gap-4 text-sm print:grid-cols-4 print:gap-2">
          <div>
            <div className="font-medium">Invoice Date</div>
            <div>{formatDate(invoice.createdAt)}</div>
          </div>
          {invoice.dueDate && (
            <div>
              <div className="font-medium">Due Date</div>
              <div>{formatDate(invoice.dueDate)}</div>
            </div>
          )}
          <div>
            <div className="font-medium">Status</div>
            <Badge variant={
              invoice.status === 'open' ? 'default' :
              invoice.status === 'void' || invoice.status === 'uncollectible' ? 'destructive' : 'outline'
            }>
              {invoice.status}
            </Badge>
          </div>
          <div>
            <div className="font-medium">Amount Due</div>
            <div className="font-bold">{formatCurrency(invoice.amountDue, invoice.currency)}</div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-2 font-medium">Description</th>
                <th className="text-right p-2 font-medium">Quantity</th>
                <th className="text-right p-2 font-medium">Unit Price</th>
                <th className="text-right p-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            
            {invoice.taxDetails && (
              <div className="flex justify-between">
                <span>Tax ({invoice.taxDetails.rate}%):</span>
                <span>{formatCurrency(taxAmount, invoice.currency)}</span>
              </div>
            )}
            
            {invoice.discount && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold border-t pt-2 text-lg">
              <span>Total:</span>
              <span>{formatCurrency(total, invoice.currency)}</span>
            </div>
            
            {invoice.amountPaid > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
            )}
            
            {invoice.amountPaid < total && (
              <div className="flex justify-between font-bold">
                <span>Amount Due:</span>
                <span>{formatCurrency(total - invoice.amountPaid, invoice.currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {isPreview && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-muted-foreground">
              Thank you for your business. Please make payment within 15 days of receiving this invoice.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}