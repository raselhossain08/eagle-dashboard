'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface TimeSeriesChartProps {
  data: Array<{ date: string; value: number; category?: string }>
  title: string
  description?: string
  valueFormatter?: (value: number) => string
  height?: number
  showLegend?: boolean
  colors?: string[]
  type?: 'line' | 'area'
  isLoading?: boolean
}

export function TimeSeriesChart({
  data,
  title,
  description,
  valueFormatter = (value) => value.toString(),
  height = 300,
  showLegend = false,
  colors = ['#3b82f6', '#ef4444', '#10b981'],
  type = 'line',
  isLoading = false,
}: TimeSeriesChartProps) {
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

  // Process data for multiple series
  const categories = Array.from(new Set(data.map(item => item.category))).filter(Boolean)
  const processedData = categories.length > 0 
    ? processMultiSeriesData(data, categories as string[])
    : data

  const ChartComponent = type === 'area' ? AreaChart : LineChart

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent
            data={processedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            {showLegend && <Legend />}
            
            {categories.length === 0 ? (
              type === 'area' ? (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
                />
              )
            ) : (
              categories.map((category, index) =>
                type === 'area' ? (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name={category}
                  />
                ) : (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={category}
                  />
                )
              )
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function processMultiSeriesData(
  data: Array<{ date: string; value: number; category?: string }>,
  categories: string[]
) {
  const dateMap = new Map()
  
  data.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, { date: item.date })
    }
    if (item.category) {
      dateMap.get(item.date)[item.category] = item.value
    }
  })
  
  return Array.from(dateMap.values())
}