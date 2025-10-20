// lib/api/invoices.service.ts
import { Invoice, CreateInvoiceDto, InvoicesQueryParams } from '@/types/billing';

export class InvoicesService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  constructor(private client: ApiClient) {}

  async getInvoices(params: InvoicesQueryParams = {}): Promise<{ data: Invoice[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/billing/invoices?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${this.baseURL}/billing/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    return response.json();
  }

  async markInvoiceAsPaid(id: string, amount: number, date?: Date): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/mark-paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ amount, date }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark invoice as paid');
    }
  }

  async voidInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/void`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to void invoice');
    }
  }

  async sendInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to send invoice');
    }
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${this.baseURL}/billing/invoices/overdue`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue invoices');
    }

    return response.json();
  }

  async downloadInvoicePdf(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice PDF');
    }

    return response.blob();
  }
}