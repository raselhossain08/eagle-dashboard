// components/files/file-upload-zone.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadZoneProps {
  onUpload: (files: File[], purpose?: string) => Promise<void>;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  purpose?: string;
}

export function FileUploadZone({
  onUpload,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  disabled = false,
  purpose
}: FileUploadZoneProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { theme } = useTheme();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    const newUploads: UploadFile[] = acceptedFiles.slice(0, maxFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);
    setIsUploading(true);

    try {
      await onUpload(acceptedFiles.slice(0, maxFiles), purpose);
      
      // Simulate upload progress (replace with actual progress tracking)
      newUploads.forEach((upload, index) => {
        setTimeout(() => {
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress: 100, status: 'completed' } : u
          ));
        }, index * 500);
      });
    } catch (error) {
      newUploads.forEach(upload => {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'error', error: 'Upload failed' } : u
        ));
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, maxFiles, disabled, purpose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    disabled: disabled || isUploading
  });

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        theme === 'dark' ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50",
        isDragActive && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className={cn(
              "w-12 h-12",
              theme === 'dark' ? "text-gray-400" : "text-gray-500"
            )} />
            <div>
              <p className={cn(
                "text-lg font-medium mb-2",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                or click to browse. Max {maxFiles} files, {maxSize / 1024 / 1024}MB each
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Card className={theme === 'dark' ? "bg-gray-800 border-gray-700" : ""}>
          <CardContent className="p-4 space-y-3">
            <h3 className={cn(
              "font-medium text-sm",
              theme === 'dark' ? "text-gray-300" : "text-gray-700"
            )}>
              Upload Progress
            </h3>
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {getStatusIcon(upload.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      theme === 'dark' ? "text-gray-200" : "text-gray-900"
                    )}>
                      {upload.file.name}
                    </p>
                    <span className={cn(
                      "text-xs",
                      theme === 'dark' ? "text-gray-400" : "text-gray-500"
                    )}>
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Progress value={upload.progress} className="h-2" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUpload(upload.id)}
                  disabled={upload.status === 'uploading'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}