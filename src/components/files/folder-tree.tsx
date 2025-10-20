// components/files/folder-tree.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Folder, FolderOpen, Plus, Trash2, Edit, ChevronRight, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  children?: FolderItem[];
  fileCount?: number;
}

interface FolderTreeProps {
  folders: FolderItem[];
  selectedFolder?: string;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate: (parentId: string, name: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  expandedFolders: string[];
  onToggleExpand: (folderId: string) => void;
}

export function FolderTree({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
  onFolderRename,
  expandedFolders,
  onToggleExpand
}: FolderTreeProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderItem | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string>('');

  const { theme } = useTheme();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(parentFolderId, newFolderName.trim());
      setNewFolderName('');
      setShowCreateDialog(false);
      setParentFolderId('');
    }
  };

  const handleRenameFolder = () => {
    if (editingFolder && newFolderName.trim()) {
      onFolderRename(editingFolder.id, newFolderName.trim());
      setNewFolderName('');
      setShowRenameDialog(false);
      setEditingFolder(null);
    }
  };

  const handleDeleteFolder = () => {
    if (deletingFolder) {
      onFolderDelete(deletingFolder.id);
      setShowDeleteDialog(false);
      setDeletingFolder(null);
    }
  };

  const openCreateDialog = (parentId: string = '') => {
    setParentFolderId(parentId);
    setNewFolderName('');
    setShowCreateDialog(true);
  };

  const openRenameDialog = (folder: FolderItem) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (folder: FolderItem) => {
    setDeletingFolder(folder);
    setShowDeleteDialog(true);
  };

  const renderFolder = (folder: FolderItem, depth = 0) => {
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolder === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors group",
                isSelected
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
              onClick={() => onFolderSelect(folder.id)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(folder.id);
                }}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )
                ) : (
                  <div className="w-3 h-3" />
                )}
              </Button>

              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )}

              <span className="flex-1 truncate text-sm">{folder.name}</span>

              {folder.fileCount !== undefined && (
                <span className="text-xs text-muted-foreground bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {folder.fileCount}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  openCreateDialog(folder.id);
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onClick={() => openCreateDialog(folder.id)}>
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuItem onClick={() => openRenameDialog(folder)}>
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => openDeleteDialog(folder)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Folders</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openCreateDialog()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {/* Root folder */}
        <div
          className={cn(
            "flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors",
            selectedFolder === 'root'
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          onClick={() => onFolderSelect('root')}
        >
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm">All Files</span>
        </div>

        {/* Render folder tree */}
        {folders.map(folder => renderFolder(folder))}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for the folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder} disabled={!newFolderName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingFolder?.name}"? 
              This will also delete all files and subfolders inside it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}