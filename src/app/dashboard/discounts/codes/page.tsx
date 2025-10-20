// app/dashboard/discounts/codes/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountCodesTable } from '@/components/discounts/discount-codes-table';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockDiscounts = [
  {
    id: '1',
    code: 'SUMMER25',
    description: 'Summer promotion 25% off',
    type: 'percentage' as const,
    value: 25,
    currency: 'USD',
    duration: 'forever' as const,
    applicablePlans: ['premium', 'business'],
    applicableProducts: [],
    maxRedemptions: 1000,
    timesRedeemed: 156,
    isActive: true,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    newCustomersOnly: false,
    eligibleCountries: ['US', 'CA', 'GB'],
    eligibleEmailDomains: [],
    minAmount: 0,
    maxAmount: 50,
    isStackable: false,
    priority: 1,
    maxUsesPerCustomer: 1,
    campaignId: 'campaign-1',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-07-20')
  }
];

export default function DiscountCodesPage() {
  const actions = (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button size="sm" asChild>
        <Link href="/dashboard/discounts/codes/new">
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/discounts/codes/bulk">
          Bulk Generate
        </Link>
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Discount Codes"
      description="Manage all discount codes and their settings"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Codes' }
      ]}
    >
      <DiscountCodesTable 
        data={mockDiscounts}
        pagination={{
          pageIndex: 0,
          pageSize: 10,
          totalCount: mockDiscounts.length
        }}
        filters={{}}
        onFiltersChange={() => {}}
        onEdit={() => {}}
        onDeactivate={() => {}}
        onViewPerformance={() => {}}
      />
    </DiscountsDashboardShell>
  );
}