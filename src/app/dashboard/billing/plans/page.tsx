// app/dashboard/billing/plans/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlansTable } from '@/components/billing/plans-table';
import { PlanForm } from '@/components/billing/plan-form';
import { PlanFilters } from '@/components/billing/plan-filters';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan, useTogglePlanStatus, useTogglePlanVisibility } from '@/hooks/use-plans';
import { Plan, CreatePlanDto, UpdatePlanDto } from '@/types/billing';

export default function PlansPage() {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    isActive: undefined as boolean | undefined,
  });
  
  const { data: plansData, isLoading, error } = usePlans(filters);
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

  const handleCreatePlan = async (data: CreatePlanDto | UpdatePlanDto) => {
    await createPlanMutation.mutateAsync(data as CreatePlanDto);
    setShowPlanForm(false);
  };

  const handleUpdatePlan = async (data: CreatePlanDto | UpdatePlanDto) => {
    if (editingPlan) {
      await updatePlanMutation.mutateAsync({ id: editingPlan.id, data: data as UpdatePlanDto });
      setEditingPlan(null);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      await deletePlanMutation.mutateAsync(planId);
    }
  };

  const handleToggleStatus = async (planId: string, isActive: boolean) => {
    await toggleStatusMutation.mutateAsync({ id: planId, isActive });
  };

  const handleToggleVisibility = async (planId: string, isVisible: boolean) => {
    await toggleVisibilityMutation.mutateAsync({ id: planId, isVisible });
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden w-64 lg:block border-r">
        <div className="p-6">
          <BillingNavigation />
        </div>
      </div>

      {/* Main Content */}
      <BillingDashboardShell
        title="Billing Plans"
        description="Create and manage your subscription plans"
        breadcrumbs={breadcrumbs}
        actions={
          <Button onClick={() => setShowPlanForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        }
      >
        {showPlanForm && (
          <PlanForm
            mode="create"
            onSubmit={handleCreatePlan}
            onCancel={() => setShowPlanForm(false)}
            isLoading={createPlanMutation.isPending}
          />
        )}

        {editingPlan && (
          <PlanForm
            plan={editingPlan}
            mode="edit"
            onSubmit={handleUpdatePlan}
            onCancel={() => setEditingPlan(null)}
            isLoading={updatePlanMutation.isPending}
          />
        )}

        {!showPlanForm && !editingPlan && (
          <div className="space-y-6">
            {/* Error handling */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="h-5 w-5 text-red-400 mr-2">⚠</div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Failed to load plans
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Plans</p>
                    <p className="text-2xl font-bold">{plansData?.pagination.total || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Plans</p>
                  <p className="text-2xl font-bold">
                    {plansData?.data.filter(p => p.isActive).length || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visible Plans</p>
                  <p className="text-2xl font-bold">
                    {plansData?.data.filter(p => p.isVisible).length || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plans on Page</p>
                  <p className="text-lg font-bold">
                    {plansData?.data.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Filters */}
            <PlanFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalCount={plansData?.pagination.total}
              filteredCount={plansData?.data.length}
            />

            {/* Plans Table */}
            <PlansTable
              data={plansData?.data || []}
              pagination={plansData?.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onPageChange={(page) => handleFiltersChange({ page })}
              onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              onToggleStatus={handleToggleStatus}
              onToggleVisibility={handleToggleVisibility}
              isLoading={isLoading}
            />
          </div>
        )}
      </BillingDashboardShell>
    </div>
  );
}