// hooks/useBilling.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'voided' | 'overdue';
  description: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BillingSummary {
  totalSpent: number;
  lifetimeValue: number;
  averageMonthlySpend: number;
  currentMrr: number;
  subscriptionStatus: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
}

export interface Activity {
  id: string;
  type: 'transaction' | 'invoice' | 'subscription' | 'login' | 'purchase' | 'subscription_change' | 'profile_update' | 'support_ticket';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface InvoiceFilters {
  userId?: string;
  status?: string;
  subscriptionId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Get subscriber billing summary
export const useSubscriberBillingSummary = (userId: string) => {
  return useQuery({
    queryKey: ['billing', 'summary', userId],
    queryFn: async (): Promise<BillingSummary> => {
      return apiClient.get(`/subscribers/${userId}/billing-summary`);
    },
    enabled: !!userId,
  });
};

// Get subscriber invoices
export const useSubscriberInvoices = (userId: string, filters?: Omit<InvoiceFilters, 'userId'>) => {
  return useQuery({
    queryKey: ['billing', 'invoices', userId, filters],
    queryFn: async () => {
      const params = { ...filters };
      return apiClient.get<{
        invoices: Invoice[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/subscribers/${userId}/invoices`, params);
    },
    enabled: !!userId,
  });
};

// Get subscriber payment methods
export const useSubscriberPaymentMethods = (userId: string) => {
  return useQuery({
    queryKey: ['billing', 'payment-methods', userId],
    queryFn: async (): Promise<PaymentMethod[]> => {
      return apiClient.get(`/billing/subscribers/${userId}/payment-methods`);
    },
    enabled: !!userId,
  });
};

// Get all invoices with filters
export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ['billing', 'invoices', filters],
    queryFn: async () => {
      return apiClient.get<{
        invoices: Invoice[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>('/billing/invoices', filters);
    },
  });
};

// Get single invoice
export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['billing', 'invoices', invoiceId],
    queryFn: async (): Promise<Invoice> => {
      return apiClient.get(`/billing/invoices/${invoiceId}`);
    },
    enabled: !!invoiceId,
  });
};

// Download invoice PDF
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await apiClient.download(`/billing/invoices/${invoiceId}/download`);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
    onSuccess: () => {
      toast.success('Invoice downloaded successfully');
    },
    onError: (error) => {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice');
    },
  });
};

// Mark invoice as paid
export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, amount, date }: { 
      invoiceId: string; 
      amount: number; 
      date?: Date 
    }) => {
      return apiClient.post(`/billing/invoices/${invoiceId}/mark-paid`, { amount, date });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices', variables.invoiceId] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      console.error('Failed to mark invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    },
  });
};

// Void invoice
export const useVoidInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiClient.post(`/billing/invoices/${invoiceId}/void`);
    },
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices', invoiceId] });
      toast.success('Invoice voided successfully');
    },
    onError: (error) => {
      console.error('Failed to void invoice:', error);
      toast.error('Failed to void invoice');
    },
  });
};

// Send invoice
export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiClient.post(`/billing/invoices/${invoiceId}/send`);
    },
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices', invoiceId] });
      toast.success('Invoice sent successfully');
    },
    onError: (error) => {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    },
  });
};

// Add payment method
export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, paymentMethodData }: { 
      userId: string; 
      paymentMethodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'> 
    }) => {
      return apiClient.post(`/billing/subscribers/${userId}/payment-methods`, paymentMethodData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'payment-methods', variables.userId] });
      toast.success('Payment method added successfully');
    },
    onError: (error) => {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    },
  });
};

// Update payment method
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, paymentMethodId, updates }: { 
      userId: string; 
      paymentMethodId: string;
      updates: Partial<PaymentMethod>
    }) => {
      return apiClient.put(`/billing/subscribers/${userId}/payment-methods/${paymentMethodId}`, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'payment-methods', variables.userId] });
      toast.success('Payment method updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    },
  });
};

// Get subscriber billing activity
export const useSubscriberActivity = (userId: string, filters?: { limit?: number; type?: string }) => {
  return useQuery({
    queryKey: ['billing', 'activity', userId, filters],
    queryFn: async (): Promise<Activity[]> => {
      const params = { ...filters };
      return apiClient.get(`/subscribers/${userId}/activities`, params);
    },
    enabled: !!userId,
  });
};

// Remove payment method
export const useRemovePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, paymentMethodId }: { 
      userId: string; 
      paymentMethodId: string 
    }) => {
      return apiClient.delete(`/billing/subscribers/${userId}/payment-methods/${paymentMethodId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'payment-methods', variables.userId] });
      toast.success('Payment method removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove payment method:', error);
      toast.error('Failed to remove payment method');
    },
  });
};