// app/dashboard/files/page.tsx - UPDATED WITH ALL COMPONENTS
'use client';

import { useState, useEffect } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FilesGridView } from '@/components/files/files-grid-view';
import { FileListView } from '@/components/files/file-list-view';
import { FileSearchFilter } from '@/components/files/file-search-filter';
import { FileActionsToolbar } from '@/components/files/file-actions-toolbar';
import { FolderTree } from '@/components/files/folder-tree';
import { StorageQuotaDisplay } from '@/components/files/storage-quota-display';
// import { UploadProgress } from '@/components/files/upload-progress';
import { FilePreviewModal } from '@/components/files/file-preview-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useFilesStore } from '@/store/files-store';
import { uploadManager } from '@/lib/upload/upload-manager';
import { FileItem, FolderItem } from '@/types/files';
import { Plus, Grid3X3, List, Folder } from 'lucide-react';

// Mock data
const mockFiles: FileItem[] = [
  {
    id: '1',
    key: 'documents/report.pdf',
    name: 'Annual Report.pdf',
    size: 2048576,
    type: 'application/pdf',
    lastModified: new Date('2024-01-15')
  },
  {
    id: '2',
    key: 'images/photo.jpg',
    name: 'Vacation Photo.jpg',
    size: 3456789,
    type: 'image/jpeg',
    lastModified: new Date('2024-01-14')
  }
];

const mockFolders: FolderItem[] = [
  {
    id: '1',
    name: 'Documents',
    fileCount: 24,
    children: [
      { id: '2', name: 'Projects', parentId: '1', fileCount: 8 },
      { id: '3', name: 'Reports', parentId: '1', fileCount: 12 }
    ]
  },
  {
    id: '4',
    name: 'Images',
    fileCount: 156,
    children: [
      { id: '5', name: '2024', parentId: '4', fileCount: 45 }
    ]
  }
];

const mockStorageBreakdown = [
  { type: 'Images', size: 1024 * 1024 * 1024 * 8.2, color: '#3b82f6' },
  { type: 'Documents', size: 1024 * 1024 * 1024 * 1.5, color: '#10b981' },
  { type: 'Others', size: 1024 * 1024 * 1024 * 1.1, color: '#8b5cf6' }
];

export default function FilesPage() {
  const {
    files,
    selectedFiles,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    fileTypeFilter,
    dateRangeFilter,
    sizeRangeFilter,
    uploadQueue,
    folders,
    expandedFolders,
    previewFile,
    showPreview,
    setFiles,
    setViewMode,
    setSorting,
    setSearchQuery,
    setFileTypeFilter,
    setDateRangeFilter,
    setSizeRangeFilter,
    selectFile,
    deselectFile,
    selectAllFiles,
    deselectAllFiles,
    addToUploadQueue,
    removeFromUploadQueue,
    updateUploadProgress,
    setUploadStatus,
    clearCompletedUploads,
    setFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolderExpand,
    setPreviewFile,
    togglePreview,
    removeFile
  } = useFilesStore();

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setFiles(mockFiles);
    setFolders(mockFolders);
  }, [setFiles, setFolders]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files' }
  ];

  const handleFileSelect = (file: FileItem) => {
    if (selectedFiles.includes(file.id)) {
      deselectFile(file.id);
    } else {
      selectFile(file.id);
    }
  };

  const handleFileDelete = (fileId: string) => {
    removeFile(fileId);
  };

  const handleFileDownload = (fileId: string) => {
    console.log('Download file:', fileId);
  };

  const handleFileRename = (fileId: string, newName: string) => {
    console.log('Rename file:', fileId, newName);
  };

  const handleFilePreview = (file: FileItem) => {
    setPreviewFile(file);
    togglePreview();
  };

  const handleBulkDownload = () => {
    console.log('Bulk download:', selectedFiles);
  };

  const handleBulkDelete = () => {
    selectedFiles.forEach(fileId => removeFile(fileId));
    deselectAllFiles();
  };

  const handleBulkMove = (targetFolder: string) => {
    console.log('Move files to folder:', targetFolder, selectedFiles);
  };

  const handleUploadCancel = (uploadId: string) => {
    uploadManager.cancelUpload(uploadId);
    removeFromUploadQueue(uploadId);
  };

  const handleUploadRetry = (uploadId: string) => {
    uploadManager.retryUpload(uploadId);
  };

  const handleUploadPause = (uploadId: string) => {
    uploadManager.pauseUpload(uploadId);
    setUploadStatus(uploadId, 'paused');
  };

  const handleUploadResume = (uploadId: string) => {
    uploadManager.resumeUpload(uploadId);
    setUploadStatus(uploadId, 'uploading');
  };

  const handleFolderSelect = (folderId: string) => {
    console.log('Selected folder:', folderId);
  };

  const handleFolderCreate = (parentId: string, name: string) => {
    createFolder(name, parentId);
  };

  const handleFolderDelete = (folderId: string) => {
    deleteFolder(folderId);
  };

  const handleFolderRename = (folderId: string, newName: string) => {
    renameFolder(folderId, newName);
  };

  const handleFolderToggleExpand = (folderId: string) => {
    toggleFolderExpand(folderId);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.type.includes(fileTypeFilter);
    const matchesSize = file.size >= sizeRangeFilter[0] && file.size <= sizeRangeFilter[1];
    
    let matchesDate = true;
    if (dateRangeFilter.from && file.lastModified < dateRangeFilter.from) matchesDate = false;
    if (dateRangeFilter.to && file.lastModified > dateRangeFilter.to) matchesDate = false;
    
    return matchesSearch && matchesType && matchesSize && matchesDate;
  });

  return (
    <>
      <FilesDashboardShell
        title="Files Management"
        description="Manage and organize your files"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
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
                dateRange={dateRangeFilter}
                onDateRangeChange={setDateRangeFilter}
                sizeRange={sizeRangeFilter}
                onSizeRangeChange={setSizeRangeFilter}
                onReset={() => {
                  setSearchQuery('');
                  setFileTypeFilter('all');
                  setDateRangeFilter({ from: undefined, to: undefined });
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
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={setSorting}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <FolderTree
                folders={folders}
                selectedFolder="root"
                onFolderSelect={handleFolderSelect}
                onFolderCreate={handleFolderCreate}
                onFolderDelete={handleFolderDelete}
                onFolderRename={handleFolderRename}
                expandedFolders={expandedFolders}
                onToggleExpand={handleFolderToggleExpand}
              />

              <StorageQuotaDisplay
                used={10.8}
                total={50}
                unit="GB"
                breakdown={mockStorageBreakdown}
                showDetails={true}
              />
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
        onSelectAll={selectAllFiles}
        onDeselectAll={deselectAllFiles}
        totalFiles={files.length}
      />

      {/* Upload Progress */}
      {uploadQueue.length > 0 && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Upload Progress</h3>
          <p className="text-sm text-muted-foreground">
            {uploadQueue.length} file(s) uploading...
          </p>
        </div>
      )}

      <FilePreviewModal
        file={previewFile}
        isOpen={showPreview}
        onClose={() => {
          setPreviewFile(null);
          togglePreview();
        }}
        onDownload={() => previewFile && handleFileDownload(previewFile.id)}
        onDelete={() => previewFile && handleFileDelete(previewFile.id)}
        showNavigation={filteredFiles.length > 1}
        onNext={() => {
          if (!previewFile) return;
          const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
          const nextIndex = (currentIndex + 1) % filteredFiles.length;
          setPreviewFile(filteredFiles[nextIndex]);
        }}
        onPrevious={() => {
          if (!previewFile) return;
          const currentIndex = filteredFiles.findIndex(f => f.id === previewFile.id);
          const prevIndex = (currentIndex - 1 + filteredFiles.length) % filteredFiles.length;
          setPreviewFile(filteredFiles[prevIndex]);
        }}
      />
    </>
  );
}