// components/files/storage-analytics-dashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DonutChart } from '@/components/charts/donut-chart';
import { useTheme } from 'next-themes';

interface StorageAnalyticsDashboardProps {
  data: {
    totalFiles: number;
    totalSize: number;
    fileTypes: Array<{ type: string; count: number; size: number }>;
    uploadTrends: Array<{ date: string; uploads: number; totalSize: number }>;
    topUsers: Array<{ userId: string; fileCount: number; totalSize: number }>;
    storageGrowth: Array<{ date: string; totalSize: number; totalFiles: number }>;
  };
  dateRange?: { from?: Date; to?: Date };
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

  // Prepare data for charts
  const donutData = data.fileTypes.map((fileType, index) => ({
    name: fileType.type,
    value: fileType.size,
    count: fileType.count,
    color: `hsl(${index * 45}, 70%, 50%)`
  }));

  const uploadTrendsChartData = data.uploadTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    uploads: trend.uploads,
    size: Math.round(trend.totalSize / (1024 * 1024)) // Convert to MB
  }));

  const topUsersChartData = data.topUsers.slice(0, 10).map(user => ({
    name: user.userId.substring(0, 8) + '...',
    files: user.fileCount,
    size: Math.round(user.totalSize / (1024 * 1024)) // Convert to MB
  }));

  const storageGrowthChartData = data.storageGrowth.map(growth => ({
    date: new Date(growth.date).toLocaleDateString(),
    totalSize: Math.round(growth.totalSize / (1024 * 1024)), // Convert to MB
    totalFiles: growth.totalFiles
  }));

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
              {data.totalFiles > 0 ? formatFileSize(data.totalSize / data.totalFiles) : '0 Bytes'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>File Type Distribution</CardTitle>
            <CardDescription>Storage breakdown by file type</CardDescription>
          </CardHeader>
          <CardContent>
            {donutData.length > 0 ? (
              <DonutChart
                data={donutData}
                title=""
                valueFormatter={(value) => formatFileSize(value)}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No file type data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Trends</CardTitle>
            <CardDescription>Daily upload activity</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadTrendsChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px] overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Uploads</th>
                        <th className="text-left p-2">Size (MB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadTrendsChartData.slice(-10).map((trend, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{trend.date}</td>
                          <td className="p-2">{trend.uploads}</td>
                          <td className="p-2">{trend.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No upload trends data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Storage</CardTitle>
            <CardDescription>Users with highest storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            {topUsersChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Files</th>
                        <th className="text-left p-2">Size (MB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsersChartData.map((user, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono text-xs">{user.name}</td>
                          <td className="p-2">{user.files}</td>
                          <td className="p-2">{user.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Growth</CardTitle>
            <CardDescription>Storage and file count over time</CardDescription>
          </CardHeader>
          <CardContent>
            {storageGrowthChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px] overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Size (MB)</th>
                        <th className="text-left p-2">Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storageGrowthChartData.slice(-10).map((growth, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{growth.date}</td>
                          <td className="p-2">{growth.totalSize}</td>
                          <td className="p-2">{growth.totalFiles}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No storage growth data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed File Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed File Type Breakdown</CardTitle>
          <CardDescription>Complete breakdown by file type</CardDescription>
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
                  <span className="text-sm text-muted-foreground min-w-[3rem]">
                    {((fileType.size / data.totalSize) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}