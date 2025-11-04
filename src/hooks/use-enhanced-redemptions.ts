// hooks/use-enhanced-redemptions.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { DateRange } from '@/types/discounts';
import { 
  RedemptionAnalyticsAPI, 
  RedemptionAnalyticsParams,
  RedemptionAnalyticsResponse,
  RealtimeRedemptionsResponse,
  dateRangeToParams,
  RecentRedemption
} from '@/lib/api/redemption-analytics';

export const REDEMPTIONS_QUERY_KEY = 'redemptions';

// Enhanced redemption analytics interface
export interface RedemptionAnalyticsData {
  // Core metrics
  totalRedemptions: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  averageOrderValue: number;
  conversionRate: number;
  
  // Time-based analytics
  periodComparison: {
    current: {
      redemptions: number;
      revenue: number;
      growth: number;
    };
    previous: {
      redemptions: number;
      revenue: number;
      growth: number;
    };
    changePercent: number;
  };
  
  // Channel performance
  topChannels: Array<{
    channel: string;
    redemptions: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
  }>;
  
  // Code performance
  topCodes: Array<{
    code: string;
    redemptions: number;
    revenue: number;
    conversionRate: number;
    discountAmount: number;
  }>;
  
  // Time series data for charts
  timeline: Array<{
    date: string;
    redemptions: number;
    revenue: number;
    discountAmount: number;
    conversionRate: number;
  }>;
  
  // Geographic insights
  topCountries: Array<{
    country: string;
    redemptions: number;
    revenue: number;
  }>;
  
  // Customer insights
  customerSegments: Array<{
    segment: string;
    redemptions: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  
  // Performance funnel
  conversionFunnel: Array<{
    step: string;
    count: number;
    rate: number;
  }>;
}

// Enhanced options interface
export interface UseRedemptionAnalyticsOptions {
  dateRange: DateRange;
  refreshInterval?: number;
  enableRealTime?: boolean;
  includeComparison?: boolean;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Enhanced hook for comprehensive redemption analytics with real-time updates
 */
export function useRedemptionAnalytics(options: UseRedemptionAnalyticsOptions) {
  const {
    dateRange,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    enableRealTime = true,
    includeComparison = true,
    granularity = 'day'
  } = options;

  return useQuery({
    queryKey: [
      REDEMPTIONS_QUERY_KEY, 
      'analytics', 
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
      granularity,
      includeComparison
    ],
    queryFn: async (): Promise<RedemptionAnalyticsData> => {
      try {
        // Fetch comprehensive analytics data from API
        const baseStats = await RedemptionAnalyticsAPI.getAnalytics({
          ...dateRangeToParams(dateRange),
          granularity: granularity === 'hour' ? 'day' : granularity,
          includeComparison
        });

        // Extract data from the comprehensive response
        const {
          timeline = [],
          topChannels = [],
          topCodes = [],
          topCountries = [],
          customerSegments = [],
          conversionFunnel = []
        } = baseStats;

        // Transform and combine the data
        return {
          totalRedemptions: baseStats.totalRedemptions || 0,
          totalRevenue: baseStats.totalRevenue || 0,
          totalDiscountAmount: baseStats.totalDiscountAmount || 0,
          averageOrderValue: baseStats.averageOrderValue || 0,
          conversionRate: baseStats.conversionRate || 0,
          
          periodComparison: {
            current: { 
              redemptions: baseStats.totalRedemptions || 0, 
              revenue: baseStats.totalRevenue || 0, 
              growth: baseStats.redemptionGrowthRate || 0 
            },
            previous: { 
              redemptions: baseStats.previousPeriodRedemptions || 0, 
              revenue: baseStats.previousPeriodRevenue || 0, 
              growth: baseStats.revenueGrowthRate || 0 
            },
            changePercent: baseStats.redemptionGrowthRate || 0
          },
          
          topChannels: topChannels || [],
          topCodes: topCodes || [],
          timeline: timeline.map(point => ({
            ...point,
            discountAmount: 0 // Will be calculated from analytics
          })) || [],
          topCountries: topCountries || [],
          customerSegments: customerSegments || [],
          conversionFunnel: conversionFunnel || []
        };
      } catch (error: any) {
        console.error('Failed to fetch redemption analytics:', error);
        throw new Error(`Analytics fetch failed: ${error.message}`);
      }
    },
    staleTime: enableRealTime ? 30 * 1000 : 10 * 60 * 1000, // 30s for real-time, 10min otherwise
    refetchInterval: enableRealTime ? refreshInterval : false,
    refetchIntervalInBackground: enableRealTime,
    retry: (failureCount, error: any) => {
      // Retry logic for different error types
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false; // Don't retry for permission/not found errors
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook for exporting redemption analytics data
 */
export function useExportRedemptionAnalytics() {
  return useMutation({
    mutationFn: async (params: {
      dateRange: DateRange;
      format: 'csv' | 'excel' | 'json';
      includeDetails?: boolean;
      filters?: any;
    }) => {
      const response = await RedemptionAnalyticsAPI.exportAnalytics({
        ...dateRangeToParams(params.dateRange),
        format: params.format,
        includeDetails: params.includeDetails || false
      });
      
      return response;
    },
    onSuccess: () => {
      toast.success('Analytics export completed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to export analytics', {
        description: error?.message || 'Please try again'
      });
    },
  });
}

/**
 * Hook for real-time redemption monitoring
 */
export function useRealTimeRedemptions(options: {
  enablePolling?: boolean;
  onNewRedemption?: (redemption: any) => void;
}) {
  const { enablePolling = true, onNewRedemption } = options;
  const queryClient = useQueryClient();

  const { data: recentRedemptions } = useQuery({
    queryKey: [REDEMPTIONS_QUERY_KEY, 'real-time'],
    queryFn: () => RedemptionAnalyticsAPI.getRealtimeRedemptions({ limit: 10 }),
    enabled: enablePolling,
    refetchInterval: 15 * 1000, // 15 seconds
    refetchIntervalInBackground: true,
  });

  // Handle new redemption detection using useEffect
  useEffect(() => {
    if (onNewRedemption && recentRedemptions?.recent && recentRedemptions.recent.length > 0) {
      // Check if there are new redemptions compared to previous render
      const previousData = queryClient.getQueryData([REDEMPTIONS_QUERY_KEY, 'real-time-previous']);
      if (previousData && Array.isArray(recentRedemptions.recent)) {
        const newRedemptions = recentRedemptions.recent.filter(
          (redemption: RecentRedemption) => !(previousData as any)?.recent?.find((prev: any) => prev.id === redemption.id)
        );
        
        newRedemptions.forEach(onNewRedemption);
      }
      
      // Store current data for next comparison
      queryClient.setQueryData([REDEMPTIONS_QUERY_KEY, 'real-time-previous'], recentRedemptions);
    }
  }, [recentRedemptions, onNewRedemption, queryClient]);

  return { recentRedemptions: recentRedemptions?.recent || [] };
}

/**
 * Hook for comparative analytics (period over period)
 */
export function useComparativeAnalytics(
  currentPeriod: DateRange,
  comparisonPeriod: DateRange
) {
  return useQuery({
    queryKey: [
      REDEMPTIONS_QUERY_KEY,
      'comparison',
      currentPeriod.from.toISOString(),
      currentPeriod.to.toISOString(),
      comparisonPeriod.from.toISOString(),
      comparisonPeriod.to.toISOString()
    ],
    queryFn: async () => {
      const [currentData, comparisonData] = await Promise.all([
        RedemptionAnalyticsAPI.getAnalytics({
          ...dateRangeToParams(currentPeriod),
          includeComparison: false
        }),
        RedemptionAnalyticsAPI.getAnalytics({
          ...dateRangeToParams(comparisonPeriod),
          includeComparison: false
        })
      ]);

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        current: currentData,
        comparison: comparisonData,
        changes: {
          redemptions: calculateChange(
            currentData.totalRedemptions,
            comparisonData.totalRedemptions
          ),
          revenue: calculateChange(
            currentData.totalRevenue,
            comparisonData.totalRevenue
          ),
          conversionRate: calculateChange(
            currentData.conversionRate,
            comparisonData.conversionRate
          ),
          averageOrderValue: calculateChange(
            currentData.averageOrderValue,
            comparisonData.averageOrderValue
          )
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for advanced filtering and search
 */
export function useRedemptionFiltering() {
  const queryClient = useQueryClient();

  const searchRedemptions = useMutation({
    mutationFn: async (params: {
      query: string;
      filters: any;
      dateRange: DateRange;
      limit?: number;
    }) => {
      // For now, return analytics data as search is not implemented yet
      const analytics = await RedemptionAnalyticsAPI.getAnalytics({
        ...dateRangeToParams(params.dateRange)
      });
      
      return {
        results: analytics.topCodes.slice(0, params.limit || 10),
        totalCount: analytics.totalRedemptions,
        query: params.query
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [REDEMPTIONS_QUERY_KEY] });
    }
  });

  return { searchRedemptions };
}