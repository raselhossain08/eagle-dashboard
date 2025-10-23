// hooks/useSegments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SegmentsService } from '@/lib/api/segments';
import { UserSegment, CreateUserSegmentDto, UpdateUserSegmentDto } from '@/types/segments';

export const useSegments = () => {
  return useQuery<UserSegment[], Error>({
    queryKey: ['segments'],
    queryFn: () => SegmentsService.getSegments(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useSegment = (id: string) => {
  return useQuery<UserSegment, Error>({
    queryKey: ['segments', id],
    queryFn: () => SegmentsService.getSegment(id),
    enabled: !!id,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserSegmentDto) => SegmentsService.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserSegmentDto }) => 
      SegmentsService.updateSegment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      queryClient.invalidateQueries({ queryKey: ['segments', variables.id] });
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SegmentsService.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

export const useSegmentUsers = (id: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['segments', id, 'users', page, limit],
    queryFn: () => SegmentsService.getSegmentUsers(id, page, limit),
    enabled: !!id,
  });
};