'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { TimeSeriesChart } from '@/components/charts/time-series-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Download } from 'lucide-react'
import { useEventTrends } from '@/hooks/use-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock event data
const eventsData = [
  { name: 'page_view', value: 12500 },
  { name: 'button_click', value: 8500 },
  { name: 'form_submit', value: 3200 },
  { name: 'purchase', value: 1500 },
  { name: 'add_to_cart', value: 2800 },
  { name: 'user_signup', value: 1200 },
]

const eventTimelineData = [
  { date: '2024-01-01', page_view: 1200, purchase: 45, add_to_cart: 120 },
  { date: '2024-01-02', page_view: 1800, purchase: 52, add_to_cart: 150 },
  { date: '2024-01-03', page_view: 1500, purchase: 48, add_to_cart: 130 },
  { date: '2024-01-04', page_view: 2200, purchase: 61, add_to_cart: 180 },
  { date: '2024-01-05', page_view: 1900, purchase: 55, add_to_cart: 160 },
  { date: '2024-01-06', page_view: 2100, purchase: 67, add_to_cart: 190 },
  { date: '2024-01-07', page_view: 2400, purchase: 59, add_to_cart: 170 },
]

export default function EventsPage() {
  const { data: eventTrends, isLoading } = useEventTrends({ groupBy: 'day' })

  return (
    <DashboardShell
      title="Event Analytics"
      description="Track and analyze user interactions and custom events"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Events</Button>
          <Button variant="outline" size="sm">Custom Events</Button>
          <Button variant="outline" size="sm">System Events</Button>
        </div>
      </div>

      {/* Event Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={eventsData}
          title="Event Distribution"
          description="Total events by type"
          orientation="horizontal"
          isLoading={isLoading}
        />

        <TimeSeriesChart
          data={[]}
          title="Event Timeline"
          description="Event trends over time"
          valueFormatter={(value) => value.toString()}
          isLoading={isLoading}
        />
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Detailed breakdown of all tracked events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventsData.map((event) => (
                <div key={event.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{event.name.replace('_', ' ')}</h4>
                    <p className="text-sm text-muted-foreground">Custom user event</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{event.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">occurrences</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}