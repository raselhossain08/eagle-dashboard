'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { ArrowLeft, Edit, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface ReportData {
  metric: string;
  value: number;
  change: number;
}

interface CustomReport {
  id: string;
  name: string;
  type: string;
  description: string;
  data: ReportData[];
  insights: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<CustomReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<CustomReport>(`/reports/custom/${reportId}`);
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setExporting(true);
      const blob = await apiClient.download(`/reports/export/${reportId}?format=${format}`);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Report link copied to clipboard');
  };

  const handleEdit = () => {
    toast.info('Edit functionality coming soon');
  };

  const tableColumns = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value', format: (value: number) => value.toLocaleString() },
    { key: 'change', label: 'Change', format: (value: number) => 
      `${value >= 0 ? '+' : ''}${value}%`
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading report...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports/custom">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Not Found</h1>
            <p className="text-muted-foreground">
              The requested report could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">{report.name}</h1>
            <p className="text-muted-foreground">
              {report.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created: {new Date(report.createdAt).toLocaleDateString()} • 
              Updated: {new Date(report.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <ExportControls onExport={handleExport} isLoading={exporting} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {report.data.map((item, index) => (
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
            data={report.data} 
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
            {report.insights.map((insight, index) => (
              <p key={index}>• {insight}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {report.recommendations.map((recommendation, index) => (
              <p key={index}>• {recommendation}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}