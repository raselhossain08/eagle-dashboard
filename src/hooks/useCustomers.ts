// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService, Customer, CustomerListResponse, CustomerParams } from '@/lib/api/customers';
import { toast } from 'sonner';

// Get customers list
export const useCustomers = (params: CustomerParams = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getCustomers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single customer
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersService.getCustomer(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get customer support summary
export const useCustomerSupportSummary = (customerId: string) => {
  return useQuery({
    queryKey: ['customers', customerId, 'support-summary'],
    queryFn: () => customersService.getCustomerSupportSummary(customerId),
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Search customers
export const useSearchCustomers = (query: string, params: Omit<CustomerParams, 'search'> = {}) => {
  return useQuery({
    queryKey: ['customers', 'search', query, params],
    queryFn: () => customersService.searchCustomers(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Custom hook for paginated customer list with real-time updates
export const useCustomerList = (initialParams: CustomerParams = {}) => {
  const queryClient = useQueryClient();
  
  const query = useCustomers(initialParams);
  
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  return {
    ...query,
    refetch,
  };
};

// Hook for customer stats
export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: async () => {
      // This would call a dedicated stats endpoint
      const response = await customersService.getCustomers({ page: 1, limit: 1 });
      return {
        totalCustomers: response.total,
        // Add more stats as needed
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};