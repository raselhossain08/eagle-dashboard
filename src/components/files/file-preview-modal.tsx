// components/files/file-preview-modal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Image
} from 'lucide-react';
import { FileItem } from '@/types/files';
import { useTheme } from 'next-themes';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onDownload: () => void;
  onDelete: () => void;
  showNavigation?: boolean;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onDownload,
  onDelete,
  showNavigation = false
}: FilePreviewModalProps) {
  const { theme } = useTheme();

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {isImage ? (
                <Image className="w-5 h-5 text-blue-500" />
              ) : (
                <FileText className="w-5 h-5 text-blue-500" />
              )}
              <span className="max-w-md truncate">{file.name}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {showNavigation && (
                <>
                  <Button variant="outline" size="sm" onClick={onPrevious}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900">
            {isImage && file.url ? (
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : isPDF ? (
              <div className="text-center space-y-4">
                <FileText className="w-24 h-24 text-red-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium">PDF Document</p>
                  <p className="text-sm text-muted-foreground">
                    Use the download button to view this document
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <FileText className="w-24 h-24 text-blue-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium">{file.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Preview not available for this file type
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="w-80 border-l bg-background">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">File Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Name</p>
                      <p className="truncate">{file.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Type</p>
                      <p>{file.type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Size</p>
                      <p>{formatFileSize(file.size)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Modified</p>
                      <p>{formatDate(file.lastModified)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Storage Key</p>
                      <p className="text-xs font-mono truncate">{file.key}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={onDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      navigator.clipboard.writeText(file.url || '');
                      // Add toast notification
                    }}>
                      <FileText className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" onClick={onDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete File
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}