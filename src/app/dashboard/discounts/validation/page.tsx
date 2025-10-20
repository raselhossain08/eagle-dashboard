// app/dashboard/discounts/validation/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountCodeValidator } from '@/components/discounts/discount-code-validator';
import { ValidateDiscountDto, ValidationResult } from '@/types/discounts';

export default function ValidationPage() {
  const handleValidate = async (data: ValidateDiscountDto): Promise<ValidationResult> => {
    // Implement actual API call
    return {
      isValid: true,
      discountedAmount: data.orderAmount * 0.8, // 20% discount example
      discount: {
        id: '1',
        code: data.code,
        type: 'percentage',
        value: 20,
        currency: data.currency,
        duration: 'once',
        applicablePlans: [],
        applicableProducts: [],
        maxRedemptions: 1000,
        timesRedeemed: 156,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        newCustomersOnly: false,
        eligibleCountries: [],
        eligibleEmailDomains: [],
        minAmount: 0,
        isStackable: false,
        priority: 1,
        maxUsesPerCustomer: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  };

  const mockPlans = [
    { id: 'basic', name: 'Basic Plan' },
    { id: 'premium', name: 'Premium Plan' }
  ];

  return (
    <DiscountsDashboardShell
      title="Code Validation"
      description="Validate discount codes and check eligibility in real-time"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Validation' }
      ]}
    >
      <DiscountCodeValidator
        onValidate={handleValidate}
        plans={mockPlans}
      />
    </DiscountsDashboardShell>
  );
}