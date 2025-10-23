'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserActivityReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function UserActivityPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const activityParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    metrics: ['activeUsers', 'sessions', 'engagementRate'],
  };

  const { data: activityData, isLoading } = useUserActivityReport(activityParams);

  const handleExport = (format: any) => {
    console.log('Exporting activity report:', format);
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
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : avgActiveUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : totalSessions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${avgEngagementRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Average rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : totalPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total views
            </p>
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
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading insights...</p>
            ) : activityData && activityData.length > 0 ? (
              <>
                <p>• Peak activity: {Math.max(...activityData.map((d: any) => d.activeUsers || 0)).toLocaleString()} users</p>
                <p>• Average session length: {totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 2.5) : 0} minutes</p>
                <p>• Pages per session: {totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : '0'}</p>
                <p>• Data points: {activityData.length} days analyzed</p>
              </>
            ) : (
              <p>No insights available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>User behavior analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading engagement metrics...</p>
            ) : activityData && activityData.length > 0 ? (
              <>
                <p>• Average engagement: {avgEngagementRate}%</p>
                <p>• Best performing day: {activityData.sort((a: any, b: any) => (b.engagementRate || 0) - (a.engagementRate || 0))[0]?.date}</p>
                <p>• Session-to-user ratio: {avgActiveUsers > 0 ? ((totalSessions / activityData.length) / avgActiveUsers).toFixed(2) : '0'}</p>
                <p>• Growth trend: {activityData.length >= 2 ? 
                  ((activityData[activityData.length - 1].activeUsers - activityData[0].activeUsers) / activityData[0].activeUsers * 100).toFixed(1) : '0'}%</p>
              </>
            ) : (
              <p>No engagement data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}