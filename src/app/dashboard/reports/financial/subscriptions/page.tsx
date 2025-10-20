'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useSubscriptionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function SubscriptionReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const subscriptionParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { data: subscriptionData, isLoading } = useSubscriptionReport(subscriptionParams);

  const handleExport = (format: any) => {
    console.log('Exporting subscription report:', format);
  };

  const tableColumns = [
    { key: 'period', label: 'Period' },
    { key: 'revenue', label: 'MRR', format: (value: number) => `$${value.toLocaleString()}` },
    { key: 'subscriptions', label: 'New Subscriptions' },
    { key: 'growth', label: 'Growth', format: (value: number) => `${value}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Reports</h1>
          <p className="text-muted-foreground">
            MRR, churn rate, and subscription analytics
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
            <CardTitle className="text-sm font-medium">Monthly MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscriptionData?.reduce((sum, item) => sum + item.revenue, 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Subs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionData?.reduce((sum, item) => sum + item.subscriptions, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subscriptionData?.[subscriptionData.length - 1]?.growth || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              MRR growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              2.1%
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly churn
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Metrics</CardTitle>
          <CardDescription>
            Detailed subscription data and MRR calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={subscriptionData || []} 
            columns={tableColumns}
            searchable={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}