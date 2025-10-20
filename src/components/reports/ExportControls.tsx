'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Sheet, Table } from 'lucide-react';
import { ExportFormat } from '@/types/reports';

interface ExportControlsProps {
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
}

export function ExportControls({ onExport, isLoading = false }: ExportControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { format: 'pdf' as ExportFormat, label: 'PDF Report', icon: FileText },
    { format: 'excel' as ExportFormat, label: 'Excel File', icon: Sheet },
    { format: 'csv' as ExportFormat, label: 'CSV Data', icon: Table },
  ];

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}