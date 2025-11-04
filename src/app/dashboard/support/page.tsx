'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActiveImpersonations } from '@/hooks/useSupport';
import { useCompleteDashboard } from '@/hooks/useSupportDashboard';
import { useSupportStore } from '@/stores/support-store';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';

export default function SupportDashboard() {
  const [enableRealTime, setEnableRealTime] = useState(true);
  const { data: activeImpersonations, isLoading: impersonationsLoading } = useActiveImpersonations();
  const setIsCreatingNote = useSupportStore((state) => state.setIsCreatingNote);
  
  // Use comprehensive dashboard hook for all data
  const {
    stats,
    recentActivities,
    pendingFollowUps,
    analytics,
    satisfactionTrend,
    performanceOverview,
    urgentNotifications,
    isLoading,
    hasError,
    refetchAll,
    statsLoading,
    activitiesLoading,
    followUpsLoading
  } = useCompleteDashboard({ 
    enableRealTime,
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }
  });

  // Show loading skeleton while initial data is loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state if there's an error
  if (hasError) {
    return <ErrorState onRetry={refetchAll} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time customer support metrics and management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setEnableRealTime(!enableRealTime)}
          >
            <Activity className={`w-4 h-4 mr-2 ${enableRealTime ? 'text-green-500' : 'text-muted-foreground'}`} />
            Real-time {enableRealTime ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={refetchAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreatingNote(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications && urgentNotifications.length > 0 && (
        <UrgentNotificationsSection notifications={urgentNotifications} />
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets || 0}
          previousValue={performanceOverview?.previousPeriod.totalTickets}
          change={performanceOverview?.changes.totalTickets}
          icon={<MessageSquare className="w-4 h-4" />}
          description="All support requests"
          loading={statsLoading}
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedTickets || 0}
          previousValue={performanceOverview?.previousPeriod.resolvedTickets}
          change={performanceOverview?.changes.resolvedTickets}
          icon={<CheckCircle className="w-4 h-4" />}
          description="Successfully closed"
          loading={statsLoading}
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats?.averageResponseTime || 0}m`}
          previousValue={performanceOverview?.previousPeriod.averageResponseTime}
          change={performanceOverview?.changes.averageResponseTime}
          icon={<Clock className="w-4 h-4" />}
          description="Average first response"
          loading={statsLoading}
          isTime={true}
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${stats?.customerSatisfaction || 0}%`}
          previousValue={performanceOverview?.previousPeriod.customerSatisfaction}
          change={performanceOverview?.changes.customerSatisfaction}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Overall satisfaction"
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitiesCard 
          activities={recentActivities} 
          loading={activitiesLoading} 
        />
        <PendingFollowUpsCard 
          followUps={pendingFollowUps} 
          loading={followUpsLoading} 
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <CustomerSatisfactionTrendCard trend={satisfactionTrend} />
        <ActiveImpersonationsCard 
          impersonations={activeImpersonations} 
          loading={impersonationsLoading} 
        />
        <PerformanceOverviewCard overview={performanceOverview} />
      </div>
    </div>
  );
}

// Enhanced Stat Card Component with trends
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  variant?: 'default' | 'destructive';
  previousValue?: number;
  change?: number;
  isTime?: boolean;
  loading?: boolean;
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  variant = 'default',
  previousValue,
  change,
  isTime = false,
  loading = false
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const getTrendInfo = () => {
    if (change === undefined || change === null) return null;
    
    const isPositive = change > 0;
    const isNegative = change < 0;
    const isNeutral = change === 0;
    
    // For response time, negative change is good (faster response)
    const isGood = isTime ? isNegative : isPositive;
    
    return {
      isPositive,
      isNegative,
      isNeutral,
      isGood,
      color: isGood ? 'text-green-600' : isNegative || isPositive ? 'text-red-600' : 'text-muted-foreground',
      icon: isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown,
      text: `${isPositive ? '+' : ''}${change}${isTime ? 'm' : ''} from last period`
    };
  };

  const trendInfo = getTrendInfo();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          variant === 'destructive' ? 'text-destructive' : ''
        }`}>
          {value}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trendInfo && (
            <div className={`flex items-center text-xs ${trendInfo.color}`}>
              <trendInfo.icon className="w-3 h-3 mr-1" />
              <span>{Math.abs(change!)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activities Component with real data
function RecentActivitiesCard({ 
  activities, 
  loading 
}: { 
  activities?: any[], 
  loading?: boolean 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest support interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  {activity.priority && (
                    <Badge 
                      variant={activity.priority === 'urgent' || activity.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.priority}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Link href="/dashboard/support/tickets">
            <Button variant="ghost" size="sm" className="w-full">
              View all tickets
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for activity colors
function getActivityColor(type: string): string {
  switch (type) {
    case 'ticket_created': return 'bg-blue-500';
    case 'ticket_resolved': return 'bg-green-500';
    case 'note_added': return 'bg-yellow-500';
    case 'follow_up_completed': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

// Pending Follow-ups Component with real data
function PendingFollowUpsCard({ 
  followUps, 
  loading 
}: { 
  followUps?: any[], 
  loading?: boolean 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Follow-ups</CardTitle>
          <CardDescription>Requires immediate attention</CardDescription>
        </div>
        {followUps && followUps.length > 0 && (
          <Badge variant="outline">{followUps.length}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="w-4 h-4" />
              </div>
            ))}
          </div>
        ) : followUps && followUps.length > 0 ? (
          <div className="space-y-4">
            {followUps.slice(0, 5).map((followUp) => (
              <div key={followUp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{followUp.customer?.name || 'Unknown Customer'}</p>
                    <Badge 
                      variant={followUp.priority === 'urgent' || followUp.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {followUp.priority}
                    </Badge>
                    {followUp.overdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{followUp.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {format(new Date(followUp.dueDate), 'MMM d, yyyy')} 
                    ({followUp.daysPending} days pending)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {followUp.overdue ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pending follow-ups</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Link href="/dashboard/support/tickets?filter=followUp">
            <Button variant="ghost" size="sm" className="w-full">
              View all follow-ups
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Satisfaction Trend Card
function CustomerSatisfactionTrendCard({ trend }: { trend?: any[] }) {
  const currentSatisfaction = trend?.[trend.length - 1]?.score || 0;
  const previousSatisfaction = trend?.[trend.length - 2]?.score || 0;
  const change = currentSatisfaction - previousSatisfaction;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Satisfaction Trend</CardTitle>
        <CardDescription>Based on recent feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currentSatisfaction ? `${currentSatisfaction.toFixed(1)}/5` : 'N/A'}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(currentSatisfaction / 5) * 100}%` }}
            />
          </div>
          {change !== 0 && (
            <div className={`flex items-center text-xs ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Active Impersonations Card
function ActiveImpersonationsCard({ 
  impersonations, 
  loading 
}: { 
  impersonations?: any[], 
  loading?: boolean 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Impersonations</CardTitle>
        <CardDescription>Current user sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div>
            <div className={`text-2xl font-bold ${
              impersonations && impersonations.length > 0 ? 'text-destructive' : ''
            }`}>
              {impersonations?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {impersonations && impersonations.length > 0 
                ? 'Sessions in progress' 
                : 'No active sessions'
              }
            </p>
            {impersonations && impersonations.length > 0 && (
              <div className="mt-2">
                <Link href="/dashboard/support/impersonation">
                  <Button variant="outline" size="sm">
                    Manage Sessions
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Performance Overview Card
function PerformanceOverviewCard({ overview }: { overview?: any }) {
  if (!overview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Period comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const { trends } = overview;
  const isImproving = trends?.performance === 'improving';
  const isStable = trends?.performance === 'stable';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Period comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          isImproving ? 'text-green-600' : isStable ? '' : 'text-red-600'
        }`}>
          {isImproving ? 'Improving' : isStable ? 'Stable' : 'Declining'}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Overall performance trend
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Resolution Rate</span>
            <span className={overview.changes.resolutionRate > 0 ? 'text-green-600' : 'text-red-600'}>
              {overview.changes.resolutionRate > 0 ? '+' : ''}{overview.changes.resolutionRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Response Time</span>
            <span className={overview.changes.averageResponseTime < 0 ? 'text-green-600' : 'text-red-600'}>
              {overview.changes.averageResponseTime > 0 ? '+' : ''}{overview.changes.averageResponseTime}m
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Error State Component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <XCircle className="w-12 h-12 text-destructive" />
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't load your support dashboard data. Please try again.
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Urgent Notifications Section
function UrgentNotificationsSection({ notifications }: { notifications: any[] }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-orange-800 dark:text-orange-200">
            Urgent Notifications
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Items requiring immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                notification.severity === 'critical' ? 'bg-red-500' :
                notification.severity === 'error' ? 'bg-red-400' :
                notification.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {notification.actionRequired && notification.actionUrl && (
                  <Link href={notification.actionUrl}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Take Action
                    </Button>
                  </Link>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
        {notifications.length > 3 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              +{notifications.length - 3} more notifications
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}