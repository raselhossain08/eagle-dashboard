"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventTrends } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { TrendingUp, Users, MousePointerClick, Clock } from "lucide-react";

const mockEventsData = [
  { name: "page_view", value: 45000 },
  { name: "button_click", value: 23000 },
  { name: "form_submit", value: 15000 },
  { name: "product_view", value: 12000 },
  { name: "add_to_cart", value: 8000 },
  { name: "purchase", value: 3000 },
];

const mockEventTrends = [
  { date: '2024-01-01', value: 1200, category: 'page_view' },
  { date: '2024-01-01', value: 600, category: 'button_click' },
  { date: '2024-01-02', value: 1400, category: 'page_view' },
  { date: '2024-01-02', value: 700, category: 'button_click' },
  { date: '2024-01-03', value: 1100, category: 'page_view' },
  { date: '2024-01-03', value: 550, category: 'button_click' },
  { date: '2024-01-04', value: 1600, category: 'page_view' },
  { date: '2024-01-04', value: 800, category: 'button_click' },
];

const mockConversionEvents = [
  { date: '2024-01-01', value: 45 },
  { date: '2024-01-02', value: 52 },
  { date: '2024-01-03', value: 48 },
  { date: '2024-01-04', value: 61 },
  { date: '2024-01-05', value: 55 },
  { date: '2024-01-06', value: 72 },
  { date: '2024-01-07', value: 68 },
];

export default function EventsPage() {
  const { dateRange } = useDashboardStore();
  const { data: eventTrends, isLoading } = useEventTrends({
    ...dateRange,
    groupBy: 'day'
  });

  return (
    <DashboardShell
      title="Event Analytics"
      description="Track and analyze user events and interactions"
    >
      <div className="space-y-6">
        {/* Event Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95.4K</div>
              <p className="text-xs text-muted-foreground">
                +18.2% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 new events this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.4K</div>
              <p className="text-xs text-muted-foreground">
                +8.7% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Events/User</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.7</div>
              <p className="text-xs text-muted-foreground">
                +1.2 from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            data={mockEventTrends}
            title="Event Trends Over Time"
            valueFormatter={(value) => value.toLocaleString()}
            showLegend={true}
            isLoading={isLoading}
          />
          <BarChart
            data={mockEventsData}
            title="Top Events by Volume"
            valueFormatter={(value) => value.toLocaleString()}
            orientation="horizontal"
            isLoading={isLoading}
          />
        </div>

        {/* Conversion Events */}
        <TimeSeriesChart
          data={mockConversionEvents}
          title="Conversion Events Trend"
          valueFormatter={(value) => value.toLocaleString()}
          isLoading={isLoading}
        />

        {/* Event Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                <div>Event Name</div>
                <div className="text-right">Count</div>
                <div className="text-right">Unique Users</div>
                <div className="text-right">Conversion Rate</div>
                <div className="text-right">Avg. Value</div>
              </div>
              {[
                { name: "page_view", count: 45000, users: 12400, conversion: 2.1, value: 0 },
                { name: "button_click", count: 23000, users: 8900, conversion: 8.5, value: 0 },
                { name: "form_submit", count: 15000, users: 4500, conversion: 15.2, value: 0 },
                { name: "product_view", count: 12000, users: 6800, conversion: 12.8, value: 45.50 },
                { name: "add_to_cart", count: 8000, users: 3200, conversion: 25.4, value: 78.30 },
                { name: "purchase", count: 3000, users: 2800, conversion: 100, value: 156.42 },
              ].map((event, index) => (
                <div key={event.name} className="grid grid-cols-5 gap-4 items-center py-2 border-b">
                  <div className="font-medium capitalize">{event.name.replace('_', ' ')}</div>
                  <div className="text-right">{event.count.toLocaleString()}</div>
                  <div className="text-right">{event.users.toLocaleString()}</div>
                  <div className="text-right">{event.conversion}%</div>
                  <div className="text-right">
                    {event.value > 0 ? `$${event.value.toFixed(2)}` : '-'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}