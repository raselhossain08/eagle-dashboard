"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCohortAnalysis } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";

// No mock data - using only real API responses

const months = ["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", 
               "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11"];

export default function CohortsPage() {
  const { dateRange } = useDashboardStore();
  const { data: cohortData, isLoading } = useCohortAnalysis({
    type: 'monthly',
    periods: 12
  });

  // Use real data from backend API only
  const displayCohortData = cohortData || [];

  const getRetentionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-green-300";
    if (percentage >= 40) return "bg-yellow-300";
    if (percentage >= 20) return "bg-orange-300";
    return "bg-red-300";
  };

  const getRetentionTextColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-900";
    if (percentage >= 60) return "text-green-800";
    if (percentage >= 40) return "text-yellow-800";
    if (percentage >= 20) return "text-orange-800";
    return "text-red-800";
  };

  return (
    <DashboardShell
      title="Cohort Analysis"
      description="User retention and behavior analysis by cohorts"
    >
      <div className="space-y-6">
        {/* Cohort Retention Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Retention Cohort Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Cohort</th>
                    <th className="text-left p-2 font-medium">Size</th>
                    {months.map((month, index) => (
                      <th key={month} className="text-right p-2 font-medium">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayCohortData.length > 0 ? displayCohortData.map((cohort: any, cohortIndex: number) => (
                    <tr key={cohort.cohort} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cohort.cohort}</td>
                      <td className="p-2">{cohort.size.toLocaleString()}</td>
                      {cohort.retention.map((retention: number, monthIndex: number) => (
                        <td key={monthIndex} className="p-2 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <span className={`text-xs ${getRetentionTextColor(retention)}`}>
                              {retention}%
                            </span>
                            <div 
                              className={`w-3 h-3 rounded ${getRetentionColor(retention)}`}
                              title={`${retention}% retention`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={14} className="p-8 text-center text-muted-foreground">
                        {isLoading ? "Loading cohort data..." : "No cohort data available. Please ensure analytics data exists."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Cohort Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Cohort</th>
                    <th className="text-left p-2 font-medium">Size</th>
                    {months.slice(0, 6).map((month, index) => (
                      <th key={month} className="text-right p-2 font-medium">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayCohortData.length > 0 ? displayCohortData.map((cohort: any, cohortIndex: number) => (
                    <tr key={cohort.cohort} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cohort.cohort}</td>
                      <td className="p-2">{cohort.size.toLocaleString()}</td>
                      {(cohort.revenue || []).slice(0, 6).map((revenue: number, monthIndex: number) => (
                        <td key={monthIndex} className="p-2 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              ${(revenue / 1000).toFixed(1)}k
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ${Math.round(revenue / cohort.size)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        {isLoading ? "Loading revenue cohort data..." : "No revenue cohort data available. Please ensure analytics data exists."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Month 1 Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayCohortData.length > 0 
                  ? Math.round(
                      displayCohortData.reduce((acc: number, cohort: any) => 
                        acc + (cohort.retention[1] || 0), 0
                      ) / displayCohortData.length
                    )
                  : "--"
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                {displayCohortData.length > 0 
                  ? `Across ${displayCohortData.length} cohorts`
                  : "No data available"
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${displayCohortData.length > 0
                  ? (displayCohortData.reduce((total: number, cohort: any) => 
                      total + (cohort.revenue?.reduce((sum: number, rev: number) => sum + rev, 0) || 0), 0
                    ) / 1000).toFixed(1)
                  : "--"
                }k
              </div>
              <p className="text-xs text-muted-foreground">
                {displayCohortData.length > 0 
                  ? "Generated across all cohorts"
                  : "No data available"
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayCohortData.length > 0 
                  ? displayCohortData.reduce((acc: number, cohort: any) => acc + cohort.size, 0).toLocaleString()
                  : "--"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {displayCohortData.length > 0 
                  ? "Across all cohorts"
                  : "No data available"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Best Performing Cohort:</span> {
                    displayCohortData.length > 0
                      ? `${displayCohortData.reduce((best: any, cohort: any) => 
                          (cohort.retention[1] || 0) > (best.retention[1] || 0) ? cohort : best
                        ).cohort} shows the highest Month 1 retention rate`
                      : "No cohort data available to analyze performance"
                  }
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Data Source:</span> {
                    displayCohortData.length > 0
                      ? `Real cohort data from ${displayCohortData.length} time periods`
                      : "No real data available - ensure users have signed up and analytics events exist"
                  }
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Analysis Status:</span> {
                    isLoading 
                      ? "Loading cohort analysis data..."
                      : displayCohortData.length > 0
                        ? "Real-time cohort analysis based on user behavior data"
                        : "No cohort data found - analytics events may not exist or users haven't signed up yet"
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}