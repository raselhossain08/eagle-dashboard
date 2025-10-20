// app/dashboard/discounts/campaigns/new/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignForm } from '@/components/discounts/campaign-form';
import { CreateCampaignDto } from '@/types/discounts';

export default function CreateCampaignPage() {
  const handleSubmit = async (data: CreateCampaignDto) => {
    // Implement API call
    console.log('Creating campaign:', data);
  };

  const handleCancel = () => {
    window.history.back();
  };

  // Mock data
  const mockDiscounts = [
    { id: '1', code: 'SUMMER25', description: 'Summer 25% off' },
    { id: '2', code: 'WELCOME10', description: 'Welcome 10% off' }
  ];

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
        discounts={mockDiscounts}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="create"
      />
    </DiscountsDashboardShell>
  );
}