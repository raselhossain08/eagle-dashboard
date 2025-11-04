// app/dashboard/billing/plans/new/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlanForm } from '@/components/billing/plan-form';
import { PlanPricingCalculator } from '@/components/billing/plan-pricing-calculator';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  RefreshCw,
  Lightbulb,
  Copy,
  Settings
} from 'lucide-react';
import { useCreatePlan, usePlans } from '@/hooks/use-plans';
import { CreatePlanDto, Plan } from '@/types/billing';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';

export default function CreatePlanPage() {
  const router = useRouter();
  
  // Enhanced state management
  const [formData, setFormData] = useState<Partial<CreatePlanDto>>({
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    trialPeriodDays: 0,
    baseSeats: 1,
    pricePerSeat: 0,
    isActive: true,
    isVisible: false,
    features: []
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [saveDraftDialog, setSaveDraftDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // API hooks
  const createPlanMutation = useCreatePlan();
  const { data: existingPlans, isLoading: plansLoading } = usePlans();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans' },
    { label: 'Create Plan', href: '#', active: true }
  ];

  // Enhanced form validation
  const validateForm = useCallback((data: Partial<CreatePlanDto>) => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) errors.push('Plan name is required');
    if (!data.price || data.price <= 0) errors.push('Price must be greater than 0');
    if (!data.currency) errors.push('Currency is required');
    if (!data.interval) errors.push('Billing interval is required');
    if (!data.intervalCount || data.intervalCount < 1) errors.push('Interval count must be at least 1');
    
    // Check for duplicate plan names
    if (data.name && existingPlans?.data?.some(plan => 
      plan.name.toLowerCase() === data.name?.toLowerCase()
    )) {
      errors.push('A plan with this name already exists');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [existingPlans]);

  // Enhanced create handler with comprehensive error handling
  const handleCreatePlan = useCallback(async (data: CreatePlanDto) => {
    try {
      if (!validateForm(data)) {
        toast.error('Please fix form validation errors');
        return;
      }

      const result = await createPlanMutation.mutateAsync(data);
      
      toast.success('Plan created successfully!', {
        description: `${data.name} is now available for customers`,
        duration: 5000,
      });
      
      setHasUnsavedChanges(false);
      
      // Navigate to the newly created plan
      router.push(`/dashboard/billing/plans/${result.id}`);
      
    } catch (error: any) {
      console.error('Plan creation error:', error);
      toast.error('Failed to create plan', {
        description: error.message || 'Please check your input and try again',
      });
    }
  }, [createPlanMutation, router, validateForm]);

  // Enhanced cancel handler with unsaved changes warning
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard/billing/plans');
      }
    } else {
      router.push('/dashboard/billing/plans');
    }
  }, [hasUnsavedChanges, router]);

  // Draft saving functionality
  const handleSaveDraft = useCallback(async () => {
    try {
      const draftData = { ...formData, isActive: false };
      if (validateForm(draftData as CreatePlanDto)) {
        await createPlanMutation.mutateAsync(draftData as CreatePlanDto);
        toast.success('Plan saved as draft');
        setHasUnsavedChanges(false);
        setSaveDraftDialog(false);
        router.push('/dashboard/billing/plans');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    }
  }, [formData, createPlanMutation, router, validateForm]);





  // Track form changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">

        {/* Main Content */}
        <BillingDashboardShell
          title="Create New Plan"
          description="Create a new billing plan for your customers"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveDraftDialog(true)}
                  disabled={createPlanMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                disabled={!formData.name}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <h4 className="font-medium mb-2">Please fix the following errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Plan Form */}
              <div className="lg:col-span-2">
                {previewMode ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Plan Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="text-center border-2 border-dashed border-muted rounded-lg p-8">
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold">{formData.name || 'Untitled Plan'}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-3xl font-bold">
                                {formData.price ? formatCurrency(formData.price, formData.currency || 'USD') : '$0'}
                              </span>
                              <span className="text-muted-foreground">
                                /{formData.intervalCount === 1 ? formData.interval : `${formData.intervalCount} ${formData.interval}s`}
                              </span>
                            </div>
                            {formData.description && (
                              <p className="text-muted-foreground">{formData.description}</p>
                            )}
                            <div className="flex justify-center gap-2">
                              <Badge variant={formData.isActive ? "default" : "secondary"}>
                                {formData.isActive ? 'Active' : 'Draft'}
                              </Badge>
                              <Badge variant={formData.isVisible ? "default" : "outline"}>
                                {formData.isVisible ? 'Visible' : 'Hidden'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {formData.features && formData.features.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Features Included:</h4>
                            <div className="grid gap-2">
                              {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.trialPeriodDays && formData.trialPeriodDays > 0 && (
                          <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription>
                              Includes {formData.trialPeriodDays} days free trial period
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">

                    <PlanForm
                      mode="create"
                      plan={formData as any}
                      onSubmit={handleCreatePlan as any}
                      onCancel={handleCancel}
                      isLoading={createPlanMutation.isPending}
                    />
                  </div>
                )}
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Real-time Pricing Calculator */}
                {formData.price && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pricing Calculator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PlanPricingCalculator
                        basePrice={formData.price}
                        pricePerSeat={formData.pricePerSeat || 0}
                        quantity={formData.baseSeats || 1}
                        interval={formData.interval || 'month'}
                        intervalCount={formData.intervalCount || 1}
                        currency={formData.currency || 'USD'}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Plan Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Plan Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status</span>
                      <Badge variant={formData.isActive ? "default" : "secondary"}>
                        {formData.isActive ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Visibility</span>
                      <Badge variant={formData.isVisible ? "default" : "outline"}>
                        {formData.isVisible ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Base Seats</span>
                      <span className="font-medium">{formData.baseSeats || 1}</span>
                    </div>
                    {formData.pricePerSeat && formData.pricePerSeat > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Per Additional Seat</span>
                        <span className="font-medium">
                          {formatCurrency(formData.pricePerSeat, formData.currency || 'USD')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Existing Plans Reference */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Existing Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {plansLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    ) : existingPlans?.data && existingPlans.data.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {existingPlans.data.slice(0, 5).map((plan, index) => (
                          <div key={plan.id ? `existing-plan-${plan.id}` : `existing-plan-${index}-${plan.name}`} className="flex justify-between text-sm">
                            <span className="truncate">{plan.name}</span>
                            <span className="font-medium">
                              {formatCurrency(plan.price, plan.currency)}
                            </span>
                          </div>
                        ))}
                        {existingPlans.data.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center pt-2">
                            +{existingPlans.data.length - 5} more plans
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This will be your first plan
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2 text-muted-foreground">
                    <p>• Start with inactive plans to test before going live</p>
                    <p>• Use clear, descriptive plan names</p>
                    <p>• Consider offering trial periods for higher conversion</p>
                    <p>• Set competitive pricing based on value delivered</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Save Draft Confirmation Dialog */}
            <Dialog open={saveDraftDialog} onOpenChange={setSaveDraftDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Plan as Draft</DialogTitle>
                  <DialogDescription>
                    Your plan will be saved as inactive so you can continue editing later.
                    You can activate it when you're ready to offer it to customers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDraftDialog(false)}
                    disabled={createPlanMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={createPlanMutation.isPending}
                  >
                    {createPlanMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </BillingDashboardShell>
      </div>
    </ErrorBoundary>
  );
}