// app/dashboard/discounts/codes/bulk/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { BulkCodeGenerator } from '@/components/discounts/bulk-code-generator';
import { CreateDiscountDto } from '@/types/discounts';
import { useGenerateBulkDiscounts } from '@/hooks/use-discounts';
import { toast } from 'sonner';

export default function BulkGenerationPage() {
  const router = useRouter();
  const generateBulkDiscounts = useGenerateBulkDiscounts();
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const result = await generateBulkDiscounts.mutateAsync({ 
        template, 
        count, 
        prefix 
      });
      
      toast.success(`Successfully generated ${result.codes.length} discount codes`);
      router.push('/dashboard/discounts/codes');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to generate discount codes';
      toast.error(errorMessage);
      console.error('Failed to generate bulk codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (count: number, prefix?: string): string[] => {
    // Generate preview codes
    return Array.from({ length: Math.min(count, 10) }, (_, i) => 
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
        isLoading={isLoading}
      />
    </DiscountsDashboardShell>
  );
}