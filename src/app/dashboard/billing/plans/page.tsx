// app/dashboard/billing/plans/page.tsx
'use client';

import React, { useState } from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlansTable } from '@/components/billing/plans-table';
import { PlanForm } from '@/components/billing/plan-form';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/use-plans';
import { Plan, CreatePlanDto, UpdatePlanDto } from '@/types/billing';

export default function PlansPage() {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  const { data: plansData, isLoading } = usePlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans', active: true }
  ];

  const handleCreatePlan = async (data: CreatePlanDto) => {
    await createPlanMutation.mutateAsync(data);
    setShowPlanForm(false);
  };

  const handleUpdatePlan = async (data: UpdatePlanDto) => {
    if (editingPlan) {
      await updatePlanMutation.mutateAsync({ id: editingPlan.id, data });
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
    // Implementation for toggling plan status
    console.log('Toggle plan status:', planId, isActive);
  };

  const handleToggleVisibility = async (planId: string, isVisible: boolean) => {
    // Implementation for toggling plan visibility
    console.log('Toggle plan visibility:', planId, isVisible);
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
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Plans</p>
                    <p className="text-2xl font-bold">{plansData?.data.length || 0}</p>
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
                  <p className="text-sm font-medium text-gray-600">Popular Plan</p>
                  <p className="text-lg font-bold truncate">
                    {plansData?.data[0]?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Plans Table */}
            <PlansTable
              data={plansData?.data || []}
              pagination={plansData?.pagination || { page: 1, pageSize: 10, total: 0 }}
              onPageChange={(page) => console.log('Page change:', page)}
              onPageSizeChange={(size) => console.log('Page size change:', size)}
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