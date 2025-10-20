'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { TimeSeriesChart } from '@/components/charts/time-series-chart'
import { DonutChart } from '@/components/charts/donut-chart'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Download, FileText, TrendingUp, Users } from 'lucide-react'
import { useRevenueReport, useGoalPerformance } from '@/hooks/use-reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock revenue data
const revenueData = [
  { date: '2024-01-01', value: 12500 },
  { date: '2024-01-02', value: 11800 },
  { date: '2024-01-03', value: 13200 },
  { date: '2024-01-04', value: 14100 },
  { date: '2024-01-05', value: 12800 },
  { date: '2024-01-06', value: 15200 },
  { date: '2024-01-07', value: 14800 },
]

const goalData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 20, color: '#f59e0b' },
  { name: 'Not Started', value: 15, color: '#ef4444' },
]

export default function ReportsPage() {
  const { data: revenueReport, isLoading: revenueLoading } = useRevenueReport()
  const { data: goals, isLoading: goalsLoading } = useGoalPerformance()

  return (
    <DashboardShell
      title="Reports & Insights"
      description="Comprehensive reports and business intelligence insights"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$84,200</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,458</div>
            <p className="text-xs text-muted-foreground">
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$67.50</div>
            <p className="text-xs text-muted-foreground">
              +3.8% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={revenueData}
          title="Revenue Trends"
          description="Daily revenue performance"
          valueFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          isLoading={revenueLoading}
          type="area"
        />

        <DonutChart
          data={goalData}
          title="Goal Completion"
          description="Progress towards business goals"
          isLoading={goalsLoading}
        />
      </div>

      {/* Additional Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key performance indicators overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Acquisition Cost</span>
                <span className="font-medium">$24.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Lifetime Value</span>
                <span className="font-medium">$425.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Return on Ad Spend</span>
                <span className="font-medium">4.2x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest significant events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Revenue milestone reached</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user record</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Conversion rate improved</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}