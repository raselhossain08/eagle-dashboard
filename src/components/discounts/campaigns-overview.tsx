// components/discounts/campaigns-overview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, DollarSign, PieChart } from 'lucide-react';

interface CampaignsOverviewProps {
  data: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    budgetSpent: number;
    averageROI: number;
    topPerformingCampaign: string;
  };
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

export function CampaignsOverview({ data, isLoading }: CampaignsOverviewProps) {
  const cards = [
    {
      title: "Total Campaigns",
      value: data.totalCampaigns,
      icon: PieChart,
      description: `${data.activeCampaigns} active`
    },
    {
      title: "Total Budget",
      value: `$${data.totalBudget.toLocaleString()}`,
      icon: DollarSign,
      description: `$${data.budgetSpent.toLocaleString()} spent`
    },
    {
      title: "Average ROI",
      value: `${data.averageROI}x`,
      icon: TrendingUp,
      description: "Return on investment"
    },
    {
      title: "Top Campaign",
      value: data.topPerformingCampaign,
      icon: Target,
      description: "Best performing"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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