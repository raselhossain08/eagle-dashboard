'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useRevenueAnalytics } from "@/hooks/use-analytics-optimized";
import type { DateRange } from "@/store/dashboard-store";

interface RevenueSummaryProps {
  dateRange: DateRange;
}

export default function RevenueSummary({ dateRange }: RevenueSummaryProps) {
  const { data: revenueData, isLoading } = useRevenueAnalytics(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <DollarSign className="mr-2 h-4 w-4" />
          Revenue Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Revenue</span>
              <span className="font-semibold">
                ${revenueData?.totalRevenue?.toLocaleString() ?? '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Recurring</span>
              <span className="text-green-600">
                ${revenueData?.recurringRevenue?.toLocaleString() ?? '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Order Value</span>
              <span>
                ${revenueData?.averageOrderValue?.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}