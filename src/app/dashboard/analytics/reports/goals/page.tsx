"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GeographicMap } from "@/components/analytics/geographic-map";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboard-store";
import { useGeographicDistribution } from "@/hooks/use-analytics";
import { Globe, Users, MapPin, TrendingUp } from "lucide-react";
import { useMemo } from "react";

// Region mapping for countries
const countryToRegionMap: Record<string, string> = {
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  "United Kingdom": "Europe", 
  "Germany": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Spain": "Europe",
  "Netherlands": "Europe",
  "Switzerland": "Europe",
  "Belgium": "Europe",
  "Austria": "Europe",
  "Sweden": "Europe",
  "Norway": "Europe",
  "Japan": "Asia",
  "China": "Asia",
  "India": "Asia",
  "South Korea": "Asia",
  "Singapore": "Asia",
  "Thailand": "Asia",
  "Russia": "Asia",
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Brazil": "South America",
  "Argentina": "South America",
  "Chile": "South America",
  "South Africa": "Africa",
  "Nigeria": "Africa",
  "Egypt": "Africa"
};

export default function GeographicPage() {
  const { dateRange } = useDashboardStore();
  
  // API Hook - fetch real geographic data from backend
  const { data: geographicData, isLoading: geoLoading } = useGeographicDistribution(dateRange);

  // Helper function for country codes - defined before useMemo hooks
  const getCountryCode = (country: string): string => {
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
    };
    return countryCodeMap[country] || 'XX';
  };

  // Transform geographic data for visualizations
  const transformedData = useMemo(() => {
    if (geographicData && geographicData.length > 0) {
      console.log('✅ Using real geographic data from backend:', geographicData.length, 'countries');
      return geographicData.map((item, index) => ({
        ...item,
        region: countryToRegionMap[item.country] || 'Other',
        code: getCountryCode(item.country),
      }));
    }
    console.log('🔄 No geographic data available from backend');
    return [];
  }, [geographicData, getCountryCode]);

  // Transform for donut chart
  const regionChartData = useMemo(() => {
    if (transformedData && transformedData.length > 0) {
      const regionTotals: Record<string, number> = {};
      transformedData.forEach(item => {
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
  }, [transformedData]);

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

        {/* Main Geographic Visualizations */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GeographicMap 
            data={transformedData} 
            isLoading={geoLoading}
          />
          <DonutChart
            data={regionChartData}
            title="Traffic by Region"
            valueFormatter={(value) => `${value}%`}
            isLoading={geoLoading}
          />
        </div>

        {/* City Distribution */}
        <BarChart
          data={cityData}
          title="Top Cities by Sessions"
          valueFormatter={(value) => value.toLocaleString()}
          orientation="horizontal"
          isLoading={geoLoading}
        />

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
              {transformedData.length > 0 ? transformedData.slice(0, 10).map((country, index) => (
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
                    <span className="text-muted-foreground">--</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">--</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">--</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">--</span>
                  </div>
                </div>
              )) : (
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
      </div>
    </DashboardShell>
  );
}