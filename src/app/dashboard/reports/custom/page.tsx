'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { Plus, FileText, BarChart3 } from 'lucide-react';

const savedTemplates = [
  { id: 1, name: 'Monthly Revenue Summary', type: 'financial', lastRun: '2024-01-15' },
  { id: 2, name: 'User Engagement Dashboard', type: 'user', lastRun: '2024-01-14' },
  { id: 3, name: 'Subscription Analytics', type: 'financial', lastRun: '2024-01-13' },
];

export default function CustomReportsPage() {
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
            <div className="space-y-4">
              {savedTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last run: {template.lastRun}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
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
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Schedule Daily Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Export All Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
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