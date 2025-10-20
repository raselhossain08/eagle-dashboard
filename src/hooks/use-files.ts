// hooks/use-files.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesService, FilesQueryParams } from '@/lib/api/files.service';
import { FileResponse } from '@/types/files';

export const useFiles = (params: FilesQueryParams) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => filesService.getFiles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFileUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, purpose }: { file: File; purpose?: string }) =>
      filesService.uploadFile(file, purpose),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useFileDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => filesService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => filesService.deleteMultipleFiles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};