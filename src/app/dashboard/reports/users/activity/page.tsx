'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserActivityReport, useExportUserReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Activity, Users, MousePointer, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ActivityErrorBoundary } from './error-boundary';

function UserActivityContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const activityParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    metrics: ['activeUsers', 'sessions', 'engagementRate'],
  };

  const { 
    data: activityData, 
    isLoading, 
    error,
    refetch 
  } = useUserActivityReport(activityParams);
  
  const exportMutation = useExportUserReport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportMutation.mutateAsync({
        reportType: 'activity',
        params: activityParams,
        format
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const tableColumns = [
    { key: 'date', label: 'Date' },
    { key: 'activeUsers', label: 'Active Users' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'engagementRate', label: 'Engagement Rate', format: (value: number) => `${value}%` },
    { key: 'pageViews', label: 'Page Views' },
  ];

  // Calculate summary metrics
  const avgActiveUsers = activityData?.length ? 
    Math.round(activityData.reduce((sum: number, item: any) => sum + (item.activeUsers || 0), 0) / activityData.length) : 0;
  const totalSessions = activityData?.reduce((sum: number, item: any) => sum + (item.sessions || 0), 0) || 0;
  const avgEngagementRate = activityData?.length ? 
    (activityData.reduce((sum: number, item: any) => sum + (item.engagementRate || 0), 0) / activityData.length).toFixed(1) : '0';
  const totalPageViews = activityData?.reduce((sum: number, item: any) => sum + (item.pageViews || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Activity Analytics</h1>
          <p className="text-muted-foreground">
            User engagement, sessions, and activity patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Real-time Data Status */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{error ? 'Connection Error' : 'Live Data'}</span>
        </div>
        <span>•</span>
        <span>Auto-refresh: 5min</span>
        <span>•</span>
        <span>Period: {dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` : 
          'Last 30 days'
        }</span>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load activity data: {error.message}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Avg. Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {avgActiveUsers.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-blue-500" />
                  Daily average
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalSessions.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  This period
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-purple-500" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {avgEngagementRate}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {parseFloat(avgEngagementRate) >= 60 ? 
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> :
                    parseFloat(avgEngagementRate) >= 40 ? 
                    <Activity className="w-3 h-3 mr-1 text-yellow-500" /> :
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  }
                  Average rate
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-500" />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalPageViews.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Eye className="w-3 h-3 mr-1 text-orange-500" />
                  Total views
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Data</CardTitle>
          <CardDescription>
            Detailed user activity metrics and engagement data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activity data...
            </div>
          ) : activityData && activityData.length > 0 ? (
            <DataTable 
              data={activityData} 
              columns={tableColumns}
              searchable={true}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Insights</CardTitle>
            <CardDescription>Key findings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load insights</p>
            ) : activityData && activityData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Peak activity: <strong>{Math.max(...activityData.map((d: any) => d.activeUsers || 0)).toLocaleString()}</strong> users on {activityData.find((d: any) => d.activeUsers === Math.max(...activityData.map((item: any) => item.activeUsers || 0)))?.date}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Avg. session length: <strong>{totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 2.5) : 0}</strong> minutes (estimated)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Pages per session: <strong>{totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : '0'}</strong> pages</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Analysis period: <strong>{activityData.length}</strong> days of real user data</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No activity insights available for the selected period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>User behavior analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load engagement metrics</p>
            ) : activityData && activityData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <MousePointer className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Avg. engagement: <strong>{avgEngagementRate}%</strong> {parseFloat(avgEngagementRate) >= 60 ? '(Excellent)' : parseFloat(avgEngagementRate) >= 40 ? '(Good)' : '(Needs improvement)'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Best day: <strong>{activityData.sort((a: any, b: any) => (b.engagementRate || 0) - (a.engagementRate || 0))[0]?.date}</strong> ({activityData.sort((a: any, b: any) => (b.engagementRate || 0) - (a.engagementRate || 0))[0]?.engagementRate?.toFixed(1)}% engagement)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Sessions per user: <strong>{avgActiveUsers > 0 ? ((totalSessions / activityData.length) / avgActiveUsers).toFixed(2) : '0'}</strong> daily average</span>
                </div>
                <div className="flex items-start gap-2">
                  {activityData.length >= 2 && ((activityData[activityData.length - 1].activeUsers - activityData[0].activeUsers) / activityData[0].activeUsers * 100) >= 0 ? 
                    <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" /> :
                    <TrendingDown className="w-4 h-4 mt-0.5 text-red-500" />
                  }
                  <span>Growth trend: <strong>{activityData.length >= 2 ? 
                    ((activityData[activityData.length - 1].activeUsers - activityData[0].activeUsers) / activityData[0].activeUsers * 100).toFixed(1) : '0'}%</strong> over period</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No engagement data available for the selected period</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserActivityPage() {
  return (
    <ActivityErrorBoundary>
      <UserActivityContent />
    </ActivityErrorBoundary>
  );
}