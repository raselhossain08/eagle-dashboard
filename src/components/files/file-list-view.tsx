// components/files/file-list-view.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileText, Image, Download, Trash2, MoreVertical } from 'lucide-react';
import { FileItem } from '@/types/files';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface FileListViewProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (fileId: string) => void;
  sortBy: 'name' | 'size' | 'date' | 'type';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'size' | 'date' | 'type') => void;
  isLoading?: boolean;
}

export function FileListView({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false
}: FileListViewProps) {
  const { theme } = useTheme();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const SortableHeader = ({ field, children }: { field: 'name' | 'size' | 'date' | 'type', children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === field && (
          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn(
            "h-12 rounded animate-pulse",
            theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
          )} />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <SortableHeader field="name">Name</SortableHeader>
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="size">Size</SortableHeader>
            <SortableHeader field="date">Modified</SortableHeader>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="group">
              <TableCell>
                <Checkbox
                  onCheckedChange={() => onFileSelect(file)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <span className="font-medium">{file.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {file.type}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(file.lastModified)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileDownload(file.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileDelete(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}