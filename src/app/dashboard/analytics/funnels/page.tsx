'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { BarChart } from '@/components/charts/bar-chart'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { useFunnels } from '@/hooks/use-funnel'

// Mock funnel data
const funnelData = [
  { name: 'Visitors', value: 10000 },
  { name: 'Signups', value: 2500 },
  { name: 'Activations', value: 1800 },
  { name: 'Payments', value: 1200 },
  { name: 'Retained', value: 900 },
]

const funnelSteps = [
  { step: 'Visitors', count: 10000, conversionRate: 100, dropOff: 0, avgTime: 0 },
  { step: 'Signups', count: 2500, conversionRate: 25, dropOff: 75, avgTime: 45 },
  { step: 'Activations', count: 1800, conversionRate: 72, dropOff: 28, avgTime: 120 },
  { step: 'Payments', count: 1200, conversionRate: 66.7, dropOff: 33.3, avgTime: 300 },
  { step: 'Retained', count: 900, conversionRate: 75, dropOff: 25, avgTime: 1440 },
]

export default function FunnelsPage() {
  const { data: funnels, isLoading } = useFunnels()

  return (
    <DashboardShell
      title="Funnel Analysis"
      description="Track user conversion through your key funnels and identify drop-off points"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Funnel
          </Button>
        </div>
      }
    >
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>User Conversion Funnel</CardTitle>
          <CardDescription>
            User progression through the main conversion funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Funnel Steps */}
            {funnelSteps.map((step, index) => (
              <div key={step.step} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.step}</h4>
                    <p className="text-sm text-muted-foreground">
                      Avg. time: {step.avgTime > 0 ? `${Math.floor(step.avgTime / 60)}m` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold">{step.count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">users</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">{step.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">conversion</div>
                  </div>
                  
                  {index < funnelSteps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9%</div>
            <p className="text-xs text-muted-foreground">
              Overall funnel conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31.8h</div>
            <p className="text-xs text-muted-foreground">
              Time to complete funnel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-xs text-muted-foreground">
              Total users lost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <BarChart
        data={funnelData}
        title="Funnel Visualization"
        description="User count at each funnel stage"
        isLoading={isLoading}
      />
    </DashboardShell>
  )
}