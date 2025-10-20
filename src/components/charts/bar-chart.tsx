'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface BarChartProps {
  data: Array<{ name: string; value: number; category?: string }>
  title: string
  description?: string
  orientation?: 'horizontal' | 'vertical'
  valueFormatter?: (value: number) => string
  height?: number
  colors?: string[]
  isLoading?: boolean
}

export function BarChart({
  data,
  title,
  description,
  orientation = 'vertical',
  valueFormatter = (value) => value.toString(),
  height = 300,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  isLoading = false,
}: BarChartProps) {
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

  const categories = Array.from(new Set(data.map(item => item.category))).filter(Boolean)
  const processedData = categories.length > 0 
    ? processBarChartData(data, categories as string[])
    : data

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={processedData}
            layout={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" tickFormatter={valueFormatter} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={80}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={valueFormatter}
                />
              </>
            )}
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), 'Value']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            {categories.length > 1 && <Legend />}
            
            {categories.length === 0 ? (
              <Bar
                dataKey="value"
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            ) : (
              categories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  name={category}
                />
              ))
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function processBarChartData(
  data: Array<{ name: string; value: number; category?: string }>,
  categories: string[]
) {
  const nameMap = new Map()
  
  data.forEach(item => {
    if (!nameMap.has(item.name)) {
      nameMap.set(item.name, { name: item.name })
    }
    if (item.category) {
      nameMap.get(item.name)[item.category] = item.value
    }
  })
  
  return Array.from(nameMap.values())
}