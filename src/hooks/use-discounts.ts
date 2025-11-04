// hooks/use-discounts.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { discountsService } from '@/lib/api/discounts.service';
import { Discount, CreateDiscountDto, ValidateDiscountDto, DiscountsOverviewData } from '@/types/discounts';
import { toast } from 'sonner';

// Query Keys for better cache management
export const discountsQueryKeys = {
  all: ['discounts'] as const,
  lists: () => [...discountsQueryKeys.all, 'list'] as const,
  list: (params: any) => [...discountsQueryKeys.lists(), params] as const,
  details: () => [...discountsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...discountsQueryKeys.details(), id] as const,
  overview: () => [...discountsQueryKeys.all, 'overview'] as const,
  active: () => [...discountsQueryKeys.all, 'active'] as const,
  performance: (id: string) => [...discountsQueryKeys.detail(id), 'performance'] as const,
};

// Enhanced hook for discounts with better error handling and caching
export function useDiscounts(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    type?: string;
    campaignId?: string;
  } = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    keepPreviousData?: boolean;
  }
) {
  return useQuery({
    queryKey: discountsQueryKeys.list(params),
    queryFn: () => discountsService.getDiscounts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    placeholderData: options?.keepPreviousData ? (previousData) => previousData : undefined,
    retry: (failureCount, error) => {
      if (error.message?.includes('401') || error.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Infinite query for discounts with scroll pagination
export function useInfiniteDiscounts(
  baseParams: Omit<Parameters<typeof useDiscounts>[0], 'page'> & {
    limit?: number;
  } = {}
) {
  return useInfiniteQuery({
    queryKey: [...discountsQueryKeys.lists(), 'infinite', baseParams],
    queryFn: ({ pageParam = 1 }) =>
      discountsService.getDiscounts({
        ...baseParams,
        page: pageParam,
        limit: baseParams.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.page < lastPage.totalPages;
      return hasNextPage ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Enhanced discount detail hook
export function useDiscount(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: discountsQueryKeys.detail(id),
    queryFn: () => discountsService.getDiscountById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Enhanced discounts overview with real-time updates
export function useDiscountsOverview(options?: { 
  enabled?: boolean;
  refetchInterval?: number; 
}) {
  return useQuery({
    queryKey: discountsQueryKeys.overview(),
    queryFn: () => discountsService.getDiscountsOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes for overview data
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval || 30000, // Auto-refresh every 30s
    retry: 3,
  });
}

// Enhanced active discounts hook
export function useActiveDiscounts(options?: { 
  enabled?: boolean;
  refetchInterval?: number; 
}) {
  return useQuery({
    queryKey: discountsQueryKeys.active(),
    queryFn: () => discountsService.getActiveDiscounts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    retry: 2,
  });
}

// Enhanced discount performance hook
export function useDiscountPerformance(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: discountsQueryKeys.performance(id),
    queryFn: () => discountsService.getDiscountPerformance(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Enhanced create discount mutation with optimistic updates
export function useCreateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDiscountDto) => discountsService.createDiscount(data),
    onMutate: async (newDiscount) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: discountsQueryKeys.lists() });
      
      // Show optimistic UI
      toast.loading('Creating discount...', { id: 'create-discount' });
      
      return { newDiscount };
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.overview() });
      
      toast.success('Discount created successfully!', { id: 'create-discount' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create discount', { id: 'create-discount' });
    },
  });
}

// Enhanced update discount mutation
export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountDto> }) =>
      discountsService.updateDiscount(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: discountsQueryKeys.detail(id) });
      toast.loading('Updating discount...', { id: 'update-discount' });
    },
    onSuccess: (data, { id }) => {
      // Update the specific discount in cache
      queryClient.setQueryData(discountsQueryKeys.detail(id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.overview() });
      
      toast.success('Discount updated successfully!', { id: 'update-discount' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update discount', { id: 'update-discount' });
    },
  });
}

// Enhanced deactivate discount mutation
export function useDeactivateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => discountsService.deactivateDiscount(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: discountsQueryKeys.detail(id) });
      toast.loading('Deactivating discount...', { id: 'deactivate-discount' });
    },
    onSuccess: (data, id) => {
      // Update the specific discount in cache
      queryClient.setQueryData(discountsQueryKeys.detail(id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.overview() });
      
      toast.success('Discount deactivated successfully!', { id: 'deactivate-discount' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate discount', { id: 'deactivate-discount' });
    },
  });
}

// Enhanced bulk generation mutation
export function useGenerateBulkDiscounts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ template, count, prefix }: { 
      template: CreateDiscountDto; 
      count: number; 
      prefix?: string; 
    }) => discountsService.generateBulkDiscounts(template, count, prefix),
    onMutate: async () => {
      toast.loading('Generating discount codes...', { id: 'bulk-generate' });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: discountsQueryKeys.overview() });
      
      const generatedCount = (data as any)?.codes?.length || variables.count;
      toast.success(`Generated ${generatedCount} discount codes successfully!`, { 
        id: 'bulk-generate' 
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate discount codes', { id: 'bulk-generate' });
    },
  });
}

// Enhanced discount validation mutation with real-time feedback
export function useValidateDiscount() {
  return useMutation({
    mutationFn: (data: ValidateDiscountDto) => discountsService.validateDiscount(data),
    onMutate: () => {
      toast.loading('Validating discount code...', { id: 'validate-discount' });
    },
    onSuccess: (result) => {
      toast.dismiss('validate-discount');
      // Success/error handling is done in the component
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to validate discount code', { id: 'validate-discount' });
    },
    retry: 1,
  });
}

// Enhanced export mutation with progress feedback
export function useExportDiscounts() {
  return useMutation({
    mutationFn: (params: { format?: 'csv' | 'excel'; filters?: any }) => 
      discountsService.exportDiscounts(params),
    onMutate: () => {
      toast.loading('Preparing export...', { id: 'export-discounts' });
    },
    onSuccess: () => {
      toast.success('Export completed successfully!', { id: 'export-discounts' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export discounts', { id: 'export-discounts' });
    },
  });
}

// Utility hook for dashboard data combining overview and active discounts
export function useDiscountsDashboard() {
  const overview = useDiscountsOverview({ 
    refetchInterval: 30000 // Auto-refresh every 30s
  });
  const active = useActiveDiscounts({ 
    refetchInterval: 60000 // Auto-refresh every minute
  });
  
  return {
    overview: {
      data: overview.data,
      isLoading: overview.isLoading,
      error: overview.error,
      refetch: overview.refetch,
    },
    active: {
      data: active.data,
      isLoading: active.isLoading,
      error: active.error,
      refetch: active.refetch,
    },
    isLoading: overview.isLoading || active.isLoading,
    hasError: overview.error || active.error,
    refresh: () => {
      overview.refetch();
      active.refetch();
    },
  };
}