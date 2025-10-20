'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber, formatPercentage } from '@/lib/utils'

interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>
  title: string
  description?: string
  centerText?: string
  valueFormatter?: (value: number) => string
  height?: number
  colors?: string[]
  isLoading?: boolean
}

export function DonutChart({
  data,
  title,
  description,
  centerText,
  valueFormatter = formatNumber,
  height = 300,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
  isLoading = false,
}: DonutChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          {description && <Skeleton className="h-4 w-64" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const processedData = data.map((item, index) => ({
    ...item,
    percentage: (item.value / total) * 100,
    color: item.color || colors[index % colors.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${valueFormatter(value)} (${formatPercentage(props.payload.percentage)})`,
                name,
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        {centerText && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">{centerText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}