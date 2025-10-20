// app/dashboard/discounts/redemptions/suspicious/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { FraudDetectionPanel } from '@/components/discounts/fraud-detection-panel';
import { Button } from '@/components/ui/button';
import { Download, Shield } from 'lucide-react';

export default function FraudDetectionPage() {
  const mockSuspiciousActivity = [
    {
      type: 'multiple_ips' as const,
      count: 3,
      details: 'Same discount code used from 3 different IP addresses within 1 hour',
      redemptions: [
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
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          redeemedAt: new Date('2024-07-20T10:30:00Z'),
          createdAt: new Date('2024-07-20T10:30:00Z')
        },
        {
          id: '2',
          discountId: 'discount-1',
          userId: 'user-123',
          code: 'SUMMER25',
          discountAmount: 25,
          orderAmount: 100,
          finalAmount: 75,
          currency: 'USD',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          redeemedAt: new Date('2024-07-20T10:45:00Z'),
          createdAt: new Date('2024-07-20T10:45:00Z')
        }
      ]
    },
    {
      type: 'bulk_redemptions' as const,
      count: 15,
      details: '15 redemptions from same IP within 5 minutes',
      redemptions: []
    }
  ];

  const handleInvestigate = (activity: any) => {
    console.log('Investigating:', activity);
  };

  const handleBlock = (criteria: any) => {
    console.log('Blocking:', criteria);
  };

  const actions = (
    <Button variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export Report
    </Button>
  );

  return (
    <DiscountsDashboardShell
      title="Fraud Detection"
      description="Monitor and investigate suspicious redemption activity"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions', href: '/dashboard/discounts/redemptions' },
        { label: 'Fraud Detection' }
      ]}
    >
      <FraudDetectionPanel
        suspiciousActivity={mockSuspiciousActivity}
        onInvestigate={handleInvestigate}
        onBlock={handleBlock}
      />
    </DiscountsDashboardShell>
  );
}