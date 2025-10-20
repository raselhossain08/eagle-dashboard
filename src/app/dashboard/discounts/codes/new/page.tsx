// app/dashboard/discounts/codes/new/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto } from '@/types/discounts';

export default function CreateDiscountPage() {
  const handleSubmit = async (data: CreateDiscountDto) => {
    // Implement API call
    console.log('Creating discount:', data);
  };

  const handleCancel = () => {
    window.history.back();
  };

  // Mock data - replace with actual API calls
  const mockPlans = [
    { id: 'basic', name: 'Basic Plan' },
    { id: 'premium', name: 'Premium Plan' },
    { id: 'business', name: 'Business Plan' }
  ];

  const mockCampaigns = [
    { id: 'campaign-1', name: 'Summer Sale 2024' },
    { id: 'campaign-2', name: 'New User Welcome' }
  ];

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
        campaigns={mockCampaigns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="create"
      />
    </DiscountsDashboardShell>
  );
}