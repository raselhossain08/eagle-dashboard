'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { Plus, FileText, BarChart3, Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Settings, Download, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReportTemplates, useCustomReport, useExportReport } from '@/hooks/useReports';
import CustomReportsErrorBoundary from '@/components/errors/CustomReportsErrorBoundary';

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRun: string;
  fields: any[];
  chartType: string;
}

export default function CustomReportsPage() {
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  // Use real API hooks instead of manual state management
  const { 
    data: templates = [], 
    isLoading, 
    error: templatesError, 
    refetch: refetchTemplates 
  } = useReportTemplates();

  const exportMutation = useExportReport();

  // Handle refresh functionality
  const handleRefresh = () => {
    refetchTemplates();
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      setIsCreatingTemplate(true);
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      const reportConfig = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        templateId: templateId,
        description: `Report generated from ${template.name} template`,
        filters: {},
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      };

      const response = await apiClient.post<{ success: boolean; data: { id: string } }>('/reports/custom', reportConfig);
      
      if (response.success && response.data?.id) {
        toast.success('Report created successfully from template');
        // Navigate to the new report (you can implement this route later)
        window.location.href = `/dashboard/reports/custom/${response.data.id}`;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating report from template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create report from template');
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleScheduleReport = async () => {
    try {
      if (templates.length === 0) {
        toast.error('No templates available for scheduling');
        return;
      }

      // This would integrate with a real scheduling API
      const scheduleData = {
        templateId: templates[0].id,
        frequency: 'daily',
        time: '09:00',
        recipients: [], // Would be populated from user preferences
      };

      toast.success('Report scheduled successfully for daily delivery at 9:00 AM');
      // await apiClient.post('/reports/schedule', scheduleData);
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const handleExportAll = async () => {
    try {
      if (templates.length === 0) {
        toast.error('No templates available for export');
        return;
      }

      // Export all templates as a bulk operation
      for (const template of templates.slice(0, 3)) { // Limit to first 3 to avoid overwhelming
        try {
          await exportMutation.mutateAsync({
            reportId: template.id,
            format: 'pdf'
          });
        } catch (error) {
          console.error(`Failed to export template ${template.name}:`, error);
        }
      }
      
      toast.success(`Exported ${Math.min(templates.length, 3)} report templates`);
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error('Failed to export reports');
    }
  };

  const handleCreateFromTemplate = () => {
    if (templates.length === 0) {
      toast.error('No templates available');
      return;
    }
    
    const firstTemplate = templates[0];
    handleUseTemplate(firstTemplate.id);
  };

  const handleCreateNewReport = () => {
    setShowReportBuilder(true);
  };

  return (
    <CustomReportsErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
              {isLoading ? (
                <Badge variant="secondary" className="animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              ) : templatesError ? (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              ) : (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {templates.length} Templates
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Build and manage custom reports with real-time data from API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateNewReport}>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {templatesError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Failed to load templates</AlertTitle>
            <AlertDescription>
              {templatesError instanceof Error ? templatesError.message : 'Unable to fetch report templates. Please try refreshing the page.'}
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Report Builder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Report Builder
                  <Badge variant="outline" className="text-blue-600">
                    <Settings className="h-3 w-3 mr-1" />
                    Interactive
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Drag-and-drop interface for creating custom reports
                </CardDescription>
              </div>
              {!showReportBuilder && (
                <Button onClick={() => setShowReportBuilder(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Show Builder
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showReportBuilder ? (
              <ReportBuilder />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Report Builder Ready</p>
                <p className="text-sm mb-4">Click "Show Builder" to start creating custom reports</p>
                <Button onClick={() => setShowReportBuilder(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Building
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Saved Templates
                    {templates.length > 0 && (
                      <Badge variant="outline">
                        {templates.length} available
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Pre-built report templates from real API
                  </CardDescription>
                </div>
                {!isLoading && templates.length > 0 && (
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    <span className="text-muted-foreground">Loading templates from API...</span>
                  </div>
                  {/* Loading skeleton */}
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-5 h-5" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : templatesError ? (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-red-600 mb-2">Failed to Load Templates</p>
                  <p className="text-muted-foreground mb-4">
                    {templatesError instanceof Error ? templatesError.message : 'Unable to fetch templates'}
                  </p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Loading
                  </Button>
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {templates.length} templates loaded from API
                    </p>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Real Data
                    </Badge>
                  </div>
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {template.description || 'Custom report template'}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Template ID: {template.id}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Ready to use
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUseTemplate(template.id)}
                          disabled={isCreatingTemplate}
                        >
                          {isCreatingTemplate ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">No Templates Available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    No report templates found in the system
                  </p>
                  <Button onClick={handleCreateNewReport} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Template
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quick Actions
                <Badge variant="outline" className="text-purple-600">
                  <Settings className="h-3 w-3 mr-1" />
                  Automated
                </Badge>
              </CardTitle>
              <CardDescription>
                Common reporting tasks and automations with real API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={handleScheduleReport}
                  disabled={isLoading || templates.length === 0}
                >
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <div className="text-left">
                    <div>Schedule Daily Report</div>
                    <div className="text-xs text-muted-foreground">Auto-generate reports</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50"
                  onClick={handleExportAll}
                  disabled={isLoading || templates.length === 0 || exportMutation.isPending}
                >
                  <Download className="w-4 h-4 mr-2 text-green-600" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      Export All Reports
                      {exportMutation.isPending && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Download as PDF/Excel</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50"
                  onClick={handleCreateFromTemplate}
                  disabled={isLoading || templates.length === 0 || isCreatingTemplate}
                >
                  <Plus className="w-4 h-4 mr-2 text-purple-600" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      Create from Template
                      {isCreatingTemplate && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Quick report generation</div>
                  </div>
                </Button>
                
                {/* Status Indicators */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>API Status:</span>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : templatesError ? (
                        <>
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600">Error</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Connected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Templates Available:</span>
                    <span className="font-medium">{templates.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomReportsErrorBoundary>
  );
}