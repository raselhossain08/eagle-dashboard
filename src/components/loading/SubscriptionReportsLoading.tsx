'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Users, TrendingUp, UserCheck, UserX, Percent } from 'lucide-react';

export default function SubscriptionReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-64" />
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </Badge>
          </div>
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Key Metrics Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { icon: DollarSign, title: 'Monthly MRR' },
          { icon: UserCheck, title: 'New Subscribers' },
          { icon: TrendingUp, title: 'Growth Rate' },
          { icon: UserX, title: 'Churn Rate' },
        ].map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <metric.icon className="h-4 w-4" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Users, title: 'Average Revenue Per User' },
          { icon: Percent, title: 'Customer Lifetime Value' },
          { icon: TrendingUp, title: 'Avg Subscribers/Period' },
        ].map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <metric.icon className="h-4 w-4" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-64 mt-2" />
              </CardDescription>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-muted-foreground">Loading subscription data from API...</span>
            </div>
            
            {/* Table Header Skeleton */}
            <div className="flex space-x-4 pb-2 border-b">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            {/* Table Rows Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-5 w-16" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-20" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-56" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SubscriptionReportsPageSkeleton() {
  return <SubscriptionReportsLoading />;
}