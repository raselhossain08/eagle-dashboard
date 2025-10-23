// lib/services/invoices.service.ts
import { Invoice, CreateInvoiceDto, InvoicesQueryParams, PaginationState } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class InvoicesService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    // Debug: log all available cookies
    if (typeof document !== 'undefined') {
      console.log('All cookies:', document.cookie);
    }
    
    const token = AuthCookieService.getAccessToken();
    console.log('Token from AuthCookieService:', token);
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getInvoices(params: InvoicesQueryParams = {}): Promise<{ data: Invoice[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/billing/invoices?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Invoice API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${this.baseURL}/billing/invoices?${queryParams}`,
        headers: this.getAuthHeaders()
      });
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Invoice API Response:', result);
    
    // Ensure the response has the expected structure
    const transformedResult = {
      data: result.data || [],
      pagination: {
        page: result.pagination?.page || 1,
        pageSize: result.pagination?.pageSize || 10,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
      }
    };
    
    return transformedResult;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${this.baseURL}/billing/invoices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount, date }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark invoice as paid');
    }
  }

  async voidInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/void`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to void invoice');
    }
  }

  async sendInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to send invoice');
    }
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${this.baseURL}/billing/invoices/overdue`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue invoices');
    }

    const result = await response.json();
    // The backend now returns an array directly
    return Array.isArray(result) ? result : result.data || [];
  }

  async downloadInvoicePdf(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/billing/invoices/${id}/download`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice PDF');
    }

    return response.blob();
  }
}