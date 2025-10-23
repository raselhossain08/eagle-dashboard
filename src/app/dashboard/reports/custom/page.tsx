'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { Plus, FileText, BarChart3, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<ReportTemplate[]>('/reports/templates');
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load report templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      // Create a new report from template
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const reportConfig = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: template.type,
        fields: template.fields,
        chartType: template.chartType,
        templateId: templateId,
      };

      const newReport = await apiClient.post<{ id: string }>('/reports/custom', reportConfig);
      toast.success('Report created successfully');
      
      // Navigate to the new report
      window.location.href = `/dashboard/reports/custom/${newReport.id}`;
    } catch (error) {
      console.error('Error creating report from template:', error);
      toast.error('Failed to create report from template');
    }
  };

  const handleScheduleReport = async () => {
    try {
      toast.info('Report scheduling feature coming soon');
    } catch (error) {
      toast.error('Failed to schedule report');
    }
  };

  const handleExportAll = async () => {
    try {
      toast.info('Bulk export feature coming soon');
    } catch (error) {
      toast.error('Failed to export reports');
    }
  };

  const handleCreateFromTemplate = () => {
    const firstTemplate = templates[0];
    if (firstTemplate) {
      handleUseTemplate(firstTemplate.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Build and manage custom reports with drag-and-drop interface
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      <ReportBuilder />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
            <CardDescription>
              Pre-built report templates for quick insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading templates...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.description || `Last run: ${new Date(template.lastRun).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Type: {template.type} • Chart: {template.chartType}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                      disabled={isCreatingTemplate}
                    >
                      {isCreatingTemplate ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Use Template
                    </Button>
                  </div>
                ))}
                {templates.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common reporting tasks and automations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleScheduleReport}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Schedule Daily Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportAll}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export All Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleCreateFromTemplate}
                disabled={templates.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create from Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}