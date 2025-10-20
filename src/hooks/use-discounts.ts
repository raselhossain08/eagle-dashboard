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

export const useValidateDiscount = () => {
  return useMutation({
    mutationFn: (data: ValidateDiscountDto) => discountsService.validateDiscount(data),
  });
};