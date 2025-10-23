// hooks/use-files.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesService, FilesQueryParams, FolderItem, StorageQuota, StorageAnalytics } from '@/lib/api/files.service';
import { FileResponse } from '@/types/files';
import { toast } from 'sonner';

// Files queries
export const useFiles = (params: FilesQueryParams) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesService.getFiles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFileDetails = (fileId: string) => {
  return useQuery({
    queryKey: ['file-details', fileId],
    queryFn: () => filesService.getFileDetails(fileId),
    enabled: !!fileId,
  });
};

// Admin files query
export const useAllFiles = (params: FilesQueryParams) => {
  return useQuery({
    queryKey: ['admin-files', params],
    queryFn: () => filesService.getAllFiles(params),
    staleTime: 2 * 60 * 1000,
  });
};

// File mutations
export const useFileUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, purpose }: { file: File; purpose?: string }) =>
      filesService.uploadFile(file, purpose),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-quota'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};

export const useMultipleFileUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ files, purpose }: { files: File[]; purpose?: string }) =>
      filesService.uploadMultipleFiles(files, purpose),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-quota'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
      toast.success(`${data.length} files uploaded successfully`);
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};

export const useFileDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (key: string) => filesService.deleteFile(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-quota'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
      toast.success('File deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (keys: string[]) => filesService.deleteMultipleFiles(keys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-quota'] });
      queryClient.invalidateQueries({ queryKey: ['storage-analytics'] });
      toast.success('Files deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Bulk delete failed: ${error.message}`);
    },
  });
};

export const useFileRename = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) =>
      filesService.renameFile(fileId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File renamed successfully');
    },
    onError: (error: any) => {
      toast.error(`Rename failed: ${error.message}`);
    },
  });
};

// Folder operations
export const useFolders = (search?: string) => {
  return useQuery({
    queryKey: ['folders', search],
    queryFn: () => filesService.getFolders(search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, parentPath }: { name: string; parentPath?: string }) =>
      filesService.createFolder(name, parentPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Folder created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });
};

// Storage operations
export const useStorageQuota = () => {
  return useQuery({
    queryKey: ['storage-quota'],
    queryFn: () => filesService.getStorageQuota(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStorageAnalytics = () => {
  return useQuery({
    queryKey: ['storage-analytics'],
    queryFn: () => filesService.getStorageAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSystemAnalytics = () => {
  return useQuery({
    queryKey: ['system-storage-analytics'],
    queryFn: () => filesService.getSystemAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsageTrends = (fromDate?: Date, toDate?: Date) => {
  return useQuery({
    queryKey: ['usage-trends', fromDate?.toISOString(), toDate?.toISOString()],
    queryFn: () => filesService.getUsageTrends(fromDate, toDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserAnalytics = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['user-analytics', page, limit],
    queryFn: () => filesService.getUserAnalytics(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// File access
export const useDownloadUrl = (fileId: string) => {
  return useQuery({
    queryKey: ['download-url', fileId],
    queryFn: () => filesService.getDownloadUrl(fileId),
    enabled: !!fileId,
    staleTime: 0, // Always fresh
  });
};

export const usePreviewUrl = (fileId: string) => {
  return useQuery({
    queryKey: ['preview-url', fileId],
    queryFn: () => filesService.getPreviewUrl(fileId),
    enabled: !!fileId,
    staleTime: 0, // Always fresh
  });
};