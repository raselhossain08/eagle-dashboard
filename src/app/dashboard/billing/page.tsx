// app/dashboard/billing/page.tsx
'use client';

import React from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { RevenueOverviewCards } from '@/components/billing/revenue-overview-cards';
import { MrrTrendsChart } from '@/components/billing/mrr-trends-chart';
import { RevenueBreakdownChart } from '@/components/billing/revenue-breakdown-chart';
import { useBillingOverview } from '@/hooks/use-billing';

export default function BillingPage() {
  const { data, isLoading, dateRange, setDateRange } = useBillingOverview();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing', active: true }
  ];

  return (
    <BillingDashboardShell
      title="Billing Overview"
      description="Monitor your revenue, subscriptions, and billing performance"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Date Range Picker */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Revenue Overview</h2>
          {/* Date range picker would go here */}
        </div>

        {/* Revenue Cards */}
        <RevenueOverviewCards 
          data={data?.overview || {
            currentMrr: 0,
            newMrr: 0,
            churnedMrr: 0,
            netMrr: 0,
            growthRate: 0,
            totalRevenue: 0,
            recurringRevenue: 0,
            oneTimeRevenue: 0,
            refunds: 0,
            netRevenue: 0
          }}
          dateRange={dateRange}
          isLoading={isLoading}
        />

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <MrrTrendsChart 
            data={data?.mrrTrends || []}
            period="monthly"
            isLoading={isLoading}
          />
          <RevenueBreakdownChart 
            data={data?.revenueBreakdown || {
              recurringRevenue: 0,
              oneTimeRevenue: 0,
              refunds: 0
            }}
            period={dateRange}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Additional quick stats cards */}
        </div>
      </div>
    </BillingDashboardShell>
  );
}