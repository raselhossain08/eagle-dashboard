// components/files/files-grid-view.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  MoreVertical,
  Folder 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export interface FileItem {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
  thumbnailUrl?: string;
}

interface FilesGridViewProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFilePreview?: (file: FileItem) => void;
  selectedFiles: string[];
  viewMode: 'grid' | 'list';
  isLoading?: boolean;
}

export function FilesGridView({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onFileRename,
  onFilePreview,
  selectedFiles,
  viewMode,
  isLoading = false
}: FilesGridViewProps) {
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const { theme } = useTheme();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (fileType.includes('document') || fileType.includes('word')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

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
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className={cn(
            "animate-pulse",
            theme === 'dark' ? "bg-gray-800 border-gray-700" : ""
          )}>
            <CardContent className="p-4 space-y-3">
              <div className={cn(
                "w-full h-32 rounded",
                theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
              )} />
              <div className={cn(
                "w-3/4 h-4 rounded",
                theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
              )} />
              <div className={cn(
                "w-1/2 h-3 rounded",
                theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
              )} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className={cn(
        "text-center py-12",
        theme === 'dark' ? "bg-gray-800 border-gray-700" : ""
      )}>
        <CardContent>
          <Folder className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === 'dark' ? "text-gray-500" : "text-gray-400"
          )} />
          <h3 className={cn(
            "text-lg font-medium mb-2",
            theme === 'dark' ? "text-gray-300" : "text-gray-900"
          )}>
            No files found
          </h3>
          <p className={cn(
            "text-sm",
            theme === 'dark' ? "text-gray-400" : "text-gray-500"
          )}>
            Upload some files to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => (
        <Card
          key={file.id}
          className={cn(
            "group cursor-pointer transition-all hover:shadow-md",
            theme === 'dark' ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "hover:border-gray-300",
            selectedFiles.includes(file.id) && "ring-2 ring-blue-500 border-blue-500"
          )}
          onClick={() => onFileSelect(file)}
        >
          <CardContent className="p-3 space-y-2">
            {/* File Header */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => onFileSelect(file)}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu open
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* File Icon/Thumbnail */}
            <div 
              className="flex justify-center py-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onFilePreview?.(file);
              }}
            >
              {file.thumbnailUrl ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                getFileIcon(file.type)
              )}
            </div>

            {/* File Info */}
            <div className="space-y-1">
              <p className={cn(
                "text-sm font-medium truncate text-center",
                theme === 'dark' ? "text-gray-200" : "text-gray-900"
              )}>
                {file.name}
              </p>
              <div className={cn(
                "text-xs text-center",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                <div>{formatFileSize(file.size)}</div>
                <div>{formatDate(file.lastModified)}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDownload(file.id);
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}