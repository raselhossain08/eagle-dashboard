// app/dashboard/subscribers/[id]/subscriptions/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useSubscriberSubscriptions, useSubscriberProfile } from '@/hooks/useSubscriberProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SubscriptionsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: profile, isLoading: profileLoading } = useSubscriberProfile(id);
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriberSubscriptions(id);

  const isLoading = profileLoading || subscriptionsLoading;

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

  const handlePauseSubscription = (subscriptionId: string) => {
    toast.info('Subscription pause functionality coming soon');
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    toast.info('Subscription cancellation functionality coming soon');
  };

  const handleReactivateSubscription = (subscriptionId: string) => {
    toast.info('Subscription reactivation functionality coming soon');
  };

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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active' || sub.status === 'trialing') || [];
  const inactiveSubscriptions = subscriptions?.filter(sub => sub.status !== 'active' && sub.status !== 'trialing') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/subscribers/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Subscription History</h1>
            <p className="text-muted-foreground">
              Manage subscriptions for {profile?.firstName} {profile?.lastName}
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>
            Currently active subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSubscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{subscription.planName}</h3>
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
                    <span>Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePauseSubscription(subscription.id)}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCancelSubscription(subscription.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {activeSubscriptions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No active subscriptions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>
            Past and canceled subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inactiveSubscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{subscription.planName}</h3>
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
                    <span>Duration: {new Date(subscription.startDate).toLocaleDateString()} - {subscription.canceledAt ? new Date(subscription.canceledAt).toLocaleDateString() : new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleReactivateSubscription(subscription.id)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Reactivate
                </Button>
              </div>
            ))}
            
            {inactiveSubscriptions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No subscription history found
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
  );
}