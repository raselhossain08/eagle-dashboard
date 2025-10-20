"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeviceBreakdown } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";
import { Smartphone, Laptop, Tablet, Monitor, TrendingUp } from "lucide-react";

const mockDeviceData = [
  { name: "Desktop", value: 55, color: "#3b82f6" },
  { name: "Mobile", value: 35, color: "#ef4444" },
  { name: "Tablet", value: 10, color: "#10b981" },
];

const mockDeviceTrends = [
  { date: '2024-01-01', value: 58, category: 'Desktop' },
  { date: '2024-01-01', value: 32, category: 'Mobile' },
  { date: '2024-01-01', value: 10, category: 'Tablet' },
  { date: '2024-01-02', value: 56, category: 'Desktop' },
  { date: '2024-01-02', value: 34, category: 'Mobile' },
  { date: '2024-01-02', value: 10, category: 'Tablet' },
  { date: '2024-01-03', value: 54, category: 'Desktop' },
  { date: '2024-01-03', value: 36, category: 'Mobile' },
  { date: '2024-01-03', value: 10, category: 'Tablet' },
];

const mockOSData = [
  { name: "Windows", value: 45 },
  { name: "macOS", value: 25 },
  { name: "iOS", value: 15 },
  { name: "Android", value: 12 },
  { name: "Linux", value: 3 },
];

const mockBrowserData = [
  { name: "Chrome", value: 65 },
  { name: "Safari", value: 18 },
  { name: "Firefox", value: 8 },
  { name: "Edge", value: 6 },
  { name: "Other", value: 3 },
];

const mockDevicePerformance = [
  { device: "Desktop", sessions: 55000, bounceRate: 32, avgSession: 245, conversion: 4.2 },
  { device: "Mobile", sessions: 35000, bounceRate: 48, avgSession: 128, conversion: 2.1 },
  { device: "Tablet", sessions: 10000, bounceRate: 41, avgSession: 195, conversion: 3.5 },
];

export default function DevicesPage() {
  const { dateRange } = useDashboardStore();
  const { data: deviceData, isLoading } = useDeviceBreakdown(dateRange);

  return (
    <DashboardShell
      title="Device Analysis"
      description="User behavior and performance across different devices and platforms"
    >
      <div className="space-y-6">
        {/* Device Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desktop</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">55%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35%</div>
              <p className="text-xs text-muted-foreground">
                +3.8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tablet</CardTitle>
              <Tablet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10%</div>
              <p className="text-xs text-muted-foreground">
                -1.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+18.4%</div>
              <p className="text-xs text-muted-foreground">
                YoY mobile traffic growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Device Distribution Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DonutChart
            data={mockDeviceData}
            title="Device Distribution"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
          <TimeSeriesChart
            data={mockDeviceTrends}
            title="Device Trends Over Time"
            valueFormatter={(value) => `${value}%`}
            showLegend={true}
            isLoading={isLoading}
          />
        </div>

        {/* Platform Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <BarChart
            data={mockOSData}
            title="Operating Systems"
            valueFormatter={(value) => `${value}%`}
            orientation="horizontal"
            isLoading={isLoading}
          />
          <BarChart
            data={mockBrowserData}
            title="Browser Usage"
            valueFormatter={(value) => `${value}%`}
            orientation="horizontal"
            isLoading={isLoading}
          />
        </div>

        {/* Device Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Device Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                <div>Device</div>
                <div className="text-right">Sessions</div>
                <div className="text-right">Bounce Rate</div>
                <div className="text-right">Avg. Session</div>
                <div className="text-right">Conversion Rate</div>
              </div>
              {mockDevicePerformance.map((device, index) => (
                <div key={device.device} className="grid grid-cols-5 gap-4 items-center py-2 border-b hover:bg-muted/50">
                  <div className="flex items-center font-medium">
                    {device.device === "Desktop" && <Laptop className="h-4 w-4 mr-2" />}
                    {device.device === "Mobile" && <Smartphone className="h-4 w-4 mr-2" />}
                    {device.device === "Tablet" && <Tablet className="h-4 w-4 mr-2" />}
                    {device.device}
                  </div>
                  <div className="text-right">{device.sessions.toLocaleString()}</div>
                  <div className="text-right">{device.bounceRate}%</div>
                  <div className="text-right">{device.avgSession}s</div>
                  <div className="text-right">{device.conversion}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Desktop:</span> Highest conversion rates and engagement metrics
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Mobile:</span> Growing traffic share but needs UX improvements for conversion
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Tablet:</span> Stable performance with good engagement metrics
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Mobile Form Optimization</span>
                  <span className="text-green-600 font-medium">High Priority</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Progressive Web App</span>
                  <span className="text-blue-600 font-medium">Medium Priority</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Touch Interface Improvements</span>
                  <span className="text-orange-600 font-medium">Medium Priority</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mobile Payment Options</span>
                  <span className="text-green-600 font-medium">High Priority</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}