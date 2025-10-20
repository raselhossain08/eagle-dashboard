'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import Link from 'next/link';

// Mock data for individual report
const reportData = [
  { metric: 'Total Revenue', value: 125000, change: 12.5 },
  { metric: 'Active Users', value: 15600, change: 8.3 },
  { metric: 'Conversion Rate', value: 3.2, change: -0.5 },
  { metric: 'Customer Satisfaction', value: 4.5, change: 2.1 },
];

export default function CustomReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const handleExport = (format: any) => {
    console.log('Exporting custom report:', format, reportId);
  };

  const tableColumns = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
    { key: 'change', label: 'Change', format: (value: number) => 
      `${value >= 0 ? '+' : ''}${value}%`
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports/custom">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Report #{reportId}</h1>
            <p className="text-muted-foreground">
              Detailed analysis and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
              <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
          <CardDescription>
            Detailed metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={reportData} 
            columns={tableColumns}
            searchable={false}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insights & Analysis</CardTitle>
            <CardDescription>Key findings from this report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Revenue growth is strong at 12.5% month-over-month</p>
            <p>• User acquisition costs decreased by 8%</p>
            <p>• Customer satisfaction improved significantly</p>
            <p>• Conversion rate needs optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Increase investment in high-performing channels</p>
            <p>• Optimize conversion funnel for better rates</p>
            <p>• Expand features driving user engagement</p>
            <p>• Monitor customer satisfaction trends</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}