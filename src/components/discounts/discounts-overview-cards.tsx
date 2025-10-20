// components/discounts/discounts-overview-cards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Ticket, DollarSign, Users, Percent, Target } from 'lucide-react';

export interface DiscountsOverviewData {
  totalDiscounts: number;
  activeDiscounts: number;
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalRevenue: number;
  conversionRate: number;
  averageDiscountValue: number;
  topPerformingCode: string;
}

interface DiscountsOverviewCardsProps {
  data: DiscountsOverviewData;
  isLoading?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  isLoading 
}: { 
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[120px] mb-1" />
          <Skeleton className="h-4 w-[160px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export function DiscountsOverviewCards({ data, isLoading }: DiscountsOverviewCardsProps) {
  const cards = [
    {
      title: "Total Discounts",
      value: data.totalDiscounts,
      icon: Ticket,
      description: `${data.activeDiscounts} active`
    },
    {
      title: "Total Redemptions",
      value: data.totalRedemptions,
      icon: TrendingUp,
      description: "All time redemptions"
    },
    {
      title: "Revenue Impact",
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: `$${data.totalDiscountAmount.toLocaleString()} discounted`
    },
    {
      title: "Conversion Rate",
      value: `${data.conversionRate}%`,
      icon: Percent,
      description: "Average conversion"
    },
    {
      title: "Avg. Discount",
      value: `$${data.averageDiscountValue}`,
      icon: DollarSign,
      description: "Per redemption"
    },
    {
      title: "Top Code",
      value: data.topPerformingCode,
      icon: Target,
      description: "Best performing"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}