'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OverviewStats } from '@/types'
import { 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn, formatNumber, formatPercentage } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon: React.ElementType
  isLoading?: boolean
}

function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon: Icon, 
  isLoading 
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend && (
            <>
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={cn(
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="mx-1">•</span>
            </>
          )}
          {description}
        </div>
      </CardContent>
    </Card>
  )
}

interface OverviewCardsProps {
  data?: OverviewStats
  isLoading?: boolean
  dateRange: { startDate: Date; endDate: Date }
}

export function OverviewCards({ data, isLoading, dateRange }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: data ? formatNumber(data.totalUsers) : "0",
      description: "All time users",
      trend: { value: 12.5, isPositive: true },
      icon: Users,
    },
    {
      title: "Sessions",
      value: data ? formatNumber(data.totalSessions) : "0",
      description: "Total sessions",
      trend: { value: 8.3, isPositive: true },
      icon: MousePointer,
    },
    {
      title: "Page Views",
      value: data ? formatNumber(data.totalPageViews) : "0",
      description: "Total page views",
      trend: { value: 15.2, isPositive: true },
      icon: Eye,
    },
    {
      title: "Avg. Session",
      value: data ? `${Math.floor(data.avgSessionDuration / 60)}m ${data.avgSessionDuration % 60}s` : "0s",
      description: "Average session duration",
      trend: { value: 5.7, isPositive: true },
      icon: Clock,
    },
    {
      title: "Bounce Rate",
      value: data ? formatPercentage(data.bounceRate) : "0%",
      description: "Visits with single page",
      trend: { value: 2.1, isPositive: false },
      icon: TrendingDown,
    },
    {
      title: "Conversion Rate",
      value: data ? formatPercentage(data.conversionRate) : "0%",
      description: "Goal completions",
      trend: { value: 3.8, isPositive: true },
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          trend={card.trend}
          icon={card.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}