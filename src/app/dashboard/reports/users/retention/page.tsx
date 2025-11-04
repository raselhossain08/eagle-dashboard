'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserRetentionReport, useExportUserReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Activity, Users, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

import { RetentionErrorBoundary } from './error-boundary';

export default function UserRetentionPage() {
  return (
    <RetentionErrorBoundary>
      <UserRetentionContent />
    </RetentionErrorBoundary>
  );
}

function UserRetentionContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -365),
    to: new Date(),
  });
  const [cohortType, setCohortType] = useState<'weekly' | 'monthly'>('monthly');

  const retentionParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    cohortType,
    metrics: ['retention', 'cohorts'],
  };

  const { 
    data: retentionData, 
    isLoading, 
    error,
    refetch 
  } = useUserRetentionReport(retentionParams);
  
  const exportMutation = useExportUserReport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportMutation.mutateAsync({
        reportType: 'retention',
        params: retentionParams,
        format
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const tableColumns = [
    { key: 'cohort', label: 'Cohort' },
    { key: 'size', label: 'Size' },
    { key: 'week1', label: 'Week 1', format: (value: number) => `${value?.toFixed(1) || 0}%` },
    { key: 'week2', label: 'Week 2', format: (value: number) => `${value?.toFixed(1) || 0}%` },
    { key: 'week4', label: 'Month 1', format: (value: number) => `${value?.toFixed(1) || 0}%` },
    { key: 'week8', label: 'Month 2', format: (value: number) => `${value?.toFixed(1) || 0}%` },
    { key: 'week12', label: 'Month 3', format: (value: number) => `${value?.toFixed(1) || 0}%` },
  ];

  const getRetentionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Retention Analysis</h1>
          <p className="text-muted-foreground">
            Cohort analysis and user retention metrics over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={cohortType} onValueChange={(value: 'weekly' | 'monthly') => setCohortType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Real-time Data Status */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
          <span>{error ? 'Connection Error' : 'Live Data'}</span>
        </div>
        <span>•</span>
        <span>Cohort Type: {cohortType}</span>
        <span>•</span>
        <span>Period: {dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` : 
          'Last 365 days'
        }</span>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load retention data: {error.message}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Week 1 Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention1Week.toFixed(1)}%` : '0%'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-blue-500" />
                  Average across cohorts
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              Month 1 Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention1Month.toFixed(1)}%` : '0%'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {retentionData?.metrics?.avgRetention1Month >= 45 ? 
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> :
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  }
                  30-day retention
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Month 3 Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {retentionData?.metrics ? 
                    `${retentionData.metrics.avgRetention3Months.toFixed(1)}%` : '0%'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {retentionData?.metrics?.avgRetention3Months >= 25 ? 
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> :
                    <TrendingDown className="w-3 h-3 mr-1 text-orange-500" />
                  }
                  90-day retention
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              Avg Cohort Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <div className="text-xl font-bold text-muted-foreground">--</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {retentionData?.metrics ? 
                    Math.round(retentionData.metrics.avgCohortSize).toLocaleString() : '0'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3 h-3 mr-1 text-orange-500" />
                  Users per cohort
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Table</CardTitle>
          <CardDescription>
            Detailed retention analysis by cohort and time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading retention data...
            </div>
          ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
            <DataTable 
              data={retentionData.cohorts} 
              columns={tableColumns}
              searchable={true}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No retention data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Heatmap</CardTitle>
          <CardDescription>
            Visual representation of retention rates across cohorts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading heatmap data...
            </div>
          ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
                <div>Cohort</div>
                <div>Size</div>
                <div>Week 1</div>
                <div>Week 2</div>
                <div>Month 1</div>
                <div>Month 2</div>
                <div>Month 3</div>
                <div>Actions</div>
              </div>
              
              {/* Data rows */}
              {retentionData.cohorts.slice(0, 10).map((cohort: any, index: number) => (
                <div key={index} className="grid grid-cols-8 gap-1 items-center py-1">
                  <div className="text-sm font-medium">{cohort.cohort}</div>
                  <div className="text-sm">{cohort.size}</div>
                  
                  {[cohort.week1, cohort.week2, cohort.week4, cohort.week8, cohort.week12].map((retention: number, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded ${getRetentionColor(retention || 0)}`}
                        title={`${retention?.toFixed(1) || 0}%`}
                      />
                      <span className="text-xs">{retention?.toFixed(1) || 0}%</span>
                    </div>
                  ))}
                  
                  <div className="text-xs text-muted-foreground">
                    View Details
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No heatmap data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Retention Insights</CardTitle>
            <CardDescription>Key findings and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load insights</p>
            ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Best cohort: <strong>{retentionData.cohorts.sort((a: any, b: any) => (b.week12 || 0) - (a.week12 || 0))[0]?.cohort}</strong> ({(retentionData.cohorts.sort((a: any, b: any) => (b.week12 || 0) - (a.week12 || 0))[0]?.week12 || 0).toFixed(1)}% at 3 months)</span>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Avg dropoff (Week 1-Month 1): <strong>{retentionData.metrics ? 
                    Math.abs(retentionData.metrics.avgRetention1Week - retentionData.metrics.avgRetention1Month).toFixed(1) : 0}%</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Analysis period: <strong>{cohortType}</strong> cohorts ({retentionData.cohorts.length} total)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Total users analyzed: <strong>{retentionData.cohorts.reduce((sum: number, c: any) => sum + c.size, 0).toLocaleString()}</strong></span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No retention insights available for the selected period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Opportunities</CardTitle>
            <CardDescription>Actionable recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load recommendations</p>
            ) : retentionData?.metrics ? (
              <>
                <div className="flex items-start gap-2">
                  {retentionData.metrics.avgRetention1Week < 70 ? 
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" /> :
                    <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  }
                  <span><strong>Week 1:</strong> {retentionData.metrics.avgRetention1Week < 70 ? 
                    'Optimize onboarding flow and initial user experience' : 
                    'Strong week 1 retention - maintain current strategies'}</span>
                </div>
                <div className="flex items-start gap-2">
                  {retentionData.metrics.avgRetention1Month < 45 ? 
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" /> :
                    <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  }
                  <span><strong>Month 1:</strong> {retentionData.metrics.avgRetention1Month < 45 ? 
                    'Implement engagement features and habit-forming activities' : 
                    'Good month 1 performance - focus on long-term value'}</span>
                </div>
                <div className="flex items-start gap-2">
                  {retentionData.metrics.avgRetention3Months < 25 ? 
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" /> :
                    <TrendingUp className="w-4 h-4 mt-0.5 text-blue-500" />
                  }
                  <span><strong>Month 3:</strong> {retentionData.metrics.avgRetention3Months < 25 ? 
                    'Strengthen value proposition and add retention triggers' : 
                    'Excellent long-term retention - scale successful tactics'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span><strong>Strategy:</strong> Implement {cohortType} re-engagement campaigns for at-risk segments</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No recommendations available for the selected period</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}