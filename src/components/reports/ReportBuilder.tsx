'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface ReportField {
  id: string;
  dataSource: string;
  metric: string;
  aggregation: string;
}

export function ReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [fields, setFields] = useState<ReportField[]>([]);
  const [chartType, setChartType] = useState('bar');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const addField = () => {
    const newField: ReportField = {
      id: Date.now().toString(),
      dataSource: 'revenue',
      metric: 'amount',
      aggregation: 'sum'
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<ReportField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handlePreview = async () => {
    if (fields.length === 0) {
      toast.error('Please add at least one field to preview the report');
      return;
    }

    try {
      setIsPreviewMode(true);
      
      // Generate preview data based on selected fields
      const mockData = fields.map(field => ({
        metric: `${field.dataSource} ${field.metric}`,
        value: Math.floor(Math.random() * 100000) + 10000,
        aggregation: field.aggregation,
      }));
      
      setPreviewData(mockData);
      toast.success('Preview generated successfully');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    try {
      setIsSaving(true);
      
      const reportConfig = {
        name: reportName,
        fields,
        chartType,
        type: 'custom',
        description: `Custom report with ${fields.length} metrics`,
      };

      const savedReport = await apiClient.post<{ id: string }>('/reports/custom', reportConfig);
      
      toast.success('Report saved successfully');
      
      // Reset form
      setReportName('');
      setFields([]);
      setChartType('bar');
      setIsPreviewMode(false);
      setPreviewData([]);
      
      // Navigate to the saved report
      setTimeout(() => {
        window.location.href = `/dashboard/reports/custom/${savedReport.id}`;
      }, 1000);
      
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
        <CardDescription>
          Create custom reports by selecting data sources and metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reportName">Report Name</Label>
          <Input
            id="reportName"
            placeholder="Enter report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Chart Type</Label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="table">Data Table</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Report Fields</Label>
            <Button onClick={addField} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {fields.map((field) => (
            <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Data Source</Label>
                <Select 
                  value={field.dataSource} 
                  onValueChange={(value) => updateField(field.id, { dataSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Metric</Label>
                <Select 
                  value={field.metric} 
                  onValueChange={(value) => updateField(field.id, { metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="total">Total</SelectItem>
                    <SelectItem value="growth">Growth Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Aggregation</Label>
                <Select 
                  value={field.aggregation} 
                  onValueChange={(value) => updateField(field.id, { aggregation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No fields added yet</p>
              <Button onClick={addField} variant="outline" className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Field
              </Button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {isPreviewMode && previewData.length > 0 && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previewData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="font-medium">{item.metric}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            disabled={fields.length === 0}
          >
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!reportName.trim() || fields.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}