'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTopPages } from "@/hooks/use-analytics-optimized";
import type { DateRange } from "@/store/dashboard-store";

interface TopPagesProps {
  dateRange: DateRange;
}

export default function TopPages({ dateRange }: TopPagesProps) {
  const { data: topPages, isLoading } = useTopPages(dateRange, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <TrendingUp className="mr-2 h-4 w-4" />
          Top Pages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {topPages?.slice(0, 5).map((page, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="truncate flex-1 mr-2">{page.path}</span>
                <span className="text-muted-foreground">{page.views.toLocaleString()}</span>
              </div>
            ))}
            {(!topPages || topPages.length === 0) && (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}