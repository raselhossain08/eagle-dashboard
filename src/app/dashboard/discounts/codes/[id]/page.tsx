// app/dashboard/discounts/codes/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto, Discount } from '@/types/discounts';

export default function EditDiscountPage() {
  const params = useParams();
  const discountId = params.id as string;

  // Mock discount data - replace with API call
  const mockDiscount: Discount = {
    id: discountId,
    code: 'SUMMER25',
    description: 'Summer promotion 25% off',
    type: 'percentage',
    value: 25,
    currency: 'USD',
    duration: 'forever',
    applicablePlans: ['premium', 'business'],
    applicableProducts: [],
    maxRedemptions: 1000,
    timesRedeemed: 156,
    isActive: true,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    newCustomersOnly: false,
    eligibleCountries: ['US', 'CA', 'GB'],
    eligibleEmailDomains: [],
    minAmount: 0,
    maxAmount: 50,
    isStackable: false,
    priority: 1,
    maxUsesPerCustomer: 1,
    campaignId: 'campaign-1',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-07-20')
  };

  const handleSubmit = async (data: CreateDiscountDto) => {
    // Implement update API call
    console.log('Updating discount:', data);
  };

  const handleCancel = () => {
    window.history.back();
  };

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
        discount={mockDiscount}
        plans={mockPlans}
        campaigns={mockCampaigns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="edit"
      />
    </DiscountsDashboardShell>
  );
}