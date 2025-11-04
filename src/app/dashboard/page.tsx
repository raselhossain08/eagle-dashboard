"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { DateRangePicker } from "@/components/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download, AlertTriangle, TrendingUp, Users, Eye, DollarSign } from "lucide-react";
import { 
  useOverviewStats, 
  useEventTrends, 
  useChannelPerformance,
  useRealTimeUsers,
  useRevenueAnalytics,
  useDeviceBreakdown,
  useTopPages
} from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardErrorBoundary, DashboardSkeleton } from "@/components/dashboard/dashboard-error-boundary";

export default function DashboardPage() {
  const { dateRange, setDateRange } = useDashboardStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Analytics data hooks
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useOverviewStats(dateRange);
  const { data: eventTrends, isLoading: trendsLoading, error: trendsError } = useEventTrends(dateRange);
  const { data: channelData, isLoading: channelsLoading, error: channelsError } = useChannelPerformance(dateRange);
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueAnalytics(dateRange);
  const { data: deviceData, isLoading: deviceLoading } = useDeviceBreakdown(dateRange);
  const { data: topPages, isLoading: pagesLoading } = useTopPages(dateRange, 5);
  const { data: realTimeUsers } = useRealTimeUsers();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Export dashboard data');
  };

  // Error handling
  const hasError = overviewError || trendsError || channelsError || revenueError;
  
  if (hasError) {
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
      {realTimeUsers && (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          {realTimeUsers} active users
        </Badge>
      )}
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

  // Show loading skeleton while initial data loads
  const isInitialLoading = overviewLoading && !overviewData;

  return (
    <DashboardShell
      title="Analytics Dashboard"
      description="Real-time insights and comprehensive analytics"
      actions={actions}
    >
      <DashboardErrorBoundary>
        {isInitialLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
        {/* Overview Cards */}
        <OverviewCards 
          data={overviewData || null}
          isLoading={overviewLoading}
          dateRange={dateRange}
        />
        
        {/* Main Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={eventTrends?.map(item => ({ 
              date: item.date, 
              value: item.sessions 
            })) || []}
            title="User Sessions Over Time"
            valueFormatter={(value) => value.toLocaleString()}
            isLoading={trendsLoading}
          />
          <DonutChart
            data={channelData?.map((item, index) => ({
              name: item.name,
              value: item.value,
              color: item.color || `hsl(${index * 60}, 70%, 50%)`
            })) || []}
            title="Traffic Sources"
            valueFormatter={(value) => `${value}%`}
            isLoading={channelsLoading}
          />
        </div>

        {/* Secondary Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <TimeSeriesChart
            data={eventTrends?.map(item => ({ 
              date: item.date, 
              value: item.events 
            })) || []}
            title="Page Views"
            valueFormatter={(value) => value.toLocaleString()}
            isLoading={trendsLoading}
          />
          <TimeSeriesChart
            data={revenueData?.trends?.map(item => ({ 
              date: item.date, 
              value: item.revenue 
            })) || []}
            title="Revenue Trends"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            isLoading={revenueLoading}
          />
        </div>

        {/* Additional Insights Row */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {pagesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {topPages?.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="truncate flex-1 mr-2">{page.path}</span>
                      <span className="text-muted-foreground">{page.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Device Types</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {deviceLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {deviceData?.map((device, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{device.device}</span>
                      <span className="text-muted-foreground">
                        {device.sessions.toLocaleString()} sessions
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Revenue Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {revenueLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">
                      ${revenueData?.totalRevenue?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recurring</span>
                    <span className="text-green-600">
                      ${revenueData?.recurringRevenue?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Order Value</span>
                    <span>
                      ${revenueData?.averageOrderValue?.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>


          </div>
        )}
      </DashboardErrorBoundary>
    </DashboardShell>
  );
}