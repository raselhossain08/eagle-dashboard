// app/dashboard/users/components/UserMetrics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import { useUserMetrics } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';

export function UserMetrics() {
  const { data: metrics, isLoading, error } = useUserMetrics();

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers?.toLocaleString() || '0',
      description: 'All registered users',
      icon: Users,
      trend: '+12%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers?.toLocaleString() || '0',
      description: 'Currently active',
      icon: UserCheck,
      trend: '+5%',
      trendDirection: 'up' as const,
    },
    {
      title: 'New Users',
      value: metrics?.newUsersToday?.toLocaleString() || '0',
      description: 'Last 7 days',
      icon: UserPlus,
      trend: '+23%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Growth Rate',
      value: `${metrics?.userGrowthRate?.toFixed(1) || '0'}%`,
      description: 'Monthly growth',
      icon: TrendingUp,
      trend: '+2.1%',
      trendDirection: 'up' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Failed to load user metrics</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
            <div className={`text-xs ${
              metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.trend} from last month
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}