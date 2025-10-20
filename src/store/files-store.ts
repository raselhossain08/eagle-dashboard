// store/files-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileItem, FolderItem } from '@/types/files';

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
}

interface FilesState {
  // File management
  files: FileItem[];
  selectedFiles: string[];
  currentFolder: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'size' | 'date' | 'type';
  sortOrder: 'asc' | 'desc';
  
  // Search and filters
  searchQuery: string;
  fileTypeFilter: string;
  dateRangeFilter: { from: Date | undefined; to: Date | undefined };
  sizeRangeFilter: [number, number];
  
  // Upload state
  uploadQueue: UploadTask[];
  isUploading: boolean;
  
  // Folder state
  folders: FolderItem[];
  expandedFolders: string[];
  
  // Preview state
  previewFile: FileItem | null;
  showPreview: boolean;
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  addFiles: (files: FileItem[]) => void;
  removeFile: (fileId: string) => void;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSorting: (field: 'name' | 'size' | 'date' | 'type', order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFileTypeFilter: (type: string) => void;
  setDateRangeFilter: (range: { from: Date | undefined; to: Date | undefined }) => void;
  setSizeRangeFilter: (range: [number, number]) => void;
  
  // Upload actions
  addToUploadQueue: (files: File[]) => void;
  removeFromUploadQueue: (uploadId: string) => void;
  updateUploadProgress: (uploadId: string, progress: number) => void;
  setUploadStatus: (uploadId: string, status: UploadTask['status'], error?: string) => void;
  clearCompletedUploads: () => void;
  
  // Folder actions
  setFolders: (folders: FolderItem[]) => void;
  createFolder: (name: string, parentId?: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  toggleFolderExpand: (folderId: string) => void;
  
  // Preview actions
  setPreviewFile: (file: FileItem | null) => void;
  togglePreview: () => void;
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      selectedFiles: [],
      currentFolder: 'root',
      viewMode: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      searchQuery: '',
      fileTypeFilter: 'all',
      dateRangeFilter: { from: undefined, to: undefined },
      sizeRangeFilter: [0, 100 * 1024 * 1024],
      uploadQueue: [],
      isUploading: false,
      folders: [],
      expandedFolders: [],
      previewFile: null,
      showPreview: false,

      // File actions
      setFiles: (files) => set({ files }),
      addFiles: (files) => set((state) => ({ files: [...state.files, ...files] })),
      removeFile: (fileId) => set((state) => ({
        files: state.files.filter(file => file.id !== fileId),
        selectedFiles: state.selectedFiles.filter(id => id !== fileId)
      })),
      selectFile: (fileId) => set((state) => ({
        selectedFiles: [...state.selectedFiles, fileId]
      })),
      deselectFile: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.filter(id => id !== fileId)
      })),
      selectAllFiles: () => set((state) => ({
        selectedFiles: state.files.map(file => file.id)
      })),
      deselectAllFiles: () => set({ selectedFiles: [] }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFileTypeFilter: (fileTypeFilter) => set({ fileTypeFilter }),
      setDateRangeFilter: (dateRangeFilter) => set({ dateRangeFilter }),
      setSizeRangeFilter: (sizeRangeFilter) => set({ sizeRangeFilter }),

      // Upload actions
      addToUploadQueue: (files) => set((state) => ({
        uploadQueue: [
          ...state.uploadQueue,
          ...files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'uploading' as const
          }))
        ],
        isUploading: true
      })),
      removeFromUploadQueue: (uploadId) => set((state) => ({
        uploadQueue: state.uploadQueue.filter(upload => upload.id !== uploadId),
        isUploading: state.uploadQueue.length > 1
      })),
      updateUploadProgress: (uploadId, progress) => set((state) => ({
        uploadQueue: state.uploadQueue.map(upload =>
          upload.id === uploadId ? { ...upload, progress } : upload
        )
      })),
      setUploadStatus: (uploadId, status, error) => set((state) => ({
        uploadQueue: state.uploadQueue.map(upload =>
          upload.id === uploadId ? { ...upload, status, error } : upload
        )
      })),
      clearCompletedUploads: () => set((state) => ({
        uploadQueue: state.uploadQueue.filter(upload => upload.status !== 'completed')
      })),

      // Folder actions
      setFolders: (folders) => set({ folders }),
      createFolder: (name, parentId) => set((state) => {
        const newFolder: FolderItem = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          parentId,
          fileCount: 0
        };

        if (!parentId) {
          return { folders: [...state.folders, newFolder] };
        }

        const addFolderToParent = (folders: FolderItem[]): FolderItem[] => {
          return folders.map(folder => {
            if (folder.id === parentId) {
              return {
                ...folder,
                children: [...(folder.children || []), newFolder]
              };
            }
            if (folder.children) {
              return {
                ...folder,
                children: addFolderToParent(folder.children)
              };
            }
            return folder;
          });
        };

        return { folders: addFolderToParent(state.folders) };
      }),
      deleteFolder: (folderId) => set((state) => {
        const removeFolder = (folders: FolderItem[]): FolderItem[] => {
          return folders.filter(folder => {
            if (folder.id === folderId) return false;
            if (folder.children) {
              folder.children = removeFolder(folder.children);
            }
            return true;
          });
        };

        return { 
          folders: removeFolder(state.folders),
          expandedFolders: state.expandedFolders.filter(id => id !== folderId)
        };
      }),
      renameFolder: (folderId, newName) => set((state) => {
        const renameFolderInTree = (folders: FolderItem[]): FolderItem[] => {
          return folders.map(folder => {
            if (folder.id === folderId) {
              return { ...folder, name: newName };
            }
            if (folder.children) {
              return {
                ...folder,
                children: renameFolderInTree(folder.children)
              };
            }
            return folder;
          });
        };

        return { folders: renameFolderInTree(state.folders) };
      }),
      toggleFolderExpand: (folderId) => set((state) => ({
        expandedFolders: state.expandedFolders.includes(folderId)
          ? state.expandedFolders.filter(id => id !== folderId)
          : [...state.expandedFolders, folderId]
      })),

      // Preview actions
      setPreviewFile: (previewFile) => set({ previewFile }),
      togglePreview: () => set((state) => ({ showPreview: !state.showPreview }))
    }),
    {
      name: 'files-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        folders: state.folders,
        expandedFolders: state.expandedFolders
      })
    }
  )
);