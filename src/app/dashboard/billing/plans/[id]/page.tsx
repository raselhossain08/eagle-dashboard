// app/dashboard/billing/plans/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlanForm } from '@/components/billing/plan-form';
import { PlanPricingCalculator } from '@/components/billing/plan-pricing-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { usePlan, useUpdatePlan } from '@/hooks/use-plans';
import { UpdatePlanDto } from '@/types/billing';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params.id as string;
  
  const { data: plan, isLoading } = usePlan(planId);
  const updatePlanMutation = useUpdatePlan();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans' },
    { label: plan?.name || 'Loading...', href: '#', active: true }
  ];

  const handleUpdatePlan = async (data: UpdatePlanDto) => {
    await updatePlanMutation.mutateAsync({ id: planId, data });
  };

  const getIntervalText = () => {
    if (!plan) return '';
    if (plan.interval === 'one_time') return 'One Time';
    if (plan.intervalCount === 1) return `Per ${plan.interval}`;
    return `Every ${plan.intervalCount} ${plan.interval}s`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Loading..."
          description="Loading plan details"
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

  if (!plan) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 lg:block border-r">
          <div className="p-6">
            <BillingNavigation />
          </div>
        </div>
        <BillingDashboardShell
          title="Plan Not Found"
          description="The requested plan could not be found"
          breadcrumbs={breadcrumbs}
        >
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plan Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The plan you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/dashboard/billing/plans">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
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
        title={plan.name}
        description={plan.description || 'Plan details and configuration'}
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/dashboard/billing/plans">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plan Form */}
          <div className="lg:col-span-2">
            <PlanForm
              plan={plan}
              mode="edit"
              onSubmit={handleUpdatePlan}
              onCancel={() => window.history.back()}
              isLoading={updatePlanMutation.isPending}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <Badge variant={plan.isVisible ? "default" : "outline"}>
                    {plan.isVisible ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="font-medium">{formatCurrency(plan.price, plan.currency)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billing</span>
                  <span className="text-sm text-right">{getIntervalText()}</span>
                </div>

                {plan.trialPeriodDays > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trial</span>
                    <span className="text-sm">{plan.trialPeriodDays} days</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Calculator */}
            <PlanPricingCalculator
              basePrice={plan.price}
              pricePerSeat={plan.pricePerSeat}
              quantity={plan.baseSeats}
              interval={plan.interval}
              intervalCount={plan.intervalCount}
              currency={plan.currency}
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Plan Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Active Subscriptions</span>
                  <span className="font-medium">Coming soon</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Revenue</span>
                  <span className="font-medium">Coming soon</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Avg. Lifetime</span>
                  <span className="font-medium">Coming soon</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Churn Rate</span>
                  <span className="font-medium">Coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </BillingDashboardShell>
    </div>
  );
}