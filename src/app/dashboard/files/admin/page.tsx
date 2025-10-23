// app/dashboard/files/admin/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FileListView } from '@/components/files/file-list-view';
import { FileSearchFilter } from '@/components/files/file-search-filter';
import { StorageQuotaDisplay } from '@/components/files/storage-quota-display';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Download, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAllFiles, useSystemAnalytics } from '@/hooks/use-files';
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

  // Build query params
  const queryParams: FilesQueryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    type: fileType === 'all' ? undefined : fileType,
    sortBy,
    sortOrder
  };

  // Fetch real data
  const { 
    data: filesData, 
    isLoading: filesLoading, 
    error: filesError,
    refetch: refetchFiles 
  } = useAllFiles(queryParams);

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useSystemAnalytics();

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
      await refetchFiles();
      toast.success('Files list refreshed');
    } catch (error) {
      toast.error('Failed to refresh files');
    }
  };

  const handleExport = () => {
    // Export functionality
    toast.info('Export functionality will be implemented');
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
      <Button variant="outline" size="sm" onClick={handleRefresh} disabled={filesLoading}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
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
        
        {/* Error States */}
        {(filesError || analyticsError) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {filesError ? `Files: ${filesError.message}` : `Analytics: ${analyticsError?.message}`}
            </AlertDescription>
          </Alert>
        )}
        
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
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <FileListView
                    files={filteredFiles}
                    onFileSelect={handleFileSelect}
                    onFileDelete={(id) => console.log('Delete:', id)}
                    onFileDownload={(id) => console.log('Download:', id)}
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
                <h3 className="font-semibold">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files</span>
                    <span className="font-medium">
                      {analyticsLoading ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        analyticsData?.totalFiles || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-medium">
                      {analyticsData?.topUsers?.length || 0}
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
          </div>
        </div>
      </div>
    </FilesDashboardShell>
  );
}