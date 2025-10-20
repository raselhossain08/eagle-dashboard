// app/dashboard/discounts/redemptions/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { RedemptionsTable } from '@/components/discounts/redemptions-table';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockRedemptions = [
  {
    id: '1',
    discountId: 'discount-1',
    userId: 'user-123',
    code: 'SUMMER25',
    discountAmount: 25,
    orderAmount: 100,
    finalAmount: 75,
    currency: 'USD',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    invoiceId: 'inv-123',
    subscriptionId: 'sub-123',
    campaignId: 'campaign-1',
    redeemedAt: new Date('2024-07-20T10:30:00Z'),
    createdAt: new Date('2024-07-20T10:30:00Z')
  }
];

export default function RedemptionsPage() {
  const actions = (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/discounts/redemptions/suspicious">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Fraud Detection
        </Link>
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Redemptions"
      description="Track all discount code redemptions and monitor for suspicious activity"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions' }
      ]}
    >
      <RedemptionsTable
        data={mockRedemptions}
        pagination={{
          pageIndex: 0,
          pageSize: 10,
          totalCount: mockRedemptions.length
        }}
        filters={{}}
        onFiltersChange={() => {}}
        onViewDetails={() => {}}
        onExport={() => {}}
      />
    </DiscountsDashboardShell>
  );
}