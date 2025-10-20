"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCohortAnalysis } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";

// Mock cohort data
const mockCohortData = [
  {
    cohort: "Jan 2024",
    size: 1200,
    retention: [100, 85, 72, 65, 58, 52, 48, 45, 42, 40, 38, 36],
    revenue: [12000, 10200, 8640, 7800, 6960, 6240, 5760, 5400, 5040, 4800, 4560, 4320]
  },
  {
    cohort: "Feb 2024",
    size: 1450,
    retention: [100, 88, 76, 68, 62, 57, 53, 50, 47, 45, 43, 41],
    revenue: [14500, 12760, 11020, 9860, 8990, 8265, 7685, 7250, 6815, 6525, 6235, 5945]
  },
  {
    cohort: "Mar 2024",
    size: 1320,
    retention: [100, 82, 70, 63, 57, 52, 48, 45, 43, 41, 39, 37],
    revenue: [13200, 10824, 9240, 8316, 7524, 6864, 6336, 5940, 5676, 5412, 5148, 4884]
  },
  {
    cohort: "Apr 2024",
    size: 1580,
    retention: [100, 86, 74, 67, 61, 56, 52, 49, 46, 44, 42, 40],
    revenue: [15800, 13588, 11692, 10586, 9638, 8848, 8216, 7742, 7268, 6952, 6636, 6320]
  },
  {
    cohort: "May 2024",
    size: 1420,
    retention: [100, 84, 72, 65, 59, 54, 50, 47, 45, 43, 41, 39],
    revenue: [14200, 11928, 10224, 9230, 8378, 7668, 7100, 6674, 6390, 6106, 5822, 5538]
  }
];

const months = ["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", 
               "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11"];

export default function CohortsPage() {
  const { dateRange } = useDashboardStore();
  const { data: cohortData, isLoading } = useCohortAnalysis({
    ...dateRange,
    period: 'month'
  });

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
                  {mockCohortData.map((cohort, cohortIndex) => (
                    <tr key={cohort.cohort} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cohort.cohort}</td>
                      <td className="p-2">{cohort.size.toLocaleString()}</td>
                      {cohort.retention.map((retention, monthIndex) => (
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
                  ))}
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
                  {mockCohortData.map((cohort, cohortIndex) => (
                    <tr key={cohort.cohort} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cohort.cohort}</td>
                      <td className="p-2">{cohort.size.toLocaleString()}</td>
                      {cohort.revenue.slice(0, 6).map((revenue, monthIndex) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Retention (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from previous period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. LTV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$245.60</div>
              <p className="text-xs text-muted-foreground">
                +8.5% from previous period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8%</div>
              <p className="text-xs text-muted-foreground">
                -1.2% from previous period
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
                  <span className="font-medium">Best Performing Cohort:</span> Feb 2024 shows the highest retention rates across all months
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Revenue Growth:</span> Recent cohorts show improving LTV with better monetization
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Churn Pattern:</span> Most churn occurs between months 2-3, indicating need for engagement improvements
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}