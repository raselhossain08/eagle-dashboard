// app/dashboard/discounts/validation/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountCodeValidator } from '@/components/discounts/discount-code-validator';
import { ValidateDiscountDto, ValidationResult } from '@/types/discounts';
import { useValidateDiscount } from '@/hooks/use-discounts';
import { useActiveDiscounts } from '@/hooks/use-discounts';
import { usePlans } from '@/hooks/use-plans';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ValidationPage() {
  const validateDiscount = useValidateDiscount();
  
  // Fetch active discounts and extract plans from them using enhanced hooks
  const { 
    data: activeDiscounts, 
    isLoading: discountsLoading,
    error: discountsError,
    refetch: refetchActiveDiscounts
  } = useActiveDiscounts({
    refetchInterval: 60000 // Auto-refresh every minute for validation page
  });

  const handleValidate = async (data: ValidateDiscountDto): Promise<ValidationResult> => {
    try {
      const result = await validateDiscount.mutateAsync(data);
      
      if (result.isValid) {
        toast.success(`Discount code "${data.code}" is valid! Discount: ${result.discountedAmount || 0} ${result.discount?.currency || 'USD'}`, {
          description: result.discount ? `${result.discount.description || 'No description'}` : undefined,
          duration: 5000,
        });
      } else {
        toast.error(result.error || 'Discount code is invalid', {
          description: 'Please check the code and try again',
          duration: 4000,
        });
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to validate discount code';
      toast.error('Validation Error', {
        description: errorMessage,
        duration: 4000,
      });
      throw error;
    }
  };

  // Fetch active plans from the plans API as a real-data fallback
  const { data: plansData, isLoading: plansLoading, error: plansError } = usePlans({ isActive: true });

  // Build unique available plans from active discounts first, then fall back to plans API.
  const availablePlans = (() => {
    const out: Array<{ id: string; name: string }> = [];

    if (activeDiscounts && Array.isArray(activeDiscounts)) {
      activeDiscounts.forEach((discount: any) => {
        discount.applicablePlans?.forEach((planId: string) => {
          if (!out.find((p) => p.id === planId)) {
            // Prefer plan name from plansData if available
            const planFromApi = plansData?.data?.find((p: any) => p.id === planId);
            const planName = planFromApi?.name || planId.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            out.push({ id: planId, name: planName });
          }
        });
      });
    }

    // If no plans derived from discounts, use plans from plans API
    if (out.length === 0 && plansData?.data && Array.isArray(plansData.data)) {
      plansData.data.forEach((p: any) => {
        if (!out.find((x) => x.id === p.id)) {
          out.push({ id: p.id, name: p.name || p.id });
        }
      });
    }

    return out;
  })();

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
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => refetchActiveDiscounts()}
            >
              Retry
            </Button>
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
        <>
          {(!discountsLoading && !plansLoading && availablePlans.length === 0) ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No plans available to validate against. Please ensure plans are configured in Billing.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => { refetchActiveDiscounts(); /* trigger plans refetch via hook re-render */ }}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <DiscountCodeValidator
              onValidate={handleValidate}
              plans={availablePlans}
              isLoading={validateDiscount.isPending || plansLoading}
            />
          )}
        </>
      )}
    </DiscountsDashboardShell>
  );
}