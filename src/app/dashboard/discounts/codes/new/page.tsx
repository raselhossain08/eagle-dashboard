// app/dashboard/discounts/codes/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountForm } from '@/components/discounts/discount-form';
import { CreateDiscountDto } from '@/types/discounts';
import { useCreateDiscount } from '@/hooks/use-discounts';
import { useActiveCampaigns } from '@/hooks/use-campaigns';
import { useActivePlans } from '@/hooks/use-plans';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { CreateDiscountErrorBoundary } from '@/components/discounts/create-discount-error-boundary';
import { DiscountValidator, DiscountValidationResult } from '@/lib/validators/discount-validator';
import { toast } from 'sonner';

function CreateDiscountPageContent() {
  const router = useRouter();
  const createDiscount = useCreateDiscount();
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<DiscountValidationResult | null>(null);
  const [formData, setFormData] = useState<Partial<CreateDiscountDto>>({});

  // Fetch real data with comprehensive error handling
  const { 
    data: activeCampaigns, 
    isLoading: isLoadingCampaigns, 
    error: campaignsError,
    refetch: refetchCampaigns 
  } = useActiveCampaigns();

  // Fetch real plans data  
  const { 
    data: activePlans, 
    isLoading: isLoadingPlans, 
    error: plansError,
    refetch: refetchPlans 
  } = useActivePlans();

  const handleSubmit = async (data: CreateDiscountDto) => {
    // Comprehensive validation before submission
    const validation = DiscountValidator.validate(data);
    setValidationResult(validation);
    
    if (!validation.isValid) {
      toast.error('Please fix validation errors before submitting', {
        description: `${validation.errors.length} error(s) found`
      });
      return;
    }

    // Basic required field check
    if (!data.code || !data.type || !data.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if plans/campaigns are still loading
    if (isLoadingData) {
      toast.error('Please wait for data to load completely');
      return;
    }

    setIsLoading(true);
    
    try {
      // Enhanced data validation
      const validatedData: CreateDiscountDto = {
        ...data,
        // Ensure proper data types
        value: Number(data.value),
        maxRedemptions: Number(data.maxRedemptions) || 100, // Default to 100 if not provided
        maxUsesPerCustomer: data.maxUsesPerCustomer ? Number(data.maxUsesPerCustomer) : 1,
        minAmount: data.minAmount ? Number(data.minAmount) : 0,
        // Ensure proper arrays
        applicablePlans: data.applicablePlans || [],
        eligibleCountries: data.eligibleCountries || [],
        eligibleEmailDomains: data.eligibleEmailDomains || [],
        // Set defaults
        isActive: data.isActive !== undefined ? data.isActive : true,
        priority: data.priority || 1,
        // Handle date fields properly
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      };

      const result = await createDiscount.mutateAsync(validatedData);
      
      // Success feedback with detailed information
      toast.success(
        `Discount code "${data.code}" created successfully`, 
        {
          description: `${data.type === 'percentage' ? data.value + '% off' : '$' + data.value + ' off'} discount is now active`
        }
      );
      
      // Navigate to codes list or to the created discount detail
      if (result?.id) {
        router.push(`/dashboard/discounts/codes/${result.id}`);
      } else {
        router.push('/dashboard/discounts/codes');
      }
      
    } catch (error: any) {
      console.error('Failed to create discount:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to create discount code';
      
      if (error?.status === 400) {
        errorMessage = error?.message || 'Invalid discount data provided';
      } else if (error?.status === 409) {
        errorMessage = 'A discount code with this name already exists';
      } else if (error?.status === 422) {
        errorMessage = 'Please check your input values and try again';
      } else if (error?.status === 403) {
        errorMessage = 'You don\'t have permission to create discount codes';
      } else if (error?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        description: 'Please review your inputs and try again'
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/discounts/codes');
  };

  // Handle form data changes and real-time validation
  const handleFormChange = (data: Partial<CreateDiscountDto>) => {
    setFormData(data);
    
    // Perform real-time validation
    const validation = DiscountValidator.validate(data);
    setValidationResult(validation);
  };

  // Transform plans and campaigns data for the form
  const plans = activePlans?.map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    category: plan.category || 'subscription'
  })) || [];

  const campaigns = activeCampaigns?.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description
  })) || [];

  // Handle retry for failed data fetching
  const handleRetryDataFetch = async () => {
    if (plansError) {
      try {
        await refetchPlans();
      } catch (error) {
        toast.error('Failed to reload plans data');
      }
    }
    if (campaignsError) {
      try {
        await refetchCampaigns();
      } catch (error) {
        toast.error('Failed to reload campaigns data');
      }
    }
  };

  // Check if we're still loading critical data
  const isLoadingData = isLoadingPlans || isLoadingCampaigns;
  
  // Check if we have critical errors that prevent form usage
  const hasCriticalErrors = plansError || campaignsError;
  
  // Check if form is ready to use
  const isFormReady = !isLoadingData && !hasCriticalErrors;

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
      <div className="space-y-6">
        {/* Data Loading State */}
        {isLoadingData && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Loading plans and campaigns data...
            </AlertDescription>
          </Alert>
        )}

        {/* Error State with Retry */}
        {hasCriticalErrors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium">Failed to load required data</p>
                <p className="text-sm mt-1">
                  {plansError && "• Failed to load subscription plans"}
                  {campaignsError && "• Failed to load campaigns"}
                </p>
              </div>
              <Button
                onClick={handleRetryDataFetch}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Loading Skeleton */}
        {isLoadingData && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        )}

        {/* Validation Feedback (shown after submission attempt) */}
        {validationResult && !validationResult.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Please fix the following errors:</p>
                {validationResult.errors.map((error, index) => (
                  <p key={index} className="text-sm">• {error.message}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validationResult && validationResult.warnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-1">
                <p className="font-medium">Recommendations:</p>
                {validationResult.warnings.map((warning, index) => (
                  <p key={index} className="text-sm">• {warning.message}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        {isFormReady && (
          <DiscountForm
            plans={plans}
            campaigns={campaigns}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="create"
            isLoading={isLoading || createDiscount.isPending}
          />
        )}
      </div>
    </DiscountsDashboardShell>
  );
}

export default function CreateDiscountPage() {
  return (
    <CreateDiscountErrorBoundary>
      <CreateDiscountPageContent />
    </CreateDiscountErrorBoundary>
  );
}