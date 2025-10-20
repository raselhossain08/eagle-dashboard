'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, FileText, Calendar, Shield, Settings } from 'lucide-react';
import { AuditQueryParams } from '@/types/audit';
import { pdfExportService } from '@/lib/export/pdf-export.service';
import { auditService } from '@/lib/services/audit.service';

interface AdvancedExportProps {
  filters: AuditQueryParams;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function AdvancedExport({ filters, onExportStart, onExportComplete }: AdvancedExportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'compliance'>('csv');
  const [complianceStandard, setComplianceStandard] = useState<'SOX' | 'GDPR' | 'HIPAA'>('SOX');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'csv' | 'pdf' | 'compliance' = 'csv') => {
    setIsExporting(true);
    onExportStart?.();

    try {
      switch (type) {
        case 'csv':
          await handleCSVExport();
          break;
        case 'pdf':
          await handlePDFExport();
          break;
        case 'compliance':
          await handleComplianceExport();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      onExportComplete?.();
    }
  };

  const handleCSVExport = async () => {
    const blob = await auditService.exportAuditLogs({
      ...filters,
      limit: 10000, // Export all
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePDFExport = async () => {
    const logs = await auditService.getAuditLogs({
      ...filters,
      limit: 1000, // Limit for PDF
    });

    const blob = await pdfExportService.exportAuditLogsToPDF(
      logs.logs, 
      filters, 
      'Audit Report'
    );
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleComplianceExport = async () => {
    const logs = await auditService.getAuditLogs({
      ...filters,
      limit: 5000,
    });

    const blob = await pdfExportService.generateComplianceReport(
      logs.logs,
      complianceStandard
    );
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${complianceStandard}-compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDashboardExport = async () => {
    setIsExporting(true);
    try {
      const blob = await pdfExportService.exportDashboardToPDF('audit-dashboard', 'audit-dashboard.pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-dashboard.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Dashboard export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export
            {isExporting && '...'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Compliance Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDashboardExport}>
            <Calendar className="h-4 w-4 mr-2" />
            Export Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Compliance Report</DialogTitle>
            <DialogDescription>
              Create a formatted compliance report for auditing purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="compliance-standard">Compliance Standard</Label>
              <Select value={complianceStandard} onValueChange={(value: any) => setComplianceStandard(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOX">SOX Compliance</SelectItem>
                  <SelectItem value="GDPR">GDPR Compliance</SelectItem>
                  <SelectItem value="HIPAA">HIPAA Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-type">Report Type</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">Detailed PDF Report</SelectItem>
                  <SelectItem value="compliance">Compliance Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
              <Label htmlFor="include-charts">Include charts and visualizations</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  handleExport(exportType);
                }}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}