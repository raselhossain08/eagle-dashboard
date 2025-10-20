// app/dashboard/users/components/UserExport.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Sheet, File, Check } from 'lucide-react';

interface UserExportProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
}

export function UserExport({ onExport }: UserExportProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(format);
    try {
      await onExport(format);
      // Success handling would be here
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const getExportIcon = (format: string) => {
    if (exporting === format) {
      return <Check className="h-4 w-4 mr-2" />;
    }
    switch (format) {
      case 'csv': return <FileText className="h-4 w-4 mr-2" />;
      case 'excel': return <Sheet className="h-4 w-4 mr-2" />;
      case 'pdf': return <File className="h-4 w-4 mr-2" />;
      default: return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!!exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? `Exporting ${exporting.toUpperCase()}...` : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          {getExportIcon('csv')}
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          {getExportIcon('excel')}
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          {getExportIcon('pdf')}
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}