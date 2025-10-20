// app/dashboard/discounts/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { DiscountsOverviewCards, DiscountsOverviewData } from '@/components/discounts/discounts-overview-cards';
import { RedemptionTrendsChart } from '@/components/discounts/redemption-trends-chart';
import { TopPerformingDiscounts } from '@/components/discounts/top-performing-discounts';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockOverviewData: DiscountsOverviewData = {
  totalDiscounts: 156,
  activeDiscounts: 89,
  totalRedemptions: 1247,
  totalDiscountAmount: 45230,
  totalRevenue: 289500,
  conversionRate: 12.4,
  averageDiscountValue: 36.25,
  topPerformingCode: "SUMMER25"
};

const mockTrendsData = [
  { date: 'Jan', redemptions: 45, revenue: 12000, discountAmount: 1800 },
  { date: 'Feb', redemptions: 52, revenue: 14500, discountAmount: 2200 },
  { date: 'Mar', redemptions: 48, revenue: 13800, discountAmount: 2100 },
  { date: 'Apr', redemptions: 67, revenue: 18900, discountAmount: 2900 },
  { date: 'May', redemptions: 72, revenue: 21500, discountAmount: 3200 },
  { date: 'Jun', redemptions: 85, revenue: 25400, discountAmount: 3800 },
];

const mockTopDiscounts = [
  { code: "SUMMER25", redemptions: 156, revenue: 45200, conversionRate: 18.2, discountAmount: 11200 },
  { code: "WELCOME10", redemptions: 134, revenue: 38900, conversionRate: 15.7, discountAmount: 8900 },
  { code: "BLACKFRIDAY", redemptions: 98, revenue: 56700, conversionRate: 22.1, discountAmount: 14300 },
  { code: "NEWYEAR20", redemptions: 87, revenue: 31200, conversionRate: 14.3, discountAmount: 7800 },
  { code: "SPRING15", redemptions: 76, revenue: 28900, conversionRate: 13.8, discountAmount: 6700 },
];

export default function DiscountsOverviewPage() {
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
    </div>
  );

  return (
    <DiscountsDashboardShell
      title="Discounts Overview"
      description="Manage discount codes, campaigns, and track performance"
      actions={actions}
    >
      <DiscountsOverviewCards data={mockOverviewData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RedemptionTrendsChart 
          data={mockTrendsData} 
          period="monthly" 
        />
        <TopPerformingDiscounts 
          data={mockTopDiscounts} 
          limit={5}
        />
      </div>
    </DiscountsDashboardShell>
  );
}