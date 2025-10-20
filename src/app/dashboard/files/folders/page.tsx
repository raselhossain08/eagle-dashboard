// app/dashboard/files/folders/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Plus, MoreVertical, File, Search } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  totalSize: number;
  lastModified: Date;
  parentId?: string;
}

const mockFolders: FolderItem[] = [
  {
    id: '1',
    name: 'Documents',
    fileCount: 24,
    totalSize: 1024 * 1024 * 50, // 50MB
    lastModified: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Images',
    fileCount: 156,
    totalSize: 1024 * 1024 * 250, // 250MB
    lastModified: new Date('2024-01-14')
  },
  {
    id: '3',
    name: 'Archives',
    fileCount: 8,
    totalSize: 1024 * 1024 * 120, // 120MB
    lastModified: new Date('2024-01-13')
  }
];

export default function FoldersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<FolderItem[]>(mockFolders);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Files', href: '/dashboard/files' },
    { label: 'Folders' }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FilesDashboardShell
      title="Folders"
      description="Organize your files into folders"
      breadcrumbs={breadcrumbs}
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      }
    >
      <div className="space-y-6">
        <FilesNavigation />
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFolders.map((folder) => (
            <Card key={folder.id} className="group cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Folder className="w-8 h-8 text-blue-500" />
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 truncate">{folder.name}</h3>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <File className="w-3 h-3" />
                    <span>{folder.fileCount} files</span>
                  </div>
                  <div>{formatFileSize(folder.totalSize)}</div>
                  <div className="text-xs">
                    Modified {folder.lastModified.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No folders found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Create your first folder to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </FilesDashboardShell>
  );
}