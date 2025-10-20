// app/dashboard/files/documents/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { FilesGridView } from '@/components/files/files-grid-view';
import { FilePreviewModal } from '@/components/files/file-preview-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, List, Plus } from 'lucide-react';
import { FileItem } from '@/types/files';

// Mock document files
const mockDocumentFiles: FileItem[] = [
  {
    id: '1',
    key: 'documents/report.pdf',
    name: 'Annual Report 2024.pdf',
    size: 3048576,
    type: 'application/pdf',
    lastModified: new Date('2024-01-15')
  },
  {
    id: '2',
    key: 'documents/proposal.docx',
    name: 'Project Proposal.docx',
    size: 1456789,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    lastModified: new Date('2024-01-14')
  },
  {
    id: '3',
    key: 'documents/contract.pdf',
    name: 'Service Contract.pdf',
    size: 2876543,
    type: 'application/pdf',
    lastModified: new Date('2024-01-13')
  }
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Documents' }
  ];

  const filteredFiles = mockDocumentFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleFileDelete = (fileId: string) => {
    console.log('Delete file:', fileId);
  };

  const handleFileDownload = (fileId: string) => {
    console.log('Download file:', fileId);
  };

  const handleFileRename = (fileId: string, newName: string) => {
    console.log('Rename file:', fileId, newName);
  };

  return (
    <>
      <FilesDashboardShell
        title="Documents"
        description="Manage your documents and files"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        }
      >
        <div className="space-y-6">
          <FilesNavigation />
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Documents Grid */}
          <FilesGridView
            files={filteredFiles}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
            onFileDownload={handleFileDownload}
            onFileRename={handleFileRename}
            selectedFiles={selectedFiles}
            viewMode={viewMode}
          />

          {/* Selected Files Actions */}
          {selectedFiles.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg border bg-background">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedFiles.length} document(s) selected
                </span>
                <Button variant="outline" size="sm">
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  Move to Folder
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
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