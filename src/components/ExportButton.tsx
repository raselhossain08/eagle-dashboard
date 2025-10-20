// components/ExportButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText,
  Sheet,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ExportButtonProps {
  selectedSubscribers?: string[];
  onExport?: (format: string, fields: string[]) => void;
}

const exportFields = [
  { id: 'id', label: 'ID', default: true },
  { id: 'name', label: 'Name', default: true },
  { id: 'email', label: 'Email', default: true },
  { id: 'company', label: 'Company', default: false },
  { id: 'status', label: 'Status', default: true },
  { id: 'kycStatus', label: 'KYC Status', default: true },
  { id: 'lifetimeValue', label: 'Lifetime Value', default: true },
  { id: 'totalSpent', label: 'Total Spent', default: false },
  { id: 'createdAt', label: 'Created Date', default: true },
  { id: 'lastActivity', label: 'Last Activity', default: false },
];

export function ExportButton({ selectedSubscribers = [], onExport }: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportFields.filter(field => field.default).map(field => field.id)
  );
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = () => {
    if (onExport) {
      onExport(exportFormat, selectedFields);
    } else {
      // Default export behavior
      console.log('Exporting:', {
        format: exportFormat,
        fields: selectedFields,
        subscribers: selectedSubscribers.length > 0 ? selectedSubscribers : 'all'
      });
      
      // Simulate export download
      const data = {
        format: exportFormat,
        fields: selectedFields,
        count: selectedSubscribers.length || 'all'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setIsDialogOpen(false);
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(exportFields.map(field => field.id));
  };

  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
            {selectedSubscribers.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                {selectedSubscribers.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Sheet className="h-4 w-4 mr-2" />
            Export to Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Export to JSON
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Subscribers</DialogTitle>
            <DialogDescription>
              Choose export format and select fields to include
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                {['csv', 'excel', 'json'].map((format) => (
                  <Button
                    key={format}
                    variant={exportFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Include Fields</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllFields}>
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                {exportFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm font-normal">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Scope */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                {selectedSubscribers.length > 0
                  ? `Exporting ${selectedSubscribers.length} selected subscribers`
                  : 'Exporting all subscribers'
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={selectedFields.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}