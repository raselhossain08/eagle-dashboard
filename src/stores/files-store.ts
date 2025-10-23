// stores/files-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FileItem } from '@/types/files';
import { FolderItem } from '@/lib/api/files.service';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  error?: string;
  purpose?: string;
}

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

interface FilesState {
  // Files data
  files: FileItem[];
  selectedFiles: string[];
  
  // View settings
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'size' | 'date' | 'type';
  sortOrder: 'asc' | 'desc';
  
  // Filters
  searchQuery: string;
  fileTypeFilter: string;
  dateRangeFilter: DateRangeFilter;
  sizeRangeFilter: [number, number];
  
  // Upload management
  uploadQueue: UploadItem[];
  
  // Folder management
  folders: FolderItem[];
  expandedFolders: string[];
  currentFolder?: string;
  
  // Preview
  previewFile: FileItem | null;
  showPreview: boolean;
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileItem>) => void;
  
  // Selection
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  toggleFileSelection: (fileId: string) => void;
  
  // View settings
  setViewMode: (mode: 'grid' | 'list') => void;
  setSorting: (sortBy: 'name' | 'size' | 'date' | 'type', sortOrder?: 'asc' | 'desc') => void;
  
  // Filters
  setSearchQuery: (query: string) => void;
  setFileTypeFilter: (type: string) => void;
  setDateRangeFilter: (range: DateRangeFilter) => void;
  setSizeRangeFilter: (range: [number, number]) => void;
  clearFilters: () => void;
  
  // Upload management
  addToUploadQueue: (item: UploadItem) => void;
  removeFromUploadQueue: (id: string) => void;
  updateUploadProgress: (id: string, progress: number) => void;
  setUploadStatus: (id: string, status: UploadItem['status'], error?: string) => void;
  clearCompletedUploads: () => void;
  
  // Folder management
  setFolders: (folders: FolderItem[]) => void;
  addFolder: (folder: FolderItem) => void;
  createFolder: (name: string, parentId?: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  toggleFolderExpand: (folderId: string) => void;
  setCurrentFolder: (folderId?: string) => void;
  
  // Preview
  setPreviewFile: (file: FileItem | null) => void;
  togglePreview: () => void;
  setShowPreview: (show: boolean) => void;
}

export const useFilesStore = create<FilesState>()(
  devtools(
    (set, get) => ({
      // Initial state
      files: [],
      selectedFiles: [],
      
      viewMode: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      
      searchQuery: '',
      fileTypeFilter: 'all',
      dateRangeFilter: {},
      sizeRangeFilter: [0, 100 * 1024 * 1024], // 0 to 100MB
      
      uploadQueue: [],
      
      folders: [],
      expandedFolders: [],
      currentFolder: undefined,
      
      previewFile: null,
      showPreview: false,
      
      // File actions
      setFiles: (files) => set({ files }),
      
      addFile: (file) => set((state) => ({
        files: [file, ...state.files],
      })),
      
      removeFile: (fileId) => set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
        selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
      })),
      
      updateFile: (fileId, updates) => set((state) => ({
        files: state.files.map((f) => f.id === fileId ? { ...f, ...updates } : f),
      })),
      
      // Selection actions
      selectFile: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.includes(fileId)
          ? state.selectedFiles
          : [...state.selectedFiles, fileId],
      })),
      
      deselectFile: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
      })),
      
      selectAllFiles: () => set((state) => ({
        selectedFiles: state.files.map((f) => f.id),
      })),
      
      deselectAllFiles: () => set({ selectedFiles: [] }),
      
      toggleFileSelection: (fileId) => {
        const { selectedFiles, selectFile, deselectFile } = get();
        if (selectedFiles.includes(fileId)) {
          deselectFile(fileId);
        } else {
          selectFile(fileId);
        }
      },
      
      // View settings
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setSorting: (sortBy, sortOrder) => set((state) => ({
        sortBy,
        sortOrder: sortOrder || (state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc'),
      })),
      
      // Filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFileTypeFilter: (type) => set({ fileTypeFilter: type }),
      setDateRangeFilter: (range) => set({ dateRangeFilter: range }),
      setSizeRangeFilter: (range) => set({ sizeRangeFilter: range }),
      
      clearFilters: () => set({
        searchQuery: '',
        fileTypeFilter: 'all',
        dateRangeFilter: {},
        sizeRangeFilter: [0, 100 * 1024 * 1024],
      }),
      
      // Upload management
      addToUploadQueue: (item) => set((state) => ({
        uploadQueue: [...state.uploadQueue, item],
      })),
      
      removeFromUploadQueue: (id) => set((state) => ({
        uploadQueue: state.uploadQueue.filter((item) => item.id !== id),
      })),
      
      updateUploadProgress: (id, progress) => set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === id ? { ...item, progress } : item
        ),
      })),
      
      setUploadStatus: (id, status, error) => set((state) => ({
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === id ? { ...item, status, error } : item
        ),
      })),
      
      clearCompletedUploads: () => set((state) => ({
        uploadQueue: state.uploadQueue.filter(
          (item) => item.status !== 'completed' && item.status !== 'failed'
        ),
      })),
      
      // Folder management
      setFolders: (folders) => set({ folders }),
      
      addFolder: (folder) => set((state) => ({
        folders: [...state.folders, folder],
      })),
      
      createFolder: (name, parentId) => {
        // This would typically make an API call
        const newFolder: FolderItem = {
          id: Date.now().toString(),
          name,
          path: parentId ? `${parentId}/${name}` : name,
          fileCount: 0,
          totalSize: 0,
          lastModified: new Date(),
          parentId,
        };
        
        set((state) => ({
          folders: [...state.folders, newFolder],
        }));
      },
      
      deleteFolder: (folderId) => set((state) => ({
        folders: state.folders.filter((f) => f.id !== folderId),
        expandedFolders: state.expandedFolders.filter((id) => id !== folderId),
      })),
      
      renameFolder: (folderId, newName) => set((state) => ({
        folders: state.folders.map((f) =>
          f.id === folderId ? { ...f, name: newName } : f
        ),
      })),
      
      toggleFolderExpand: (folderId) => set((state) => ({
        expandedFolders: state.expandedFolders.includes(folderId)
          ? state.expandedFolders.filter((id) => id !== folderId)
          : [...state.expandedFolders, folderId],
      })),
      
      setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
      
      // Preview
      setPreviewFile: (file) => set({ previewFile: file }),
      togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
      setShowPreview: (show) => set({ showPreview: show }),
    }),
    { name: 'files-store' }
  )
);