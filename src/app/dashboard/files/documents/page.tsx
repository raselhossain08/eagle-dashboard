// app/dashboard/files/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FilesGridView } from '@/components/files/files-grid-view';
import { FilePreviewModal } from '@/components/files/file-preview-modal';
import { FileUploadZone } from '@/components/files/file-upload-zone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Grid3X3, List, Plus, Upload, AlertTriangle, FileText, HardDrive, Download, RefreshCw } from 'lucide-react';
import { FileItem } from '@/types/files';
import { 
  useFiles, 
  useFileUpload, 
  useMultipleFileUpload, 
  useFileDelete, 
  useBulkDelete, 
  useFileRename, 
  useDownloadUrl, 
  usePreviewUrl,
  useStorageAnalytics
} from '@/hooks/use-files';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const pageSize = 20;

  // Filter for document files only
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];

  // Fetch files with real API and enhanced error handling
  const { 
    data: filesData, 
    isLoading, 
    error, 
    refetch 
  } = useFiles({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    type: 'document' // Filter for documents only
  });

  // Mutations and Analytics
  const fileUpload = useFileUpload();
  const multipleFileUpload = useMultipleFileUpload();
  const deleteFile = useFileDelete();
  const bulkDelete = useBulkDelete();
  const renameFile = useFileRename();

  // Real storage analytics for documents
  const { 
    data: storageAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useStorageAnalytics();

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
        refetchAnalytics();
      }, 2 * 60 * 1000); // Refresh every 2 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch, refetchAnalytics]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Documents' }
  ];

  // Filter files for documents only (client-side filter as backup)
  const documentFiles = (filesData?.files || []).filter(file => 
    documentTypes.some(type => file.type.includes(type.split('/')[1]) || file.type === type)
  );

  const handleFileSelect = (file: FileItem) => {
    setSelectedFiles(prev =>
      prev.includes(file.id)
        ? prev.filter(id => id !== file.id)
        : [...prev, file.id]
    );
  };

  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const fileToDelete = documentFiles.find(f => f.id === fileId);
      if (!fileToDelete) {
        toast.error('File not found');
        return;
      }

      await deleteFile.mutateAsync(fileToDelete.key);
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      refetch();
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  };

  const handleFileDownload = async (fileId: string) => {
    try {
      const fileToDownload = documentFiles.find(f => f.id === fileId);
      if (!fileToDownload) {
        toast.error('Document not found');
        return;
      }

      toast.info('Preparing download...');

      // Get auth token for direct API call
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      
      if (!token) {
        toast.error('Authentication required for download');
        return;
      }

      // Get download URL from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Download request failed');
      }

      const data = await response.json();
      
      if (data.url) {
        const link = document.createElement('a');
        link.href = data.url;
        link.download = fileToDownload.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started successfully');
      } else {
        toast.error('Download URL not available');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document');
      console.error('Download failed:', error);
    }
  };

  const handleFileRename = async (fileId: string, newName: string) => {
    try {
      await renameFile.mutateAsync({ fileId, newName });
      refetch();
    } catch (error: any) {
      console.error('Rename failed:', error);
    }
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadZone = async (files: File[], purpose?: string) => {
    try {
      if (files.length === 1) {
        await fileUpload.mutateAsync({ 
          file: files[0], 
          purpose: purpose || 'documents' 
        });
      } else {
        await multipleFileUpload.mutateAsync({ 
          files: files, 
          purpose: purpose || 'documents' 
        });
      }
      refetch();
      setShowUploadModal(false);
    } catch (error: any) {
      console.error('Upload failed:', error);
      throw error; // Re-throw so FileUploadZone can handle it
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    try {
      const keysToDelete = documentFiles
        .filter(file => selectedFiles.includes(file.id))
        .map(file => file.key);

      await bulkDelete.mutateAsync(keysToDelete);
      setSelectedFiles([]);
      refetch();
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    try {
      // Download each file individually
      for (const fileId of selectedFiles) {
        await handleFileDownload(fileId);
      }
    } catch (error: any) {
      console.error('Bulk download failed:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetch(),
        refetchAnalytics()
      ]);
      toast.success('Documents refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh documents');
    }
  };

  const handleExport = async () => {
    try {
      // Get auth token
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      
      if (!token) {
        toast.error('Authentication required for export');
        return;
      }

      // Build export parameters
      const exportParams = new URLSearchParams();
      if (searchQuery) exportParams.append('search', searchQuery);
      exportParams.append('type', 'document');
      exportParams.append('format', 'csv');

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
        link.download = data.filename || `documents-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${data.recordCount || 0} documents successfully`);
      } else {
        toast.warning('No documents to export');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export documents');
    }
  };

  // Calculate document-specific statistics
  const documentStats = {
    totalDocuments: documentFiles.length,
    totalSize: documentFiles.reduce((sum, file) => sum + (file.size || 0), 0),
    avgSize: documentFiles.length > 0 ? documentFiles.reduce((sum, file) => sum + (file.size || 0), 0) / documentFiles.length : 0,
    typeDistribution: documentFiles.reduce((acc, file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <>
      <FilesDashboardShell
        title="Documents"
        description="Manage your documents and files"
        breadcrumbs={breadcrumbs}
        actions={
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
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogTrigger asChild>
                <Button disabled={fileUpload.isPending || multipleFileUpload.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                </DialogHeader>
                <FileUploadZone
                  onUpload={handleUploadZone}
                  acceptedTypes={[
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain',
                    'text/csv'
                  ]}
                  maxSize={50 * 1024 * 1024} // 50MB for documents
                  maxFiles={20}
                  disabled={fileUpload.isPending || multipleFileUpload.isPending}
                  purpose="documents"
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        <div className="space-y-6">
          <FilesNavigation />

          {/* Error States with Retry */}
          {(error || analyticsError) && (
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  {error && <div>Documents: {error.message}</div>}
                  {analyticsError && <div>Analytics: {analyticsError.message}</div>}
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Document Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        documentStats.totalDocuments.toLocaleString()
                      )}
                    </p>
                    <p className="text-muted-foreground">Total Documents</p>
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
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        `${(documentStats.totalSize / (1024 ** 2)).toFixed(1)} MB`
                      )}
                    </p>
                    <p className="text-muted-foreground">Total Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Upload className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        `${(documentStats.avgSize / 1024).toFixed(1)} KB`
                      )}
                    </p>
                    <p className="text-muted-foreground">Avg Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Grid3X3 className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        Object.keys(documentStats.typeDistribution).length
                      )}
                    </p>
                    <p className="text-muted-foreground">File Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Type Distribution */}
          {!isLoading && Object.keys(documentStats.typeDistribution).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(documentStats.typeDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.toUpperCase()}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div className="w-full h-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Grid with Enhanced States */}
          {!isLoading && !error && (
            <>
              {documentFiles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? `No documents match "${searchQuery}". Try adjusting your search terms.`
                        : 'You haven\'t uploaded any documents yet. Start by uploading your first document.'
                      }
                    </p>
                    {searchQuery ? (
                      <Button onClick={() => handleSearch('')} variant="outline">
                        Clear Search
                      </Button>
                    ) : (
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Documents
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <FilesGridView
                  files={documentFiles}
                  onFileSelect={handleFileSelect}
                  onFileDelete={handleFileDelete}
                  onFileDownload={handleFileDownload}
                  onFileRename={handleFileRename}
                  onFilePreview={handleFilePreview}
                  selectedFiles={selectedFiles}
                  viewMode={viewMode}
                  isLoading={isLoading}
                />
              )}
            </>
          )}

          {/* Pagination */}
          {filesData && filesData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filesData.total)} of {filesData.total} documents
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, filesData.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > filesData.totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
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

          {/* Enhanced Selected Files Actions */}
          {selectedFiles.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl border bg-background z-50 min-w-[400px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedFiles.length}
                  </Badge>
                  <span className="text-sm font-medium">
                    document{selectedFiles.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDownload}
                    disabled={selectedFiles.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDelete.isPending || selectedFiles.length === 0}
                  >
                    {bulkDelete.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Delete All
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FilesDashboardShell>

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={() => previewFile && handleFileDownload(previewFile.id)}
        onDelete={() => previewFile && handleFileDelete(previewFile.id)}
      />
    </>
  );
}