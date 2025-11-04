'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  AlertCircle,
  CheckCircle,
  Send,
  BarChart3
} from 'lucide-react';
import { useEmailStats } from '@/hooks/useNotifications';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className = '' }: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-1 text-xs">
            {trend && trendValue && (
              <>
                {getTrendIcon()}
                <span className={getTrendColor()}>{trendValue}</span>
              </>
            )}
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmailStatsDashboard() {
  const { data: stats, isLoading, error } = useEmailStats();

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div>
              <p className="text-sm font-medium">Failed to load email statistics</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Mail className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No email statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sent"
          value={stats.totalSent.toLocaleString()}
          subtitle="emails sent"
          icon={Send}
        />
        
        <StatCard
          title="Delivered"
          value={stats.delivered.toLocaleString()}
          subtitle={`${formatPercentage(stats.deliveryRate)} delivery rate`}
          icon={CheckCircle}
          trend={stats.deliveryRate > 0.95 ? 'up' : stats.deliveryRate < 0.85 ? 'down' : 'stable'}
          trendValue={formatPercentage(stats.deliveryRate)}
          className={stats.deliveryRate > 0.95 ? 'border-green-200' : stats.deliveryRate < 0.85 ? 'border-red-200' : ''}
        />
        
        <StatCard
          title="Opened"
          value={formatPercentage(stats.openRate)}
          subtitle="open rate"
          icon={Eye}
          trend={stats.openRate > 0.25 ? 'up' : stats.openRate < 0.15 ? 'down' : 'stable'}
          trendValue={`${stats.openRate > 0.25 ? 'Good' : stats.openRate < 0.15 ? 'Low' : 'Average'}`}
        />
        
        <StatCard
          title="Clicked"
          value={formatPercentage(stats.clickRate)}
          subtitle="click rate"
          icon={MousePointer}
          trend={stats.clickRate > 0.03 ? 'up' : stats.clickRate < 0.01 ? 'down' : 'stable'}
          trendValue={`${stats.clickRate > 0.03 ? 'Good' : stats.clickRate < 0.01 ? 'Low' : 'Average'}`}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Key email performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Delivery Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPercentage(stats.deliveryRate)}</span>
                  <Badge variant={stats.deliveryRate > 0.95 ? 'default' : 'secondary'}>
                    {stats.deliveryRate > 0.95 ? 'Excellent' : stats.deliveryRate > 0.85 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Bounce Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatPercentage(stats.bounceRate)}</span>
                  <Badge variant={stats.bounceRate < 0.02 ? 'default' : 'destructive'}>
                    {stats.bounceRate < 0.02 ? 'Good' : 'High'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Failed Emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.failed}</span>
                  {stats.failed > 0 && (
                    <Badge variant="destructive">
                      {stats.failed > 10 ? 'Critical' : 'Monitor'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Templates */}
        {stats.topTemplates && stats.topTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Top Templates
              </CardTitle>
              <CardDescription>
                Most used email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topTemplates.slice(0, 5).map((template, index) => (
                  <div key={template.template} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate max-w-32" title={template.template}>
                        {template.template}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {template.sentCount} sent
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}