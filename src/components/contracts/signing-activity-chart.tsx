import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface SigningActivityChartProps {
  data: Array<{
    date: string
    sent: number
    viewed: number
    signed: number
  }>
  period: 'daily' | 'weekly' | 'monthly'
  isLoading?: boolean
}

export function SigningActivityChart({ data, period, isLoading }: SigningActivityChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.flatMap(d => [d.sent, d.viewed, d.signed]))

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs">Sent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded" />
          <span className="text-xs">Viewed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-xs">Signed</span>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-16 text-xs text-muted-foreground">
              {period === 'monthly' 
                ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
                : item.date
              }
            </div>
            
            <div className="flex-1 flex gap-1">
              {/* Sent */}
              <div 
                className="bg-blue-500 rounded-l transition-all duration-300 hover:opacity-80"
                style={{ width: `${(item.sent / maxValue) * 100}%` }}
                title={`Sent: ${item.sent}`}
              >
                <div className="h-8" />
              </div>
              
              {/* Viewed */}
              <div 
                className="bg-purple-500 transition-all duration-300 hover:opacity-80"
                style={{ width: `${(item.viewed / maxValue) * 100}%` }}
                title={`Viewed: ${item.viewed}`}
              >
                <div className="h-8" />
              </div>
              
              {/* Signed */}
              <div 
                className="bg-green-500 rounded-r transition-all duration-300 hover:opacity-80"
                style={{ width: `${(item.signed / maxValue) * 100}%` }}
                title={`Signed: ${item.signed}`}
              >
                <div className="h-8" />
              </div>
            </div>
            
            <div className="w-20 text-right">
              <Badge variant="outline" className="text-xs">
                {item.signed}/{item.sent}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
        <div>Total Period: {period}</div>
        <div>
          Conversion: {(
            (data.reduce((sum, item) => sum + item.signed, 0) / 
             data.reduce((sum, item) => sum + item.sent, 0)) * 100 || 0
          ).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}