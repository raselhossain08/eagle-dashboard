// app/dashboard/billing/subscriptions/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { SubscriptionDetailsPanel } from '@/components/billing/subscription-details-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, Users } from 'lucide-react';
import { useSubscription, useCancelSubscription, usePauseSubscription, useResumeSubscription } from '@/hooks/use-subscriptions';
import { useCustomer } from '@/hooks/use-customers';
import { usePlan } from '@/hooks/use-plans';
import { useSubscriptionInvoices } from '@/hooks/use-invoices';
import { UpdateSubscriptionDto } from '@/types/billing';
import Link from 'next/link';

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const subscriptionId = params.id as string;
  
  const { data: subscription, isLoading } = useSubscription(subscriptionId);
  const { data: customer, isLoading: customerLoading } = useCustomer(subscription?.userId || '');
  const { data: plan, isLoading: planLoading } = usePlan(subscription?.planId || '');
  const { data: invoices, isLoading: invoicesLoading } = useSubscriptionInvoices(subscriptionId);
  
  const cancelMutation = useCancelSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions' },
    { label: `Subscription #${subscriptionId.slice(0, 8)}`, href: '#', active: true }
  ];

  const handleUpdate = async (data: UpdateSubscriptionDto) => {
    try {
      // Implementation would use subscription update mutation
      console.log('Update subscription:', data);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleCancel = async (reason?: string) => {
    try {
      await cancelMutation.mutateAsync({ id: subscriptionId, reason });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handlePause = async (until: Date) => {
    try {
      await pauseMutation.mutateAsync({ id: subscriptionId, until });
    } catch (error) {
      console.error('Failed to pause subscription:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync(subscriptionId);
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  if (isLoading || customerLoading || planLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Loading..."
          description="Loading subscription details"
          breadcrumbs={breadcrumbs}
        >
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  if (!subscription || !customer || !plan) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Subscription Not Found"
          description="The requested subscription could not be found"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center py-12">
            <Users className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Subscription Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The subscription you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/dashboard/billing/subscriptions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subscriptions
              </Button>
            </Link>
          </div>
        </BillingDashboardShell>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title={`Subscription #${subscriptionId.slice(0, 8)}`}
        description="Manage subscription details and billing"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/dashboard/billing/subscriptions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscriptions
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          {/* Subscription Details Panel */}
          <SubscriptionDetailsPanel
            subscription={subscription}
            customer={customer}
            plan={plan}
            invoices={invoices || []}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            onPause={handlePause}
            onResume={handleResume}
          />

          {/* Additional Analytics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$598.00</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Months Active</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Since January 2024
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Invoice</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Feb 15</div>
                <p className="text-xs text-muted-foreground">
                  Next billing date
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    </div>
  );
}