// app/dashboard/users/components/UserMetrics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';

const metrics = [
  {
    title: 'Total Users',
    value: '2,847',
    description: 'All registered users',
    icon: Users,
    trend: '+12%',
    trendDirection: 'up' as const,
  },
  {
    title: 'Active Users',
    value: '1,923',
    description: 'Currently active',
    icon: UserCheck,
    trend: '+5%',
    trendDirection: 'up' as const,
  },
  {
    title: 'New Users',
    value: '84',
    description: 'Last 7 days',
    icon: UserPlus,
    trend: '+23%',
    trendDirection: 'up' as const,
  },
  {
    title: 'Growth Rate',
    value: '12.5%',
    description: 'Monthly growth',
    icon: TrendingUp,
    trend: '+2.1%',
    trendDirection: 'up' as const,
  },
];

export function UserMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
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