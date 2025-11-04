"use client";

import { Suspense, lazy, useMemo, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DateRangePicker } from "@/components/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download, AlertTriangle } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardErrorBoundary, DashboardSkeleton } from "@/components/dashboard/dashboard-error-boundary";

// Lazy load heavy components
const OverviewCards = lazy(() => import("@/components/analytics/overview-cards").then(m => ({ default: m.OverviewCards })));
const TimeSeriesChart = lazy(() => import("@/components/charts/time-series-chart-optimized").then(m => ({ default: m.TimeSeriesChart })));
const DonutChart = lazy(() => import("@/components/charts/donut-chart-optimized").then(m => ({ default: m.DonutChart })));
const TopPages = lazy(() => import("../../app/dashboard/components/top-pages"));
const DeviceBreakdown = lazy(() => import("../../app/dashboard/components/device-breakdown"));
const RevenueSummary = lazy(() => import("../../app/dashboard/components/revenue-summary"));

// Optimized hooks with better caching
import { 
  useOverviewStats, 
  useEventTrends, 
  useChannelPerformance,
  useRevenueAnalytics,
  useDeviceBreakdown,
  useTopPages
} from "@/hooks/use-analytics-optimized";

// Component-level loading fallbacks
const ChartSkeleton = () => (
  <Card>
    <CardHeader className="space-y-0 pb-2">
      <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
    </CardHeader>
    <CardContent>
      <div className="h-[300px] bg-muted animate-pulse rounded" />
    </CardContent>
  </Card>
);

const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPageOptimized() {
  const { dateRange } = useDashboardStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimized data fetching with proper dependencies
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useOverviewStats(dateRange);

  // Memoized data transformations to prevent unnecessary recalculations
  const transformedEventTrends = useMemo(() => {
    return null; // We'll load this lazily in the chart component
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Only invalidate essential queries, not all analytics
      await queryClient.invalidateQueries({ 
        queryKey: ['analytics', 'overview'],
        refetchType: 'active'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const handleExport = useCallback(() => {
    console.log('Export dashboard data');
  }, []);

  // Early error return
  if (overviewError) {
    return (
      <DashboardShell title="Dashboard" description="Welcome to your analytics dashboard">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Unable to load analytics data</h3>
              <p className="text-muted-foreground mt-2">
                Please check your connection to the analytics API and try again.
              </p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </DashboardShell>
    );
  }

  const actions = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh} 
        disabled={isRefreshing}
      >
        <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <DateRangePicker />
    </div>
  );

  return (
    <DashboardShell
      title="Analytics Dashboard"
      description="Real-time insights and comprehensive analytics"
      actions={actions}
    >
      <DashboardErrorBoundary>
        <div className="space-y-6">
          {/* Overview Cards - Load first, most important */}
          <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>}>
            <OverviewCards 
              data={overviewData || null}
              isLoading={overviewLoading}
              dateRange={dateRange}
            />
          </Suspense>
          
          {/* Main Charts Row - Load after overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <TimeSeriesChart
                dateRange={dateRange}
                title="User Sessions Over Time"
                valueFormatter={(value) => value.toLocaleString()}
              />
            </Suspense>
            
            <Suspense fallback={<ChartSkeleton />}>
              <DonutChart
                dateRange={dateRange}
                title="Traffic Sources"
                valueFormatter={(value) => `${value}%`}
              />
            </Suspense>
          </div>

          {/* Secondary Charts Row - Load last */}
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <TimeSeriesChart
                dateRange={dateRange}
                title="Page Views"
                type="pageviews"
                valueFormatter={(value) => value.toLocaleString()}
              />
            </Suspense>
            
            <Suspense fallback={<ChartSkeleton />}>
              <TimeSeriesChart
                dateRange={dateRange}
                title="Revenue Trends"
                type="revenue"
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
            </Suspense>
          </div>

          {/* Additional Insights Row - Load on demand */}
          <div className="grid gap-6 md:grid-cols-4">
            <Suspense fallback={<CardSkeleton />}>
              <TopPages dateRange={dateRange} />
            </Suspense>

            <Suspense fallback={<CardSkeleton />}>
              <DeviceBreakdown dateRange={dateRange} />
            </Suspense>

            <Suspense fallback={<CardSkeleton />}>
              <RevenueSummary dateRange={dateRange} />
            </Suspense>

            {/* Real-time users - only load if enabled */}
            <Suspense fallback={<CardSkeleton />}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Real-time Users</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Real-time tracking disabled
                  </p>
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </div>
      </DashboardErrorBoundary>
    </DashboardShell>
  );
}