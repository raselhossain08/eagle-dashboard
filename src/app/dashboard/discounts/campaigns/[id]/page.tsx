// app/dashboard/discounts/campaigns/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { CampaignPerformanceDashboard } from '@/components/discounts/campaign-performance-dashboard';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Download } from 'lucide-react';

export default function CampaignDetailsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  // Mock campaign data - replace with API call
  const mockCampaign = {
    id: campaignId,
    name: 'Summer Sale 2024',
    description: 'Annual summer promotion campaign',
    type: 'promotional' as const,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    isActive: true,
    discountIds: ['1', '2'],
    channels: ['email', 'social', 'web'],
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
  };

  const mockMetrics = {
    redemptions: 456,
    revenue: 187000,
    roi: 3.74,
    conversionRate: 12.3,
    costPerAcquisition: 109.65
  };

  const mockTrendsData = [
    { date: '2024-06-01', redemptions: 45, revenue: 12000 },
    { date: '2024-06-08', redemptions: 52, revenue: 14500 },
    { date: '2024-06-15', redemptions: 48, revenue: 13800 },
    { date: '2024-06-22', redemptions: 67, revenue: 18900 },
    { date: '2024-06-29', redemptions: 72, revenue: 21500 },
    { date: '2024-07-06', redemptions: 85, revenue: 25400 },
    { date: '2024-07-13', redemptions: 78, revenue: 23400 },
    { date: '2024-07-20', redemptions: 69, revenue: 20500 },
  ];

  const actions = (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <Archive className="mr-2 h-4 w-4" />
        Archive
      </Button>
      <Button size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Edit Campaign
      </Button>
    </div>
  );

  return (
    <DiscountsDashboardShell
      title={mockCampaign.name}
      description={mockCampaign.description}
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Campaigns', href: '/dashboard/discounts/campaigns' },
        { label: mockCampaign.name }
      ]}
    >
      <CampaignPerformanceDashboard
        campaign={mockCampaign}
        metrics={mockMetrics}
        trendsData={mockTrendsData}
      />
    </DiscountsDashboardShell>
  );
}