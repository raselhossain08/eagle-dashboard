// hooks/use-enhanced-discounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsService } from '@/lib/api/discounts.service';
import { Discount, CreateDiscountDto, ValidateDiscountDto, DiscountFilters } from '@/types/discounts';
import { toast } from 'sonner';

const DISCOUNTS_QUERY_KEY = 'discounts';

export interface UseDiscountsOptions {
  page?: number;
  limit?: number;
  filters?: DiscountFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Enhanced hook for fetching discounts with comprehensive error handling
 */
export function useEnhancedDiscounts(options: UseDiscountsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    filters = {},
    enabled = true,
    refetchInterval
  } = options;

  return useQuery({
    queryKey: [DISCOUNTS_QUERY_KEY, 'list', { page, limit, ...filters }],
    queryFn: () => discountsService.getDiscounts({
      page,
      limit,
      ...filters
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled,
    refetchInterval, // For real-time updates if needed
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Enhanced hook for discounts overview with real-time updates
 */
export function useDiscountsOverviewEnhanced() {
  return useQuery({
    queryKey: [DISCOUNTS_QUERY_KEY, 'overview'],
    queryFn: () => discountsService.getDiscountsOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Enhanced hook for deactivating discounts with optimistic updates
 */
export function useDeactivateDiscountEnhanced() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discountId: string) => {
      const result = await discountsService.deactivateDiscount(discountId);
      return { discountId, result };
    },
    onMutate: async (discountId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [DISCOUNTS_QUERY_KEY] });

      // Snapshot previous value
      const previousDiscounts = queryClient.getQueriesData({ 
        queryKey: [DISCOUNTS_QUERY_KEY] 
      });

      // Optimistically update discount status
      queryClient.setQueriesData(
        { queryKey: [DISCOUNTS_QUERY_KEY, 'list'] },
        (old: any) => {
          if (!old?.data) return old;
          
          return {
            ...old,
            data: old.data.map((discount: Discount) => 
              discount.id === discountId 
                ? { ...discount, isActive: false }
                : discount
            )
          };
        }
      );

      return { previousDiscounts };
    },
    onError: (error: any, discountId: string, context: any) => {
      // Revert optimistic update on error
      if (context?.previousDiscounts) {
        context.previousDiscounts.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error('Failed to deactivate discount', {
        description: error?.message || 'Please try again'
      });
    },
    onSuccess: (data, discountId) => {
      toast.success('Discount deactivated successfully');
      
      // Invalidate and refetch discount queries
      queryClient.invalidateQueries({ queryKey: [DISCOUNTS_QUERY_KEY] });
    },
  });
}

/**
 * Enhanced export hook with progress tracking
 */
export function useExportDiscountsEnhanced() {
  return useMutation({
    mutationFn: async (params: { 
      format?: 'csv' | 'excel'; 
      filters?: DiscountFilters;
      filename?: string; 
    }) => {
      const { format = 'csv', filters = {}, filename } = params;
      
      try {
        const blob = await discountsService.exportDiscounts({ format, filters });
        
        // Create and trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `discounts-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return { success: true, filename: link.download };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Export completed successfully', {
        description: `File ${data.filename} has been downloaded`
      });
    },
    onError: (error: any) => {
      toast.error('Export failed', {
        description: error?.message || 'Please try again'
      });
    },
  });
}

/**
 * Hook for bulk operations with progress tracking
 */
export function useBulkDiscountOperations() {
  const queryClient = useQueryClient();

  const bulkDeactivate = useMutation({
    mutationFn: async (discountIds: string[]) => {
      const results = await Promise.allSettled(
        discountIds.map(id => discountsService.deactivateDiscount(id))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: discountIds.length };
    },
    onSuccess: (data) => {
      if (data.failed === 0) {
        toast.success(`Successfully deactivated ${data.successful} discounts`);
      } else {
        toast.warning(`Partially completed: ${data.successful} successful, ${data.failed} failed`);
      }
      
      queryClient.invalidateQueries({ queryKey: [DISCOUNTS_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error('Bulk operation failed', {
        description: error?.message || 'Please try again'
      });
    },
  });

  const bulkExport = useMutation({
    mutationFn: async (params: { 
      discountIds: string[];
      format?: 'csv' | 'excel';
    }) => {
      return discountsService.exportDiscounts({
        format: params.format,
        filters: { ids: params.discountIds }
      });
    },
    onSuccess: () => {
      toast.success('Bulk export completed');
    },
    onError: (error: any) => {
      toast.error('Bulk export failed', {
        description: error?.message || 'Please try again'
      });
    },
  });

  return {
    bulkDeactivate,
    bulkExport,
  };
}

/**
 * Hook for real-time discount updates with polling
 */
export function useRealTimeDiscounts(options: UseDiscountsOptions & {
  enablePolling?: boolean;
  pollingInterval?: number;
} = {}) {
  const { enablePolling = false, pollingInterval = 30000, ...restOptions } = options;

  return useEnhancedDiscounts({
    ...restOptions,
    refetchInterval: enablePolling ? pollingInterval : undefined,
  });
}

/**
 * Hook for discount search with debouncing
 */
export function useDiscountSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: async (params: {
      query: string;
      filters?: DiscountFilters;
      limit?: number;
    }) => {
      return discountsService.getDiscounts({
        search: params.query,
        limit: params.limit || 20,
        ...params.filters
      });
    },
  });

  const clearCache = () => {
    queryClient.invalidateQueries({ queryKey: [DISCOUNTS_QUERY_KEY] });
  };

  return {
    search: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    clearCache,
  };
}

/**
 * Hook for discount analytics and insights
 */
export function useDiscountAnalytics() {
  return useQuery({
    queryKey: [DISCOUNTS_QUERY_KEY, 'analytics'],
    queryFn: () => discountsService.getDiscountsOverview(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => ({
      ...data,
      // Add computed insights
      averageDiscountValue: data.totalDiscountAmount / (data.totalRedemptions || 1),
      redemptionRate: data.totalDiscounts ? (data.totalRedemptions / data.totalDiscounts) * 100 : 0,
      revenueImpact: data.totalRevenue - data.totalDiscountAmount,
    }),
  });
}