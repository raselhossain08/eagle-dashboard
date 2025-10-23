// app/dashboard/subscribers/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users
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

export default function SubscriberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: profileSummary, isLoading: profileLoading, error } = useSubscriberProfileSummary(id);
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriberSubscriptions(id);
  const { data: billingSummary, isLoading: billingLoading } = useSubscriberBillingSummary(id);
  const { data: activity, isLoading: activityLoading } = useSubscriberActivity(id);

  const isLoading = profileLoading;
  const profile = profileSummary?.profile;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load subscriber</p>
          <Link href="/dashboard/subscribers">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscribers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Subscriber not found</p>
          <Link href="/dashboard/subscribers">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscribers
            </Button>
          </Link>
        </div>
      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subscribers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-medium">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
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
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${profile.totalSpent?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime customer value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${billingSummary?.currentMrr?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  MRR from this subscriber
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registration date
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
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>Current subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : activeSubscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {activeSubscriptions.slice(0, 3).map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{subscription.planName}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.status} • {subscription.billingCycle}
                          </p>
                        </div>
                        <p className="font-medium">${(subscription.amount / 100).toFixed(2)}</p>
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
                    No active subscriptions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                Active and past subscriptions for this subscriber
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{subscription.planName}</h3>
                          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${(subscription.amount / 100).toFixed(2)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'} • 
                          Started {new Date(subscription.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/dashboard/subscribers/${id}/subscriptions`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No subscriptions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activity and events for this subscriber
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href={`/dashboard/subscribers/${id}/activity`}>
                    <Button variant="outline" className="w-full">
                      View Full Activity Timeline
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No activity found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Payment methods and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="h-8 w-16 bg-muted rounded animate-pulse mx-auto" />
                        <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : billingSummary ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${billingSummary.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${billingSummary.averageMonthlySpend?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Monthly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${billingSummary.currentMrr?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Current MRR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${billingSummary.lifetimeValue?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">Lifetime Value</div>
                    </div>
                  </div>
                  <Link href={`/dashboard/subscribers/${id}/billing`}>
                    <Button className="w-full">
                      View Full Billing Details
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No billing information found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}