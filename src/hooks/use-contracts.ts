import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Contract,
  ContractMetrics,
  PaginatedContracts,
  CreateContractDto,
  SignContractDto,
  ContractTemplate,
  DateRange,
  ContractsQueryParams
} from '@/lib/types/contracts';
import ContractsService, {
  ContractSearchParams,
  UpdateContractDto,
  BulkActionDto,
  ContractMetricsQuery,
  EnhancedContractMetrics
} from '@/services/contracts.service';

// Query Keys
export const contractsQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractsQueryKeys.all, 'list'] as const,
  list: (params: ContractSearchParams) => [...contractsQueryKeys.lists(), params] as const,
  details: () => [...contractsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractsQueryKeys.details(), id] as const,
  metrics: () => [...contractsQueryKeys.all, 'metrics'] as const,
  metricsWithParams: (params: ContractMetricsQuery) => [...contractsQueryKeys.metrics(), params] as const,
  templates: () => [...contractsQueryKeys.all, 'templates'] as const,
  activity: (id: string) => [...contractsQueryKeys.all, 'activity', id] as const,
};

// Enhanced hook for fetching contracts with advanced filtering
export function useContracts(
  params: ContractSearchParams = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    keepPreviousData?: boolean;
  }
) {
  return useQuery({
    queryKey: contractsQueryKeys.list(params),
    queryFn: () => ContractsService.getContracts(params),
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

// Hook for infinite scrolling contracts
export function useInfiniteContracts(
  baseParams: Omit<ContractSearchParams, 'page'> = {}
) {
  return useInfiniteQuery({
    queryKey: [...contractsQueryKeys.lists(), 'infinite', baseParams],
    queryFn: ({ pageParam = 1 }) =>
      ContractsService.getContracts({
        ...baseParams,
        page: pageParam,
        limit: baseParams.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.meta.page < lastPage.meta.totalPages;
      return hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Enhanced hook for fetching contract metrics
export function useContractMetrics(
  dateRange?: DateRange,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const params: ContractMetricsQuery = {
    ...(dateRange?.from && { dateFrom: dateRange.from.toISOString() }),
    ...(dateRange?.to && { dateTo: dateRange.to.toISOString() }),
  };

  return useQuery({
    queryKey: contractsQueryKeys.metricsWithParams(params),
    queryFn: () => ContractsService.getContractMetrics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for metrics
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval || 30000, // Auto-refresh every 30s
  });
}

// Enhanced hook for fetching single contract
export function useContract(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: contractsQueryKeys.detail(id),
    queryFn: () => ContractsService.getContract(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled && !!id,
  });
}

// Hook for fetching contract templates
export function useContractTemplates(
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: contractsQueryKeys.templates(),
    queryFn: () => ContractsService.getTemplates(),
    staleTime: 10 * 60 * 1000, // Templates don't change often
    gcTime: 30 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

// Hook for fetching contract activity
export function useContractActivity(
  id: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: contractsQueryKeys.activity(id),
    queryFn: () => ContractsService.getActivity(id),
    staleTime: 30 * 1000, // 30 seconds for activity logs
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled && !!id,
    refetchInterval: options?.refetchInterval || 10000, // Refresh every 10s
  });
}

// Enhanced mutation hook for creating contracts
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractDto) => ContractsService.createContract(data),
    onSuccess: (newContract) => {
      // Invalidate contracts lists
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      
      // Add to cache
      queryClient.setQueryData(contractsQueryKeys.detail(newContract.id), newContract);
      
      toast.success('Contract created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create contract:', error);
      toast.error(`Failed to create contract: ${error.message}`);
    },
  });
}

// Enhanced mutation hook for updating contracts
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractDto }) =>
      ContractsService.updateContract(id, data),
    onSuccess: (updatedContract, { id }) => {
      // Update specific contract in cache
      queryClient.setQueryData(contractsQueryKeys.detail(id), updatedContract);
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      
      toast.success('Contract updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update contract:', error);
      toast.error(`Failed to update contract: ${error.message}`);
    },
  });
}

// Mutation hook for deleting contracts
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ContractsService.deleteContract(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contractsQueryKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      
      toast.success('Contract deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete contract:', error);
      toast.error(`Failed to delete contract: ${error.message}`);
    },
  });
}

// Enhanced mutation hook for sending contracts
export function useSendContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { recipientEmail: string; message?: string } }) =>
      ContractsService.sendContract(id, data),
    onSuccess: (updatedContract, { id }) => {
      // Update contract in cache
      queryClient.setQueryData(contractsQueryKeys.detail(id), updatedContract);
      
      // Invalidate lists and metrics
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.activity(id) });
      
      toast.success('Contract sent successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to send contract:', error);
      toast.error(`Failed to send contract: ${error.message}`);
    },
  });
}

// Mutation hook for signing contracts
export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignContractDto }) =>
      ContractsService.signContract(id, data),
    onSuccess: (signedContract, { id }) => {
      // Update contract in cache
      queryClient.setQueryData(contractsQueryKeys.detail(id), signedContract);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.activity(id) });
      
      toast.success('Contract signed successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to sign contract:', error);
      toast.error(`Failed to sign contract: ${error.message}`);
    },
  });
}

// Enhanced mutation hook for voiding contracts
export function useVoidContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ContractsService.voidContract(id, reason),
    onSuccess: (voidedContract, { id }) => {
      // Update contract in cache
      queryClient.setQueryData(contractsQueryKeys.detail(id), voidedContract);
      
      // Invalidate lists and metrics
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.activity(id) });
      
      toast.success('Contract voided successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to void contract:', error);
      toast.error(`Failed to void contract: ${error.message}`);
    },
  });
}

// Mutation hook for bulk actions
export function useBulkContractAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkActionDto) => ContractsService.bulkAction(data),
    onSuccess: (result, { action, contractIds }) => {
      // Remove deleted contracts from cache if action was delete
      if (action === 'delete') {
        contractIds.forEach(id => {
          queryClient.removeQueries({ queryKey: contractsQueryKeys.detail(id) });
        });
      }
      
      // Invalidate all lists and metrics
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.metrics() });
      
      toast.success(`Bulk ${action} completed successfully. ${result.affected} contracts affected.`);
    },
    onError: (error: Error) => {
      console.error('Failed to perform bulk action:', error);
      toast.error(`Failed to perform bulk action: ${error.message}`);
    },
  });
}

// Enhanced download contract hook
export function useDownloadContract() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'excel' | 'pdf'; filters?: ContractSearchParams }) =>
      ContractsService.exportContracts(format, filters),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contracts-export-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download completed successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to download contracts:', error);
      toast.error(`Failed to download contracts: ${error.message}`);
    },
  });
}

// Custom hook for real-time contracts with polling
export function useRealTimeContracts(
  params: ContractSearchParams = {},
  enabled = true
) {
  return useContracts(params, {
    enabled,
    refetchInterval: 15000, // Poll every 15 seconds
    keepPreviousData: true,
  });
}

// Custom hook for dashboard data
export function useContractsDashboard(dateRange?: DateRange) {
  const metricsQuery = useContractMetrics(dateRange, {
    refetchInterval: 30000, // Refresh metrics every 30s
  });

  const recentContractsQuery = useContracts({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }, {
    refetchInterval: 60000, // Refresh recent contracts every minute
  });

  const expiringContractsQuery = useContracts({
    expirationFilter: 'expiring-soon',
    limit: 10,
    sortBy: 'expiresAt',
    sortOrder: 'asc',
  }, {
    refetchInterval: 300000, // Refresh expiring contracts every 5 minutes
  });

  return {
    metrics: metricsQuery,
    recentContracts: recentContractsQuery,
    expiringContracts: expiringContractsQuery,
    isLoading: metricsQuery.isLoading || recentContractsQuery.isLoading || expiringContractsQuery.isLoading,
    isError: metricsQuery.isError || recentContractsQuery.isError || expiringContractsQuery.isError,
    error: metricsQuery.error || recentContractsQuery.error || expiringContractsQuery.error,
  };
}