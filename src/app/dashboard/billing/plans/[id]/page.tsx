// app/dashboard/billing/plans/[id]/page.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlanForm } from '@/components/billing/plan-form';
import { PlanPricingCalculator } from '@/components/billing/plan-pricing-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  EyeOff,
  Power,
  Trash2,
  Loader2,
  BarChart3
} from 'lucide-react';
import { 
  usePlan, 
  useUpdatePlan, 
  useDeletePlan, 
  useTogglePlanStatus, 
  useTogglePlanVisibility, 
  usePlanStatistics,
  usePlanSubscriptionHistory 
} from '@/hooks/use-plans';
import { UpdatePlanDto } from '@/types/billing';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = params.id as string;
  
  // Enhanced state management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Real API hooks
  const { data: plan, isLoading, error, refetch } = usePlan(planId);
  const { data: planStats, isLoading: statsLoading, error: statsError } = usePlanStatistics(planId);
  const { data: subscriptionHistory, isLoading: historyLoading } = usePlanSubscriptionHistory(planId);
  
  // Mutation hooks
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const toggleStatusMutation = useTogglePlanStatus();
  const toggleVisibilityMutation = useTogglePlanVisibility();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans' },
    { label: plan?.name || 'Loading...', href: '#', active: true }
  ];

  // Enhanced update handler with error handling
  const handleUpdatePlan = useCallback(async (data: UpdatePlanDto) => {
    try {
      await updatePlanMutation.mutateAsync({ id: planId, data });
      toast.success('Plan updated successfully');
    } catch (error) {
      toast.error('Failed to update plan');
      console.error('Update error:', error);
    }
  }, [planId, updatePlanMutation]);

  // Status toggle handler
  const handleToggleStatus = useCallback(async () => {
    if (!plan) return;
    
    try {
      await toggleStatusMutation.mutateAsync({ 
        id: planId, 
        isActive: !plan.isActive 
      });
      toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update plan status');
      console.error('Status toggle error:', error);
    }
  }, [plan, planId, toggleStatusMutation]);

  // Visibility toggle handler
  const handleToggleVisibility = useCallback(async () => {
    if (!plan) return;
    
    try {
      await toggleVisibilityMutation.mutateAsync({ 
        id: planId, 
        isVisible: !plan.isVisible 
      });
      toast.success(`Plan ${!plan.isVisible ? 'made visible' : 'hidden'} successfully`);
    } catch (error) {
      toast.error('Failed to update plan visibility');
      console.error('Visibility toggle error:', error);
    }
  }, [plan, planId, toggleVisibilityMutation]);

  // Delete handler
  const handleDeletePlan = useCallback(async () => {
    try {
      await deletePlanMutation.mutateAsync(planId);
      toast.success('Plan deleted successfully');
      window.location.href = '/dashboard/billing/plans';
    } catch (error) {
      toast.error('Failed to delete plan');
      console.error('Delete error:', error);
    }
  }, [planId, deletePlanMutation]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Plan data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Computed values with memoization
  const getIntervalText = useCallback(() => {
    if (!plan) return '';
    if (plan.interval === 'one_time') return 'One Time';
    if (plan.intervalCount === 1) return `Per ${plan.interval}`;
    return `Every ${plan.intervalCount} ${plan.interval}s`;
  }, [plan]);

  const statsWithCalculations = useMemo(() => {
    if (!planStats) return null;
    
    return {
      ...planStats,
      revenueGrowthFormatted: planStats.revenueGrowth > 0 ? 
        `+${planStats.revenueGrowth.toFixed(1)}%` : 
        `${planStats.revenueGrowth.toFixed(1)}%`,
      averageLifetimeFormatted: `${Math.round(planStats.averageLifetime)} days`,
      churnRateFormatted: `${planStats.churnRate.toFixed(1)}%`,
      mrrFormatted: formatCurrency(planStats.monthlyRecurringRevenue, plan?.currency || 'USD')
    };
  }, [planStats, plan]);

  // Loading states checks
  const isAnyLoading = isLoading || updatePlanMutation.isPending || 
                      toggleStatusMutation.isPending || toggleVisibilityMutation.isPending;

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen">

          <BillingDashboardShell
            title="Loading..."
            description="Loading plan details"
            breadcrumbs={breadcrumbs}
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </BillingDashboardShell>
        </div>
      </ErrorBoundary>
    );
  }

  if (error || (!plan && !isLoading)) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen">
          <BillingDashboardShell
            title="Plan Error"
            description="Failed to load plan details"
            breadcrumbs={breadcrumbs}
          >
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <h4 className="font-medium mb-1">Failed to load plan</h4>
                    <p className="text-sm mb-3">
                      {error ? <ApiErrorHandler error={error} /> : 'The plan you\'re looking for doesn\'t exist or has been deleted.'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                      >
                        {refreshing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Retry
                      </Button>
                      <Link href="/dashboard/billing/plans">
                        <Button variant="outline" size="sm">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {!error && (
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
              )}
            </div>
          </BillingDashboardShell>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">

        {/* Main Content */}
        <BillingDashboardShell
          title={plan?.name || 'Plan Details'}
          description={plan?.description || 'Plan details and configuration'}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || isAnyLoading}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Plan</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete "{plan?.name}"? This action cannot be undone 
                      and will affect all associated subscriptions.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={deletePlanMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeletePlan}
                      disabled={deletePlanMutation.isPending}
                    >
                      {deletePlanMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Plan'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Link href="/dashboard/billing/plans">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              </Link>
            </div>
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

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Plan Summary with Controls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm">Plan Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isAnyLoading}
                    className={cn(
                      "h-8 w-8 p-0",
                      plan?.isActive ? "text-green-600" : "text-gray-400"
                    )}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleVisibility}
                    disabled={isAnyLoading}
                    className={cn(
                      "h-8 w-8 p-0",
                      plan?.isVisible ? "text-blue-600" : "text-gray-400"
                    )}
                  >
                    {plan?.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan?.isActive ? "default" : "secondary"}>
                      {plan?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {toggleStatusMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan?.isVisible ? "default" : "outline"}>
                      {plan?.isVisible ? 'Visible' : 'Hidden'}
                    </Badge>
                    {toggleVisibilityMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="font-medium">
                    {plan ? formatCurrency(plan.price, plan.currency) : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billing</span>
                  <span className="text-sm text-right">{getIntervalText()}</span>
                </div>

                {plan && plan.trialPeriodDays > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trial</span>
                    <span className="text-sm">{plan.trialPeriodDays} days</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm text-right">
                    {plan?.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '--'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Calculator */}
            {plan && (
              <PlanPricingCalculator
                basePrice={plan.price}
                pricePerSeat={plan.pricePerSeat}
                quantity={plan.baseSeats}
                interval={plan.interval}
                intervalCount={plan.intervalCount}
                currency={plan.currency}
              />
            )}

            {/* Real-time Plan Statistics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm">Plan Statistics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                {statsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ApiErrorHandler error={statsError} />
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span>Active Subscriptions</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium flex items-center gap-1">
                      {statsWithCalculations?.activeSubscriptions || 0}
                      <Users className="h-3 w-3 text-blue-600" />
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Total Revenue</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    <span className="font-medium flex items-center gap-1">
                      {statsWithCalculations ? formatCurrency(statsWithCalculations.totalRevenue, plan?.currency || 'USD') : '$0'}
                      <DollarSign className="h-3 w-3 text-green-600" />
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Monthly Recurring Revenue</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    <span className="font-medium text-green-600">
                      {statsWithCalculations?.mrrFormatted || '$0'}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Avg. Lifetime</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="font-medium flex items-center gap-1">
                      {statsWithCalculations?.averageLifetimeFormatted || '0 days'}
                      <Calendar className="h-3 w-3 text-orange-600" />
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Churn Rate</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className={cn(
                      "font-medium flex items-center gap-1",
                      statsWithCalculations && statsWithCalculations.churnRate > 5 ? "text-red-600" : "text-green-600"
                    )}>
                      {statsWithCalculations?.churnRateFormatted || '0%'}
                      {statsWithCalculations && statsWithCalculations.churnRate > 0 ? (
                        statsWithCalculations.churnRate > 5 ? 
                          <TrendingDown className="h-3 w-3" /> : 
                          <TrendingUp className="h-3 w-3" />
                      ) : (
                        <Activity className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Revenue Growth</span>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className={cn(
                      "font-medium flex items-center gap-1",
                      statsWithCalculations && statsWithCalculations.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {statsWithCalculations?.revenueGrowthFormatted || '0%'}
                      {statsWithCalculations && statsWithCalculations.revenueGrowth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription History Chart Preview */}
            {subscriptionHistory && subscriptionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subscriptionHistory.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-4">
                          <span className="font-medium">{item.subscriptions} subs</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(item.revenue, plan?.currency || 'USD')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {historyLoading && (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <div className="flex gap-4">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </BillingDashboardShell>
      </div>
    </ErrorBoundary>
  );
}