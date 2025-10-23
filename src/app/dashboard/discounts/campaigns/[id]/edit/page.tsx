// app/dashboard/discounts/campaigns/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignForm } from '@/components/discounts/campaign-form';
import { CreateCampaignDto } from '@/types/discounts';
import { useCampaign, useUpdateCampaign } from '@/hooks/use-campaigns';
import { useDiscounts } from '@/hooks/use-discounts';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Fetch campaign data
  const { 
    data: campaign, 
    isLoading: campaignLoading, 
    error: campaignError 
  } = useCampaign(campaignId);

  // Fetch available discounts for selection
  const { data: discountsData } = useDiscounts({
    page: 1,
    limit: 100, // Get all discounts for selection
    isActive: true
  });

  const updateCampaign = useUpdateCampaign();

  const handleSubmit = async (data: CreateCampaignDto) => {
    try {
      await updateCampaign.mutateAsync({ id: campaignId, data });
      toast.success('Campaign updated successfully');
      router.push(`/dashboard/discounts/campaigns/${campaignId}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update campaign';
      toast.error(errorMessage);
      console.error('Campaign update failed:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/discounts/campaigns/${campaignId}`);
  };

  if (campaignLoading) {
    return (
      <DiscountsDashboardShell
        title="Loading..."
        description="Loading campaign details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Edit Campaign' }
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DiscountsDashboardShell>
    );
  }

  if (campaignError) {
    return (
      <DiscountsDashboardShell
        title="Error"
        description="Failed to load campaign"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Error' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load campaign: {campaignError.message}
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

  if (!campaign) {
    return (
      <DiscountsDashboardShell
        title="Not Found"
        description="Campaign not found"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discounts', href: '/dashboard/discounts' },
          { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
          { label: 'Not Found' }
        ]}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Campaign not found or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
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
      title={`Edit ${campaign.name}`}
      description="Update campaign settings and configuration"
      actions={
        <Button asChild variant="outline">
          <Link href={`/dashboard/discounts/campaigns/${campaignId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Link>
        </Button>
      }
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
        { label: campaign.name, href: `/dashboard/discounts/campaigns/${campaignId}` },
        { label: 'Edit' }
      ]}
    >
      <CampaignForm
        discounts={discounts}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="edit"
        campaign={campaign}
        isLoading={updateCampaign.isPending}
      />
    </DiscountsDashboardShell>
  );
}