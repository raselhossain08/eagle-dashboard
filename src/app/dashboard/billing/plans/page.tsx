// app/dashboard/billing/plans/page.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlansTable } from '@/components/billing/plans-table';
import { PlanForm } from '@/components/billing/plan-form';
import { PlanFilters } from '@/components/billing/plan-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Package, 
  Users, 
  Eye, 
  EyeOff, 
  Power, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  BarChart3,
  Settings,
  Download,
  Upload
} from 'lucide-react';

import { 
  usePlans, 
  useCreatePlan, 
  useUpdatePlan, 
  useDeletePlan, 
  useTogglePlanStatus, 
  useTogglePlanVisibility 
} from '@/hooks/use-plans';
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams } from '@/types/billing';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';

// Utility function to safely convert ObjectId or any value to string
const safeIdToString = (id: any): string => {
  if (!id) return '';
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'object' && id !== null) {
    // Handle MongoDB ObjectId cases
    if (id.$oid) {
      return id.$oid;
    } else if (typeof id.toString === 'function') {
      return id.toString();
    } else if (id.toHexString && typeof id.toHexString === 'function') {
      return id.toHexString();
    }
  }
  
  return String(id);
};
import { ApiErrorHandler } from '@/components/api-error-handler';
import { ErrorBoundary } from '@/components/error-boundary';

export default function PlansPage() {
  // Enhanced state management
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    planId: string | null;
    planName: string | null;
  }>({
    isOpen: false,
    planId: null,
    planName: null
  });
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('table');

  const [filters, setFilters] = useState<PlansQueryParams>({
    page: 1,
    pageSize: 20, // Increased to show more plans by default
    search: '',
    isActive: undefined,
    sortBy: 'sortOrder', // Sort by sortOrder first, then createdAt
    sortOrder: 'asc'
  });
  
  // Real API hooks with enhanced functionality
  const { data: plansData, isLoading, error, refetch } = usePlans(filters);
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const toggleStatusMutation = useTogglePlanStatus();
  const toggleVisibilityMutation = useTogglePlanVisibility();



  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans', active: true }
  ];

  // Enhanced computed values with memoization
  const planStats = useMemo(() => {
    if (!plansData?.data) return {
      total: 0,
      active: 0,
      visible: 0,
      hidden: 0,
      totalRevenue: 0,
      averagePrice: 0
    };

    const plans = plansData.data;
    const totalRevenue = plans.reduce((sum, plan) => sum + (plan.price || 0), 0);
    
    return {
      total: plansData.pagination.total || 0,
      active: plans.filter(p => p.isActive).length,
      visible: plans.filter(p => p.isVisible).length,
      hidden: plans.filter(p => !p.isVisible).length,
      totalRevenue,
      averagePrice: plans.length > 0 ? totalRevenue / plans.length : 0
    };
  }, [plansData]);

  const isAnyLoading = isLoading || createPlanMutation.isPending || 
                      updatePlanMutation.isPending || deletePlanMutation.isPending ||
                      toggleStatusMutation.isPending || toggleVisibilityMutation.isPending ||
                      bulkActionLoading;

  // Enhanced handlers with error handling and notifications
  const handleCreatePlan = useCallback(async (data: CreatePlanDto | UpdatePlanDto) => {
    try {
      await createPlanMutation.mutateAsync(data as CreatePlanDto);
      toast.success('Plan created successfully');
      setShowPlanForm(false);
    } catch (error: any) {
      toast.error('Failed to create plan', {
        description: error.message || 'Please check your input and try again'
      });
    }
  }, [createPlanMutation]);

  const handleUpdatePlan = useCallback(async (data: CreatePlanDto | UpdatePlanDto) => {
    if (!editingPlan) return;
    
    try {
      const planId = safeIdToString(editingPlan.id);
      if (!planId) {
        throw new Error('Plan ID is missing or invalid');
      }
      
      await updatePlanMutation.mutateAsync({ id: planId, data: data as UpdatePlanDto });
      await refetch();
      
      toast.success('Plan updated successfully');
      setEditingPlan(null);
    } catch (error: any) {
      toast.error('Failed to update plan', {
        description: error.message || 'Please try again'
      });
      await refetch();
    }
  }, [editingPlan, updatePlanMutation, refetch]);

  const handleEditPlan = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setShowPlanForm(true);
  }, []);

  const handleDeleteConfirmation = useCallback((planId: string, planName: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      planId,
      planName
    });
  }, []);

  const handleDeletePlan = useCallback(async () => {
    if (!deleteConfirmDialog.planId) return;
    
    try {
      const normalizedPlanId = safeIdToString(deleteConfirmDialog.planId);
      
      await deletePlanMutation.mutateAsync(normalizedPlanId);
      toast.success('Plan deleted successfully');
      setDeleteConfirmDialog({ isOpen: false, planId: null, planName: null });
    } catch (error: any) {
      toast.error('Failed to delete plan', {
        description: error.message || 'Please try again'
      });
    }
  }, [deleteConfirmDialog.planId, deletePlanMutation]);

  const handleToggleStatus = useCallback(async (planId: string, isActive: boolean) => {
    try {
      const normalizedPlanId = safeIdToString(planId);
      
      if (!normalizedPlanId || normalizedPlanId === '') {
        toast.error('Failed to update plan status', {
          description: 'Plan ID is missing or invalid'
        });
        return;
      }
      
      await toggleStatusMutation.mutateAsync({ id: normalizedPlanId, isActive });
      await refetch();
      
      toast.success(`Plan ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error('Failed to update plan status', {
        description: error.message
      });
      await refetch();
    }
  }, [toggleStatusMutation, refetch]);

  const handleToggleVisibility = useCallback(async (planId: string, isVisible: boolean) => {
    try {
      const normalizedPlanId = safeIdToString(planId);
      
      await toggleVisibilityMutation.mutateAsync({ id: normalizedPlanId, isVisible });
      toast.success(`Plan ${isVisible ? 'made visible' : 'hidden'} successfully`);
    } catch (error: any) {
      toast.error('Failed to update plan visibility', {
        description: error.message
      });
    }
  }, [toggleVisibilityMutation]);

  const handleFiltersChange = useCallback((newFilters: Partial<PlansQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSelectedPlans([]); // Clear selection on filter change
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Plans data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Bulk operations
  const handleBulkStatusChange = useCallback(async (isActive: boolean) => {
    if (selectedPlans.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedPlans.map(planId => 
          toggleStatusMutation.mutateAsync({ id: planId, isActive })
        )
      );
      toast.success(`${selectedPlans.length} plans ${isActive ? 'activated' : 'deactivated'}`);
      setSelectedPlans([]);
    } catch (error) {
      toast.error('Failed to update plans status');
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedPlans, toggleStatusMutation]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnyLoading) {
        refetch();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAnyLoading, refetch]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">


        {/* Main Content */}
        <BillingDashboardShell
          title="Billing Plans"
          description="Create and manage your subscription plans"
          breadcrumbs={breadcrumbs}
          showStats={false}
          actions={
            <div className="flex gap-2">
              {selectedPlans.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange(true)}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
                    Activate Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange(false)}
                    disabled={bulkActionLoading}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Deactivate Selected
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || isAnyLoading}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(view === 'table' ? 'grid' : 'table')}
              >
                {view === 'table' ? 'Grid View' : 'Table View'}
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>
          }
        >
        <div className="space-y-6">
          {/* Professional Error Handling */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <h4 className="font-medium mb-1">Failed to load plans</h4>
                  <p className="text-sm mb-3">
                    <ApiErrorHandler error={error} />
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Selection Summary */}
          {selectedPlans.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedPlans.length} plan{selectedPlans.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlans([])}
                      disabled={bulkActionLoading}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Enhanced Statistics Dashboard */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{planStats.total}</p>
                        <p className="text-xs text-muted-foreground">
                          Across all categories
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-green-600">{planStats.active}</p>
                        <p className="text-xs text-muted-foreground">
                          {planStats.total > 0 ? Math.round((planStats.active / planStats.total) * 100) : 0}% of total
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visible Plans</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{planStats.visible}</p>
                        <p className="text-xs text-muted-foreground">
                          Public facing plans
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{formatCurrency(planStats.averagePrice, 'USD')}</p>
                        <p className="text-xs text-muted-foreground">
                          Per month average
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(planStats.totalRevenue, 'USD')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Combined pricing
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Plan Filters */}
          <PlanFilters
            filters={{
              page: filters.page || 1,
              pageSize: filters.pageSize || 10,
              search: filters.search || '',
              isActive: filters.isActive
            }}
            onFiltersChange={handleFiltersChange}
            totalCount={plansData?.pagination.total}
            filteredCount={plansData?.data.length}
          />

          {/* Loading State */}
          {isLoading && !plansData && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Freshness Indicator */}
          {(toggleStatusMutation.isPending || updatePlanMutation.isPending || refreshing) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Updating data and refreshing from database...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}





          {/* Enhanced Plans Table */}
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load plans: {error.message}. 
                <Button variant="link" onClick={() => refetch()} className="p-0 h-auto ml-2">
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <PlansTable
            data={plansData?.data || []}
            pagination={plansData?.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }}
            filters={{
              page: filters.page || 1,
              pageSize: filters.pageSize || 10,
              search: filters.search || '',
              isActive: filters.isActive
            }}
            onFiltersChange={handleFiltersChange}
            onPageChange={(page) => handleFiltersChange({ page })}
            onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
            onEdit={handleEditPlan}
            onDelete={(planId) => {
              const plan = plansData?.data.find(p => safeIdToString(p.id) === planId);
              handleDeleteConfirmation(planId, plan?.name || 'Unknown Plan');
            }}
            onToggleStatus={handleToggleStatus}
            onToggleVisibility={handleToggleVisibility}
            isLoading={isLoading}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={deleteConfirmDialog.isOpen} 
            onOpenChange={(open) => 
              setDeleteConfirmDialog(prev => ({ ...prev, isOpen: open }))
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Plan</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deleteConfirmDialog.planName}"? 
                  This action cannot be undone and will affect all associated subscriptions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmDialog({ isOpen: false, planId: null, planName: null })}
                  disabled={deletePlanMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeletePlan}
                  disabled={deletePlanMutation.isPending}
                >
                  {deletePlanMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Plan'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Plan Form Modal for Create/Edit */}
          {(showPlanForm || editingPlan) && (
            <Dialog 
              open={showPlanForm || !!editingPlan} 
              onOpenChange={(open) => {
                if (!open) {
                  setShowPlanForm(false);
                  setEditingPlan(null);
                }
              }}
            >
              <DialogContent className="max-w-[95vw] lg:max-w-6xl xl:max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPlan 
                      ? 'Update the plan details below' 
                      : 'Fill in the details to create a new billing plan'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <PlanForm
                  plan={editingPlan || undefined}
                  mode={editingPlan ? 'edit' : 'create'}
                  onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
                  onCancel={() => {
                    setShowPlanForm(false);
                    setEditingPlan(null);
                  }}
                  isLoading={createPlanMutation.isPending || updatePlanMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        </BillingDashboardShell>
      </div>
    </ErrorBoundary>
  );
}