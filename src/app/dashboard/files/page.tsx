// app/dashboard/files/page.tsx - CONVERTED TO REAL API
'use client';

import { useState, useMemo } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FilesGridView } from '@/components/files/files-grid-view';
import { FileListView } from '@/components/files/file-list-view';
import { FileSearchFilter } from '@/components/files/file-search-filter';
import { FileActionsToolbar } from '@/components/files/file-actions-toolbar';
import { FolderTree } from '@/components/files/folder-tree';
import { StorageQuotaDisplay } from '@/components/files/storage-quota-display';
import { FilePreviewModal } from '@/components/files/file-preview-modal';
import { FileUploadZone } from '@/components/files/file-upload-zone';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFiles, useFileDelete, useBulkDelete, useFileRename, useFileUpload, useMultipleFileUpload, useFolders, useCreateFolder, useStorageQuota, useStorageAnalytics } from '@/hooks/use-files';
import { FileItem } from '@/types/files';
import { FilesQueryParams } from '@/lib/api/files.service';
import { Plus, Grid3X3, List, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FilesPage() {
  // State management
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: Date; to?: Date }>({});
  const [sizeRangeFilter, setSizeRangeFilter] = useState<[number, number]>([0, 100 * 1024 * 1024]);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Query parameters for API
  const queryParams: FilesQueryParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
    type: fileTypeFilter !== 'all' ? fileTypeFilter : undefined,
    sortBy,
    sortOrder,
    fromDate: dateRangeFilter.from,
    toDate: dateRangeFilter.to,
    minSize: sizeRangeFilter[0] > 0 ? sizeRangeFilter[0] : undefined,
    maxSize: sizeRangeFilter[1] < 100 * 1024 * 1024 ? sizeRangeFilter[1] : undefined,
  }), [currentPage, searchQuery, fileTypeFilter, sortBy, sortOrder, dateRangeFilter, sizeRangeFilter]);

  // API hooks
  const { data: filesData, isLoading: filesLoading, error: filesError, refetch: refetchFiles } = useFiles(queryParams);
  const { data: foldersData, isLoading: foldersLoading } = useFolders();
  const { data: storageQuota } = useStorageQuota();
  const { data: storageAnalytics } = useStorageAnalytics();
  
  // Mutations
  const deleteFile = useFileDelete();
  const bulkDelete = useBulkDelete();
  const renameFile = useFileRename();
  const fileUpload = useFileUpload();
  const multipleFileUpload = useMultipleFileUpload();
  const createFolder = useCreateFolder();

  const files = filesData?.files || [];
  const totalFiles = filesData?.total || 0;
  const folders = foldersData || [];

  // Event handlers
  const handleFileSelect = (file: FileItem) => {
    if (selectedFiles.includes(file.id)) {
      setSelectedFiles(prev => prev.filter(id => id !== file.id));
    } else {
      setSelectedFiles(prev => [...prev, file.id]);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const file = files.find((f: FileItem) => f.id === fileId);
      if (file) {
        await deleteFile.mutateAsync(file.key);
        refetchFiles();
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  };

  const handleFileDownload = (fileId: string) => {
    const file = files.find((f: FileItem) => f.id === fileId);
    if (file) {
      // Create download link
      const link = document.createElement('a');
      link.href = `/api/files/download/${fileId}`;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  const handleFileRename = async (fileId: string, newName: string) => {
    try {
      await renameFile.mutateAsync({ fileId, newName });
      refetchFiles();
    } catch (error: any) {
      console.error('Rename failed:', error);
    }
  };

  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleBulkDownload = () => {
    selectedFiles.forEach(fileId => {
      handleFileDownload(fileId);
    });
  };

  const handleBulkDelete = async () => {
    try {
      const filesToDelete = files.filter((f: FileItem) => selectedFiles.includes(f.id));
      const keys = filesToDelete.map((f: FileItem) => f.key);
      await bulkDelete.mutateAsync(keys);
      setSelectedFiles([]);
      refetchFiles();
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkMove = (targetFolder: string) => {
    console.log('Move files to folder:', targetFolder, selectedFiles);
    // TODO: Implement bulk move functionality
  };

  const handleSelectAll = () => {
    setSelectedFiles(files.map((f: FileItem) => f.id));
  };

  const handleDeselectAll = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async (files: File[], purpose?: string) => {
    try {
      if (files.length === 1) {
        await fileUpload.mutateAsync({ file: files[0], purpose });
      } else {
        await multipleFileUpload.mutateAsync({ files, purpose });
      }
      refetchFiles();
      setShowUploadModal(false);
    } catch (error: any) {
      console.error('Upload failed:', error);
    }
  };

  const handleFolderCreate = async (parentId: string, name: string) => {
    try {
      await createFolder.mutateAsync({ name, parentPath: parentId !== 'root' ? parentId : undefined });
      // Refetch folders would happen here if we had a folders refetch function
    } catch (error: any) {
      console.error('Create folder failed:', error);
    }
  };

  const handleSorting = (field: 'name' | 'size' | 'date' | 'type') => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
  };

  // Filter files based on current tab
  const filteredFiles = files.filter((file: FileItem) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.type.includes(fileTypeFilter);
    const matchesSize = file.size >= sizeRangeFilter[0] && file.size <= sizeRangeFilter[1];
    
    let matchesDate = true;
    if (dateRangeFilter.from && file.lastModified < dateRangeFilter.from) matchesDate = false;
    if (dateRangeFilter.to && file.lastModified > dateRangeFilter.to) matchesDate = false;
    
    let matchesTab = true;
    if (activeTab === 'recent') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchesTab = file.lastModified > weekAgo;
    }
    // TODO: Add favorites filter when favorites are implemented
    
    return matchesSearch && matchesType && matchesSize && matchesDate && matchesTab;
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files' }
  ];

  // Loading and error states
  if (filesLoading) {
    return (
      <FilesDashboardShell
        title="Files Management"
        description="Manage and organize your files"
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </FilesDashboardShell>
    );
  }

  if (filesError) {
    return (
      <FilesDashboardShell
        title="Files Management"
        description="Manage and organize your files"
        breadcrumbs={breadcrumbs}
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load files. Please try again later.
          </AlertDescription>
        </Alert>
      </FilesDashboardShell>
    );
  }

  return (
    <>
      <FilesDashboardShell
        title="Files Management"
        description="Manage and organize your files"
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <FileUploadZone
                onUpload={handleUpload}
                acceptedTypes={['*/*']}
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={10}
              />
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          <FilesNavigation />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <FileSearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                fileType={fileTypeFilter}
                onFileTypeChange={setFileTypeFilter}
                dateRange={{ from: dateRangeFilter.from, to: dateRangeFilter.to }}
                onDateRangeChange={setDateRangeFilter}
                sizeRange={sizeRangeFilter}
                onSizeRangeChange={setSizeRangeFilter}
                onReset={() => {
                  setSearchQuery('');
                  setFileTypeFilter('all');
                  setDateRangeFilter({});
                  setSizeRangeFilter([0, 100 * 1024 * 1024]);
                }}
              />

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="all">All Files</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="favorites">Favorites</TabsTrigger>
                      </TabsList>
                    </Tabs>

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

                  {viewMode === 'grid' ? (
                    <FilesGridView
                      files={filteredFiles}
                      onFileSelect={handleFileSelect}
                      onFileDelete={handleFileDelete}
                      onFileDownload={handleFileDownload}
                      onFileRename={handleFileRename}
                      selectedFiles={selectedFiles}
                      viewMode={viewMode}
                    />
                  ) : (
                    <FileListView
                      files={filteredFiles}
                      onFileSelect={handleFileSelect}
                      onFileDelete={handleFileDelete}
                      onFileDownload={handleFileDownload}
                      sortBy={sortBy === 'date' ? 'date' : sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSorting}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {!foldersLoading && (
                <FolderTree
                  folders={folders}
                  selectedFolder="root"
                  onFolderSelect={(folderId) => console.log('Selected folder:', folderId)}
                  onFolderCreate={handleFolderCreate}
                  onFolderDelete={(folderId) => console.log('Delete folder:', folderId)}
                  onFolderRename={(folderId, newName) => console.log('Rename folder:', folderId, newName)}
                  expandedFolders={[]}
                  onToggleExpand={(folderId) => console.log('Toggle folder:', folderId)}
                />
              )}

              {storageQuota && (
                <StorageQuotaDisplay
                  used={storageQuota.used / (1024 * 1024 * 1024)} // Convert to GB
                  total={storageQuota.total / (1024 * 1024 * 1024)} // Convert to GB
                  unit="GB"
                  breakdown={[]}
                  showDetails={true}
                />
              )}
            </div>
          </div>
        </div>
      </FilesDashboardShell>

      {/* Global Components */}
      <FileActionsToolbar
        selectedFiles={selectedFiles}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        totalFiles={totalFiles}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={showPreview}
        onClose={() => {
          setPreviewFile(null);
          setShowPreview(false);
        }}
        onDownload={() => previewFile && handleFileDownload(previewFile.id)}
        onDelete={() => previewFile && handleFileDelete(previewFile.id)}
        showNavigation={filteredFiles.length > 1}
        onNext={() => {
          if (!previewFile) return;
          const currentIndex = filteredFiles.findIndex((f: FileItem) => f.id === previewFile.id);
          const nextIndex = (currentIndex + 1) % filteredFiles.length;
          setPreviewFile(filteredFiles[nextIndex]);
        }}
        onPrevious={() => {
          if (!previewFile) return;
          const currentIndex = filteredFiles.findIndex((f: FileItem) => f.id === previewFile.id);
          const prevIndex = (currentIndex - 1 + filteredFiles.length) % filteredFiles.length;
          setPreviewFile(filteredFiles[prevIndex]);
        }}
      />
    </>
  );
}