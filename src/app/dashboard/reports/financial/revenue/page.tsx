'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { DataTable } from '@/components/reports/DataTable';
import { useRevenueReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const revenueParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { data: revenueData, isLoading } = useRevenueReport(revenueParams);

  const handleExport = (format: any) => {
    console.log('Exporting revenue report:', format);
  };

  const tableColumns = [
    { key: 'period', label: 'Period' },
    { key: 'revenue', label: 'Revenue', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'growth', label: 'Growth', format: (value: number) => `${value}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Detailed revenue analysis and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <RevenueChart 
        data={revenueData || []} 
        isLoading={isLoading}
        title="Revenue Trend"
        description="Daily revenue performance over time"
      />

      <Card>
        <CardHeader>
          <CardTitle>Revenue Data</CardTitle>
          <CardDescription>
            Detailed revenue metrics and calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={revenueData || []} 
            columns={tableColumns}
            searchable={true}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
            <CardDescription>Key revenue metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">
                ${revenueData?.reduce((sum, item) => sum + item.revenue, 0).toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Daily:</span>
              <span className="font-semibold">
                ${revenueData?.length ? (revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length).toFixed(2) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Growth Rate:</span>
              <span className="font-semibold text-green-600">
                {revenueData?.[revenueData.length - 1]?.growth || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Revenue analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• {revenueData?.length || 0} days of data analyzed</p>
            <p>• Peak revenue period analysis</p>
            <p>• Seasonal trend detection</p>
            <p>• Growth pattern insights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}