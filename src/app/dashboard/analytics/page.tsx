"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewStats, useEventTrends, useChannelPerformance } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { AlertTriangle, Database } from "lucide-react";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const { dateRange } = useDashboardStore();
  
  // API Hooks
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useOverviewStats(dateRange);
  const { data: eventTrends, isLoading: trendsLoading, error: trendsError } = useEventTrends({
    ...dateRange,
    groupBy: 'day'
  });
  const { data: channelData, isLoading: channelLoading, error: channelError } = useChannelPerformance(dateRange);

  // Transform channel data for DonutChart
  const transformedChannelData = useMemo(() => {
    if (channelData && channelData.length > 0) {
      const totalSessions = channelData.reduce((sum, item) => sum + item.sessions, 0);
      return channelData.map((item, index) => ({
        name: item.channel || 'Unknown',
        value: totalSessions > 0 ? Math.round((item.sessions / totalSessions) * 100) : 0,
        color: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"][index % 6]
      }));
    }
    return [];
  }, [channelData]);

  // Transform event trends data for TimeSeriesChart
  const transformedEventTrends = useMemo(() => {
    if (eventTrends && eventTrends.length > 0) {
      return eventTrends.map(item => ({
        date: item.date || new Date().toISOString().split('T')[0],
        value: item.count || 0,
        category: item.event || 'Unknown'
      }));
    }
    return [];
  }, [eventTrends]);

  const hasData = overviewData || eventTrends?.length || channelData?.length;
  const hasErrors = overviewError || trendsError || channelError;
  const isLoading = overviewLoading || trendsLoading || channelLoading;

  // Error state
  if (hasErrors && !isLoading) {
    return (
      <DashboardShell
        title="Analytics"
        description="Comprehensive analytics dashboard with real-time insights"
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data from the backend. Please check your connection and try again.
            <div className="mt-2 text-sm">
              {overviewError && <div>Overview: {overviewError.message}</div>}
              {trendsError && <div>Trends: {trendsError.message}</div>}
              {channelError && <div>Channels: {channelError.message}</div>}
            </div>
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  // Loading state
  if (isLoading && !hasData) {
    return (
      <DashboardShell
        title="Analytics"
        description="Comprehensive analytics dashboard with real-time insights"
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  // No data state (only when there's actually no data, not as fallback)
  if (!hasData && !isLoading && !hasErrors) {
    return (
      <DashboardShell
        title="Analytics"
        description="Comprehensive analytics dashboard with real-time insights"
      >
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No analytics data available</h3>
          <p className="text-muted-foreground mt-2">
            No analytics events have been recorded yet. Data will appear here as users interact with the system.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Analytics"
      description="Comprehensive analytics dashboard with real-time insights"
    >
      <div className="space-y-6">
        <OverviewCards 
          data={overviewData || null}
          isLoading={overviewLoading}
          dateRange={dateRange}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={transformedEventTrends}
            title="Event Trends"
            valueFormatter={(value) => value.toLocaleString()}
            showLegend={true}
            isLoading={trendsLoading}
          />
          <DonutChart
            data={transformedChannelData}
            title="Traffic Channels"
            valueFormatter={(value) => `${value}%`}
            isLoading={channelLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}