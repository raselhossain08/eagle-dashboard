// app/dashboard/billing/subscriptions/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { SubscriptionsTable } from '@/components/billing/subscriptions-table';
import { SubscriptionsOverview } from '@/components/billing/subscriptions-overview';
import { Button } from '@/components/ui/button';
import { Plus, Users, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useSubscriptions, useCancelSubscription, usePauseSubscription, useResumeSubscription } from '@/hooks/use-subscriptions';
import { useBillingMetrics } from '@/hooks/use-billing';
import { Subscription, SubscriptionStatus } from '@/types/billing';

export default function SubscriptionsPage() {
  const [filters, setFilters] = useState({
    status: undefined as SubscriptionStatus | undefined,
    search: '',
    page: 1,
    pageSize: 10,
  });

  const { data: subscriptionsData, isLoading, error } = useSubscriptions(filters);
  const { data: metricsData, isLoading: metricsLoading } = useBillingMetrics();
  const cancelMutation = useCancelSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions', active: true }
  ];

  // Show error state
  if (error) {
    console.error('Subscriptions fetch error:', error);
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  const handleCancelSubscription = async (subscriptionId: string, reason?: string) => {
    try {
      await cancelMutation.mutateAsync({ id: subscriptionId, reason });
      // Success feedback handled by react-query
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      // Error feedback handled by react-query
    }
  };

  const handlePauseSubscription = async (subscriptionId: string, until: Date) => {
    try {
      await pauseMutation.mutateAsync({ id: subscriptionId, until });
    } catch (error) {
      console.error('Failed to pause subscription:', error);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      await resumeMutation.mutateAsync(subscriptionId);
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  // Calculate overview data from actual data with proper null checks
  const subscriptions = subscriptionsData?.data || [];
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Subscriptions data:', subscriptionsData);
    console.log('Subscriptions array:', subscriptions);
    console.log('Metrics data:', metricsData);
  }

  const overviewData = {
    totalActive: subscriptions.filter(s => s.status === 'active').length,
    totalCanceled: subscriptions.filter(s => s.status === 'canceled').length,
    totalPaused: subscriptions.filter(s => s.status === 'paused').length,
    upcomingRenewals: subscriptions.filter(s => 
      s.status === 'active' && 
      new Date(s.currentPeriodEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    ).length,
    churnRate: metricsData?.churnRate || 0,
    averageLifetime: metricsData?.averageLifetime || 0,
  };

  return (
    <div className="flex min-h-screen">

      {/* Main Content */}
      <BillingDashboardShell
        title="Subscriptions"
        description="Manage customer subscriptions and billing"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        }
      >
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <TrendingDown className="h-24 w-24 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Subscriptions</h3>
              <p className="text-gray-600">
                {error instanceof Error ? error.message : 'Failed to load subscription data'}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Subscriptions Overview */}
          <SubscriptionsOverview 
            data={overviewData} 
            isLoading={isLoading || metricsLoading} 
          />

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{overviewData.totalActive}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Canceled</p>
                  <p className="text-2xl font-bold">{overviewData.totalCanceled}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Renewals</p>
                  <p className="text-2xl font-bold">{overviewData.upcomingRenewals}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Lifetime</p>
                  <p className="text-2xl font-bold">{overviewData.averageLifetime}m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <SubscriptionsTable
            data={subscriptions}
            pagination={subscriptionsData?.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onCancel={handleCancelSubscription}
            onPause={handlePauseSubscription}
            onResume={handleResumeSubscription}
            isLoading={isLoading}
          />
        </div>
        )}
      </BillingDashboardShell>
    </div>
  );
}