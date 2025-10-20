// components/billing/revenue-overview-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, RefreshCw } from 'lucide-react';
import { RevenueOverviewData } from '@/types/billing';
import { formatCurrency } from '@/lib/utils';

interface RevenueOverviewCardsProps {
  data: RevenueOverviewData;
  dateRange: { from: Date; to: Date };
  isLoading?: boolean;
}

export function RevenueOverviewCards({ data, dateRange, isLoading }: RevenueOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-24 bg-muted rounded animate-pulse mb-1" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Current MRR",
      value: data.currentMrr,
      description: "Monthly Recurring Revenue",
      icon: DollarSign,
      trend: data.growthRate,
      trendLabel: "from last month"
    },
    {
      title: "New MRR",
      value: data.newMrr,
      description: "New subscription revenue",
      icon: TrendingUp,
      trend: data.newMrr > 0 ? data.newMrr / data.currentMrr * 100 : 0,
      trendLabel: "of total MRR"
    },
    {
      title: "Churned MRR",
      value: data.churnedMrr,
      description: "Lost subscription revenue",
      icon: TrendingDown,
      trend: data.churnedMrr > 0 ? -(data.churnedMrr / data.currentMrr * 100) : 0,
      trendLabel: "of total MRR"
    },
    {
      title: "Total Revenue",
      value: data.totalRevenue,
      description: "All revenue sources",
      icon: Users,
      trend: data.netRevenue > 0 ? (data.netRevenue / data.totalRevenue * 100) : 0,
      trendLabel: "net revenue"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(card.value)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {card.trend !== 0 && (
                  <>
                    <TrendingUp className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                      {isPositive ? '+' : ''}{card.trend.toFixed(1)}%
                    </span>
                    <span className="mx-1">•</span>
                  </>
                )}
                {card.trendLabel}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}