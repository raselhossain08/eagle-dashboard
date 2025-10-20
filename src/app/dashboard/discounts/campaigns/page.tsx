// app/dashboard/discounts/campaigns/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignsOverview } from '@/components/discounts/campaigns-overview';
import { CampaignsTable } from '@/components/discounts/campaigns-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockCampaigns = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    description: 'Annual summer promotion',
    type: 'promotional' as const,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    isActive: true,
    discountIds: ['1', '2'],
    channels: ['email', 'social'],
    targetAudience: ['new_customers', 'existing_customers'],
    budget: 50000,
    revenueGoal: 200000,
    conversionGoal: 1000,
    utmSource: 'summer_sale_2024',
    totalRedemptions: 456,
    totalRevenue: 187000,
    totalDiscountAmount: 28700,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-07-20')
  }
];

const mockOverviewData = {
  totalCampaigns: 12,
  activeCampaigns: 8,
  totalBudget: 150000,
  budgetSpent: 89000,
  averageROI: 3.2,
  topPerformingCampaign: 'Summer Sale 2024'
};

export default function CampaignsPage() {
  const actions = (
    <Button size="sm" asChild>
      <Link href="/dashboard/discounts/campaigns/new">
        <Plus className="mr-2 h-4 w-4" />
        New Campaign
      </Link>
    </Button>
  );

  return (
    <DiscountsDashboardShell
      title="Campaigns"
      description="Manage marketing campaigns and track performance"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns' }
      ]}
    >
      <CampaignsOverview data={mockOverviewData} />
      <CampaignsTable
        data={mockCampaigns}
        pagination={{
          pageIndex: 0,
          pageSize: 10,
          totalCount: mockCampaigns.length
        }}
        filters={{}}
        onFiltersChange={() => {}}
        onEdit={() => {}}
        onArchive={() => {}}
        onViewPerformance={() => {}}
      />
    </DiscountsDashboardShell>
  );
}