// app/dashboard/subscribers/[id]/activity/page.tsx
'use client';

import { Suspense, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  User,
  CreditCard,
  Settings,
  MessageSquare,
  ShoppingCart,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Activity,
  BarChart3,
  Clock,
  TrendingUp,
  Mail,
  Key,
  Lock,
  Code,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriber } from '@/hooks/useSubscribers';
import { useSubscriberActivity, useSubscriberActivityStats, useActivityTypes } from '@/hooks/useBilling';
import { SubscriberActivityErrorBoundary } from '@/components/subscribers/SubscriberActivityErrorBoundary';
import { SubscriberActivitySkeleton } from '@/components/subscribers/SubscriberActivitySkeleton';
import { ActivityProcessor } from '@/lib/activity-processor';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';
import { ApiErrorHandler, useApiErrorHandler } from '@/components/errors/ApiErrorHandler';
import { toast } from 'sonner';

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    login: User,
    transaction: CreditCard,
    invoice: FileText,
    subscription: CreditCard,
    purchase: ShoppingCart,
    subscription_change: Settings,
    profile_update: Settings,
    support_ticket: MessageSquare,
    payment_failed: AlertTriangle,
    password_reset: Key,
    email_verification: Mail,
    account_locked: Lock,
    api_access: Code,
    data_export: Download,
    default: Activity
  };
  return iconMap[type] || iconMap.default;
};

function SubscriberActivityContent() {
  const params = useParams();
  const id = params.id as string;
  const { handleError } = useApiErrorHandler();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // API calls with comprehensive error handling
  const { 
    data: subscriber, 
    isLoading: subscriberLoading, 
    error: subscriberError,
    refetch: refetchSubscriber 
  } = useSubscriber(id);
  
  const { 
    data: activities, 
    isLoading: activitiesLoading, 
    error: activitiesError,
    refetch: refetchActivities 
  } = useSubscriberActivity(id, { limit: 100 });
  
  const { 
    data: activityStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useSubscriberActivityStats(id);
  
  const { 
    data: activityTypes, 
    isLoading: typesLoading,
    error: typesError 
  } = useActivityTypes();

  // Handle refresh all data
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    refetchSubscriber();
    refetchActivities();
    refetchStats();
    toast.success('Activity data refreshed');
  };

  // Handle 403 permission errors specifically
  const permissionError = [subscriberError, activitiesError, statsError, typesError]
    .find(error => {
      if (!error) return false;
      const anyError = error as any;
      return anyError?.status === 403 || 
             anyError?.statusCode === 403 || 
             error?.message?.includes('403') ||
             error?.message?.includes('Forbidden');
    });
  
  if (permissionError) {
    const apiError = handleError(permissionError);
    return <ApiErrorHandler error={apiError} retry={handleRefreshAll} />;
  }

  // Check for critical errors
  const hasErrors = subscriberError || activitiesError || statsError;
  
  if (hasErrors) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/subscribers/${id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Activity Timeline</h1>
              <p className="text-muted-foreground">
                Recent activity and events for subscriber
              </p>
            </div>
          </div>
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Activity Error:</strong> {
              subscriberError?.message || 
              activitiesError?.message || 
              statsError?.message || 
              'Failed to load subscriber activity data'
            }
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <p className="text-lg font-medium text-muted-foreground mb-2">Activity Unavailable</p>
              <p className="text-sm text-muted-foreground">
                Unable to load activity data. Please check your connection and try again.
              </p>
            </div>
            <Button onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process activities with filters and search
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    
    let filtered = activities;
    
    // Apply type filter
    if (selectedActivityType !== 'all') {
      filtered = ActivityProcessor.filterActivitiesByType(filtered, [selectedActivityType]);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = ActivityProcessor.searchActivities(filtered, searchTerm);
    }
    
    return filtered;
  }, [activities, selectedActivityType, searchTerm]);

  const groupedActivities = ActivityProcessor.groupActivitiesByDate(filteredActivities);
  const activityTypeStats = activities ? ActivityProcessor.getActivityTypeStats(activities) : [];
  const recentSummary = activities ? ActivityProcessor.getRecentActivitySummary(activities, 7) : null;

  const isLoading = subscriberLoading || activitiesLoading;

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/subscribers/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Activity Timeline</h1>
            <p className="text-muted-foreground">
              Recent activity and events for {subscriber?.firstName} {subscriber?.lastName}
              {!subscriberLoading && activities && (
                <span className="ml-2">• {activities.length} total activities</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Statistics Cards */}
      {!statsLoading && activityStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.totalActivities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.recentActivities}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.averagePerDay.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Activities per day</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(activityStats.mostActiveDay).toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground">Peak activity day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Filter activities by type or search for specific events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Activities</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search descriptions, types, or metadata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="min-w-48">
              <Label>Activity Type</Label>
              <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activityTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Activity Type Stats */}
          {activityTypeStats.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Activity Distribution:</p>
              <div className="flex flex-wrap gap-2">
                {activityTypeStats.slice(0, 6).map((stat) => (
                  <Badge key={stat.type} variant="outline" className="text-xs">
                    {stat.type.replace('_', ' ')}: {stat.count} ({stat.percentage.toFixed(0)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
            {filteredActivities && (
              <Badge variant="outline" className="ml-2">
                {filteredActivities.length} activities
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Chronological view of all subscriber activities
            {(searchTerm || selectedActivityType !== 'all') && (
              <span className="text-primary"> (filtered)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <SubscriberActivitySkeleton />
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Badge>
                    <div className="h-px bg-border flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {dateActivities.length} activities
                    </span>
                  </div>

                  {/* Activities for this date */}
                  <div className="space-y-3">
                    {dateActivities.map((activity, index) => {
                      const activityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${activityIcon.color}`}>
                              {activityIcon.icon}
                            </div>
                            {index < dateActivities.length - 1 && (
                              <div className="w-px h-8 bg-border mt-2" />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">
                                  {ActivityProcessor.formatActivityDescription(activity)}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {activity.type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Metadata Display */}
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="bg-muted/30 p-3 rounded border text-xs space-y-1">
                                <div className="font-medium text-muted-foreground mb-2">Activity Details:</div>
                                {Object.entries(activity.metadata).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </span>
                                    <span className="text-foreground break-all">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Load More Activities */}
              {filteredActivities.length >= 50 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={handleRefreshAll}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                {(searchTerm || selectedActivityType !== 'all') ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground font-medium">No activities match your filters</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search term or activity type filter
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setSelectedActivityType('all');
                    }}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground font-medium">No activities found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This subscriber hasn't performed any activities yet
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriberActivityPage() {
  return (
    <RoleBasedAccess requiredRoles={['super_admin', 'finance_admin', 'support']}>
      <Suspense fallback={<SubscriberActivitySkeleton />}>
        <SubscriberActivityErrorBoundary>
          <SubscriberActivityContent />
        </SubscriberActivityErrorBoundary>
      </Suspense>
    </RoleBasedAccess>
  );
}