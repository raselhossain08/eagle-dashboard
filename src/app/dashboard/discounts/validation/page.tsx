// app/dashboard/discounts/validation/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountCodeValidator } from '@/components/discounts/discount-code-validator';
import { ValidateDiscountDto, ValidationResult } from '@/types/discounts';
import { useValidateDiscount } from '@/hooks/use-discounts';
import { useActiveDiscounts } from '@/hooks/use-discounts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ValidationPage() {
  const validateDiscount = useValidateDiscount();
  
  // Fetch active discounts and extract plans from them
  const { 
    data: activeDiscounts, 
    isLoading: discountsLoading,
    error: discountsError 
  } = useActiveDiscounts();

  const handleValidate = async (data: ValidateDiscountDto): Promise<ValidationResult> => {
    try {
      const result = await validateDiscount.mutateAsync(data);
      
      if (result.isValid) {
        toast.success(`Discount code "${data.code}" is valid!`);
      } else {
        toast.error(result.error || 'Discount code is invalid');
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to validate discount code';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Extract unique plans from applicable plans in active discounts
  const mockPlans = activeDiscounts?.reduce((plans: Array<{id: string, name: string}>, discount) => {
    discount.applicablePlans?.forEach(planId => {
      if (!plans.find(p => p.id === planId)) {
        // In a real implementation, you'd fetch plan details from a plans service
        plans.push({ 
          id: planId, 
          name: planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan' 
        });
      }
    });
    return plans;
  }, []) || [
    { id: 'basic', name: 'Basic Plan' },
    { id: 'premium', name: 'Premium Plan' },
    { id: 'enterprise', name: 'Enterprise Plan' }
  ];

  // Handle error state
  if (discountsError) {
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
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load validation data: {discountsError.message}
          </AlertDescription>
        </Alert>
      </DiscountsDashboardShell>
    );
  }

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
      {discountsLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-32" />
        </div>
      ) : (
        <DiscountCodeValidator
          onValidate={handleValidate}
          plans={mockPlans}
          isLoading={validateDiscount.isPending}
        />
      )}
    </DiscountsDashboardShell>
  );
}