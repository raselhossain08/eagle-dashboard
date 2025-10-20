import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Send, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react'

interface ContractStatusFlowChartProps {
  data: Array<{
    status: string
    count: number
    percentage: number
  }>
  isLoading?: boolean
}

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  sent: { label: 'Sent', icon: Send, color: 'bg-blue-100 text-blue-800' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-purple-100 text-purple-800' },
  signed: { label: 'Signed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  expired: { label: 'Expired', icon: XCircle, color: 'bg-red-100 text-red-800' },
  void: { label: 'Void', icon: XCircle, color: 'bg-gray-100 text-gray-800' },
}

export function ContractStatusFlowChart({ data, isLoading }: ContractStatusFlowChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      {/* Status Flow Visualization */}
      <div className="flex items-center justify-between">
        {data.map((item, index) => {
          const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.draft
          const Icon = config.icon
          const percentage = total > 0 ? (item.count / total) * 100 : 0
          
          return (
            <div key={item.status} className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full ${config.color} mb-2`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium">{config.label}</div>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium">Detailed Breakdown</h4>
        {data.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.draft
          const percentage = total > 0 ? (item.count / total) * 100 : 0
          
          return (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`} />
                <span className="text-sm">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}