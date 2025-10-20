// components/discounts/top-performing-discounts.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export interface TopPerformingDiscountsProps {
  data: Array<{
    code: string;
    redemptions: number;
    revenue: number;
    conversionRate: number;
    discountAmount: number;
  }>;
  limit?: number;
  isLoading?: boolean;
}

export function TopPerformingDiscounts({ data, limit = 5, isLoading }: TopPerformingDiscountsProps) {
  const displayData = data.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
              <Skeleton className="h-4 w-[60px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Discounts</CardTitle>
        <CardDescription>
          Most effective discount codes by revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((item, index) => (
            <div key={item.code} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
                <div>
                  <div className="font-medium">{item.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.redemptions} redemptions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${item.revenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  {item.conversionRate}% conversion
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}