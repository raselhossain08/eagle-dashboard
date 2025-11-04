// hooks/use-bulk-discounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  bulkDiscountService, 
  BulkGenerationTemplate, 
  BulkGenerationResult,
  BulkDiscountAnalytics
} from '@/lib/api/bulk-discount.service';

export const useBulkDiscountGeneration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: BulkGenerationTemplate) => 
      bulkDiscountService.generateBulkDiscounts(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-discount-history'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-discount-analytics'] });
    },
    retry: 1,
  });
};

export const useBulkDiscountPreview = () => {
  return useMutation({
    mutationFn: (template: BulkGenerationTemplate) => 
      bulkDiscountService.previewBulkGeneration(template),
    retry: 0,
  });
};

export const useBulkDiscountValidation = () => {
  return useMutation({
    mutationFn: (template: BulkGenerationTemplate) => 
      bulkDiscountService.validateBulkTemplate(template),
    retry: 0,
  });
};

export const useBulkDiscountProgress = (operationId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['bulk-discount-progress', operationId],
    queryFn: () => bulkDiscountService.getBulkGenerationProgress(operationId),
    enabled: !!operationId && enabled,
    refetchInterval: 1000, // Poll every second during generation
    retry: false,
  });
};

export const useBulkDiscountHistory = (params: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  prefix?: string;
} = {}) => {
  return useQuery({
    queryKey: ['bulk-discount-history', params],
    queryFn: () => bulkDiscountService.getBulkDiscountHistory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBulkDiscountAnalytics = () => {
  return useQuery({
    queryKey: ['bulk-discount-analytics'],
    queryFn: () => bulkDiscountService.getBulkDiscountAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useExportBulkCodes = () => {
  return useMutation({
    mutationFn: ({ batchId, format }: { batchId: string; format: 'csv' | 'excel' | 'json' }) =>
      bulkDiscountService.exportBulkCodes(batchId, format),
  });
};

export const useDuplicateBulkGeneration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batchId, modifications }: { 
      batchId: string; 
      modifications?: Partial<BulkGenerationTemplate> 
    }) => bulkDiscountService.duplicateBulkGeneration(batchId, modifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-discount-history'] });
    },
  });
};

export const useCodeGenerationSuggestions = () => {
  return useMutation({
    mutationFn: (input: {
      businessType?: string;
      campaignType?: string;
      targetAudience?: string;
      seasonality?: string;
    }) => bulkDiscountService.getCodeGenerationSuggestions(input),
  });
};

export const useCancelBulkGeneration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operationId: string) => 
      bulkDiscountService.cancelBulkGeneration(operationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-discount-progress'] });
    },
  });
};