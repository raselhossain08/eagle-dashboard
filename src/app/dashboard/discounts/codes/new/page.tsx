// app/dashboard/discounts/codes/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto } from '@/types/discounts';
import { useCreateDiscount } from '@/hooks/use-discounts';
import { useActiveCampaigns } from '@/hooks/use-campaigns';
import { toast } from 'sonner';

export default function CreateDiscountPage() {
  const router = useRouter();
  const createDiscount = useCreateDiscount();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data
  const { data: activeCampaigns, isLoading: isLoadingCampaigns } = useActiveCampaigns();

  const handleSubmit = async (data: CreateDiscountDto) => {
    setIsLoading(true);
    try {
      await createDiscount.mutateAsync(data);
      toast.success('Discount code created successfully');
      router.push('/dashboard/discounts/codes');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create discount code';
      toast.error(errorMessage);
      console.error('Failed to create discount:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/discounts/codes');
  };

  // TODO: Replace with real API calls to get plans
  const mockPlans = [
    { id: 'basic', name: 'Basic Plan' },
    { id: 'premium', name: 'Premium Plan' },
    { id: 'business', name: 'Business Plan' }
  ];

  // Transform campaigns data for the form
  const campaigns = activeCampaigns?.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name
  })) || [];

  return (
    <DiscountsDashboardShell
      title="Create Discount Code"
      description="Create a new discount code with advanced targeting options"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes', href: '/dashboard/discounts/codes' },
        { label: 'New' }
      ]}
    >
      <DiscountForm
        plans={mockPlans}
        campaigns={campaigns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="create"
        isLoading={isLoading}
      />
    </DiscountsDashboardShell>
  );
}