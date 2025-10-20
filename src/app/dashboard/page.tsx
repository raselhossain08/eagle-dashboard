'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { OverviewCards } from '@/components/analytics/overview-cards'
import { TimeSeriesChart } from '@/components/charts/time-series-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { Button } from '@/components/ui/button'

import { Download, RefreshCw } from 'lucide-react'
import { useOverviewStats, useTopPages, useChannelPerformance, useRealTimeUsers } from '@/hooks/use-analytics'
import { useDashboardStore } from '@/store/dashboard-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { DateRangePicker } from '@/components/date-range-picker'

// Mock data for demonstration
const trafficData = [
  { date: '2024-01-01', value: 1200 },
  { date: '2024-01-02', value: 1800 },
  { date: '2024-01-03', value: 1500 },
  { date: '2024-01-04', value: 2200 },
  { date: '2024-01-05', value: 1900 },
  { date: '2024-01-06', value: 2100 },
  { date: '2024-01-07', value: 2400 },
]

const conversionData = [
  { date: '2024-01-01', value: 2.5 },
  { date: '2024-01-02', value: 3.1 },
  { date: '2024-01-03', value: 2.8 },
  { date: '2024-01-04', value: 3.5 },
  { date: '2024-01-05', value: 3.2 },
  { date: '2024-01-06', value: 3.7 },
  { date: '2024-01-07', value: 4.0 },
]

export default function DashboardPage() {
  const { dateRange } = useDashboardStore()
  const { data: overviewData, isLoading: overviewLoading } = useOverviewStats()
  const { data: realTimeUsers } = useRealTimeUsers()
  const { data: topPages, isLoading: topPagesLoading } = useTopPages(5)
  const { data: channels, isLoading: channelsLoading } = useChannelPerformance()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Export data')
  }

  return (
    <DashboardShell
      title="Analytics Overview"
      description="Monitor your key metrics and performance indicators in real-time"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Real-time active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Cards */}
      <OverviewCards 
        data={overviewData}
        isLoading={overviewLoading}
        dateRange={dateRange}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={trafficData}
          title="Traffic Overview"
          description="Daily visitors and sessions"
          valueFormatter={(value) => formatNumber(value)}
          isLoading={overviewLoading}
        />
        
        <TimeSeriesChart
          data={conversionData}
          title="Conversion Rate"
          description="Daily conversion rate percentage"
          valueFormatter={(value) => `${value}%`}
          type="area"
          isLoading={overviewLoading}
        />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Pages */}
        <BarChart
          data={topPages?.map(page => ({
            name: page.page,
            value: page.visits,
          })) || []}
          title="Top Pages"
          description="Most visited pages"
          orientation="horizontal"
          isLoading={topPagesLoading}
        />

        {/* Channel Performance */}
        <DonutChart
          data={channels?.map(channel => ({
            name: channel.channel,
            value: channel.sessions,
          })) || []}
          title="Traffic Channels"
          description="Session distribution by channel"
          isLoading={channelsLoading}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData ? `${Math.floor(overviewData.avgSessionDuration / 60)}m ${overviewData.avgSessionDuration % 60}s` : '0s'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average session duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData ? `${overviewData.bounceRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Single page sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData ? formatNumber(overviewData.newUsers) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              First time visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData ? formatNumber(overviewData.returningUsers) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Repeat visitors
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}