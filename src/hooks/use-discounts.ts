// hooks/use-discounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsService } from '@/lib/api/discounts.service';
import { Discount, CreateDiscountDto, ValidateDiscountDto } from '@/types/discounts';

export const useDiscounts = (params: any) => {
  return useQuery({
    queryKey: ['discounts', params],
    queryFn: () => discountsService.getDiscounts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDiscount = (id: string) => {
  return useQuery({
    queryKey: ['discounts', id],
    queryFn: () => discountsService.getDiscountById(id),
    enabled: !!id,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDiscountDto) => discountsService.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountDto> }) =>
      discountsService.updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};

export const useDeactivateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountsService.deactivateDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};

export const useGenerateBulkDiscounts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ template, count, prefix }: { 
      template: CreateDiscountDto; 
      count: number; 
      prefix?: string; 
    }) => discountsService.generateBulkDiscounts(template, count, prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};

export const useDiscountPerformance = (id: string) => {
  return useQuery({
    queryKey: ['discounts', id, 'performance'],
    queryFn: () => discountsService.getDiscountPerformance(id),
    enabled: !!id,
  });
};

export const useDiscountsOverview = () => {
  return useQuery({
    queryKey: ['discounts', 'overview'],
    queryFn: () => discountsService.getDiscountsOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveDiscounts = () => {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: () => discountsService.getActiveDiscounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValidateDiscount = () => {
  return useMutation({
    mutationFn: (data: ValidateDiscountDto) => discountsService.validateDiscount(data),
  });
};

export const useExportDiscounts = () => {
  return useMutation({
    mutationFn: (params: { format?: 'csv' | 'excel'; filters?: any }) => 
      discountsService.exportDiscounts(params),
  });
};