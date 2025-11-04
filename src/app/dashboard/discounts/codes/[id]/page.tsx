// app/dashboard/discounts/codes/[id]/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto } from '@/types/discounts';
import { useDiscount, useUpdateDiscount } from '@/hooks/use-discounts';
import { useActivePlans } from '@/hooks/use-plans';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useActiveCampaigns } from '@/hooks/use-campaigns';
import { useDiscountPerformance, useDiscountValidation } from '@/hooks/use-discount-performance';
import { DiscountDetailsErrorBoundary } from '@/components/discounts/discount-details-error-boundary';
import { DiscountFormSkeleton } from '@/components/skeletons/discount-form-skeleton';
import { DiscountCodeValidator } from '@/components/discounts/discount-validator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, DollarSign, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';

function EditDiscountPageContent() {
  const params = useParams();
  const router = useRouter();
  const discountId = params.id as string;
  const updateDiscount = useUpdateDiscount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch discount data
  const { 
    data: discount, 
    isLoading: isLoadingDiscount, 
    error: discountError,
    refetch: refetchDiscount 
  } = useDiscount(discountId);

  // Fetch real plans data for discount targeting
  const { 
    data: plansData, 
    isLoading: isLoadingPlans, 
    error: plansError,
    refetch: refetchPlans 
  } = useActivePlans();

  // Fetch real campaigns data
  const { 
    data: activeCampaigns, 
    isLoading: isLoadingCampaigns,
    error: campaignsError,
    refetch: refetchCampaigns 
  } = useActiveCampaigns();

  // Fetch discount performance data
  const { 
    data: performanceData, 
    isLoading: isLoadingPerformance,
    error: performanceError,
    refetch: refetchPerformance 
  } = useDiscountPerformance(discountId, !!discount);

  // Discount validation mutation for real-time validation
  const discountValidation = useDiscountValidation();

  const handleSubmit = async (data: CreateDiscountDto) => {
    setIsSubmitting(true);
    try {
      await updateDiscount.mutateAsync({ id: discountId, data });
      toast.success('Discount code updated successfully');
      router.push('/dashboard/discounts/codes');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update discount code';
      toast.error(errorMessage);
      console.error('Failed to update discount:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/discounts/codes');
  };

  const handleRetry = () => {
    refetchDiscount();
    refetchPlans();
    refetchCampaigns();
    refetchPerformance();
  };

  // Transform real plans data for the form
  const plans = useMemo(() => {
    return plansData?.map((plan: any) => ({
      id: plan.id || plan._id,
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle
    })) || [];
  }, [plansData]);

  // Transform campaigns data for the form
  const campaigns = useMemo(() => {
    return activeCampaigns?.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name
    })) || [];
  }, [activeCampaigns]);

  // Check if we have any critical errors
  const hasError = discountError || plansError || campaignsError;
  const isLoading = isLoadingDiscount || isLoadingPlans || isLoadingCampaigns;
  const hasPerformanceData = performanceData && !isLoadingPerformance;

  // Show comprehensive loading state
  if (isLoading && !discount && !plansData) {
    return (
      <DiscountsDashboardShell
        title="Edit Discount Code"
        description="Update discount code settings and targeting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Codes', href: '/dashboard/discounts/codes' },
          { label: 'Edit' }
        ]}
      >
        <DiscountFormSkeleton />
      </DiscountsDashboardShell>
    );
  }

  // Show partial loading state when some data is available
  if (isLoadingPlans && discount) {
    return (
      <DiscountsDashboardShell
        title="Edit Discount Code"
        description="Update discount code settings and targeting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Codes', href: '/dashboard/discounts/codes' },
          { label: 'Edit' }
        ]}
      >
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Loading plans data... Some features may be limited.
          </AlertDescription>
        </Alert>
        <DiscountForm
          discount={discount}
          plans={[]} // Empty array while loading
          campaigns={campaigns}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          mode="edit"
          isLoading={isSubmitting || isLoadingPlans}
        />
      </DiscountsDashboardShell>
    );
  }

  // Show error state with retry functionality
  if (hasError && !isLoading) {
    const errorMessage = discountError?.message || plansError?.message || campaignsError?.message || 'Failed to load data';
    
    return (
      <DiscountsDashboardShell
        title="Edit Discount Code"
        description="Update discount code settings and targeting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Codes', href: '/dashboard/discounts/codes' },
          { label: 'Edit' }
        ]}
      >
        <Alert className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load data: {errorMessage}</span>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Show not found state
  if (!discount) {
    return (
      <DiscountsDashboardShell
        title="Edit Discount Code"
        description="Update discount code settings and targeting"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Codes', href: '/dashboard/discounts/codes' },
          { label: 'Edit' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Discount not found
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  return (
    <DiscountsDashboardShell
      title="Edit Discount Code"
      description="Update discount code settings and targeting"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes', href: '/dashboard/discounts/codes' },
        { label: 'Edit' }
      ]}
    >
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Discount Settings</TabsTrigger>
          <TabsTrigger value="validation" disabled={!discount}>
            Validation Test
          </TabsTrigger>
          <TabsTrigger value="performance" disabled={!hasPerformanceData}>
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="history" disabled={!discount}>
            Usage History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {hasPerformanceData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceData.totalRedemptions}</div>
                  <p className="text-xs text-muted-foreground">
                    {performanceData.redemptionRate.toFixed(1)}% redemption rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(performanceData.totalRevenue / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${(performanceData.averageOrderValue / 100).toFixed(2)} avg order value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Discount Amount</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(performanceData.totalDiscountAmount / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total discounts applied
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={discount.isActive ? 'default' : 'secondary'}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {discount.timesRedeemed} / {discount.maxRedemptions} used
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <DiscountForm
            discount={discount}
            plans={plans}
            campaigns={campaigns}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="edit"
            isLoading={isSubmitting || isLoading}
          />
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <DiscountCodeValidator 
            discountCode={discount?.code}
            className="max-w-4xl mx-auto"
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {isLoadingPerformance ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : performanceError ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load performance data: {performanceError.message}
              </AlertDescription>
            </Alert>
          ) : hasPerformanceData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Detailed analytics for discount code: {discount.code}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Redemption Rate</p>
                      <p className="text-2xl font-bold">{performanceData.redemptionRate.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Average Order Value</p>
                      <p className="text-2xl font-bold">
                        ${(performanceData.averageOrderValue / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Revenue Impact</p>
                      <p className="text-2xl font-bold">
                        ${((performanceData.totalRevenue - performanceData.totalDiscountAmount) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No performance data available for this discount code.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
              <CardDescription>
                Recent usage and redemption details for this discount code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Redemption history will be displayed here. This feature requires additional API integration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DiscountsDashboardShell>
  );
}

export default function EditDiscountPage() {
  const params = useParams();
  const discountId = params.id as string;

  return (
    <DiscountDetailsErrorBoundary discountId={discountId}>
      <EditDiscountPageContent />
    </DiscountDetailsErrorBoundary>
  );
}