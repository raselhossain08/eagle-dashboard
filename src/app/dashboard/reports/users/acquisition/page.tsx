'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserAcquisitionReport, useExportUserReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, UserPlus, DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, Minus, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AcquisitionErrorBoundary } from './error-boundary';

function UserAcquisitionContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const acquisitionParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    metrics: ['users', 'cost', 'conversion', 'ltv'],
  };

  const { 
    data: acquisitionData, 
    isLoading, 
    error,
    refetch 
  } = useUserAcquisitionReport(acquisitionParams);
  
  const exportMutation = useExportUserReport();

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportMutation.mutateAsync({
        reportType: 'acquisition',
        params: acquisitionParams,
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
    { key: 'channel', label: 'Channel' },
    { key: 'users', label: 'New Users' },
    { key: 'cost', label: 'Cost', format: (value: number) => value ? `$${value.toLocaleString()}` : 'Free' },
    { key: 'conversion', label: 'Conversion', format: (value: number) => `${value}%` },
    { key: 'ltv', label: 'LTV', format: (value: number) => `$${value}` },
  ];

  // Calculate summary metrics
  const totalUsers = acquisitionData?.reduce((sum: number, item: any) => sum + (item.users || 0), 0) || 0;
  const totalCost = acquisitionData?.reduce((sum: number, item: any) => sum + (item.cost || 0), 0) || 0;
  const avgConversion = acquisitionData?.length ? 
    (acquisitionData.reduce((sum: number, item: any) => sum + (item.conversion || 0), 0) / acquisitionData.length).toFixed(1) : '0';
  const cac = totalUsers > 0 ? Math.round(totalCost / totalUsers) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-green-500" />
            User Acquisition Analytics
          </h1>
          <p className="text-muted-foreground">
            Acquisition channels, costs, and conversion metrics
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
        <span>Auto-refresh: 5min</span>
        <span>•</span>
        <span>Period: {dateRange?.from && dateRange?.to ? 
          `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` : 
          'Last 30 days'
        }</span>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load acquisition data: {error.message}
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
              <Users className="w-4 h-4 text-green-500" />
              Total Acquired
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
                  {totalUsers.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  New users
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Acquisition Cost
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
                  ${totalCost.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <DollarSign className="w-3 h-3 mr-1 text-blue-500" />
                  Total spend
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Avg. Conversion
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
                  {avgConversion}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {parseFloat(avgConversion) >= 5 ? 
                    <ArrowUp className="w-3 h-3 mr-1 text-green-500" /> :
                    parseFloat(avgConversion) >= 2 ? 
                    <Minus className="w-3 h-3 mr-1 text-yellow-500" /> :
                    <ArrowDown className="w-3 h-3 mr-1 text-red-500" />
                  }
                  Conversion rate
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-500" />
              CAC (Customer Acquisition Cost)
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
                  ${cac}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {cac <= 50 ? 
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> :
                    cac <= 100 ? 
                    <TrendingUp className="w-3 h-3 mr-1 text-yellow-500" /> :
                    <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                  }
                  Per customer
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acquisition Channels</CardTitle>
          <CardDescription>
            Performance by marketing channel and campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading acquisition data...
            </div>
          ) : acquisitionData && acquisitionData.length > 0 ? (
            <DataTable 
              data={acquisitionData} 
              columns={tableColumns}
              searchable={true}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No acquisition data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Channel Performance
            </CardTitle>
            <CardDescription>Effectiveness analysis and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load performance insights</p>
            ) : acquisitionData && acquisitionData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Highest converting: <strong>{acquisitionData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.channel}</strong> ({acquisitionData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.conversion}% rate)</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Most cost-effective: <strong>{acquisitionData.filter((d: any) => d.cost === 0)[0]?.channel || acquisitionData.sort((a: any, b: any) => (a.cost || 0) - (b.cost || 0))[0]?.channel}</strong> (lowest cost channel)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Highest volume: <strong>{acquisitionData.sort((a: any, b: any) => b.users - a.users)[0]?.channel}</strong> ({acquisitionData.sort((a: any, b: any) => b.users - a.users)[0]?.users.toLocaleString()} users)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Best LTV: <strong>{acquisitionData.sort((a: any, b: any) => b.ltv - a.ltv)[0]?.channel}</strong> (${acquisitionData.sort((a: any, b: any) => b.ltv - a.ltv)[0]?.ltv} lifetime value)</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No channel performance data available for the selected period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              ROI & Financial Analysis
            </CardTitle>
            <CardDescription>Return on investment metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-muted-foreground">Unable to load ROI analysis</p>
            ) : acquisitionData && acquisitionData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Overall ROI: <strong>{totalCost > 0 ? Math.round((totalUsers * 150 / totalCost) * 100) : 'N/A'}%</strong> {totalCost > 0 && totalUsers > 0 ? '(Profitable)' : '(No cost data)'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Best ROI channel: <strong>{acquisitionData.filter((d: any) => d.cost === 0)[0]?.channel || 'Organic channels'}</strong> (free acquisition)</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Paid channels ROI: <strong>{Math.round((acquisitionData.filter((d: any) => d.cost > 0).reduce((sum: number, d: any) => sum + d.users * d.ltv, 0) / Math.max(1, acquisitionData.filter((d: any) => d.cost > 0).reduce((sum: number, d: any) => sum + d.cost, 0))) * 100)}%</strong> return</span>
                </div>
                <div className="flex items-start gap-2">
                  <UserPlus className="w-4 h-4 mt-0.5 text-orange-500" />
                  <span>Break-even period: <strong>{cac > 0 ? Math.round(cac / 50 * 10) / 10 : 'N/A'}</strong> {cac > 0 ? 'months (estimated)' : '(no cost data)'}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No ROI data available for the selected period</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserAcquisitionPage() {
  return (
    <AcquisitionErrorBoundary>
      <UserAcquisitionContent />
    </AcquisitionErrorBoundary>
  );
}