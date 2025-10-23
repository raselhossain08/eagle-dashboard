'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserRetentionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserRetentionPage() {
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

  const { data: retentionData, isLoading } = useUserRetentionReport(retentionParams);

  const handleExport = (format: any) => {
    console.log('Exporting retention report:', format);
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

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Week 1 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : retentionData?.metrics ? 
                `${retentionData.metrics.avgRetention1Week.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average across cohorts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Month 1 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : retentionData?.metrics ? 
                `${retentionData.metrics.avgRetention1Month.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              30-day retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Month 3 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : retentionData?.metrics ? 
                `${retentionData.metrics.avgRetention3Months.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              90-day retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Cohort Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : retentionData?.metrics ? 
                Math.round(retentionData.metrics.avgCohortSize).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Users per cohort
            </p>
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
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading insights...</p>
            ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
              <>
                <p>• Best performing cohort: {retentionData.cohorts.sort((a: any, b: any) => (b.week12 || 0) - (a.week12 || 0))[0]?.cohort}</p>
                <p>• Average dropoff Week 1-2: {retentionData.metrics ? 
                  Math.round(retentionData.metrics.avgRetention1Week - retentionData.metrics.avgRetention1Month) : 0}%</p>
                <p>• Cohort type: {cohortType} analysis</p>
                <p>• Total cohorts analyzed: {retentionData.cohorts.length}</p>
              </>
            ) : (
              <p>No insights available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Opportunities</CardTitle>
            <CardDescription>Actionable recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading recommendations...</p>
            ) : retentionData?.metrics ? (
              <>
                <p>• {retentionData.metrics.avgRetention1Week < 70 ? 
                  'Focus on week 1 onboarding experience' : 'Week 1 retention is strong'}</p>
                <p>• {retentionData.metrics.avgRetention1Month < 45 ? 
                  'Improve month 1 engagement features' : 'Month 1 retention performing well'}</p>
                <p>• {retentionData.metrics.avgRetention3Months < 25 ? 
                  'Enhance long-term value proposition' : 'Good long-term retention'}</p>
                <p>• Consider personalized re-engagement campaigns</p>
              </>
            ) : (
              <p>No recommendations available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}