// app/dashboard/discounts/campaigns/new/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignForm } from '@/components/discounts/campaign-form';
import { CampaignFormErrorBoundary } from '@/components/discounts/campaign-form-error-boundary';
import { CreateCampaignDto } from '@/types/discounts';
import { useCreateCampaign } from '@/hooks/use-campaigns';
import { useDiscounts } from '@/hooks/use-discounts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  
  // Fetch available discounts for selection with comprehensive error handling
  const { 
    data: discountsData, 
    isLoading: isLoadingDiscounts,
    error: discountsError,
    refetch: refetchDiscounts
  } = useDiscounts({
    page: 1,
    limit: 100, // Get all discounts for selection
    isActive: true
  });

  const handleSubmit = async (data: CreateCampaignDto) => {
    try {
      const result = await createCampaign.mutateAsync(data);
      
      // Show success message with campaign details
      toast.success(`Campaign "${data.name}" created successfully!`, {
        description: 'You can now manage your campaign from the campaigns dashboard.',
        duration: 5000
      });
      
      // Navigate to the created campaign or campaigns list
      if (result && 'id' in result) {
        router.push(`/dashboard/discounts/campaigns/${result.id}`);
      } else {
        router.push('/dashboard/discounts/campaigns');
      }
    } catch (error: any) {
      // Extract detailed error information
      let errorMessage = 'Failed to create campaign';
      let errorDescription = 'An unexpected error occurred. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific validation errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorDescription = Array.isArray(validationErrors) 
          ? validationErrors.join(', ')
          : 'Please check your input and try again.';
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000
      });
      
      console.error('Campaign creation failed:', {
        error,
        data,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/discounts/campaigns');
  };

  // Handle loading and error states for discounts
  if (isLoadingDiscounts) {
    return (
      <DiscountsDashboardShell
        title="Create Campaign"
        description="Create a new marketing campaign with discounts and tracking"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'New' }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading campaign form...</p>
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  if (discountsError) {
    return (
      <DiscountsDashboardShell
        title="Create Campaign"
        description="Create a new marketing campaign with discounts and tracking"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'New' }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-destructive text-xl">⚠️</div>
            <h3 className="text-lg font-semibold">Failed to Load Form Data</h3>
            <p className="text-muted-foreground">
              Unable to load available discounts. This is required to create a campaign.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => refetchDiscounts()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Transform discounts data for the form
  const discounts = discountsData?.data?.map(discount => ({
    id: discount.id,
    code: discount.code,
    description: discount.description || `${discount.type} - ${discount.value}${discount.type === 'percentage' ? '%' : ` ${discount.currency}`}`
  })) || [];

  return (
    <DiscountsDashboardShell
      title="Create Campaign"
      description="Create a new marketing campaign with discounts and tracking"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
        { label: 'New' }
      ]}
    >
      <CampaignFormErrorBoundary>
        <CampaignForm
          discounts={discounts}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          mode="create"
          isLoading={createCampaign.isPending}
          isRefreshing={false}
        />
      </CampaignFormErrorBoundary>
    </DiscountsDashboardShell>
  );
}