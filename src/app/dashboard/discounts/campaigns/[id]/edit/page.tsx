// app/dashboard/discounts/campaigns/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignForm } from '@/components/discounts/campaign-form';
import { CreateCampaignDto, Campaign } from '@/types/discounts';
import { useCampaign, useUpdateCampaign } from '@/hooks/use-campaigns';
import { useDiscounts } from '@/hooks/use-discounts';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CampaignFormErrorBoundary } from '@/components/discounts/campaign-form-error-boundary';
import { getCampaignValidationErrors, validateCampaignData } from '@/lib/validations/campaign.validation';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  // State management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch campaign data with proper error handling
  const { 
    data: campaign, 
    isLoading: campaignLoading, 
    error: campaignError,
    refetch: refetchCampaign
  } = useCampaign(campaignId);

  // Fetch available discounts for selection with proper pagination
  const { 
    data: discountsData, 
    isLoading: discountsLoading,
    error: discountsError,
    refetch: refetchDiscounts
  } = useDiscounts({
    page: 1,
    limit: 100, // Get all active discounts for selection
    isActive: true
  });

  const updateCampaign = useUpdateCampaign();

  // Enhanced validation function using Zod
  const validateFormData = useCallback((data: CreateCampaignDto): boolean => {
    try {
      // Transform data for validation (handle date conversion)
      const validationData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        budget: data.budget ? Number(data.budget) : undefined,
        revenueGoal: data.revenueGoal ? Number(data.revenueGoal) : undefined,
        conversionGoal: data.conversionGoal ? Number(data.conversionGoal) : undefined,
      };

      const result = validateCampaignData(validationData);
      
      if (result.success) {
        setFormErrors({});
        return true;
      }

      const errors = getCampaignValidationErrors(validationData);
      setFormErrors(errors);
      return false;
      
    } catch (error) {
      console.error('Validation error:', error);
      setFormErrors({ general: 'Validation failed. Please check your input.' });
      return false;
    }
  }, []);

  // Submit handler with comprehensive error handling
  const handleSubmit = useCallback(async (data: CreateCampaignDto) => {
    try {
      // Validate form data
      if (!validateFormData(data)) {
        toast.error('Please fix the form errors before submitting');
        return;
      }

      // Prepare data for API
      const updateData: Partial<CreateCampaignDto> = {
        ...data,
        // Ensure dates are properly formatted
        startDate: data.startDate,
        endDate: data.endDate,
        // Ensure arrays are properly handled
        channels: data.channels || [],
        targetAudience: data.targetAudience || [],
        discountIds: data.discountIds || []
      };

      await updateCampaign.mutateAsync({ id: campaignId, data: updateData });
      
      // Success feedback
      toast.success('Campaign updated successfully!', {
        description: 'All changes have been saved.',
        action: {
          label: 'View Campaign',
          onClick: () => router.push(`/dashboard/discounts/campaigns/${campaignId}`)
        }
      });
      
      // Navigate back to campaign details
      router.push(`/dashboard/discounts/campaigns/${campaignId}`);
      
    } catch (error: any) {
      console.error('Campaign update failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to update campaign';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show specific error message
      toast.error('Update Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleSubmit(data)
        }
      });
    }
  }, [campaignId, updateCampaign, validateFormData, router]);

  // Cancel handler with confirmation
  const handleCancel = useCallback(() => {
    if (updateCampaign.isPending) {
      toast.info('Please wait for the current operation to complete');
      return;
    }
    
    router.push(`/dashboard/discounts/campaigns/${campaignId}`);
  }, [router, campaignId, updateCampaign.isPending]);

  // Refresh data handler
  const handleRefreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      toast.info('Refreshing campaign data...');
      
      await Promise.all([
        refetchCampaign(),
        refetchDiscounts()
      ]);
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCampaign, refetchDiscounts]);

  // Auto-refresh when component mounts
  useEffect(() => {
    if (campaignId) {
      handleRefreshData();
    }
  }, [campaignId]); // Only run once when campaignId changes

  // Loading state with proper skeleton and actions
  if (campaignLoading || discountsLoading) {
    return (
      <DiscountsDashboardShell
        title={campaignLoading ? "Loading Campaign..." : "Loading Discounts..."}
        description={campaignLoading ? "Loading campaign details for editing" : "Loading available discounts"}
        actions={
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Edit Campaign' }
        ]}
      >
        <div className="space-y-6">
          {/* Campaign Details Card Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
          
          {/* Form Fields Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Discounts Selection Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
          
          {/* Action Buttons Skeleton */}
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Comprehensive error handling
  if (campaignError || discountsError) {
    const primaryError = campaignError || discountsError;
    const errorType = campaignError ? 'campaign' : 'discounts';
    
    return (
      <DiscountsDashboardShell
        title="Error Loading Data"
        description={`Failed to load ${errorType} data`}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/discounts/campaigns/${campaignId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Error' }
        ]}
      >
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>
                <strong>
                  {campaignError ? 'Campaign Loading Error:' : 'Discounts Loading Error:'}
                </strong>
              </div>
              <div>{primaryError?.message || 'An unexpected error occurred'}</div>
              
              {/* Detailed error information */}
              {campaignError && (
                <div className="mt-2 text-sm">
                  <p>• Cannot load campaign details for editing</p>
                  <p>• Please check your internet connection</p>
                  <p>• Verify that you have permission to edit this campaign</p>
                </div>
              )}
              
              {discountsError && !campaignError && (
                <div className="mt-2 text-sm">
                  <p>• Cannot load available discounts</p>
                  <p>• You can still edit campaign details, but discount selection may be limited</p>
                  <p>• This won't affect existing discount associations</p>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Action suggestions */}
          <div className="grid gap-3 md:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/discounts/campaigns">
                View All Campaigns
              </Link>
            </Button>
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Campaign not found handling
  if (!campaign && !campaignLoading && !campaignError) {
    return (
      <DiscountsDashboardShell
        title="Campaign Not Found"
        description="The requested campaign could not be found"
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/discounts/campaigns">
              View All Campaigns
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Not Found' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>Campaign not found</strong>
            </div>
            <div>
              The campaign with ID "{campaignId}" doesn't exist or you don't have permission to edit it.
            </div>
            <div className="mt-2 text-sm">
              <p>• The campaign may have been deleted</p>
              <p>• You may not have the required permissions</p>
              <p>• The campaign ID in the URL may be incorrect</p>
            </div>
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  // Ensure we have campaign data before rendering form
  if (!campaign) {
    return null;
  }

  // Transform discounts data for the form with proper error handling
  const discounts = discountsData?.data?.map(discount => ({
    id: discount.id,
    code: discount.code,
    description: discount.description || `${discount.type} - ${discount.value}${discount.type === 'percentage' ? '%' : ` ${discount.currency}`}`
  })) || [];

  // Show warning if discounts failed to load but continue with form
  const showDiscountsWarning = discountsError && !discountsLoading;

  return (
    <DiscountsDashboardShell
      title={`Edit ${campaign.name}`}
      description="Update campaign settings and configuration"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing || updateCampaign.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/discounts/campaigns/${campaignId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign
            </Link>
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
        { label: campaign.name, href: `/dashboard/discounts/campaigns/${campaignId}` },
        { label: 'Edit' }
      ]}
    >
      <div className="space-y-6">
        {/* Show warning if discounts couldn't load */}
        {showDiscountsWarning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Could not load available discounts. 
              You can still edit campaign details, but discount selection may be limited.
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => refetchDiscounts()}
                className="ml-2 p-0 h-auto"
              >
                Try loading discounts again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main campaign form wrapped in error boundary */}
        <CampaignFormErrorBoundary>
          <CampaignForm
            discounts={discounts}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="edit"
            campaign={campaign}
            isLoading={updateCampaign.isPending}
            formErrors={formErrors}
            isRefreshing={isRefreshing}
          />
        </CampaignFormErrorBoundary>
      </div>
    </DiscountsDashboardShell>
  );
}