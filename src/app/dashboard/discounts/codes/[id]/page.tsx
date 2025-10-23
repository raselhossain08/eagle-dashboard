// app/dashboard/discounts/codes/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto } from '@/types/discounts';
import { useDiscount, useUpdateDiscount } from '@/hooks/use-discounts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useActiveCampaigns } from '@/hooks/use-campaigns';
import { toast } from 'sonner';

export default function EditDiscountPage() {
  const params = useParams();
  const router = useRouter();
  const discountId = params.id as string;
  const updateDiscount = useUpdateDiscount();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch discount data
  const { 
    data: discount, 
    isLoading: isLoadingDiscount, 
    error 
  } = useDiscount(discountId);

  // Fetch real data
  const { data: activeCampaigns, isLoading: isLoadingCampaigns } = useActiveCampaigns();

  const handleSubmit = async (data: CreateDiscountDto) => {
    setIsLoading(true);
    try {
      await updateDiscount.mutateAsync({ id: discountId, data });
      toast.success('Discount code updated successfully');
      router.push('/dashboard/discounts/codes');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update discount code';
      toast.error(errorMessage);
      console.error('Failed to update discount:', error);
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

  // Show loading state
  if (isLoadingDiscount) {
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </DiscountsDashboardShell>
    );
  }

  // Show error state
  if (error) {
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
            Failed to load discount: {error.message}
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
      <DiscountForm
        discount={discount}
        plans={mockPlans}
        campaigns={campaigns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="edit"
        isLoading={isLoading}
      />
    </DiscountsDashboardShell>
  );
}