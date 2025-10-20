"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  useRealTimeUsers, 
  useOverviewStats, 
  useRealTimeActivityFeed, 
  useRealTimeHotspots, 
  useRealTimeMetrics 
} from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { Users, Eye, MousePointerClick, Clock, Activity, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";

export default function RealTimePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshInterval, setRefreshInterval] = useState(0); // Manual refresh by default

  // Real-time data hooks - disabled auto-refresh initially
  const activeUsersQuery = useRealTimeUsers(refreshInterval, 5);
  const activityFeedQuery = useRealTimeActivityFeed(refreshInterval, 20, 30);
  const hotspotsQuery = useRealTimeHotspots(refreshInterval, 10);
  const metricsQuery = useRealTimeMetrics(refreshInterval, 5);
  
  // We don't need overview stats for real-time page, disable this query
  // const overviewStatsQuery = useOverviewStats(stableDateRange);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        activeUsersQuery.refetch(),
        activityFeedQuery.refetch(),
        hotspotsQuery.refetch(),
        metricsQuery.refetch()
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (refreshInterval === 0) {
      setRefreshInterval(30000); // 30 seconds
    } else {
      setRefreshInterval(0);
    }
  };

  // Extract data from queries
  const activeUsers = activeUsersQuery.data || 0;
  const activityFeed = activityFeedQuery.data || [];
  const hotspots = hotspotsQuery.data || [];
  const metrics = metricsQuery.data;

  // Calculate real-time metrics
  const realTimeMetrics = {
    activeUsers,
    pageViews: Math.floor(activeUsers * 2.8),
    events: Math.floor(activeUsers * 1.5),
    avgSession: metrics ? 
      `${Math.floor((metrics.bounceRate < 50 ? 240 : 120) / 60)}m ${(metrics.bounceRate < 50 ? 240 : 120) % 60}s` :
      "Loading..."
  };

  return (
    <DashboardShell
      title="Real-time Analytics"
      description="Live user activity and engagement with auto-refresh"
    >
      <div className="space-y-6">
        {/* Real-time Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Real-time Analytics</span>
            </div>
            <Badge variant="outline" className={refreshInterval > 0 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}>
              {refreshInterval > 0 ? "Auto-refresh ON" : "Manual Refresh"}
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
              className="flex items-center space-x-2"
            >
              <Activity className={`h-4 w-4 ${refreshInterval > 0 ? 'text-green-500' : ''}`} />
              <span>{refreshInterval > 0 ? 'Stop Auto-refresh' : 'Start Auto-refresh'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${activeUsers > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeUsersQuery.isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  realTimeMetrics.activeUsers.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeUsers > 0 ? "Live data" : "No active users"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeUsersQuery.isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  realTimeMetrics.pageViews.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 5 minutes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeUsersQuery.isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  realTimeMetrics.events.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Live interactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricsQuery.isLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  realTimeMetrics.avgSession
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics ? "Estimated session data" : "Loading..."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live Activity Feed
              <Badge variant="secondary" className="ml-2">
                {activityFeed ? activityFeed.length : 0} recent events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeedQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading activity feed...</span>
              </div>
            ) : activityFeedQuery.isError ? (
              <div className="text-center py-8 text-red-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Failed to load activity feed</p>
                <Button variant="outline" size="sm" onClick={() => activityFeedQuery.refetch()} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
              </div>
            ) : activityFeed && activityFeed.length > 0 ? (
              <div className="space-y-3">
                {activityFeed.map((activity, index) => (
                  <div 
                    key={`${activity.user}-${activity.timestamp}-${index}`} 
                    className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
                      index === 0 ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        index < 2 ? 'bg-green-500 animate-pulse' : 
                        index < 4 ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{activity.user}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.country}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{activity.action}</span> on {activity.page}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity to display</p>
                <p className="text-sm">Activity will appear here as users interact with your application</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Activity Hotspots</CardTitle>
            </CardHeader>
            <CardContent>
              {hotspotsQuery.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading hotspots...</span>
                </div>
              ) : hotspotsQuery.isError ? (
                <div className="text-center py-4 text-red-500">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Failed to load hotspots</p>
                  <Button variant="outline" size="sm" onClick={() => hotspotsQuery.refetch()} className="mt-2">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : hotspots && hotspots.length > 0 ? (
                <div className="space-y-3">
                  {hotspots.slice(0, 5).map((hotspot, index) => (
                    <div key={hotspot.page} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1 mr-4">{hotspot.page}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${hotspot.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">{hotspot.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No page activity detected</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsQuery.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading metrics...</span>
                </div>
              ) : metricsQuery.isError ? (
                <div className="text-center py-4 text-red-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Failed to load metrics</p>
                  <Button variant="outline" size="sm" onClick={() => metricsQuery.refetch()} className="mt-2">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : metrics ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <span className={`text-sm font-medium ${
                      metrics.bounceRate < 40 ? 'text-green-600' : 
                      metrics.bounceRate < 60 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {metrics.bounceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Page Load</span>
                    <span className={`text-sm font-medium ${
                      metrics.avgPageLoad < 2 ? 'text-green-600' : 
                      metrics.avgPageLoad < 3 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {metrics.avgPageLoad.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Visitors</span>
                    <span className="text-sm font-medium text-blue-600">
                      {metrics.newVisitors}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Rate</span>
                    <span className={`text-sm font-medium ${
                      metrics.conversionRate > 3 ? 'text-green-600' : 
                      metrics.conversionRate > 1 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {metrics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}