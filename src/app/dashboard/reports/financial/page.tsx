'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useRevenueReport, useSubscriptionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const revenueParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    groupBy: 'day' as const,
  };

  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport(revenueParams);
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscriptionReport(revenueParams);

  const handleExport = (format: any) => {
    // Implement export logic
    console.log('Exporting in format:', format);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Revenue analytics, subscription metrics, and financial performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              Daily revenue trends and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading revenue data...
              </div>
            ) : revenueData && revenueData.length > 0 ? (
              <div className="space-y-4">
                {/* Revenue chart would go here */}
                <div className="text-sm text-muted-foreground">
                  Revenue chart visualization
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
            <CardDescription>
              MRR, churn rate, and subscription growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading subscription data...
              </div>
            ) : subscriptionData && subscriptionData.length > 0 ? (
              <div className="space-y-4">
                {/* Subscription chart would go here */}
                <div className="text-sm text-muted-foreground">
                  Subscription metrics visualization
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subscription data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}