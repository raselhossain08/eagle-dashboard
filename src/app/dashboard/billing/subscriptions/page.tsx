// app/dashboard/billing/subscriptions/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { SubscriptionsTable } from '@/components/billing/subscriptions-table';
import { SubscriptionsOverview } from '@/components/billing/subscriptions-overview';
import { Button } from '@/components/ui/button';
import { Plus, Users, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Subscription, SubscriptionStatus } from '@/types/billing';

export default function SubscriptionsPage() {
  const [filters, setFilters] = useState({
    status: undefined as SubscriptionStatus | undefined,
    search: '',
  });

  const { data: subscriptionsData, isLoading } = useSubscriptions(filters);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Subscriptions', href: '/dashboard/billing/subscriptions', active: true }
  ];

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleCancelSubscription = async (subscriptionId: string, reason?: string) => {
    // Implementation for canceling subscription
    console.log('Cancel subscription:', subscriptionId, reason);
  };

  const handlePauseSubscription = async (subscriptionId: string, until: Date) => {
    // Implementation for pausing subscription
    console.log('Pause subscription:', subscriptionId, until);
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    // Implementation for resuming subscription
    console.log('Resume subscription:', subscriptionId);
  };

  // Mock overview data - in real app, this would come from API
  const overviewData = {
    totalActive: subscriptionsData?.data.filter(s => s.status === 'active').length || 0,
    totalCanceled: subscriptionsData?.data.filter(s => s.status === 'canceled').length || 0,
    totalPaused: subscriptionsData?.data.filter(s => s.status === 'paused').length || 0,
    upcomingRenewals: subscriptionsData?.data.filter(s => 
      s.status === 'active' && 
      new Date(s.currentPeriodEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    ).length || 0,
    churnRate: 2.5, // This would be calculated from historical data
    averageLifetime: 18, // Months
  };

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
        <div className="space-y-6">
          {/* Subscriptions Overview */}
          <SubscriptionsOverview data={overviewData} isLoading={isLoading} />

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
            data={subscriptionsData?.data || []}
            pagination={subscriptionsData?.pagination || { page: 1, pageSize: 10, total: 0 }}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onCancel={handleCancelSubscription}
            onPause={handlePauseSubscription}
            onResume={handleResumeSubscription}
            isLoading={isLoading}
          />
        </div>
      </BillingDashboardShell>
    </div>
  );
}