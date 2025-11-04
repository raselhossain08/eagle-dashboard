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
import { RefreshCw, Calendar } from "lucide-react";



const defaultFunnelSteps = ["page_view", "signup", "checkout_start", "purchase"];

export default function FunnelsPage() {
  const { dateRange } = useDashboardStore();
  const [selectedSteps] = useState(defaultFunnelSteps);

  // API Hooks with proper date formatting
  const { 
    data: funnelData, 
    isLoading: funnelLoading, 
    error: funnelError 
  } = useConversionFunnel({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    steps: selectedSteps
  });

  const { 
    data: timeAnalysis, 
    isLoading: timeLoading, 
    error: timeError 
  } = useFunnelTimeAnalysis({
    steps: selectedSteps,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const { 
    data: segmentData, 
    isLoading: segmentLoading, 
    error: segmentError 
  } = useSegmentPerformance({
    steps: selectedSteps,
    segmentBy: 'device',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const createFunnelMutation = useCreateFunnel();

  // Manual refresh functionality
  const handleRefreshData = () => {
    // Force refresh all queries
    window.location.reload();
  };

  // Quick date range presets
  const handleDateRangePreset = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    useDashboardStore.getState().setDateRange({
      startDate,
      endDate
    });
  };

  // Transform funnel data for display with error handling
  const transformedFunnelData = useMemo(() => {
    try {
      if (!funnelData) return [];
      
      if (Array.isArray(funnelData) && funnelData.length > 0) {
        return funnelData.map(item => ({
          ...item,
          step: item.step || 'Unknown Step',
          count: typeof item.count === 'number' ? item.count : 0,
          conversionRate: typeof item.conversionRate === 'number' ? item.conversionRate : 0,
          dropOff: typeof item.dropOff === 'number' ? item.dropOff : 0,
        }));
      }
      
      // Return default structure if no data
      return selectedSteps.map((step, index) => ({
        step,
        count: 0,
        conversionRate: 0,
        dropOff: index === 0 ? 0 : 0,
      }));
    } catch (error) {
      console.error('Error transforming funnel data:', error);
      return [];
    }
  }, [funnelData, selectedSteps]);

  // Transform time analysis for trends chart with better date handling
  const transformedTrendsData = useMemo(() => {
    try {
      if (!timeAnalysis) return [];
      
      if (Array.isArray(timeAnalysis) && timeAnalysis.length > 0) {
        return timeAnalysis.map((item: any) => ({
          date: item.date || new Date().toISOString().split('T')[0],
          value: typeof item.conversionRate === 'number' ? item.conversionRate : 0,
        }));
      }
      
      // Generate fallback data for the date range if no real data
      const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const fallbackData = [];
      
      for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
        const date = new Date(dateRange.startDate);
        date.setDate(date.getDate() + i);
        fallbackData.push({
          date: date.toISOString().split('T')[0],
          value: 0,
        });
      }
      
      return fallbackData;
    } catch (error) {
      console.error('Error transforming trends data:', error);
      return [];
    }
  }, [timeAnalysis, dateRange]);

  // Calculate funnel metrics with comprehensive error handling
  const funnelMetrics = useMemo(() => {
    try {
      if (funnelError) {
        console.warn('Funnel error, returning zero metrics:', funnelError);
        return {
          totalUsers: 0,
          completedUsers: 0,
          overallConversion: '0.0',
          avgDropOff: '0.0'
        };
      }

      if (transformedFunnelData && transformedFunnelData.length > 0) {
        const totalUsers = Math.max(0, transformedFunnelData[0]?.count ?? 0);
        const completedUsers = Math.max(0, transformedFunnelData[transformedFunnelData.length - 1]?.count ?? 0);
        
        const overallConversion = totalUsers > 0 ? 
          Math.min(100, Math.max(0, (completedUsers / totalUsers) * 100)) : 0;
        
        // Calculate average drop-off excluding the first step
        const dropOffSteps = transformedFunnelData.slice(1).filter(step => 
          typeof step.dropOff === 'number' && !isNaN(step.dropOff)
        );
        
        const avgDropOff = dropOffSteps.length > 0 
          ? dropOffSteps.reduce((acc, step) => acc + step.dropOff, 0) / dropOffSteps.length
          : 0;
        
        return {
          totalUsers,
          completedUsers,
          overallConversion: overallConversion.toFixed(1),
          avgDropOff: Math.max(0, avgDropOff).toFixed(1)
        };
      }
      
      return {
        totalUsers: 0,
        completedUsers: 0,
        overallConversion: '0.0',
        avgDropOff: '0.0'
      };
    } catch (error) {
      console.error('Error calculating funnel metrics:', error);
      return {
        totalUsers: 0,
        completedUsers: 0,
        overallConversion: '0.0',
        avgDropOff: '0.0'
      };
    }
  }, [transformedFunnelData, funnelError]);

  const handleCreateFunnel = async () => {
    try {
      await createFunnelMutation.mutateAsync({
        name: "E-commerce Conversion Funnel",
        steps: selectedSteps.map((step, index) => ({
          event: step,
          name: transformedFunnelData[index]?.step || step
        })),
        filters: { 
          source: 'dashboard',
          dateRange: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to create funnel:', error);
    }
  };

  // Enhanced error handling for different error types
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    if (typeof error === 'string') return error;
    
    if (error.message) {
      if (error.message.includes('Network')) {
        return 'Network connection error. Please check your internet connection.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timeout. The server is taking too long to respond.';
      }
      if (error.message.includes('401')) {
        return 'Authentication required. Please sign in again.';
      }
      if (error.message.includes('403')) {
        return 'Access denied. You don\'t have permission to view this data.';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  // Check if we have any data loading
  const isAnyLoading = funnelLoading || timeLoading || segmentLoading;
  
  // Check if all data sources have errors
  const hasAllErrors = funnelError && timeError && segmentError;

  // Global error fallback if all APIs fail
  if (hasAllErrors) {
    return (
      <DashboardShell
        title="Funnel Analysis"
        description="Track user conversion through custom funnels with real backend data"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Unable to Load Analytics Data</h3>
            <p className="text-muted-foreground max-w-md">
              {getErrorMessage(funnelError || timeError || segmentError)}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="default"
              >
                Reload Page
              </Button>
              <Button 
                onClick={() => {
                  // Trigger manual refetch of all queries
                  window.location.hash = '#refresh';
                  window.location.reload();
                }} 
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Funnel Analysis"
      description="Track user conversion through custom funnels with real backend data"
    >
      <div className="space-y-6">
        {/* Date Range Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDateRangePreset(7)}
                >
                  Last 7 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDateRangePreset(30)}
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDateRangePreset(90)}
                >
                  Last 90 Days
                </Button>
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="text-sm text-muted-foreground">
                  {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isAnyLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isAnyLoading ? 'animate-spin' : ''}`} />
                  {isAnyLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <div className="text-center py-4">
                  <div className="text-sm text-red-600 mb-2">
                    ❌ {getErrorMessage(segmentError)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : segmentLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="text-right space-y-1">
                        <div className="h-4 bg-muted rounded w-12"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : segmentData && Array.isArray(segmentData) && segmentData.length > 0 ? (
                <div className="space-y-3">
                  {segmentData.map((segment, index) => {
                    const conversionRate = segment.conversionRate ?? segment.completionRate ?? 0;
                    const isHighConversion = conversionRate > 20;
                    const isMediumConversion = conversionRate > 10;
                    
                    return (
                      <div key={`segment-${index}-${segment.segment}`} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{segment.segment}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            isHighConversion ? 'bg-green-500' : 
                            isMediumConversion ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{(segment.totalUsers ?? 0).toLocaleString()}</div>
                          <div className={`text-xs font-medium ${
                            isHighConversion ? 'text-green-600' : 
                            isMediumConversion ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {conversionRate.toFixed(1)}% conversion
                          </div>
                          {segment.convertingUsers !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {segment.convertingUsers} converted
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No segment data available for the selected date range
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try selecting a different date range or ensure tracking is active
                  </p>
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