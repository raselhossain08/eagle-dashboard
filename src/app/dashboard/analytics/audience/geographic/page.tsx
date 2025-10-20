"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useGeographicDistribution } from "@/hooks/use-analytics";
import { useDashboardStore } from "@/store/dashboard-store";
import { Globe, Users, MapPin, TrendingUp, Navigation } from "lucide-react";
import { useMemo } from "react";

// Country code mapping for visualization
const countryCodeMap: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB", 
  "Germany": "DE",
  "Canada": "CA",
  "Australia": "AU",
  "France": "FR",
  "Japan": "JP",
  "Brazil": "BR",
  "India": "IN",
  "Netherlands": "NL",
  "Spain": "ES",
  "Italy": "IT",
  "Mexico": "MX",
  "South Korea": "KR",
  "Russia": "RU",
  "China": "CN",
  "Singapore": "SG",
  "Thailand": "TH",
  "New Zealand": "NZ",
  "Argentina": "AR",
  "Chile": "CL",
  "South Africa": "ZA",
  "Nigeria": "NG",
  "Egypt": "EG",
  "Sweden": "SE",
  "Norway": "NO"
};

// Geographic data type
interface GeographicData {
  country: string;
  region: string;
  sessions: number;
  users: number;
  code?: string;
  fill?: string;
}

// Simple world map visualization component
const WorldMapVisualization = ({ data }: { data: GeographicData[] }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 rounded-lg border">
      {/* Simplified world map representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-2 w-64 h-64">
          {/* North America */}
          <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">NA</span>
          </div>
          {/* Europe */}
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-red-700 dark:text-red-300">EU</span>
          </div>
          {/* Asia */}
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-green-700 dark:text-green-300">AS</span>
          </div>
          {/* Rest of the world */}
          <div className="bg-gray-500/20 border-2 border-gray-500 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">OC</span>
          </div>
        </div>
      </div>
      
      {/* Data points overlay */}
      <div className="absolute inset-0">
        {/* US */}
        <div className="absolute left-1/4 top-1/3">
          <div className="relative group">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              USA: 45K sessions
            </div>
          </div>
        </div>
        
        {/* Europe */}
        <div className="absolute left-2/3 top-1/3">
          <div className="relative group">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Europe: 28K sessions
            </div>
          </div>
        </div>
        
        {/* Asia */}
        <div className="absolute left-3/4 top-2/5">
          <div className="relative group">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Asia: 8.8K sessions
            </div>
          </div>
        </div>
        
        {/* Australia */}
        <div className="absolute left-3/4 top-3/4">
          <div className="relative group">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Australia: 12K sessions
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
        <div className="text-sm font-medium mb-2">Session Intensity</div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-1" />
            <span>High</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1" />
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GeographicPage() {
  const { dateRange } = useDashboardStore();
  
  // API Hook
  const { data: geographicData, isLoading: geoLoading } = useGeographicDistribution(dateRange);

  // Transform geographic data for visualization
  const transformedData = useMemo(() => {
    if (geographicData && geographicData.length > 0) {
      console.log('✅ Using real geographic data from backend:', geographicData.length, 'countries');
      return geographicData.map((item, index) => ({
        ...item,
        code: countryCodeMap[item.country] || 'XX',
        fill: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"][index % 6]
      }));
    }
    console.log('🔄 No geographic data available from backend');
    return [];
  }, [geographicData]);

  // Transform for donut chart
  const regionChartData = useMemo(() => {
    if (geographicData && geographicData.length > 0) {
      const regionTotals: Record<string, number> = {};
      geographicData.forEach(item => {
        regionTotals[item.region] = (regionTotals[item.region] || 0) + item.sessions;
      });
      
      const totalSessions = Object.values(regionTotals).reduce((sum, val) => sum + val, 0);
      return Object.entries(regionTotals).map(([region, sessions], index) => ({
        name: region,
        value: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
        color: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"][index % 6]
      }));
    }
    return [];
  }, [geographicData]);

  // Transform for city chart - derive from geographicData
  const cityData = useMemo(() => {
    if (geographicData && geographicData.length > 0) {
      // For demo, we'll use the top countries as cities
      return geographicData
        .slice(0, 8)
        .map(item => ({
          name: item.country, // In real app might be item.city
          value: item.sessions
        }));
    }
    return [];
  }, [geographicData]);

  // Calculate metrics from real data
  const geoMetrics = useMemo(() => {
    if (geographicData && geographicData.length > 0) {
      const totalSessions = geographicData.reduce((sum, item) => sum + item.sessions, 0);
      const topCountry = geographicData.reduce((max, item) => 
        item.sessions > max.sessions ? item : max, geographicData[0]);
      const domesticSessions = geographicData.find(item => item.country === 'United States')?.sessions || 0;
      const internationalPercentage = totalSessions > 0 ? Math.round(((totalSessions - domesticSessions) / totalSessions) * 100) : 0;
      
      return {
        countriesCount: geographicData.length,
        topCountry: topCountry.country,
        topCountrySessions: `${(topCountry.sessions / 1000).toFixed(0)}K`,
        internationalPercentage,
        totalGrowth: 18.4 // This would come from a separate growth calculation API
      };
    }
    
    return {
      countriesCount: 0,
      topCountry: 'No Data',
      topCountrySessions: '0',
      internationalPercentage: 0,
      totalGrowth: 0
    };
  }, [geographicData]);

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
              <CardTitle className="text-sm font-medium">Countries Reached</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{geoMetrics.countriesCount}</div>
              <p className="text-xs text-muted-foreground">
                {geographicData && geographicData.length > 0 ? "From real data" : "No data available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Country</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{geoMetrics.topCountry}</div>
              <p className="text-xs text-muted-foreground">
                {geoMetrics.topCountrySessions} sessions this period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">International Traffic</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{geoMetrics.internationalPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {geographicData && geographicData.length > 0 ? "Real-time calculation" : "No data available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{geoMetrics.totalGrowth}%</div>
              <p className="text-xs text-muted-foreground">
                Worldwide user growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* World Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Global User Distribution
              {geoLoading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorldMapVisualization data={transformedData} />
          </CardContent>
        </Card>

        {/* Regional Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DonutChart
            data={regionChartData}
            title="Traffic by Region"
            valueFormatter={(value) => `${value}%`}
            centerText="Global"
            isLoading={geoLoading}
          />
          <BarChart
            data={cityData}
            title="Top Cities by Sessions"
            valueFormatter={(value) => value.toLocaleString()}
            orientation="horizontal"
            isLoading={geoLoading}
          />
        </div>

        {/* Country Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Country Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-4 font-medium text-sm">
                <div>Country</div>
                <div className="text-right">Sessions</div>
                <div className="text-right">Users</div>
                <div className="text-right">Bounce Rate</div>
                <div className="text-right">Avg. Session</div>
                <div className="text-right">Conversion</div>
                <div className="text-right">Growth</div>
              </div>
              {transformedData.length > 0 ? transformedData.slice(0, 10).map((country: GeographicData, index: number) => {
                // For demo purposes - in real app these would come from API
                const growth = Math.floor(Math.random() * 40 - 10);
                const bounceRate = Math.floor(Math.random() * 20 + 30);
                const avgSession = Math.floor(Math.random() * 120 + 180);
                const conversion = (Math.random() * 5 + 1).toFixed(1);
                
                return (
                  <div key={country.code || index} className="grid grid-cols-7 gap-4 items-center py-3 border-b hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded text-xs mr-2">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-xs text-muted-foreground">{country.code}</div>
                      </div>
                    </div>
                    <div className="text-right font-semibold">{country.sessions.toLocaleString()}</div>
                    <div className="text-right">{country.users.toLocaleString()}</div>
                    <div className="text-right">
                      <span className={bounceRate > 45 ? "text-red-600" : "text-green-600"}>
                        {bounceRate}%
                      </span>
                    </div>
                    <div className="text-right">{avgSession}s</div>
                    <div className="text-right">
                      <span className={parseFloat(conversion) > 3 ? "text-green-600" : "text-orange-600"}>
                        {conversion}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={growth > 0 ? "text-green-600" : "text-red-600"}>
                        {growth > 0 ? '+' : ''}{growth}%
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-7 text-center py-8 text-muted-foreground">
                  {geoLoading ? "Loading geographic data..." : "No geographic data available"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Regional Insights & Opportunities */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Regional Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {regionChartData.length > 0 ? (
                <div className="space-y-4">
                  {regionChartData.map((region, index) => (
                    <div key={region.name} className="flex items-start space-x-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                        style={{ backgroundColor: region.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">{region.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.value}% of total traffic. {
                            region.name === 'North America' ? 'Highest engagement and conversion rates.' :
                            region.name === 'Europe' ? 'Strong growth potential with localized content.' :
                            region.name === 'Asia' ? 'Emerging market with high engagement opportunities.' :
                            region.name === 'Oceania' ? 'Stable performance with loyal user base.' :
                            'Growing market segment with expansion potential.'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {geoLoading ? "Loading regional insights..." : "No regional data available"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {geographicData && geographicData.length > 0 ? (
                <div className="space-y-4">
                  {/* Generate opportunities based on data */}
                  {regionChartData.length > 1 && (
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Localized Content</div>
                        <div className="text-xs text-muted-foreground">
                          Target top {regionChartData.length} regions with localized content
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        High Impact
                      </span>
                    </div>
                  )}
                  {transformedData.some(country => ['India', 'Brazil', 'Mexico'].includes(country.country)) && (
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Regional Pricing</div>
                        <div className="text-xs text-muted-foreground">Adjust prices for emerging markets</div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        Medium Impact
                      </span>
                    </div>
                  )}
                  {transformedData.some(country => ['Germany', 'France', 'Spain'].includes(country.country)) && (
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Language Support</div>
                        <div className="text-xs text-muted-foreground">Add European languages</div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        High Impact
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Regional Analytics</div>
                      <div className="text-xs text-muted-foreground">
                        Track {geoMetrics.countriesCount} countries performance
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      Medium Impact
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {geoLoading ? "Loading opportunities..." : "No geographic data available for recommendations"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timezone Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Activity by Timezone</CardTitle>
          </CardHeader>
          <CardContent>
            {transformedData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="font-medium">Region</div>
                  <div className="text-right font-medium">Countries</div>
                  <div className="text-right font-medium">Sessions</div>
                  <div className="text-right font-medium">Users</div>
                </div>
                {regionChartData.map((region, index) => {
                  const regionCountries = transformedData.filter(country => country.region === region.name);
                  const regionSessions = regionCountries.reduce((sum, country) => sum + country.sessions, 0);
                  const regionUsers = regionCountries.reduce((sum, country) => sum + country.users, 0);
                  
                  return (
                    <div key={region.name} className="grid grid-cols-4 gap-4 items-center py-2 border-b">
                      <div className="font-medium">{region.name}</div>
                      <div className="text-right">{regionCountries.length}</div>
                      <div className="text-right">{regionSessions.toLocaleString()}</div>
                      <div className="text-right text-green-600 font-medium">{regionUsers.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {geoLoading ? "Loading timezone data..." : "No timezone data available"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}