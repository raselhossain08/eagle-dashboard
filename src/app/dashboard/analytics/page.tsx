'use client'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DataTable } from '@/components/ui/data-table'
import { DonutChart } from '@/components/charts/donut-chart'
import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import { Download, Users, MapPin, Smartphone } from 'lucide-react'
import { useGeographicDistribution, useDeviceBreakdown } from '@/hooks/use-analytics'
import { exportToCSV, exportToJSON } from '@/lib/export-utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Mock audience data
const audienceData = [
  { id: 1, country: 'United States', users: 4521, sessions: 8921, bounceRate: 38.2, avgDuration: 186 },
  { id: 2, country: 'United Kingdom', users: 2314, sessions: 4521, bounceRate: 41.5, avgDuration: 162 },
  { id: 3, country: 'Germany', users: 1876, sessions: 3678, bounceRate: 35.8, avgDuration: 198 },
  { id: 4, country: 'Canada', users: 1245, sessions: 2456, bounceRate: 39.1, avgDuration: 174 },
  { id: 5, country: 'Australia', users: 987, sessions: 1876, bounceRate: 42.3, avgDuration: 155 },
]

const deviceData = [
  { name: 'Desktop', value: 55, color: '#3b82f6' },
  { name: 'Mobile', value: 35, color: '#ef4444' },
  { name: 'Tablet', value: 10, color: '#10b981' },
]

export default function AudiencePage() {
  const { data: geographicData, isLoading: geoLoading } = useGeographicDistribution()
  const { data: deviceData, isLoading: deviceLoading } = useDeviceBreakdown()

  const columns = [
    { key: 'country', header: 'Country', sortable: true },
    { key: 'users', header: 'Users', sortable: true },
    { key: 'sessions', header: 'Sessions', sortable: true },
    { 
      key: 'bounceRate', 
      header: 'Bounce Rate', 
      sortable: true,
      render: (value: number) => `${value}%`
    },
    { 
      key: 'avgDuration', 
      header: 'Avg. Duration', 
      sortable: true,
      render: (value: number) => `${Math.floor(value / 60)}m ${value % 60}s`
    },
  ]

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      exportToCSV(audienceData, 'audience-data')
    } else {
      exportToJSON(audienceData, 'audience-data')
    }
  }

  return (
    <DashboardShell
      title="Audience Analysis"
      description="Understand your audience demographics, geographic distribution, and device usage"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* Audience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Total Audience</p>
              <p className="text-2xl font-bold text-blue-800">12,458</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Countries</p>
              <p className="text-2xl font-bold text-green-800">48</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Devices</p>
              <p className="text-2xl font-bold text-purple-800">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Data Table */}
        <div className="lg:col-span-2">
          <DataTable
            data={audienceData}
            columns={columns}
            title="Geographic Distribution"
            description="User distribution by country"
            searchKey="country"
            isLoading={geoLoading}
          />
        </div>

        {/* Device Breakdown */}
        <DonutChart
          data={deviceData}
          title="Device Usage"
          description="User distribution by device type"
          isLoading={deviceLoading}
        />
      </div>

      {/* Additional Audience Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">New Users</div>
          <div className="text-2xl font-bold mt-1">3,247</div>
          <div className="text-xs text-green-600">+12.5%</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Returning Users</div>
          <div className="text-2xl font-bold mt-1">9,211</div>
          <div className="text-xs text-green-600">+8.3%</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Avg. Pages/Session</div>
          <div className="text-2xl font-bold mt-1">4.8</div>
          <div className="text-xs text-green-600">+5.2%</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Avg. Session Duration</div>
          <div className="text-2xl font-bold mt-1">3m 06s</div>
          <div className="text-xs text-green-600">+2.1%</div>
        </div>
      </div>
    </DashboardShell>
  )
}