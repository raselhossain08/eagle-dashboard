'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueReport } from '@/types/reports';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueReport[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function RevenueChart({ data, isLoading, title = "Revenue Trend", description = "Revenue over time" }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border rounded-lg">
            <div className="text-muted-foreground">No revenue data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max revenue for scaling
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex items-center text-sm font-normal">
            <span className="text-muted-foreground mr-2">Total:</span>
            <span className="font-medium">${totalRevenue.toLocaleString()}</span>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-1 border-b border-l pl-4 pb-4">
            {data.map((item, index) => {
              const height = Math.max((item.revenue / maxRevenue) * 100, 2); // Min 2% height
              const isPositiveGrowth = item.growth > 0;
              const isNegativeGrowth = item.growth < 0;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center group cursor-pointer"
                  style={{ width: `${100 / data.length}%` }}
                  title={`${item.period}: $${item.revenue.toLocaleString()} (${item.growth > 0 ? '+' : ''}${item.growth}%)`}
                >
                  <div
                    className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm flex items-end justify-center text-xs text-white font-medium"
                    style={{ 
                      height: `${height}%`,
                      minHeight: '8px'
                    }}
                  >
                    {data.length <= 10 && (
                      <span className="p-1 text-xs">
                        ${(item.revenue / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="truncate max-w-full">
                      {new Date(item.period).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className={`flex items-center justify-center mt-1 ${
                      isPositiveGrowth ? 'text-green-600' : 
                      isNegativeGrowth ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {isPositiveGrowth && <TrendingUp className="w-3 h-3 mr-1" />}
                      {isNegativeGrowth && <TrendingDown className="w-3 h-3 mr-1" />}
                      {!isPositiveGrowth && !isNegativeGrowth && <Minus className="w-3 h-3 mr-1" />}
                      <span className="text-xs">
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="text-lg font-semibold">${avgRevenue.toFixed(0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Peak</div>
              <div className="text-lg font-semibold">${maxRevenue.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Data Points</div>
              <div className="text-lg font-semibold">{data.length}</div>
            </div>
          </div>

          {/* Recent Performance */}
          {data.length >= 5 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Recent Performance</h4>
              <div className="space-y-2">
                {data.slice(-5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {new Date(item.period).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${item.revenue.toLocaleString()}
                      </span>
                      <span className={`flex items-center text-xs ${
                        item.growth > 0 ? 'text-green-600' : 
                        item.growth < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}