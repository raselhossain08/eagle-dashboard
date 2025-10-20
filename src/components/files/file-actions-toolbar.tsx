// components/files/file-actions-toolbar.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Trash2, Folder, MoreHorizontal, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

interface FileActionsToolbarProps {
  selectedFiles: string[];
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onBulkMove: (targetFolder: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  totalFiles: number;
  disabled?: boolean;
}

const mockFolders = [
  { id: '1', name: 'Documents' },
  { id: '2', name: 'Images' },
  { id: '3', name: 'Archives' },
  { id: '4', name: 'Projects' },
];

export function FileActionsToolbar({
  selectedFiles,
  onBulkDownload,
  onBulkDelete,
  onBulkMove,
  onSelectAll,
  onDeselectAll,
  totalFiles,
  disabled = false
}: FileActionsToolbarProps) {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const { theme } = useTheme();

  const allSelected = selectedFiles.length === totalFiles && totalFiles > 0;

  const handleMove = () => {
    if (selectedFolder) {
      onBulkMove(selectedFolder);
      setShowMoveDialog(false);
      setSelectedFolder('');
    }
  };

  const handleDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  if (selectedFiles.length === 0) return null;

  return (
    <>
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg border backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700 text-white' 
          : 'bg-white/90 border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">
              {selectedFiles.length} file(s) selected
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDownload}
              disabled={disabled}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Move to Folder Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Files</DialogTitle>
            <DialogDescription>
              Select a folder to move {selectedFiles.length} file(s) to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {mockFolders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedFolder === folder.id
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedFolder === folder.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <Folder className="w-5 h-5 text-blue-500" />
                <span className="font-medium">{folder.name}</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={!selectedFolder}>
              Move Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Files</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedFiles.length} file(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}