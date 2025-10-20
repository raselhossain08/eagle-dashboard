// components/files/storage-analytics-dashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheme } from 'next-themes';

interface StorageAnalyticsDashboardProps {
  data: {
    totalFiles: number;
    totalSize: number;
    fileTypes: Array<{ type: string; count: number; size: number }>;
    uploadTrends: Array<{ date: string; uploads: number; size: number }>;
    topUsers: Array<{ userId: string; fileCount: number; totalSize: number }>;
    storageGrowth: Array<{ date: string; totalSize: number }>;
  };
  dateRange: { from: Date; to: Date };
  isLoading?: boolean;
}

export function StorageAnalyticsDashboard({
  data,
  dateRange,
  isLoading = false
}: StorageAnalyticsDashboardProps) {
  const { theme } = useTheme();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const storageLimit = 100 * 1024 * 1024 * 1024; // 100GB
  const storageUsed = data.totalSize;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <CardDescription>All stored files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFiles.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <CardDescription>Total space utilized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(storageUsed)}</div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {storagePercentage.toFixed(1)}% of {formatFileSize(storageLimit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">File Types</CardTitle>
            <CardDescription>Different formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.fileTypes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique file types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg File Size</CardTitle>
            <CardDescription>Average per file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(data.totalSize / data.totalFiles)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>File Type Distribution</CardTitle>
          <CardDescription>Breakdown by file type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.fileTypes.map((fileType, index) => (
              <div key={fileType.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                    }}
                  />
                  <span className="font-medium">{fileType.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {fileType.count} files
                  </span>
                  <span className="font-medium">
                    {formatFileSize(fileType.size)}
                  </span>
                  <div className="w-32">
                    <Progress 
                      value={(fileType.size / data.totalSize) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}