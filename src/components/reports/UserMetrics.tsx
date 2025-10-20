'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityReport } from '@/types/reports';

interface UserMetricsProps {
  data: ActivityReport[];
  isLoading?: boolean;
}

export function UserMetrics({ data, isLoading }: UserMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Metrics</CardTitle>
          <CardDescription>Loading user analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = data?.reduce(
    (acc, day) => ({
      activeUsers: acc.activeUsers + day.activeUsers,
      sessions: acc.sessions + day.sessions,
      engagement: acc.engagement + day.engagementRate,
    }),
    { activeUsers: 0, sessions: 0, engagement: 0 }
  ) || { activeUsers: 0, sessions: 0, engagement: 0 };

  const averages = {
    activeUsers: data?.length ? Math.round(totals.activeUsers / data.length) : 0,
    sessions: data?.length ? Math.round(totals.sessions / data.length) : 0,
    engagement: data?.length ? (totals.engagement / data.length).toFixed(1) : 0,
  };

  const metrics = [
    { label: 'Total Active Users', value: totals.activeUsers.toLocaleString() },
    { label: 'Total Sessions', value: totals.sessions.toLocaleString() },
    { label: 'Avg. Daily Users', value: averages.activeUsers.toLocaleString() },
    { label: 'Avg. Sessions/Day', value: averages.sessions.toLocaleString() },
    { label: 'Avg. Engagement Rate', value: `${averages.engagement}%` },
    { label: 'Peak Concurrent', value: Math.max(...(data?.map(d => d.activeUsers) || [0])).toLocaleString() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Metrics Summary</CardTitle>
        <CardDescription>
          Comprehensive user engagement and activity metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}