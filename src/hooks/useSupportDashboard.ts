// hooks/useSupportDashboard.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/lib/api/support';

// Dashboard-specific hooks for real-time data
export const useSupportDashboardStats = () => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'stats'],
    queryFn: () => supportService.getSupportStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
  });
};

// Recent activities hook
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'recent-activities', limit],
    queryFn: () => supportService.getRecentActivities(limit),
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
    staleTime: 10000,
  });
};

// Pending follow-ups hook
export const usePendingFollowUps = (limit: number = 5) => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'pending-followups', limit],
    queryFn: () => supportService.getPendingFollowUps(limit),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
};

// Dashboard analytics hook with date range support
export const useDashboardAnalytics = (dateRange?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'analytics', dateRange],
    queryFn: () => supportService.getDashboardAnalytics(dateRange),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 120000, // Data is fresh for 2 minutes
  });
};

// Customer satisfaction trend
export const useCustomerSatisfactionTrend = (days: number = 30) => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'satisfaction-trend', days],
    queryFn: () => supportService.getCustomerSatisfactionTrend(days),
    refetchInterval: 300000,
    staleTime: 120000,
  });
};

// Support ticket trends for dashboard
export const useTicketTrends = (period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 7) => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'ticket-trends', period, days],
    queryFn: () => supportService.getTicketTrends(period, days),
    refetchInterval: 180000, // Refresh every 3 minutes
    staleTime: 60000,
  });
};

// Performance overview for the dashboard
export const usePerformanceOverview = () => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'performance-overview'],
    queryFn: () => supportService.getPerformanceOverview(),
    refetchInterval: 300000,
    staleTime: 120000,
  });
};

// Real-time notifications for urgent items
export const useUrgentNotifications = () => {
  return useQuery({
    queryKey: ['support', 'dashboard', 'urgent-notifications'],
    queryFn: () => supportService.getUrgentNotifications(),
    refetchInterval: 10000, // Very frequent for urgent items
    staleTime: 5000,
  });
};

// Combined dashboard hook for all data at once
export const useCompleteDashboard = (options?: {
  enableRealTime?: boolean;
  dateRange?: { startDate?: string; endDate?: string };
}) => {
  const queryClient = useQueryClient();
  const { enableRealTime = true, dateRange } = options || {};
  
  const refetchInterval = enableRealTime ? 30000 : undefined;
  
  const stats = useSupportDashboardStats();
  const recentActivities = useRecentActivities(10);
  const pendingFollowUps = usePendingFollowUps(5);
  const analytics = useDashboardAnalytics(dateRange);
  const satisfactionTrend = useCustomerSatisfactionTrend();
  const performanceOverview = usePerformanceOverview();
  const urgentNotifications = useUrgentNotifications();
  
  const isLoading = stats.isLoading || recentActivities.isLoading || 
                   pendingFollowUps.isLoading || analytics.isLoading;
  
  const hasError = stats.error || recentActivities.error || 
                   pendingFollowUps.error || analytics.error;
  
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['support', 'dashboard'] });
  };
  
  return {
    stats: stats.data,
    recentActivities: recentActivities.data,
    pendingFollowUps: pendingFollowUps.data,
    analytics: analytics.data,
    satisfactionTrend: satisfactionTrend.data,
    performanceOverview: performanceOverview.data,
    urgentNotifications: urgentNotifications.data,
    isLoading,
    hasError,
    refetchAll,
    // Individual loading states
    statsLoading: stats.isLoading,
    activitiesLoading: recentActivities.isLoading,
    followUpsLoading: pendingFollowUps.isLoading,
    analyticsLoading: analytics.isLoading,
    // Individual error states
    statsError: stats.error,
    activitiesError: recentActivities.error,
    followUpsError: pendingFollowUps.error,
    analyticsError: analytics.error,
  };
};