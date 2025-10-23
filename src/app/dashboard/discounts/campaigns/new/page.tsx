// app/dashboard/discounts/campaigns/new/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignForm } from '@/components/discounts/campaign-form';
import { CreateCampaignDto } from '@/types/discounts';
import { useCreateCampaign } from '@/hooks/use-campaigns';
import { useDiscounts } from '@/hooks/use-discounts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  
  // Fetch available discounts for selection
  const { data: discountsData } = useDiscounts({
    page: 1,
    limit: 100, // Get all discounts for selection
    isActive: true
  });

  const handleSubmit = async (data: CreateCampaignDto) => {
    try {
      await createCampaign.mutateAsync(data);
      toast.success('Campaign created successfully');
      router.push('/dashboard/discounts/campaigns');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create campaign';
      toast.error(errorMessage);
      console.error('Campaign creation failed:', error);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/discounts/campaigns');
  };

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
      <CampaignForm
        discounts={discounts}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="create"
        isLoading={createCampaign.isPending}
      />
    </DiscountsDashboardShell>
  );
}