// hooks/use-discount-performance.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  discountPerformanceService,
  DiscountValidationData,
  DiscountPerformanceData,
  DiscountValidationResult
} from '@/lib/api/discount-performance.service';

export const useDiscountPerformance = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['discounts', id, 'performance'],
    queryFn: () => discountPerformanceService.getDiscountPerformance(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useDiscountValidation = () => {
  return useMutation({
    mutationFn: (data: DiscountValidationData) => 
      discountPerformanceService.validateDiscountCode(data),
    retry: 1,
  });
};

export const useDiscountRedemptionHistory = (
  id: string, 
  params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['discounts', id, 'redemptions', params],
    queryFn: () => discountPerformanceService.getDiscountRedemptionHistory(id, params),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDiscountAnalytics = (
  id: string, 
  period: '7d' | '30d' | '90d' | '1y' = '30d',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['discounts', id, 'analytics', period],
    queryFn: () => discountPerformanceService.getDiscountAnalytics(id, period),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGenerateDiscountReport = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'excel' }) =>
      discountPerformanceService.generateDiscountReport(id, format),
  });
};