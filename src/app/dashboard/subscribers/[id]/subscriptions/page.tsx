// app/dashboard/subscribers/[id]/subscriptions/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  X,
  RefreshCw,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriberSubscriptions, useSubscriberProfile } from '@/hooks/useSubscriberProfile';
import { 
  usePauseSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useResumeSubscription,
  useSubscriptionStats,
  useExportSubscriptions
} from '@/hooks/useSubscriptionManagement';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { RoleBasedAccess } from '@/components/role-based-access';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SubscriptionsPage() {
  const params = useParams();
  const id = params.id as string;
  
  // State management
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'pause' | 'cancel' | 'reactivate' | 'resume' | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [billingCycleFilter, setBillingCycleFilter] = useState<string>('all');
  
  // Mock user role - replace with actual auth
  const userRole = 'super_admin';
  const requiredRoles = ['super_admin', 'finance_admin', 'support'];

  // API hooks with proper error handling
  const { 
    data: profile, 
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile 
  } = useSubscriberProfile(id);
  
  const { 
    data: subscriptions, 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useSubscriberSubscriptions(id);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useSubscriptionStats(id);

  // Subscription action hooks
  const pauseSubscription = usePauseSubscription();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const resumeSubscription = useResumeSubscription();
  const exportSubscriptions = useExportSubscriptions();

  const isLoading = profileLoading || subscriptionsLoading;
  const mainError = profileError || subscriptionsError;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      past_due: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      incomplete: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[status as keyof typeof variants] || variants.incomplete;
  };

  const getBillingCycleBadge = (cycle: string) => {
    return cycle === 'monthly' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  };

  const getStatusText = (status: string) => {
    const labels = {
      active: 'Active',
      canceled: 'Canceled',
      paused: 'Paused',
      past_due: 'Past Due',
      trialing: 'Trial',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2); // Convert from cents to dollars
  };

  // Enhanced action handlers with real API integration
  const handleSubscriptionAction = (subscriptionId: string, action: typeof actionType) => {
    setSelectedSubscription(subscriptionId);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  const confirmSubscriptionAction = async () => {
    if (!selectedSubscription || !actionType) return;

    try {
      switch (actionType) {
        case 'pause':
          await pauseSubscription.mutateAsync({ 
            subscriptionId: selectedSubscription,
            reason: 'Requested by admin'
          });
          break;
        case 'cancel':
          await cancelSubscription.mutateAsync({ 
            subscriptionId: selectedSubscription,
            cancelAtPeriodEnd: true,
            reason: 'Requested by admin'
          });
          break;
        case 'reactivate':
          await reactivateSubscription.mutateAsync({ subscriptionId: selectedSubscription });
          break;
        case 'resume':
          await resumeSubscription.mutateAsync({ subscriptionId: selectedSubscription });
          break;
      }
      
      // Refresh data after successful action
      refetchSubscriptions?.();
      refetchStats?.();
    } catch (error) {
      console.error('Subscription action failed:', error);
    } finally {
      setIsActionDialogOpen(false);
      setSelectedSubscription(null);
      setActionType(null);
    }
  };

  const handleExportSubscriptions = async () => {
    try {
      await exportSubscriptions.mutateAsync({ subscriberId: id, format: 'csv', includeHistory: true });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefreshAll = () => {
    refetchProfile?.();
    refetchSubscriptions?.();
    refetchStats?.();
  };

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions?.filter(subscription => {
    const matchesSearch = searchQuery === '' || 
      subscription.planName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    const matchesBillingCycle = billingCycleFilter === 'all' || 
      subscription.billingCycle === billingCycleFilter;
    
    return matchesSearch && matchesStatus && matchesBillingCycle;
  }) || [];

  // Enhanced loading skeleton component
  const LoadingSkeleton = () => (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Subscription Cards Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </RoleBasedAccess>
    </ErrorBoundary>
  );

  // Handle main errors
  if (mainError) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <ApiErrorHandler 
            error={mainError}
            onRetry={handleRefreshAll}
            variant="page"
            showBackButton={true}
            backButtonUrl={`/dashboard/subscribers/${id}`}
            fallbackMessage="Failed to load subscription data. Please try again."
          />
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeSubscriptions = filteredSubscriptions?.filter(sub => sub.status === 'active' || sub.status === 'trialing') || [];
  const inactiveSubscriptions = filteredSubscriptions?.filter(sub => sub.status !== 'active' && sub.status !== 'trialing') || [];

  const getActionButton = (subscription: any) => {
    switch (subscription.status) {
      case 'active':
      case 'trialing':
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
            disabled={pauseSubscription.isPending}
          >
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </Button>
        );
      case 'paused':
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
            disabled={resumeSubscription.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Resume
          </Button>
        );
      case 'canceled':
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}
            disabled={reactivateSubscription.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Reactivate
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="space-y-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/subscribers/${id}`}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">Subscription Management</h1>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefreshAll}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Manage subscriptions for {profile?.firstName} {profile?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleExportSubscriptions}
                disabled={exportSubscriptions.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Subscription
              </Button>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <ApiErrorHandler 
              error={statsError}
              onRetry={() => refetchStats?.()}
              variant="inline"
              fallbackMessage="Failed to load statistics"
            />
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalSubscriptions}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{stats.activeSubscriptions} active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${stats.monthlyRevenue.toFixed(2)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Recurring revenue
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {(stats.retentionRate * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stats.retentionRate > 0.8 ? (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        Excellent retention
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
                        Needs attention
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ${stats.averageLifetimeValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Per subscriber
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Advanced Filtering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by plan name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trial</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={billingCycleFilter} onValueChange={setBillingCycleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cycles</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>
                  Currently active subscription plans ({activeSubscriptions.length})
                </CardDescription>
              </div>
              {subscriptionsError && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="text-red-500 hover:text-red-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-96" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : subscriptionsError ? (
                <ApiErrorHandler 
                  error={subscriptionsError}
                  onRetry={() => window.location.reload()}
                  variant="card"
                  fallbackMessage="Failed to load active subscriptions"
                />
              ) : (
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{subscription.planName}</h3>
                          <Badge className={getStatusBadge(subscription.status)}>
                            {getStatusText(subscription.status)}
                          </Badge>
                          <Badge className={getBillingCycleBadge(subscription.billingCycle)}>
                            {subscription.billingCycle}
                          </Badge>
                          {subscription.cancelAtPeriodEnd && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Cancelling
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">${formatAmount(subscription.amount)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                          <span className="mx-2">•</span>
                          <span>Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                          {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-blue-600 font-medium">Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionButton(subscription)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Plan
                            </DropdownMenuItem>
                            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                              <DropdownMenuItem 
                                onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {activeSubscriptions.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No active subscriptions</h3>
                      <p className="text-sm">This subscriber doesn't have any active subscription plans</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription History */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                Past and canceled subscriptions ({inactiveSubscriptions.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inactiveSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-muted-foreground">{subscription.planName}</h3>
                        <Badge className={getStatusBadge(subscription.status)}>
                          {getStatusText(subscription.status)}
                        </Badge>
                        <Badge className={getBillingCycleBadge(subscription.billingCycle)}>
                          {subscription.billingCycle}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>${formatAmount(subscription.amount)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {subscription.status === 'canceled' 
                            ? `Canceled: ${subscription.canceledAt ? new Date(subscription.canceledAt).toLocaleDateString() : 'N/A'}`
                            : `Ended: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                          }
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Duration: {new Date(subscription.startDate).toLocaleDateString()} - {
                            subscription.canceledAt 
                              ? new Date(subscription.canceledAt).toLocaleDateString() 
                              : new Date(subscription.currentPeriodEnd).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>
                    {getActionButton(subscription)}
                  </div>
                ))}
                
                {inactiveSubscriptions.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No subscription history</h3>
                    <p className="text-sm">This subscriber doesn't have any past subscriptions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Summary</CardTitle>
          <CardDescription>
            Overview of subscription metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeSubscriptions.length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {subscriptions?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${profile?.totalSpent?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${activeSubscriptions.reduce((sum, sub) => sum + (sub.amount / 100), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </RoleBasedAccess>
    </ErrorBoundary>
  );
}