'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { QuickMetric } from '@/types/reports';

interface MetricCardProps {
  metric: QuickMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const formatValue = (value: number, format: QuickMetric['format']) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getTrendIcon = (trend: QuickMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: QuickMetric['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </p>
          {getTrendIcon(metric.trend)}
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold">
            {formatValue(metric.value, metric.format)}
          </h3>
          <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}