'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Mock data for acquisition
const acquisitionData = [
  { channel: 'Organic Search', users: 1250, cost: 0, conversion: 3.2, ltv: 245 },
  { channel: 'Social Media', users: 890, cost: 1200, conversion: 2.1, ltv: 189 },
  { channel: 'Email Marketing', users: 450, cost: 300, conversion: 4.5, ltv: 312 },
  { channel: 'Referral', users: 320, cost: 0, conversion: 8.2, ltv: 421 },
  { channel: 'Paid Ads', users: 1560, cost: 4500, conversion: 1.8, ltv: 167 },
];

export default function UserAcquisitionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const handleExport = (format: any) => {
    console.log('Exporting acquisition report:', format);
  };

  const tableColumns = [
    { key: 'channel', label: 'Channel' },
    { key: 'users', label: 'New Users' },
    { key: 'cost', label: 'Cost', format: (value: number) => value ? `$${value}` : 'Free' },
    { key: 'conversion', label: 'Conversion', format: (value: number) => `${value}%` },
    { key: 'ltv', label: 'LTV', format: (value: number) => `$${value}` },
  ];

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
              {acquisitionData.reduce((sum, item) => sum + item.users, 0).toLocaleString()}
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
              ${acquisitionData.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
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
              {(acquisitionData.reduce((sum, item) => sum + item.conversion, 0) / acquisitionData.length).toFixed(1)}%
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
              $24
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
          <DataTable 
            data={acquisitionData} 
            columns={tableColumns}
            searchable={true}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Effectiveness analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Highest converting: Referral (8.2%)</p>
            <p>• Lowest cost: Organic Search</p>
            <p>• Best LTV: Referral ($421)</p>
            <p>• Highest volume: Paid Ads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Analysis</CardTitle>
            <CardDescription>Return on investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Overall ROI: 285%</p>
            <p>• Best ROI: Email Marketing (1042%)</p>
            <p>• Paid Ads ROI: 167%</p>
            <p>• Break-even period: 2.3 months</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}