// app/dashboard/discounts/codes/bulk/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { BulkCodeGenerator } from '@/components/discounts/bulk-code-generator';
import { CreateDiscountDto } from '@/types/discounts';

export default function BulkGenerationPage() {
  const template: CreateDiscountDto = {
    code: 'TEMPLATE',
    description: 'Bulk generated code',
    type: 'percentage',
    value: 20,
    currency: 'USD',
    duration: 'once',
    applicablePlans: [],
    applicableProducts: [],
    maxRedemptions: 100,
    isActive: true,
    newCustomersOnly: false,
    eligibleCountries: [],
    eligibleEmailDomains: [],
    minAmount: 0,
    isStackable: false,
    priority: 1,
    maxUsesPerCustomer: 1
  };

  const handleGenerate = async (count: number, prefix?: string) => {
    // Implement bulk generation API call
    console.log('Generating', count, 'codes with prefix:', prefix);
  };

  const handlePreview = (count: number, prefix?: string): string[] => {
    // Generate preview codes
    return Array.from({ length: count }, (_, i) => 
      `${prefix || 'CODE'}_${String(i + 1).padStart(4, '0')}`
    );
  };

  return (
    <DiscountsDashboardShell
      title="Bulk Code Generation"
      description="Generate multiple discount codes with the same settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes', href: '/dashboard/discounts/codes' },
        { label: 'Bulk Generate' }
      ]}
    >
      <BulkCodeGenerator
        template={template}
        onGenerate={handleGenerate}
        onPreview={handlePreview}
        maxCount={1000}
      />
    </DiscountsDashboardShell>
  );
}