// app/dashboard/billing/plans/new/page.tsx
'use client';

import React from 'react';
import { BillingDashboardShell } from '@/components/billing/billing-dashboard-shell';
import { BillingNavigation } from '@/components/billing/billing-navigation';
import { PlanForm } from '@/components/billing/plan-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCreatePlan } from '@/hooks/use-plans';
import { CreatePlanDto } from '@/types/billing';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePlanPage() {
  const router = useRouter();
  const createPlanMutation = useCreatePlan();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Plans', href: '/dashboard/billing/plans' },
    { label: 'Create Plan', href: '#', active: true }
  ];

  const handleCreatePlan = async (data: CreatePlanDto) => {
    await createPlanMutation.mutateAsync(data);
    router.push('/dashboard/billing/plans');
  };

  const handleCancel = () => {
    router.push('/dashboard/billing/plans');
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
        title="Create New Plan"
        description="Create a new billing plan for your customers"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/dashboard/billing/plans">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        }
      >
        <PlanForm
          mode="create"
          onSubmit={handleCreatePlan}
          onCancel={handleCancel}
          isLoading={createPlanMutation.isPending}
        />
      </BillingDashboardShell>
    </div>
  );
}