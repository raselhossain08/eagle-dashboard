"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConversionFunnel } from "@/hooks/use-reports";
import { useCreateFunnel, useFunnelTimeAnalysis, useSegmentPerformance } from "@/hooks/use-funnel";
import { useDashboardStore } from "@/store/dashboard-store";
import { TrendingDown, Users, Clock, Target } from "lucide-react";
import { useMemo, useState } from "react";



const defaultFunnelSteps = ["page_view", "signup", "checkout_start", "purchase"];

export default function FunnelsPage() {
  const { dateRange } = useDashboardStore();
  const [selectedSteps] = useState(defaultFunnelSteps);

  // API Hooks
  const { 
    data: funnelData, 
    isLoading: funnelLoading, 
    error: funnelError 
  } = useConversionFunnel({
    ...dateRange,
    steps: selectedSteps
  });

  const { 
    data: timeAnalysis, 
    isLoading: timeLoading, 
    error: timeError 
  } = useFunnelTimeAnalysis({
    steps: selectedSteps,
    ...dateRange
  });

  const { 
    data: segmentData, 
    isLoading: segmentLoading, 
    error: segmentError 
  } = useSegmentPerformance({
    steps: selectedSteps,
    segmentBy: 'device',
    ...dateRange
  });

  const createFunnelMutation = useCreateFunnel();

  // Transform funnel data for display
  const transformedFunnelData = useMemo(() => {
    if (funnelData && Array.isArray(funnelData) && funnelData.length > 0) {
      return funnelData;
    }
    return [];
  }, [funnelData]);

  // Transform time analysis for trends chart
  const transformedTrendsData = useMemo(() => {
    if (timeAnalysis && Array.isArray(timeAnalysis) && timeAnalysis.length > 0) {
      // Use actual time analysis data for trends
      return timeAnalysis.map((item: any, index: number) => ({
        date: new Date(Date.now() - (timeAnalysis.length - index - 1) * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        value: item.conversionRate ?? 0
      }));
    }
    return [];
  }, [timeAnalysis]);

  // Calculate funnel metrics
  const funnelMetrics = useMemo(() => {
    if (!funnelError && transformedFunnelData && transformedFunnelData.length > 0) {
      const totalUsers = transformedFunnelData[0]?.count ?? 0;
      const completedUsers = transformedFunnelData[transformedFunnelData.length - 1]?.count ?? 0;
      const overallConversion = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;
      const avgDropOff = transformedFunnelData.length > 1 
        ? transformedFunnelData.slice(1).reduce((acc: number, step: any) => acc + (step.dropOff ?? 0), 0) / (transformedFunnelData.length - 1)
        : 0;
      
      return {
        totalUsers,
        completedUsers,
        overallConversion: overallConversion.toFixed(1),
        avgDropOff: avgDropOff.toFixed(1)
      };
    }
    
    return {
      totalUsers: 0,
      completedUsers: 0,
      overallConversion: '0.0',
      avgDropOff: '0.0'
    };
  }, [transformedFunnelData, funnelError]);

  const handleCreateFunnel = async () => {
    try {
      await createFunnelMutation.mutateAsync({
        name: "E-commerce Conversion Funnel",
        steps: selectedSteps.map((step, index) => ({
          event: step,
          name: transformedFunnelData[index]?.step || step
        })),
        filters: { source: 'dashboard' }
      });
    } catch (error) {
      console.error('Failed to create funnel:', error);
    }
  };

  return (
    <DashboardShell
      title="Funnel Analysis"
      description="Track user conversion through custom funnels with real backend data"
    >
      <div className="space-y-6">
        {/* Funnel Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {funnelLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{funnelMetrics.totalUsers.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Entered funnel
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {funnelLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{funnelMetrics.completedUsers.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Completed funnel
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {funnelLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{funnelMetrics.overallConversion}%</div>
              )}
              <p className="text-xs text-muted-foreground">
                Overall conversion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Drop-off</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {funnelLoading ? (
                <div className="text-2xl font-bold h-8 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{funnelMetrics.avgDropOff}%</div>
              )}
              <p className="text-xs text-muted-foreground">
                Per step
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Funnel Visualization */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {funnelError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load funnel data. Please check your connection and try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <FunnelChart 
                data={transformedFunnelData}
                isLoading={funnelLoading}
              />
            )}
          </div>
          <div>
            {timeError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Overall Conversion Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load trend data. Please check your connection and try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TimeSeriesChart
                data={transformedTrendsData}
                title="Overall Conversion Rate Trend"
                valueFormatter={(value) => `${value.toFixed(1)}%`}
                isLoading={timeLoading}
              />
            )}
          </div>
        </div>

        {/* Funnel Actions and Segment Analysis */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Current funnel steps: {selectedSteps.join(' → ')}
              </div>
              <Button 
                onClick={handleCreateFunnel}
                disabled={createFunnelMutation.isPending}
                className="w-full"
              >
                {createFunnelMutation.isPending ? 'Creating...' : 'Save Custom Funnel'}
              </Button>
              {createFunnelMutation.isSuccess && (
                <div className="text-sm text-green-600">
                  ✅ Funnel created successfully!
                </div>
              )}
              {createFunnelMutation.isError && (
                <div className="text-sm text-red-600">
                  ❌ Failed to create funnel. Please check your connection.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {segmentError ? (
                <div className="text-sm text-red-600">
                  ❌ Failed to load segment data. Please try again.
                </div>
              ) : segmentLoading ? (
                <div className="text-sm text-muted-foreground">Loading segment data...</div>
              ) : segmentData && Array.isArray(segmentData) && segmentData.length > 0 ? (
                <div className="space-y-3">
                  {segmentData.map((segment, index) => (
                    <div key={`segment-${index}-${segment.segment}`} className="flex justify-between items-center">
                      <span className="font-medium">{segment.segment}</span>
                      <div className="text-right">
                        <div className="font-semibold">{(segment.totalUsers ?? 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {(segment.conversionRate ?? segment.completionRate ?? 0).toFixed(1)}% conversion
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No segment data available for the selected date range
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funnel Step Details */}
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Unable to load step analysis. Please check your connection and try again.
                </p>
              </div>
            ) : funnelLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                  <div>Step</div>
                  <div className="text-right">Users</div>
                  <div className="text-right">Conversion Rate</div>
                  <div className="text-right">Drop-off Rate</div>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 items-center py-2 border-b">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : transformedFunnelData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                  <div>Step</div>
                  <div className="text-right">Users</div>
                  <div className="text-right">Conversion Rate</div>
                  <div className="text-right">Drop-off Rate</div>
                </div>
                {transformedFunnelData.map((step: any, index: number) => {
                  const conversionRate = step.conversionRate ?? 0;
                  const dropOff = step.dropOff ?? 0;
                  const count = step.count ?? 0;
                  
                  return (
                    <div key={`step-analysis-${index}-${step.step}`} className="grid grid-cols-4 gap-4 items-center py-2 border-b hover:bg-muted/50">
                      <div className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded text-xs mr-2">
                          {index + 1}
                        </span>
                        <span className="font-medium">{step.step}</span>
                      </div>
                      <div className="text-right font-semibold">{count.toLocaleString()}</div>
                      <div className="text-right">
                        <span className={conversionRate > 50 ? "text-green-600" : conversionRate > 20 ? "text-orange-600" : "text-red-600"}>
                          {conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-right">
                        {index > 0 ? (
                          <span className={dropOff < 30 ? "text-green-600" : dropOff < 60 ? "text-orange-600" : "text-red-600"}>
                            {dropOff.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No funnel data available for the selected date range and steps.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your date range or ensure events are being tracked.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}