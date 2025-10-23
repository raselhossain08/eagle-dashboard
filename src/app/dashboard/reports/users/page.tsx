'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/reports/DataTable';
import { useUserActivityReport, useUserAcquisitionReport, useUserRetentionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function UserReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('activity');

  const reportParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    metrics: ['activeUsers', 'sessions', 'engagementRate'],
  };

  const { data: activityData, isLoading: activityLoading } = useUserActivityReport(reportParams);
  const { data: acquisitionData, isLoading: acquisitionLoading } = useUserAcquisitionReport(reportParams);
  const { data: retentionData, isLoading: retentionLoading } = useUserRetentionReport({
    ...reportParams,
    cohortType: 'monthly'
  });

  const handleExport = (format: any) => {
    console.log('Exporting user report:', format, activeTab);
  };

  // Activity table columns
  const activityColumns = [
    { key: 'date', label: 'Date' },
    { key: 'activeUsers', label: 'Active Users' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'engagementRate', label: 'Engagement Rate', format: (value: number) => `${value}%` },
  ];

  // Acquisition table columns
  const acquisitionColumns = [
    { key: 'channel', label: 'Channel' },
    { key: 'users', label: 'New Users' },
    { key: 'cost', label: 'Cost', format: (value: number) => value ? `$${value.toLocaleString()}` : 'Free' },
    { key: 'conversion', label: 'Conversion', format: (value: number) => `${value}%` },
  ];

  // Retention table columns
  const retentionColumns = [
    { key: 'cohort', label: 'Cohort' },
    { key: 'size', label: 'Size' },
    { key: 'week1', label: 'Week 1', format: (value: number) => `${value}%` },
    { key: 'week4', label: 'Month 1', format: (value: number) => `${value}%` },
    { key: 'week12', label: 'Month 3', format: (value: number) => `${value}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
          <p className="text-muted-foreground">
            User engagement, acquisition, and behavior analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLoading ? '...' : activityData?.length ? 
                    Math.round(activityData.reduce((sum: number, item: any) => sum + (item.activeUsers || 0), 0) / activityData.length).toLocaleString() : '0'}
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
                  {activityLoading ? '...' : activityData?.reduce((sum: number, item: any) => sum + (item.sessions || 0), 0).toLocaleString() || '0'}
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
                  {activityLoading ? '...' : activityData?.length ? 
                    (activityData.reduce((sum: number, item: any) => sum + (item.engagementRate || 0), 0) / activityData.length).toFixed(1) : '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Activity Over Time</CardTitle>
              <CardDescription>
                Daily active users and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading activity data...
                </div>
              ) : activityData && activityData.length > 0 ? (
                <DataTable 
                  data={activityData} 
                  columns={activityColumns}
                  searchable={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Acquired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acquisitionLoading ? '...' : acquisitionData?.reduce((sum: number, item: any) => sum + (item.users || 0), 0).toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  New users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Acquisition Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acquisitionLoading ? '...' : `$${acquisitionData?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toLocaleString() || '0'}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total spend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acquisitionLoading ? '...' : acquisitionData?.length ? 
                    (acquisitionData.reduce((sum: number, item: any) => sum + (item.conversion || 0), 0) / acquisitionData.length).toFixed(1) : '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acquisitionLoading ? '...' : acquisitionData?.length ? 
                    acquisitionData.sort((a: any, b: any) => (b.users || 0) - (a.users || 0))[0]?.channel || 'N/A' : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest volume
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acquisition Channels</CardTitle>
              <CardDescription>
                Performance by marketing channel and campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {acquisitionLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading acquisition data...
                </div>
              ) : acquisitionData && acquisitionData.length > 0 ? (
                <DataTable 
                  data={acquisitionData} 
                  columns={acquisitionColumns}
                  searchable={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No acquisition data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Week 1 Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retentionLoading ? '...' : retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention1Week.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Month 1 Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retentionLoading ? '...' : retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention1Month.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Month 3 Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retentionLoading ? '...' : retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention3Months.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retentionLoading ? '...' : retentionData?.metrics ? 
                    retentionData.metrics.totalCohorts : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzed
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>
                User retention rates by cohort and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {retentionLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading retention data...
                </div>
              ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
                <DataTable 
                  data={retentionData.cohorts} 
                  columns={retentionColumns}
                  searchable={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No retention data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}