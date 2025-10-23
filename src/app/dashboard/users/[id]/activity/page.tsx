// app/dashboard/users/[id]/activity/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Activity, 
  Clock, 
  MapPin, 
  Monitor, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useActivityTimeline, useActivityMetrics, useActivityAnalytics } from '@/hooks/useActivity';
import { toast } from 'sonner';

export default function ActivityPage() {
  const params = useParams();
  const userId = params.id as string;
  const [timeRange, setTimeRange] = useState('30');
  const [filterType, setFilterType] = useState('all');

  const { 
    data: timeline, 
    isLoading: timelineLoading, 
    error: timelineError, 
    refetch: refetchTimeline 
  } = useActivityTimeline(userId, parseInt(timeRange));

  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError 
  } = useActivityMetrics(userId);

  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useActivityAnalytics(userId, `${timeRange}d`);

  const handleRefresh = () => {
    refetchTimeline();
    toast.success('Activity data refreshed');
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'authentication':
        return <Activity className="h-4 w-4" />;
      case 'update':
      case 'edit':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'authentication':
        return 'bg-green-100 text-green-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (timelineLoading && metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Activity</h1>
            <p className="text-muted-foreground">
              Complete activity history and audit trail
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Activity</h1>
            <p className="text-muted-foreground">
              Complete activity history and audit trail
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error alerts */}
      {(timelineError || metricsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load activity data: {timelineError?.message || metricsError?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Activity Metrics */}
      {metrics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalActivities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All recorded activities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activitiesThisWeek.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Activities this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activitiesThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Activities this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.lastActivity ? new Date(metrics.lastActivity).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent activity
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Chronological history of user actions and system events
                  </CardDescription>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="update">Updates</SelectItem>
                    <SelectItem value="delete">Deletions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline
                    .filter(activity => filterType === 'all' || activity.action.toLowerCase().includes(filterType))
                    .slice(0, 20)
                    .map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getActionColor(activity.action)} variant="secondary">
                            {activity.action}
                          </Badge>
                          {activity.resourceType && (
                            <Badge variant="outline">{activity.resourceType}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          {activity.details?.description || `${activity.action} on ${activity.resourceType}`}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                          </span>
                          {activity.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {activity.ipAddress}
                            </span>
                          )}
                          {activity.location?.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.location.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {timeline.length > 20 && (
                    <div className="text-center py-4">
                      <Button variant="outline">Load More Activities</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Activity Data</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No activity records found for the selected time period. This could mean the user hasn't been active or activity logging is not enabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Common Actions</CardTitle>
                <CardDescription>Frequently performed actions by this user</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.mostCommonActions && metrics.mostCommonActions.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.mostCommonActions.slice(0, 5).map((action, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{action.action}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(action.count / Math.max(...metrics.mostCommonActions.map(a => a.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {action.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No action data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Patterns</CardTitle>
                <CardDescription>When this user is most active</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.activityByHour && metrics.activityByHour.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Activity by Hour</div>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 24 }, (_, i) => {
                        const hourData = metrics.activityByHour.find(h => h.hour === i);
                        const count = hourData?.count || 0;
                        const maxCount = Math.max(...metrics.activityByHour.map(h => h.count));
                        const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        
                        return (
                          <div
                            key={i}
                            className={`h-8 rounded text-xs flex items-center justify-center ${
                              intensity > 50 ? 'bg-blue-500 text-white' :
                              intensity > 25 ? 'bg-blue-300 text-blue-900' :
                              intensity > 0 ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-500'
                            }`}
                            title={`${i}:00 - ${count} activities`}
                          >
                            {i}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pattern data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
                <CardDescription>Devices and platforms used</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.deviceStats && metrics.deviceStats.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.deviceStats.map((device, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{device.device}</span>
                        <span className="text-sm font-medium">{device.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No device data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Statistics</CardTitle>
                <CardDescription>Geographic activity distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.locationStats && metrics.locationStats.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.locationStats.map((location, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{location.location}</span>
                        <span className="text-sm font-medium">{location.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No location data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}