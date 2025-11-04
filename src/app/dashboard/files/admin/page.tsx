// app/dashboard/files/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FileListView } from '@/components/files/file-list-view';
import { FileSearchFilter } from '@/components/files/file-search-filter';
import { StorageQuotaDisplay } from '@/components/files/storage-quota-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, Download, Trash2, RefreshCw, AlertTriangle, Calendar, FileText, HardDrive, TrendingUp } from 'lucide-react';
import { useAllFiles, useSystemAnalytics, useUsageTrends, useUserAnalytics } from '@/hooks/use-files';
import { FilesQueryParams } from '@/lib/api/files.service';
import { toast } from 'sonner';

export default function AdminFileManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileType, setFileType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: undefined as Date | undefined, to: undefined as Date | undefined });
  const [sizeRange, setSizeRange] = useState<[number, number]>([0, 100 * 1024 * 1024]);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Build query params
  const queryParams: FilesQueryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    type: fileType === 'all' ? undefined : fileType,
    sortBy,
    sortOrder
  };

  // Fetch real data with enhanced analytics
  const { 
    data: filesData, 
    isLoading: filesLoading, 
    error: filesError,
    refetch: refetchFiles 
  } = useAllFiles(queryParams);

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useSystemAnalytics();

  const { 
    data: trendsData, 
    isLoading: trendsLoading, 
    error: trendsError,
    refetch: refetchTrends 
  } = useUsageTrends();

  const { 
    data: userAnalyticsData, 
    isLoading: userAnalyticsLoading, 
    error: userAnalyticsError,
    refetch: refetchUserAnalytics 
  } = useUserAnalytics();

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetchFiles();
        refetchAnalytics();
        refetchTrends();
        refetchUserAnalytics();
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetchFiles, refetchAnalytics, refetchTrends, refetchUserAnalytics]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Admin' }
  ];

  const handleFileSelect = (file: any) => {
    setSelectedFiles(prev =>
      prev.includes(file.id)
        ? prev.filter(id => id !== file.id)
        : [...prev, file.id]
    );
  };

  const handleSort = (field: 'name' | 'size' | 'date' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFileType('all');
    setDateRange({ from: undefined, to: undefined });
    setSizeRange([0, 100 * 1024 * 1024]);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchFiles(),
        refetchAnalytics(),
        refetchTrends(),
        refetchUserAnalytics()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const setDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    setDateRange({ from, to });
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Build export parameters
      const exportParams = new URLSearchParams();
      if (searchQuery) exportParams.append('search', searchQuery);
      if (fileType !== 'all') exportParams.append('type', fileType);
      if (dateRange.from) exportParams.append('from', dateRange.from.toISOString());
      if (dateRange.to) exportParams.append('to', dateRange.to.toISOString());
      exportParams.append('format', 'csv');

      // Get auth token
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      
      if (!token) {
        toast.error('Authentication required for export');
        return;
      }
      
      // Fetch export data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/files/admin/export?${exportParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Export request failed');
      }
      
      const data = await response.json();
      
      // Create and download file
      if (data.content) {
        const blob = new Blob([data.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || `admin-files-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${data.recordCount || 0} files successfully`);
      } else {
        toast.warning('No data to export');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export files');
    } finally {
      setExportLoading(false);
    }
  };

  // Filter files by additional criteria (size, date) since backend doesn't support these yet
  const filteredFiles = filesData?.files?.filter(file => {
    const matchesSize = file.size >= sizeRange[0] && file.size <= sizeRange[1];
    
    let matchesDate = true;
    if (dateRange.from && file.lastModified < dateRange.from) matchesDate = false;
    if (dateRange.to && file.lastModified > dateRange.to) matchesDate = false;
    
    return matchesSize && matchesDate;
  }) || [];

  // Calculate storage breakdown for display
  const storageBreakdown = analyticsData?.fileTypes?.map(type => ({
    type: type.type,
    size: type.size,
    color: '#3b82f6' // Default color, could be mapped better
  })) || [];

  const totalStorageUsed = analyticsData?.totalSize || 0;
  const storageUsedGB = totalStorageUsed / (1024 * 1024 * 1024);

  const actions = (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-xs text-muted-foreground">Auto-refresh:</span>
        <Button
          variant={autoRefresh ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? 'On' : 'Off'}
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={handleRefresh} disabled={filesLoading || analyticsLoading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${filesLoading || analyticsLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={exportLoading}>
        <Download className={`w-4 h-4 mr-2 ${exportLoading ? 'animate-spin' : ''}`} />
        {exportLoading ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );

  return (
    <FilesDashboardShell
      title="Admin File Management"
      description="Manage all files across the system"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        <FilesNavigation />
        
        {/* Error States with Retry */}
        {(filesError || analyticsError || trendsError || userAnalyticsError) && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                {filesError && <div>Files: {filesError.message}</div>}
                {analyticsError && <div>Analytics: {analyticsError.message}</div>}
                {trendsError && <div>Trends: {trendsError.message}</div>}
                {userAnalyticsError && <div>User Analytics: {userAnalyticsError.message}</div>}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Date Range Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Quick Date Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setDatePreset(7)}>
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDatePreset(30)}>
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDatePreset(90)}>
                Last 90 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                All time
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      analyticsData?.totalFiles?.toLocaleString() || 0
                    )}
                  </p>
                  <p className="text-muted-foreground">Total Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HardDrive className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      `${((analyticsData?.totalSize || 0) / (1024 ** 3)).toFixed(1)} GB`
                    )}
                  </p>
                  <p className="text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {userAnalyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      userAnalyticsData?.users?.length || 0
                    )}
                  </p>
                  <p className="text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {trendsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      trendsData?.[0]?.uploads || 0
                    )}
                  </p>
                  <p className="text-muted-foreground">Today's Uploads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="files">
              <TabsList>
                <TabsTrigger value="files">All Files</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="system">System Operations</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="space-y-4">
                <FileSearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  fileType={fileType}
                  onFileTypeChange={setFileType}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  sizeRange={sizeRange}
                  onSizeRangeChange={setSizeRange}
                  onReset={handleResetFilters}
                />

                {filesLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-sm text-muted-foreground">Loading files...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : filesError ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Failed to Load Files</h3>
                      <p className="text-muted-foreground mb-4">{filesError.message}</p>
                      <Button onClick={() => refetchFiles()} variant="outline">
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredFiles.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery || fileType !== 'all' || dateRange.from || dateRange.to
                          ? 'No files match your current filters.'
                          : 'No files have been uploaded yet.'
                        }
                      </p>
                      {(searchQuery || fileType !== 'all' || dateRange.from || dateRange.to) && (
                        <Button onClick={handleResetFilters} variant="outline" className="mt-3">
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <FileListView
                    files={filteredFiles}
                    onFileSelect={handleFileSelect}
                    onFileDelete={(id) => {
                      toast.info('File deletion will be implemented');
                      console.log('Delete:', id);
                    }}
                    onFileDownload={(id) => {
                      toast.info('File download will be implemented');
                      console.log('Download:', id);
                    }}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                )}

                {/* Pagination */}
                {filesData && filesData.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filesData.total)} of {filesData.total} files
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {filesData.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= filesData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Users className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium">User Management</h3>
                        <p className="text-muted-foreground">
                          Manage user storage quotas and permissions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Trash2 className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium">System Operations</h3>
                        <p className="text-muted-foreground">
                          System maintenance and cleanup operations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {analyticsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : (
              <StorageQuotaDisplay
                used={parseFloat(storageUsedGB.toFixed(2))}
                total={100}
                unit="GB"
                breakdown={storageBreakdown}
                showDetails={true}
              />
            )}

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">System Overview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files</span>
                    <span className="font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        analyticsData?.totalFiles?.toLocaleString() || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-medium">
                      {userAnalyticsLoading ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        userAnalyticsData?.users?.length || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span className="font-medium">
                      {storageUsedGB.toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Types</span>
                    <span className="font-medium">
                      {analyticsData?.fileTypes?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Types Breakdown */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">File Types Distribution</h3>
                {analyticsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData?.fileTypes?.slice(0, 6).map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {type.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{type.count}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {((type.size || 0) / (1024 ** 2)).toFixed(1)} MB
                        </span>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No file types data available
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Top Users by Storage</h3>
                {userAnalyticsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userAnalyticsData?.users?.slice(0, 5).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            User {user.userId}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{user.fileCount}</div>
                          <div className="text-xs text-muted-foreground">
                            {((user.totalSize || 0) / (1024 ** 2)).toFixed(1)} MB
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No user data available
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FilesDashboardShell>
  );
}