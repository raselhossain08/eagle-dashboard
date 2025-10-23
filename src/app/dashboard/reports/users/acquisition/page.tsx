'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { useUserAcquisitionReport } from '@/hooks/useReports';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function UserAcquisitionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const acquisitionParams = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
    metrics: ['users', 'cost', 'conversion', 'ltv'],
  };

  const { data: acquisitionData, isLoading } = useUserAcquisitionReport(acquisitionParams);

  const handleExport = (format: any) => {
    console.log('Exporting acquisition report:', format);
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
          <h1 className="text-3xl font-bold tracking-tight">User Acquisition</h1>
          <p className="text-muted-foreground">
            Acquisition channels, costs, and conversion metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Acquired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              New users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acquisition Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${totalCost.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${avgConversion}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${cac}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer cost
            </p>
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
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Effectiveness analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading performance insights...</p>
            ) : acquisitionData && acquisitionData.length > 0 ? (
              <>
                <p>• Highest converting: {acquisitionData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.channel} ({acquisitionData.sort((a: any, b: any) => b.conversion - a.conversion)[0]?.conversion}%)</p>
                <p>• Lowest cost: {acquisitionData.filter((d: any) => d.cost === 0)[0]?.channel || 'N/A'}</p>
                <p>• Best LTV: {acquisitionData.sort((a: any, b: any) => b.ltv - a.ltv)[0]?.channel} (${acquisitionData.sort((a: any, b: any) => b.ltv - a.ltv)[0]?.ltv})</p>
                <p>• Highest volume: {acquisitionData.sort((a: any, b: any) => b.users - a.users)[0]?.channel}</p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Analysis</CardTitle>
            <CardDescription>Return on investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <p>Loading ROI analysis...</p>
            ) : acquisitionData && acquisitionData.length > 0 ? (
              <>
                <p>• Overall ROI: {totalCost > 0 ? Math.round((totalUsers * 150 / totalCost) * 100) : 'N/A'}%</p>
                <p>• Best ROI: {acquisitionData.filter((d: any) => d.cost === 0)[0]?.channel || 'Organic channels'}</p>
                <p>• Paid channels ROI: {Math.round((acquisitionData.filter((d: any) => d.cost > 0).reduce((sum: number, d: any) => sum + d.users * d.ltv, 0) / Math.max(1, acquisitionData.filter((d: any) => d.cost > 0).reduce((sum: number, d: any) => sum + d.cost, 0))) * 100)}%</p>
                <p>• Break-even period: {cac > 0 ? Math.round(cac / 50 * 10) / 10 : 'N/A'} months</p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}