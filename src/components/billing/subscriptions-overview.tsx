// components/billing/subscriptions-overview.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubscriptionsOverviewData {
  totalActive: number;
  totalCanceled: number;
  totalPaused: number;
  upcomingRenewals: number;
  churnRate: number;
  averageLifetime: number;
}

interface SubscriptionsOverviewProps {
  data: SubscriptionsOverviewData;
  isLoading?: boolean;
}

export function SubscriptionsOverview({ data, isLoading }: SubscriptionsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Active Subscriptions",
      value: data.totalActive,
      description: "Currently active subscriptions",
      icon: CheckCircle,
      color: "text-green-600",
      trend: "positive" as const,
    },
    {
      title: "Canceled",
      value: data.totalCanceled,
      description: "Total canceled subscriptions",
      icon: TrendingDown,
      color: "text-red-600",
      trend: "negative" as const,
    },
    {
      title: "Paused",
      value: data.totalPaused,
      description: "Temporarily paused subscriptions",
      icon: Clock,
      color: "text-orange-600",
      trend: "neutral" as const,
    },
    {
      title: "Upcoming Renewals",
      value: data.upcomingRenewals,
      description: "Renewing in next 7 days",
      icon: AlertTriangle,
      color: "text-yellow-600",
      trend: "neutral" as const,
    },
    {
      title: "Churn Rate",
      value: `${data.churnRate}%`,
      description: "Monthly churn rate",
      icon: TrendingDown,
      color: "text-red-600",
      trend: data.churnRate > 5 ? "negative" : "positive",
    },
    {
      title: "Avg Lifetime",
      value: `${data.averageLifetime}m`,
      description: "Average subscription duration",
      icon: TrendingUp,
      color: "text-blue-600",
      trend: "positive" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              {metric.trend !== 'neutral' && (
                <Badge 
                  variant={metric.trend === 'positive' ? 'default' : 'destructive'} 
                  className="mt-2 text-xs"
                >
                  {metric.trend === 'positive' ? 'Good' : 'Needs Attention'}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}