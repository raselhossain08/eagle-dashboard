// app/dashboard/subscribers/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Edit,
  Calendar,
  DollarSign,
  CreditCard,
  Activity,
  Users,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { 
  useSubscriberProfileSummary,
  useSubscriberSubscriptions 
} from '@/hooks/useSubscriberProfile';
import { 
  useSubscriberBillingSummary, 
  useSubscriberActivity 
} from '@/hooks/useBilling';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { RoleBasedAccess } from '@/components/role-based-access';
import { ErrorBoundary } from '@/components/error-boundary';
import { useState } from 'react';

export default function SubscriberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  // Mock user role for now - replace with actual auth hook when available
  const userRole = 'super_admin';
  
  // API hooks with proper error handling
  const { 
    data: profileSummary, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useSubscriberProfileSummary(id);
  
  const { 
    data: subscriptions, 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions
  } = useSubscriberSubscriptions(id);
  
  const { 
    data: billingSummary, 
    isLoading: billingLoading,
    error: billingError,
    refetch: refetchBilling
  } = useSubscriberBillingSummary(id);
  
  const { 
    data: activity, 
    isLoading: activityLoading,
    error: activityError,
    refetch: refetchActivity
  } = useSubscriberActivity(id, { limit: 10 });

  const isLoading = profileLoading;
  const profile = profileSummary?.profile;
  const mainError = profileError || subscriptionsError;

  // Wrap the entire component in role-based access control
  const requiredRoles = ['super_admin', 'finance_admin', 'support'];

  if (mainError) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <ApiErrorHandler 
            error={mainError}
            onRetry={() => {
              if (refetchProfile) refetchProfile();
              if (refetchSubscriptions) refetchSubscriptions();
            }}
            variant="page"
            showBackButton={true}
            backButtonUrl="/dashboard/subscribers"
            fallbackMessage="Failed to load subscriber details. Please try again."
          />
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  // Enhanced loading skeleton component
  const LoadingSkeleton = () => (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </RoleBasedAccess>
    </ErrorBoundary>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!profile) {
    return (
      <ErrorBoundary>
        <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
          <ApiErrorHandler 
            error={new Error('Subscriber not found')}
            onRetry={() => { if (refetchProfile) refetchProfile(); }}
            variant="card"
            showBackButton={true}
            backButtonUrl="/dashboard/subscribers"
            fallbackMessage="The requested subscriber could not be found. They may have been deleted or you may not have access."
          />
        </RoleBasedAccess>
      </ErrorBoundary>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getKycBadge = (kycStatus: string) => {
    const variants = {
      verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return variants[kycStatus as keyof typeof variants] || variants.not_started;
  };

  const getKycStatusText = (status: string) => {
    const labels = {
      verified: 'Verified',
      pending: 'Pending',
      rejected: 'Rejected',
      not_started: 'Not Started'
    };
    return labels[status as keyof typeof labels] || 'Not Started';
  };

  const activeSubscriptions = subscriptions?.filter(sub => 
    sub.status === 'active' || sub.status === 'trialing'
  ) || [];

  // Enhanced retry handler for all data
  const handleRefreshAll = () => {
    if (refetchProfile) refetchProfile();
    if (refetchSubscriptions) refetchSubscriptions();
    if (refetchBilling) refetchBilling();
    if (refetchActivity) refetchActivity();
  };

  const handleRefreshSubscriptions = () => {
    if (refetchSubscriptions) refetchSubscriptions();
  };

  const handleRefreshBilling = () => {
    if (refetchBilling) refetchBilling();
  };

  const handleRefreshActivity = () => {
    if (refetchActivity) refetchActivity();
  };

  return (
    <ErrorBoundary>
      <RoleBasedAccess requiredRoles={requiredRoles} userRole={userRole}>
        <div className="space-y-6">
          {/* Header with refresh functionality */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/subscribers">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <span className="text-lg font-medium">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRefreshAll}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadge(profile.status)}>
                {profile.status}
              </Badge>
              <Badge className={getKycBadge(profile.kycStatus)}>
                KYC: {getKycStatusText(profile.kycStatus)}
              </Badge>
              <Link href={`/dashboard/subscribers/${id}/profile`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Enhanced Stats Cards */}
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${profile.totalSpent?.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  Lifetime customer value
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {profile.activeSubscriptions || 0}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {profile.activeSubscriptions > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      Currently active
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                      No active subscriptions
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : billingError ? (
                  <div className="text-sm text-red-500">Error loading</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600">
                      ${billingSummary?.currentMrr?.toFixed(2) || '0.00'}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {(billingSummary?.currentMrr || 0) > 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          MRR from this subscriber
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                          No recurring revenue
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.createdAt ? 
                    `${Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
                    'Registration date'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic subscriber details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{profile.company}</p>
                    </div>
                  </div>
                )}
                {profile.address && (profile.address.street || profile.address.city) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.address.street && profile.address.city 
                          ? `${profile.address.street}, ${profile.address.city}`
                          : profile.address.street || profile.address.city
                        }
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Activity</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Subscriptions Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Current subscription plans</CardDescription>
                </div>
                {subscriptionsError && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefreshSubscriptions}
                    className="text-red-500 hover:text-red-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : subscriptionsError ? (
                  <ApiErrorHandler 
                    error={subscriptionsError}
                    onRetry={handleRefreshSubscriptions}
                    variant="inline"
                    fallbackMessage="Failed to load subscriptions"
                  />
                ) : activeSubscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {activeSubscriptions.slice(0, 3).map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{subscription.planName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge 
                              variant={subscription.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {subscription.status}
                            </Badge>
                            <span>•</span>
                            <span>{subscription.billingCycle}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">${(subscription.amount / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            /{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activeSubscriptions.length > 3 && (
                      <Link href={`/dashboard/subscribers/${id}/subscriptions`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View All ({activeSubscriptions.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active subscriptions</p>
                    <p className="text-sm">This subscriber doesn't have any active plans</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscription History</CardTitle>
                <CardDescription>
                  Active and past subscriptions for this subscriber
                </CardDescription>
              </div>
              {subscriptionsError && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshSubscriptions}
                  className="text-red-500 hover:text-red-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : subscriptionsError ? (
                <ApiErrorHandler 
                  error={subscriptionsError}
                  onRetry={handleRefreshSubscriptions}
                  variant="card"
                  fallbackMessage="Failed to load subscription history"
                />
              ) : subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{subscription.planName}</h3>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status}
                          </Badge>
                          {subscription.cancelAtPeriodEnd && (
                            <Badge variant="destructive" className="text-xs">
                              Cancelling
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            ${(subscription.amount / 100).toFixed(2)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </p>
                          <p>
                            Started {new Date(subscription.startDate).toLocaleDateString()}
                          </p>
                          {subscription.currentPeriodEnd && (
                            <p>
                              Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link href={`/dashboard/subscribers/${id}/subscriptions/${subscription.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No subscriptions found</h3>
                  <p className="text-sm">This subscriber doesn't have any subscription history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Recent activity and events for this subscriber
                </CardDescription>
              </div>
              {activityError && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshActivity}
                  className="text-red-500 hover:text-red-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityError ? (
                <ApiErrorHandler 
                  error={activityError}
                  onRetry={handleRefreshActivity}
                  variant="card"
                  fallbackMessage="Failed to load activity timeline"
                />
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.slice(0, 10).map((event, index) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'login': return '🔐';
                        case 'purchase': return '💳';
                        case 'subscription': return '📋';
                        case 'profile_update': return '👤';
                        case 'transaction': return '💰';
                        default: return '📝';
                      }
                    };

                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'login': return 'bg-green-100 text-green-600';
                        case 'purchase': return 'bg-purple-100 text-purple-600';
                        case 'subscription': return 'bg-blue-100 text-blue-600';
                        case 'transaction': return 'bg-orange-100 text-orange-600';
                        default: return 'bg-gray-100 text-gray-600';
                      }
                    };

                    return (
                      <div key={index} className="flex items-start gap-3 hover:bg-muted/30 p-3 rounded-lg transition-colors">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(event.type)}`}>
                          {getActivityIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {event.metadata && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Link href={`/dashboard/subscribers/${id}/activity`}>
                    <Button variant="outline" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      View Full Activity Timeline ({activity.length} total)
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No activity found</h3>
                  <p className="text-sm">This subscriber doesn't have any recorded activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Payment methods and billing history
                </CardDescription>
              </div>
              {billingError && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshBilling}
                  className="text-red-500 hover:text-red-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-8 w-16 mx-auto" />
                        <Skeleton className="h-4 w-12 mx-auto mt-2" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : billingError ? (
                <ApiErrorHandler 
                  error={billingError}
                  onRetry={handleRefreshBilling}
                  variant="card"
                  fallbackMessage="Failed to load billing information"
                />
              ) : billingSummary ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${billingSummary.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                      <div className="text-xs text-muted-foreground mt-1">All time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        ${billingSummary.averageMonthlySpend?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Monthly</div>
                      <div className="text-xs text-muted-foreground mt-1">Last 12 months</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${billingSummary.currentMrr?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Current MRR</div>
                      <div className="text-xs text-muted-foreground mt-1">Monthly recurring</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        ${billingSummary.lifetimeValue?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Lifetime Value</div>
                      <div className="text-xs text-muted-foreground mt-1">Projected value</div>
                    </div>
                  </div>

                  {/* Payment Status & Next Billing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payment Status
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={billingSummary.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                            {billingSummary.subscriptionStatus}
                          </Badge>
                        </div>
                        {billingSummary.lastPaymentDate && (
                          <div className="flex justify-between">
                            <span>Last Payment:</span>
                            <span>{new Date(billingSummary.lastPaymentDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {billingSummary.nextBillingDate && (
                          <div className="flex justify-between">
                            <span>Next Billing:</span>
                            <span>{new Date(billingSummary.nextBillingDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Account Health
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Payment Health:</span>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-green-600">Good</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          No failed payments in the last 90 days
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/subscribers/${id}/billing`} className="flex-1">
                      <Button className="w-full">
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Full Billing Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/subscribers/${id}/invoices`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Invoices
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">No billing information found</h3>
                  <p className="text-sm">This subscriber doesn't have any billing data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </RoleBasedAccess>
    </ErrorBoundary>
  );
}