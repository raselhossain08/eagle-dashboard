"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useOverviewStats, useEventTrends, useChannelPerformance } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
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
    if (channelError) {
      console.error('❌ Channel data error:', channelError);
    }
    
    if (channelData && channelData.length > 0) {
      const totalSessions = channelData.reduce((sum, item) => sum + item.sessions, 0);
      return channelData.map((item, index) => ({
        name: item.channel || 'Unknown',
        value: totalSessions > 0 ? Math.round((item.sessions / totalSessions) * 100) : 0,
        color: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"][index % 6]
      }));
    }
    return [];
  }, [channelData, channelError]);

  // Transform event trends data for TimeSeriesChart
  const transformedEventTrends = useMemo(() => {
    if (trendsError) {
      console.error('❌ Event trends error:', trendsError);
    }
    
    if (eventTrends && eventTrends.length > 0) {
      return eventTrends.map(item => ({
        date: item.date || new Date().toISOString().split('T')[0],
        value: item.count || 0,
        category: item.event || 'Unknown'
      }));
    }
    return [];
  }, [eventTrends, trendsError]);

  const hasRealData = overviewData || eventTrends?.length || channelData?.length;
  const hasErrors = overviewError || trendsError || channelError;

  return (
    <DashboardShell
      title="Analytics"
      description="Comprehensive analytics dashboard with real-time insights"
    >
      <div className="space-y-6">
        {/* Data Status Indicator */}
        {hasErrors && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Some analytics data couldn't be loaded
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Showing fallback data. Check console for details or try refreshing the page.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!hasRealData && !hasErrors && !overviewLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  No analytics data available
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This might be a new installation. Try seeding some sample data by running: <code className="bg-blue-100 px-1 rounded">npm run seed:analytics</code> in the backend.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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