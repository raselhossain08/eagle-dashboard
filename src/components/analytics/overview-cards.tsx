"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewStats } from "@/services/analytics.service";
import { Users, Eye, Clock, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react";

interface OverviewCardsProps {
  data: OverviewStats | null;
  isLoading?: boolean;
  dateRange: { startDate: Date; endDate: Date };
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isLoading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<any>;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            {trend.value > 0 ? '+' : ''}{trend.value}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function OverviewCards({ data, isLoading, dateRange }: OverviewCardsProps) {
  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined) => {
    return value !== undefined && value !== null ? value.toLocaleString() : "0";
  };

  // Helper function to safely format session duration
  const formatSessionDuration = (duration: number | undefined) => {
    if (!duration) return "0m 0s";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Helper function to safely format percentage
  const formatPercentage = (value: number | undefined) => {
    return value !== undefined && value !== null ? `${value.toFixed(1)}%` : "0%";
  };

  const stats = [
    {
      title: "Total Users",
      value: formatNumber(data?.totalUsers),
      icon: Users,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Total Sessions",
      value: formatNumber(data?.totalSessions),
      icon: Eye,
      trend: { value: 8.3, isPositive: true },
    },
    {
      title: "Page Views",
      value: formatNumber(data?.totalPageViews || (data as any)?.pageViews),
      icon: MousePointerClick,
      trend: { value: 15.2, isPositive: true },
    },
    {
      title: "Avg. Session",
      value: formatSessionDuration(data?.averageSessionDuration || (data as any)?.avgSessionDuration),
      icon: Clock,
      trend: { value: -2.1, isPositive: false },
    },
    {
      title: "Bounce Rate",
      value: formatPercentage(data?.bounceRate),
      icon: TrendingDown,
      trend: { value: -5.7, isPositive: true },
    },
    {
      title: "Unique Visitors",
      value: formatNumber((data as any)?.uniqueVisitors || data?.newUsers),
      icon: Users,
      trend: { value: 10.3, isPositive: true },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}