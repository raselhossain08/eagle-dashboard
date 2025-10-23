// hooks/use-customers.ts
import { useQuery } from '@tanstack/react-query';
import { CustomersService } from '@/lib/services/customers.service';

const customersService = new CustomersService();

interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useCustomers = (params: CustomerQueryParams = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getCustomers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersService.getCustomerById(id),
    enabled: !!id,
  });
};