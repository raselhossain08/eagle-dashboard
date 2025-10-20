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
  ];

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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData?.length ? Math.round(activityData.reduce((sum, item) => sum + item.activeUsers, 0) / activityData.length) : 0}
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
              {activityData?.reduce((sum, item) => sum + item.sessions, 0) || 0}
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
              {activityData?.length ? (activityData.reduce((sum, item) => sum + item.engagementRate, 0) / activityData.length).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average rate
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
          <DataTable 
            data={activityData || []} 
            columns={tableColumns}
            searchable={true}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Insights</CardTitle>
            <CardDescription>Key findings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Peak activity hours: 2:00 PM - 4:00 PM</p>
            <p>• Mobile vs Desktop: 65% / 35%</p>
            <p>• Average session duration: 4.2 minutes</p>
            <p>• Bounce rate: 42%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>User behavior analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Pages per session: 3.8</p>
            <p>• Return visitors: 38%</p>
            <p>• Feature adoption rate: 72%</p>
            <p>• Support tickets: 12/day</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}