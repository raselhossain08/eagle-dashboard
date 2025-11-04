'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportControls } from '@/components/reports/ExportControls';
import { DataTable } from '@/components/reports/DataTable';
import { ArrowLeft, Edit, Share2, TrendingUp, TrendingDown, Activity, RefreshCw, FileText, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCustomReport } from '@/hooks/use-reports';
import { reportsService } from '@/lib/api/reports.service';
import { useState } from 'react';
import { CustomReportDetailSkeleton } from '@/components/reports/CustomReportDetailSkeleton';
import CustomReportDetailErrorBoundary from '@/components/errors/CustomReportDetailErrorBoundary';

interface ReportData {
  metric: string;
  value: number;
  change: number;
}

const CustomReportDetailContent = () => {
  const params = useParams();
  const reportId = params.reportId as string;
  const [exporting, setExporting] = useState(false);

  const {
    data: report,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useCustomReport(reportId);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!reportId) return;
    
    try {
      setExporting(true);
      const blob = await reportsService.exportCustomReport(reportId, format);
      
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleEdit = () => {
    toast.info('Edit functionality coming soon');
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Report data refreshed');
  };

  const tableColumns = [
    { 
      key: 'metric', 
      label: 'Metric'
    },
    { 
      key: 'value', 
      label: 'Value', 
      format: (value: number) => value.toLocaleString()
    },
    { 
      key: 'change', 
      label: 'Change', 
      format: (value: number) => `${value >= 0 ? '+' : ''}${value}%`
    },
  ];

  if (isLoading) {
    return <CustomReportDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports/custom">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-600">Error Loading Report</h1>
            <p className="text-muted-foreground">
              {error.message || 'Failed to load report details'}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports/custom">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{report.name}</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {report.type}
              </Badge>
              {isRefetching && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Updating...
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-1">
              {report.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {new Date(report.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated: {new Date(report.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {report.data.map((item, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {item.metric}
                <div className={`p-1 rounded-full ${item.change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{item.value.toLocaleString()}</div>
              <div className={`text-xs font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}% from last period
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${item.change >= 0 ? 'bg-green-200' : 'bg-red-200'}`} />
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Report Data
              </CardTitle>
              <CardDescription>
                Detailed metrics and performance indicators
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {report.data.length} metrics
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={report.data} 
            columns={tableColumns}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Insights & Analysis
            </CardTitle>
            <CardDescription>Key findings from this report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-2 border-blue-200">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recommendations
            </CardTitle>
            <CardDescription>Suggested actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-2 border-green-200">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-green-800">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function CustomReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  return (
    <CustomReportDetailErrorBoundary reportId={reportId}>
      <CustomReportDetailContent />
    </CustomReportDetailErrorBoundary>
  );
}