// hooks/useSupport.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/lib/api/support';
import { SupportNote, CreateSupportNoteDto, UpdateSupportNoteDto, ImpersonateUserDto, CreateSavedReplyDto } from '@/types/support';

// Support Notes
export const useSupportNotes = (userId?: string, params?: any) => {
  return useQuery({
    queryKey: ['support', 'notes', userId, params],
    queryFn: () => supportService.getUserSupportNotes(userId!, params),
    enabled: !!userId,
  });
};

export const useCreateSupportNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupportNoteDto) => supportService.createSupportNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'notes'] });
    },
  });
};

export const useUpdateSupportNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupportNoteDto }) => 
      supportService.updateSupportNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'notes'] });
    },
  });
};

// Impersonation
export const useActiveImpersonations = () => {
  return useQuery({
    queryKey: ['support', 'impersonation', 'active'],
    queryFn: () => supportService.getActiveImpersonations(),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useStartImpersonation = () => {
  return useMutation({
    mutationFn: (data: ImpersonateUserDto) => supportService.startImpersonation(data),
  });
};

export const useEndImpersonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, reason }: { logId: string; reason?: string }) => 
      supportService.endImpersonation(logId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'impersonation', 'active'] });
    },
  });
};

// Saved Replies
export const useSavedReplies = (params?: any) => {
  return useQuery({
    queryKey: ['support', 'saved-replies', params],
    queryFn: () => supportService.getSavedReplies(params),
  });
};

export const useCreateSavedReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavedReplyDto) => supportService.createSavedReply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'saved-replies'] });
    },
  });
};

// Analytics
export const useSupportStats = () => {
  return useQuery({
    queryKey: ['support', 'stats'],
    queryFn: () => supportService.getSupportStats(),
  });
};

// Impersonation History
export const useImpersonationHistory = (params?: any) => {
  return useQuery({
    queryKey: ['support', 'impersonation', 'history', params],
    queryFn: () => supportService.getImpersonationHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};