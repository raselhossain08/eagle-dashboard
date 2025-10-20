"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GeographicMap } from "@/components/analytics/geographic-map";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboard-store";
import { Globe, Users, MapPin, TrendingUp } from "lucide-react";

const mockGeographicData = [
  { country: "United States", region: "North America", sessions: 45000, users: 32000 },
  { country: "United Kingdom", region: "Europe", sessions: 28000, users: 21000 },
  { country: "Germany", region: "Europe", sessions: 22000, users: 18000 },
  { country: "Canada", region: "North America", sessions: 18000, users: 15000 },
  { country: "Australia", region: "Oceania", sessions: 12000, users: 9000 },
  { country: "France", region: "Europe", sessions: 9500, users: 7800 },
  { country: "Japan", region: "Asia", sessions: 8800, users: 7200 },
  { country: "Brazil", region: "South America", sessions: 7500, users: 6200 },
  { country: "India", region: "Asia", sessions: 6800, users: 5800 },
  { country: "Netherlands", region: "Europe", sessions: 5200, users: 4500 },
];

const mockRegionData = [
  { name: "North America", value: 63, color: "#3b82f6" },
  { name: "Europe", value: 25, color: "#ef4444" },
  { name: "Asia", value: 7, color: "#10b981" },
  { name: "Oceania", value: 3, color: "#f59e0b" },
  { name: "South America", value: 2, color: "#8b5cf6" },
];

const mockCityData = [
  { name: "New York", value: 12500 },
  { name: "London", value: 9800 },
  { name: "Los Angeles", value: 8700 },
  { name: "Berlin", value: 7600 },
  { name: "Toronto", value: 6500 },
  { name: "Sydney", value: 5400 },
  { name: "Paris", value: 4800 },
  { name: "Chicago", value: 4200 },
];

export default function GeographicPage() {
  const { dateRange } = useDashboardStore();

  return (
    <DashboardShell
      title="Geographic Analysis"
      description="User distribution and behavior across regions and countries"
    >
      <div className="space-y-6">
        {/* Geographic Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Country</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">USA</div>
              <p className="text-xs text-muted-foreground">
                45K sessions this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intl. Traffic</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">37%</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+18.4%</div>
              <p className="text-xs text-muted-foreground">
                Global user growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Geographic Visualizations */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GeographicMap data={mockGeographicData} />
          <DonutChart
            data={mockRegionData}
            title="Traffic by Region"
            valueFormatter={(value) => `${value}%`}
          />
        </div>

        {/* City Distribution */}
        <BarChart
          data={mockCityData}
          title="Top Cities by Sessions"
          valueFormatter={(value) => value.toLocaleString()}
          orientation="horizontal"
        />

        {/* Country Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Country Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 font-medium text-sm">
                <div>Country</div>
                <div className="text-right">Sessions</div>
                <div className="text-right">Users</div>
                <div className="text-right">Bounce Rate</div>
                <div className="text-right">Avg. Session</div>
                <div className="text-right">Conversion</div>
              </div>
              {mockGeographicData.map((country, index) => (
                <div key={country.country} className="grid grid-cols-6 gap-4 items-center py-2 border-b hover:bg-muted/50">
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded text-xs mr-2">
                      {index + 1}
                    </span>
                    {country.country}
                  </div>
                  <div className="text-right">{country.sessions.toLocaleString()}</div>
                  <div className="text-right">{country.users.toLocaleString()}</div>
                  <div className="text-right">{Math.floor(Math.random() * 20 + 30)}%</div>
                  <div className="text-right">{Math.floor(Math.random() * 120 + 180)}s</div>
                  <div className="text-right">{Math.floor(Math.random() * 5 + 2)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Regional Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">North America:</span> Highest conversion rates and average order value
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Europe:</span> Strong growth in Germany and France with 25% MoM increase
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Asia:</span> Emerging market with high engagement but lower conversion rates
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Localized Content</span>
                  <span className="text-green-600 font-medium">High Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Regional Pricing</span>
                  <span className="text-blue-600 font-medium">Medium Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Language Support</span>
                  <span className="text-orange-600 font-medium">High Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Local Payment Methods</span>
                  <span className="text-green-600 font-medium">Medium Impact</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}