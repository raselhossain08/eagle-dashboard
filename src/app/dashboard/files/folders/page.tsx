// app/dashboard/files/folders/page.tsx
'use client';

import { useState } from 'react';
import { FilesDashboardShell } from '@/components/files/files-dashboard-shell';
import { FilesNavigation } from '@/components/files/files-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, Plus, MoreVertical, File, Search, AlertTriangle, Edit, Trash2, FolderOpen } from 'lucide-react';
import { useFolders, useCreateFolder } from '@/hooks/use-files';
import { FolderItem } from '@/lib/api/files.service';
import { toast } from 'sonner';

export default function FoldersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentPath, setParentPath] = useState('');

  // Fetch folders data using real API
  const { 
    data: folders = [], 
    isLoading, 
    error, 
    refetch 
  } = useFolders(searchQuery);

  // Create folder mutation
  const createFolder = useCreateFolder();

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      await createFolder.mutateAsync({
        name: newFolderName.trim(),
        parentPath: parentPath.trim() || undefined
      });
      setNewFolderName('');
      setParentPath('');
      setShowCreateModal(false);
      refetch(); // Refresh the folders list
    } catch (error: any) {
      // Error already handled by the hook with toast
      console.error('Failed to create folder:', error);
    }
  };

  const handleFolderClick = (folder: FolderItem) => {
    // Navigate to folder contents or handle folder selection
    console.log('Open folder:', folder.name);
    // TODO: Implement folder navigation to show files within the folder
    // Could navigate to /dashboard/files/documents?folder=foldername
  };

  const handleEditFolder = (folder: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit folder:', folder.name);
    // TODO: Implement folder renaming functionality
  };

  const handleDeleteFolder = (folder: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete folder:', folder.name);
    // TODO: Implement folder deletion functionality
  };

  const filteredFolders = folders; // Search is now handled by the API

  return (
    <FilesDashboardShell
      title="Folders"
      description="Organize your files into folders"
      breadcrumbs={breadcrumbs}
      actions={
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button disabled={createFolder.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="folderName" className="text-sm font-medium">
                  Folder Name
                </label>
                <Input
                  id="folderName"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="parentPath" className="text-sm font-medium">
                  Parent Path (optional)
                </label>
                <Input
                  id="parentPath"
                  placeholder="e.g., documents/projects"
                  value={parentPath}
                  onChange={(e) => setParentPath(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={createFolder.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFolder}
                  disabled={createFolder.isPending || !newFolderName.trim()}
                >
                  {createFolder.isPending ? 'Creating...' : 'Create Folder'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        <FilesNavigation />

        {/* Error State */}
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load folders: {error.message}
            </AlertDescription>
          </Alert>
        )}
        
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="w-8 h-8" />
                    <Skeleton className="w-8 h-8" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Folders Grid */}
        {!isLoading && filteredFolders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFolders.map((folder) => (
              <Card 
                key={folder.id} 
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFolderClick(folder)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Folder className="w-8 h-8 text-blue-500" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleFolderClick(folder)}>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Open Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleEditFolder(folder, e)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteFolder(folder, e)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 truncate">{folder.name}</h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <File className="w-3 h-3" />
                      <span>{folder.fileCount} files</span>
                    </div>
                    <div>{formatFileSize(folder.totalSize)}</div>
                    <div className="text-xs">
                      Modified {new Date(folder.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFolders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No folders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first folder to get started'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={createFolder.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FilesDashboardShell>
  );
}