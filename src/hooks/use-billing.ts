import { useQuery } from '@tanstack/react-query';

// Mock functions since billing service structure is different
const mockBillingService = {
  getOverview: async () => ({
    totalRevenue: 45231.89,
    invoicesCount: 2350,
    outstanding: 12234,
    growthRate: 573
  }),
  getInvoices: async () => ([]),
  getPayments: async () => ([]),
  getRevenue: async () => ({
    total: 45231.89,
    monthly: 12000,
    yearly: 144000
  })
};

export function useBilling() {
  return useQuery({
    queryKey: ['billing', 'overview'],
    queryFn: () => mockBillingService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBillingInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => mockBillingService.getInvoices(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBillingPayments() {
  return useQuery({
    queryKey: ['billing', 'payments'],
    queryFn: () => mockBillingService.getPayments(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBillingRevenue() {
  return useQuery({
    queryKey: ['billing', 'revenue'],
    queryFn: () => mockBillingService.getRevenue(),
    staleTime: 5 * 60 * 1000,
  });
}

// Export alias for backwards compatibility
export const useBillingOverview = useBilling;