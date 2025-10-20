"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventTrends, useOverviewStats, useEventStatistics, useEventDetails } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { TrendingUp, Users, MousePointerClick, Clock } from "lucide-react";
import { useMemo } from "react";

export default function EventsPage() {
  const { dateRange } = useDashboardStore();
  
  // API Hooks
  const { 
    data: eventTrends, 
    isLoading: trendsLoading, 
    error: trendsError 
  } = useEventTrends({
    ...dateRange,
    groupBy: 'day'
  });
  
  const { 
    data: overviewStats, 
    isLoading: overviewLoading,
    error: overviewError 
  } = useOverviewStats(dateRange);
  
  const { 
    data: eventStatistics, 
    isLoading: statisticsLoading,
    error: statisticsError 
  } = useEventStatistics(dateRange);
  
  const { 
    data: eventDetails, 
    isLoading: detailsLoading,
    error: detailsError 
  } = useEventDetails({ ...dateRange, limit: 10 });

  // Transform event trends data for charts
  const transformedEventTrends = useMemo(() => {
    if (eventTrends && eventTrends.length > 0) {
      return eventTrends.map(item => ({
        date: item.date,
        value: item.count,
        category: item.event
      }));
    }
    return [];
  }, [eventTrends]);

  // Calculate event summary data from statistics with fallback
  const eventSummaryData = useMemo(() => {
    // Primary: use statistics data
    if (eventStatistics && eventStatistics.length > 0) {
      return eventStatistics.map(stat => ({ 
        name: stat.event, 
        value: stat.count 
      })).slice(0, 10);
    }
    
    // Fallback: aggregate trends data if statistics fails
    if (statisticsError && eventTrends && eventTrends.length > 0) {
      const eventCounts = eventTrends.reduce((acc, item) => {
        acc[item.event] = (acc[item.event] || 0) + item.count;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(eventCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
    
    return [];
  }, [eventStatistics, statisticsError, eventTrends]);

  // Calculate metrics from real data with fallbacks
  const metrics = useMemo(() => {
    // If statistics API fails, fallback to trends data for basic metrics
    if (eventStatistics && overviewStats) {
      const totalEvents = eventStatistics.reduce((sum, stat) => sum + stat.count, 0);
      const uniqueEvents = eventStatistics.length;
      const activeUsers = overviewStats.totalUsers || 0;
      const avgEventsPerUser = activeUsers > 0 
        ? (totalEvents / activeUsers).toFixed(1)
        : '0.0';
      
      return {
        totalEvents,
        uniqueEvents,
        activeUsers,
        avgEventsPerUser
      };
    }
    
    // Fallback: use trends data if statistics fails but trends works
    if (statisticsError && eventTrends && overviewStats) {
      const totalEvents = eventTrends.reduce((sum, trend) => sum + trend.count, 0);
      const uniqueEvents = [...new Set(eventTrends.map(trend => trend.event))].length;
      const activeUsers = overviewStats.totalUsers || 0;
      const avgEventsPerUser = activeUsers > 0 
        ? (totalEvents / activeUsers).toFixed(1)
        : '0.0';
        
      return {
        totalEvents,
        uniqueEvents,
        activeUsers,
        avgEventsPerUser
      };
    }
    
    return {
      totalEvents: 0,
      uniqueEvents: 0,
      activeUsers: 0,
      avgEventsPerUser: '0.0'
    };
  }, [eventStatistics, overviewStats, statisticsError, eventTrends]);

  return (
    <DashboardShell
      title="Event Analytics"
      description="Track and analyze user events and interactions with real backend data"
    >
      <div className="space-y-6">
        {/* Event Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statisticsLoading || overviewLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">
                  {metrics.totalEvents > 1000 
                    ? `${(metrics.totalEvents / 1000).toFixed(1)}K` 
                    : metrics.totalEvents.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Real-time data
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statisticsLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{metrics.uniqueEvents}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Event types tracked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">
                  {metrics.activeUsers > 1000 
                    ? `${(metrics.activeUsers / 1000).toFixed(1)}K` 
                    : metrics.activeUsers.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Current period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Events/User</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statisticsLoading || overviewLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{metrics.avgEventsPerUser}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Calculated from data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {trendsError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Event Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load event trends. Please check your connection and try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TimeSeriesChart
                data={transformedEventTrends}
                title="Event Trends Over Time"
                valueFormatter={(value) => value.toLocaleString()}
                showLegend={true}
                isLoading={trendsLoading}
              />
            )}
          </div>
          <div>
            {statisticsError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Top Events by Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load event statistics. Please check your connection and try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <BarChart
                data={eventSummaryData}
                title="Top Events by Volume"
                valueFormatter={(value) => value.toLocaleString()}
                orientation="horizontal"
                isLoading={statisticsLoading}
              />
            )}
          </div>
        </div>

        {/* Event Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            {detailsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Failed to load event details. Please check your connection and try again.
                </p>
              </div>
            ) : detailsLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                  <div>Event Name</div>
                  <div className="text-right">Count</div>
                  <div className="text-right">Unique Users</div>
                  <div className="text-right">Conversion Rate</div>
                  <div className="text-right">Avg. Value</div>
                </div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 items-center py-2 border-b">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : eventDetails && eventDetails.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                  <div>Event Name</div>
                  <div className="text-right">Count</div>
                  <div className="text-right">Unique Users</div>
                  <div className="text-right">Conversion Rate</div>
                  <div className="text-right">Avg. Value</div>
                </div>
                {eventDetails.slice(0, 10).map((event, index) => (
                  <div key={`${event.event}-${index}`} className="grid grid-cols-5 gap-4 items-center py-2 border-b hover:bg-muted/50">
                    <div className="font-medium capitalize">
                      {event.event.replace(/_/g, ' ')}
                    </div>
                    <div className="text-right font-semibold">
                      {event.count.toLocaleString()}
                    </div>
                    <div className="text-right">
                      {event.uniqueUsers.toLocaleString()}
                    </div>
                    <div className="text-right">
                      <span className={event.conversionRate > 10 ? "text-green-600" : event.conversionRate > 5 ? "text-orange-600" : "text-red-600"}>
                        {event.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      {event.avgValue > 0 ? `$${event.avgValue.toFixed(2)}` : '-'}
                    </div>
                  </div>
                ))}
              </div>
            ) : detailsError && eventStatistics && eventStatistics.length > 0 ? (
              // Fallback: show basic statistics if details API fails
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                  <div>Event Name</div>
                  <div className="text-right">Count</div>
                  <div className="text-right">Unique Users</div>
                  <div className="text-right">Conversion Rate</div>
                  <div className="text-right">Avg. Value</div>
                </div>
                {eventStatistics.slice(0, 10).map((event, index) => (
                  <div key={`${event.event}-${index}`} className="grid grid-cols-5 gap-4 items-center py-2 border-b hover:bg-muted/50">
                    <div className="font-medium capitalize">
                      {event.event.replace(/_/g, ' ')}
                    </div>
                    <div className="text-right font-semibold">
                      {event.count.toLocaleString()}
                    </div>
                    <div className="text-right">
                      {event.uniqueUsers.toLocaleString()}
                    </div>
                    <div className="text-right">
                      <span className={event.conversionRate > 10 ? "text-green-600" : event.conversionRate > 5 ? "text-orange-600" : "text-red-600"}>
                        {event.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      {event.avgValue > 0 ? `$${event.avgValue.toFixed(2)}` : '-'}
                    </div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground text-center py-2">
                  ⚠️ Showing basic statistics (detailed view unavailable)
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No event data available for the selected date range.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Events will appear here once tracking data is available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}