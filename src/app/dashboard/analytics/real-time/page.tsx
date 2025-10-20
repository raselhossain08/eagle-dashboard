'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, Eye, MousePointer, MapPin } from 'lucide-react'
import { useRealTimeUsers } from '@/hooks/use-analytics'
import { useEffect, useState } from 'react'

// Mock real-time data
const liveEvents = [
  { id: 1, user: 'User #4582', action: 'Viewed Product', page: '/products/iphone-15', time: 'now' },
  { id: 2, user: 'User #8921', action: 'Added to Cart', page: '/cart', time: '10s ago' },
  { id: 3, user: 'User #3476', action: 'Completed Purchase', page: '/checkout/success', time: '25s ago' },
  { id: 4, user: 'User #6734', action: 'Signed Up', page: '/auth/signup', time: '45s ago' },
  { id: 5, user: 'User #1256', action: 'Viewed Pricing', page: '/pricing', time: '1m ago' },
]

const geographicData = [
  { country: 'United States', users: 45 },
  { country: 'United Kingdom', users: 23 },
  { country: 'Germany', users: 18 },
  { country: 'Canada', users: 12 },
  { country: 'Australia', users: 8 },
]

export default function RealTimePage() {
  const { data: activeUsers, refetch } = useRealTimeUsers(10000) // Refresh every 10 seconds
  const [events, setEvents] = useState(liveEvents)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new events
      if (Math.random() > 0.7) {
        const newEvent = {
          id: Date.now(),
          user: `User #${Math.floor(Math.random() * 10000)}`,
          action: ['Viewed Product', 'Added to Cart', 'Signed Up', 'Completed Purchase'][Math.floor(Math.random() * 4)],
          page: ['/products', '/cart', '/auth/signup', '/checkout'][Math.floor(Math.random() * 4)],
          time: 'now'
        }
        setEvents(prev => [newEvent, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    refetch()
  }

  return (
    <DashboardShell
      title="Real-time Analytics"
      description="Monitor live user activity and real-time metrics"
      actions={
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Last 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Last 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active regions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
            <CardDescription>
              Real-time user actions and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{event.user}</span>
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                    </div>
                    <p className="text-sm">{event.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.page}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Live Geographic Distribution</CardTitle>
            <CardDescription>
              Active users by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicData.map((location) => (
                <div key={location.country} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.country}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${(location.users / 45) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{location.users}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Viewed Pages</CardTitle>
          <CardDescription>
            Pages with active users right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium">Homepage</div>
              <div className="text-2xl font-bold mt-2">12</div>
              <div className="text-sm text-muted-foreground">active users</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-medium">Products</div>
              <div className="text-2xl font-bold mt-2">8</div>
              <div className="text-sm text-muted-foreground">active users</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-medium">Pricing</div>
              <div className="text-2xl font-bold mt-2">5</div>
              <div className="text-sm text-muted-foreground">active users</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="font-medium">Documentation</div>
              <div className="text-2xl font-bold mt-2">3</div>
              <div className="text-sm text-muted-foreground">active users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}