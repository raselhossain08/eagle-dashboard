// hooks/use-redemptions.ts - Enhanced React Query Hooks for Redemptions
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getRedemptions,
  getRedemptionStats,
  getRedemptionById,
  flagRedemption,
  blockSuspiciousActivity,
  exportRedemptions,
  RedemptionsQueryParams,
  RedemptionsResponse,
  RedemptionStats,
  EnhancedRedemption
} from '@/services/redemptions';

// Re-export types for consumer convenience
export type { RedemptionsQueryParams, RedemptionsResponse, RedemptionStats, EnhancedRedemption };

// Query Keys
export const REDEMPTIONS_QUERY_KEYS = {
  all: ['redemptions'] as const,
  lists: () => [...REDEMPTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (params: RedemptionsQueryParams) => [...REDEMPTIONS_QUERY_KEYS.lists(), params] as const,
  details: () => [...REDEMPTIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REDEMPTIONS_QUERY_KEYS.details(), id] as const,
  stats: () => [...REDEMPTIONS_QUERY_KEYS.all, 'stats'] as const,
  statsWithParams: (params: any) => [...REDEMPTIONS_QUERY_KEYS.stats(), params] as const,
} as const;

// Hook Options
interface UseRedemptionsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retryCount?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: RedemptionsResponse) => void;
}

interface UseRedemptionStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: RedemptionStats) => void;
}

// Main Redemptions Hook with Enhanced Features
export function useRedemptions(
  params: RedemptionsQueryParams = {},
  options: UseRedemptionsOptions = {}
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: REDEMPTIONS_QUERY_KEYS.list(params),
    queryFn: () => getRedemptions(params),
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes
    refetchInterval: options.refetchInterval,
    retry: options.retryCount || 3,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Handle errors and success manually with useEffect if needed
  const { error, data, isSuccess } = query;
  
  if (error && options.onError) {
    console.error('Redemptions fetch error:', error);
    toast.error('Failed to load redemptions data');
    options.onError(error as Error);
  }
  
  if (data && isSuccess && options.onSuccess) {
    options.onSuccess(data);
  }

  // Manual refresh function
  const refresh = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: REDEMPTIONS_QUERY_KEYS.lists()
    });
  }, [queryClient]);

  // Prefetch next page for performance
  const prefetchNextPage = useCallback(() => {
    if (query.data?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: REDEMPTIONS_QUERY_KEYS.list({ ...params, page: (params.page || 1) + 1 }),
        queryFn: () => getRedemptions({ ...params, page: (params.page || 1) + 1 }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient, query.data?.hasNext, params]);

  // Enhanced data with computed properties
  const enhancedData = useMemo(() => {
    if (!query.data) return null;

    const { redemptions, metadata } = query.data;

    // Calculate additional metrics
    const suspiciousRedemptions = redemptions.filter(r => r.isSuspicious);
    const highValueRedemptions = redemptions.filter(r => r.orderAmount > 50000); // $500+
    const recentRedemptions = redemptions.filter(r => 
      new Date().getTime() - r.redeemedAt.getTime() < 24 * 60 * 60 * 1000
    );

    // Fraud risk distribution
    const riskDistribution = redemptions.reduce((acc, r) => {
      const risk = r.riskLevel || 'low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Channel performance
    const channelStats = redemptions.reduce((acc, r) => {
      const channel = r.channelSource || 'unknown';
      if (!acc[channel]) {
        acc[channel] = {
          count: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          avgOrderValue: 0
        };
      }
      acc[channel].count += 1;
      acc[channel].totalRevenue += r.finalAmount;
      acc[channel].totalDiscount += r.discountAmount;
      return acc;
    }, {} as Record<string, any>);

    // Calculate average order values for channels
    Object.keys(channelStats).forEach(channel => {
      channelStats[channel].avgOrderValue = 
        channelStats[channel].totalRevenue / channelStats[channel].count;
    });

    return {
      ...query.data,
      computed: {
        suspiciousRedemptions,
        highValueRedemptions,
        recentRedemptions,
        riskDistribution,
        channelStats,
        suspiciousRate: (suspiciousRedemptions.length / redemptions.length) * 100,
        averageFraudScore: redemptions.reduce((sum, r) => sum + (r.fraudScore || 0), 0) / redemptions.length,
        totalSavings: metadata.totalDiscounts,
        conversionValue: metadata.totalValue - metadata.totalDiscounts
      }
    };
  }, [query.data]);

  return {
    ...query,
    data: enhancedData,
    refresh,
    prefetchNextPage,
    // Convenience flags
    hasRedemptions: (query.data?.redemptions.length || 0) > 0,
    hasSuspiciousActivity: (enhancedData?.computed.suspiciousRedemptions.length || 0) > 0,
    isEmpty: query.isSuccess && (query.data?.redemptions.length || 0) === 0,
  };
}

// Infinite Scroll Hook for Large Datasets
export function useInfiniteRedemptions(
  baseParams: Omit<RedemptionsQueryParams, 'page'> = {},
  options: UseRedemptionsOptions = {}
) {
  return useInfiniteQuery({
    queryKey: REDEMPTIONS_QUERY_KEYS.list(baseParams),
    queryFn: ({ pageParam = 1 }) => getRedemptions({ ...baseParams, page: pageParam as number }),
    getNextPageParam: (lastPage: RedemptionsResponse) => 
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000,
    gcTime: options.cacheTime || 10 * 60 * 1000,
    retry: options.retryCount || 3,
    initialPageParam: 1,
  });
}

// Redemption Statistics Hook
export function useRedemptionStats(
  params: { startDate?: string; endDate?: string } = {},
  options: UseRedemptionStatsOptions = {}
) {
  const query = useQuery({
    queryKey: REDEMPTIONS_QUERY_KEYS.statsWithParams(params),
    queryFn: () => getRedemptionStats(params),
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 2 * 60 * 1000, // 2 minutes for stats
    refetchInterval: options.refetchInterval || 30000, // Auto-refresh every 30 seconds
    retry: 3,
  });

  // Handle errors manually
  if (query.error && options.onError) {
    console.error('Redemption stats error:', query.error);
    toast.error('Failed to load redemption statistics');
    options.onError(query.error as Error);
  }

  if (query.data && query.isSuccess && options.onSuccess) {
    options.onSuccess(query.data);
  }

  return query;
}

// Single Redemption Detail Hook
export function useRedemptionDetail(
  id: string,
  options: { enabled?: boolean; onError?: (error: Error) => void } = {}
) {
  const query = useQuery({
    queryKey: REDEMPTIONS_QUERY_KEYS.detail(id),
    queryFn: () => getRedemptionById(id),
    enabled: options.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Handle errors manually
  if (query.error && options.onError) {
    console.error('Redemption detail error:', query.error);
    toast.error('Failed to load redemption details');
    options.onError(query.error as Error);
  }

  return query;
}

// Flag Redemption Mutation Hook
export function useFlagRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flagData }: { 
      id: string; 
      flagData: { reason: string; notes?: string } 
    }) => flagRedemption(id, flagData),
    onSuccess: (data, variables) => {
      toast.success(data.message);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: REDEMPTIONS_QUERY_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: REDEMPTIONS_QUERY_KEYS.detail(variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: REDEMPTIONS_QUERY_KEYS.stats()
      });
    },
    onError: (error: Error) => {
      console.error('Flag redemption error:', error);
      toast.error('Failed to flag redemption');
    },
  });
}

// Block Suspicious Activity Mutation Hook
export function useBlockSuspiciousActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (criteria: {
      ipAddress?: string;
      userId?: string;
      pattern?: string;
      reason?: string;
    }) => blockSuspiciousActivity(criteria),
    onSuccess: (data) => {
      toast.success(`${data.message}. Blocked ${data.blockedCount} redemptions.`);
      
      // Invalidate all redemptions data
      queryClient.invalidateQueries({
        queryKey: REDEMPTIONS_QUERY_KEYS.all
      });
    },
    onError: (error: Error) => {
      console.error('Block suspicious activity error:', error);
      toast.error('Failed to block suspicious activity');
    },
  });
}

// Export Redemptions Mutation Hook
export function useExportRedemptions() {
  return useMutation({
    mutationFn: (params: RedemptionsQueryParams & { format?: 'csv' | 'excel' | 'json' }) => 
      exportRedemptions(params),
    onSuccess: (blob, variables) => {
      const format = variables.format || 'csv';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redemptions-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Redemptions exported successfully as ${format.toUpperCase()}`);
    },
    onError: (error: Error) => {
      console.error('Export error:', error);
      toast.error('Failed to export redemptions data');
    },
  });
}

// Real-time Polling Hook for Live Updates
export function useRedemptionsRealTime(
  params: RedemptionsQueryParams = {},
  options: { 
    enabled?: boolean; 
    interval?: number;
    onNewData?: (newData: RedemptionsResponse) => void;
  } = {}
) {
  const queryClient = useQueryClient();
  const interval = options.interval || 10000; // 10 seconds default

  const query = useRedemptions(params, {
    enabled: options.enabled !== false,
    refetchInterval: interval,
    staleTime: 0, // Always consider data stale for real-time updates
    onSuccess: (data) => {
      options.onNewData?.(data);
    }
  });

  // Real-time notifications for suspicious activity
  const checkForSuspiciousActivity = useCallback((data: any) => {
    const suspiciousCount = data.computed?.suspiciousRedemptions.length || 0;
    
    if (suspiciousCount > 0) {
      const lastCheck = localStorage.getItem('lastSuspiciousCheck');
      const now = Date.now();
      
      // Only notify if we haven't checked in the last 30 seconds
      if (!lastCheck || now - parseInt(lastCheck) > 30000) {
        toast.warning(
          `${suspiciousCount} suspicious redemption${suspiciousCount > 1 ? 's' : ''} detected!`,
          {
            action: {
              label: 'View Details',
              onClick: () => {
                // Navigate to suspicious redemptions view
                window.location.href = '/dashboard/discounts/redemptions?filter=suspicious';
              }
            }
          }
        );
        localStorage.setItem('lastSuspiciousCheck', String(now));
      }
    }
  }, []);

  // Monitor for suspicious activity
  if (query.data?.computed?.suspiciousRedemptions.length) {
    checkForSuspiciousActivity(query.data);
  }

  return {
    ...query,
    isRealTime: true,
    pollingInterval: interval,
    stopPolling: () => queryClient.cancelQueries({
      queryKey: REDEMPTIONS_QUERY_KEYS.list(params)
    }),
  };
}

// Enhanced Search Hook with Debouncing
export function useRedemptionsSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: (searchParams: {
      query: string;
      filters: RedemptionsQueryParams;
    }) => {
      // Implement search logic here
      return getRedemptions({
        ...searchParams.filters,
        search: searchParams.query
      });
    },
    onError: (error: Error) => {
      console.error('Search error:', error);
      toast.error('Failed to search redemptions');
    },
  });

  const performSearch = useCallback((query: string, filters: RedemptionsQueryParams = {}) => {
    if (query.trim().length === 0) {
      return Promise.resolve(null);
    }

    return searchMutation.mutateAsync({
      query: query.trim(),
      filters
    });
  }, [searchMutation]);

  return {
    ...searchMutation,
    performSearch,
    isSearching: searchMutation.isPending,
  };
}

// Legacy hooks for backward compatibility
export const useRedemption = useRedemptionDetail;

export const useSuspiciousRedemptions = () => {
  return useRedemptions({ 
    sortBy: 'redeemedAt', 
    sortOrder: 'desc',
    includeFraudScore: true 
  });
};