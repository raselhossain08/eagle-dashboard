'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ReportsOverview } from '@/types/reports';

interface ReportOverviewProps {
  data: ReportsOverview;
}

export function ReportOverview({ data }: ReportOverviewProps) {
  const metrics = [
    {
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(data.totalRevenue),
      change: data.revenueGrowth,
    },
    {
      label: 'Active Subscriptions',
      value: data.activeSubscriptions.toLocaleString(),
      change: -data.churnRate, // churn is negative growth
    },
    {
      label: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      change: data.userGrowth,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p
                className={`text-sm ${
                  metric.change >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metric.change >= 0 ? '+' : ''}
                {metric.change}% from last period
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}