"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversionFunnelData } from "@/lib/api/reports.service";

interface FunnelChartProps {
  data: ConversionFunnelData[];
  isLoading?: boolean;
}

export function FunnelChart({ data, isLoading = false }: FunnelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="w-full h-16 mb-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No funnel data available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ensure events are being tracked for the selected date range
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(item => Math.max(0, item.count ?? 0)), 1);
  const totalUsers = data[0]?.count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalUsers > 0 ? `${totalUsers.toLocaleString()} users entered the funnel` : 'No users in funnel'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => {
            const count = Math.max(0, step.count ?? 0);
            const conversionRate = Math.max(0, step.conversionRate ?? 0);
            const dropOff = Math.max(0, step.dropOff ?? 0);
            const widthPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            // Color coding based on conversion performance
            const getStepColor = () => {
              if (conversionRate >= 70) return 'bg-green-500';
              if (conversionRate >= 40) return 'bg-yellow-500';
              if (conversionRate >= 20) return 'bg-orange-500';
              return 'bg-red-500';
            };

            return (
              <div key={`funnel-step-${index}-${step.step}`} className="relative">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{step.step}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({conversionRate.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ease-out ${getStepColor()}`}
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-muted-foreground">
                        Step {index + 1} of {data.length}
                      </span>
                      {index > 0 && (
                        <span className={`font-medium ${
                          dropOff < 30 ? 'text-green-600' : 
                          dropOff < 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          Drop-off: {dropOff.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Connection arrow for visual flow */}
                {index < data.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-muted-foreground"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        {totalUsers > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Overall Conversion:</span>
              <span className="font-semibold">
                {data.length > 0 ? data[data.length - 1].conversionRate?.toFixed(1) ?? '0.0' : '0.0'}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}