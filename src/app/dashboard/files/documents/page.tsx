// app/dashboard/files/documents/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FilesGridView } from '@/components/files/files-grid-view';
import { FilePreviewModal } from '@/components/files/file-preview-modal';
import { FileUploadZone } from '@/components/files/file-upload-zone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Grid3X3, List, Plus, Upload, AlertTriangle } from 'lucide-react';
import { FileItem } from '@/types/files';
import { 
  useFiles, 
  useFileUpload, 
  useMultipleFileUpload, 
  useFileDelete, 
  useBulkDelete, 
  useFileRename, 
  useDownloadUrl, 
  usePreviewUrl 
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

  // Fetch files with real API
  const { 
    data: filesData, 
    isLoading, 
    error, 
    refetch 
  } = useFiles({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    type: 'document' // Filter for documents
  });

  // Mutations
  const fileUpload = useFileUpload();
  const multipleFileUpload = useMultipleFileUpload();
  const deleteFile = useFileDelete();
  const bulkDelete = useBulkDelete();
  const renameFile = useFileRename();

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
        toast.error('File not found');
        return;
      }

      // Get download URL from API
      const downloadQuery = useDownloadUrl(fileId);
      const response = await downloadQuery.refetch();
      
      if (response.data?.url) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = fileToDownload.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      }
    } catch (error: any) {
      toast.error('Download failed');
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

  return (
    <>
      <FilesDashboardShell
        title="Documents"
        description="Manage your documents and files"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
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

          {/* Error State */}
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load files: {error.message}
              </AlertDescription>
            </Alert>
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

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
            </div>
          )}

          {/* Documents Grid */}
          {!isLoading && (
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

          {/* Selected Files Actions */}
          {selectedFiles.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg border bg-background z-50">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedFiles.length} document(s) selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkDownload}
                  disabled={selectedFiles.length === 0}
                >
                  Download
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDelete.isPending || selectedFiles.length === 0}
                >
                  {bulkDelete.isPending ? 'Deleting...' : 'Delete'}
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