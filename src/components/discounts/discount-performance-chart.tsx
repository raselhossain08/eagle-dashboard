// components/discounts/discount-performance-chart.tsx
'use client';

import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscountPerformanceChartProps {
  data: Array<{
    code: string;
    redemptions: number;
    revenue: number;
    discountAmount: number;
    roi: number;
  }>;
  metric: 'redemptions' | 'revenue' | 'roi';
  chartType: 'bar' | 'line' | 'pie';
  isLoading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function DiscountPerformanceChart({ data, metric, chartType, isLoading }: DiscountPerformanceChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const chartData = data.map(item => ({
    code: item.code,
    value: item[metric],
    redemptions: item.redemptions,
    revenue: item.revenue,
    roi: item.roi,
    discountAmount: item.discountAmount
  }));

  const getMetricLabel = () => {
    switch (metric) {
      case 'redemptions': return 'Redemptions';
      case 'revenue': return 'Revenue ($)';
      case 'roi': return 'ROI (x)';
      default: return 'Value';
    }
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case 'revenue': return `$${value.toLocaleString()}`;
      case 'roi': return `${value}x`;
      default: return value.toLocaleString();
    }
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="code" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis fontSize={12} />
        <Tooltip 
          formatter={(value: number) => [formatValue(value), getMetricLabel()]}
          labelFormatter={(label) => `Code: ${label}`}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="code" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis fontSize={12} />
        <Tooltip 
          formatter={(value: number) => [formatValue(value), getMetricLabel()]}
          labelFormatter={(label) => `Code: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ code, value }) => `${code}: ${formatValue(Number(value))}`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [formatValue(value), getMetricLabel()]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="h-[400px]">
      {chartType === 'bar' && renderBarChart()}
      {chartType === 'line' && renderLineChart()}
      {chartType === 'pie' && renderPieChart()}
    </div>
  );
}