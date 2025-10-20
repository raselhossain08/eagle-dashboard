// hooks/useSubscribers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribersService } from '@/lib/api/subscribers';
import { SubscriberParams, SubscriberProfile } from '@/types/subscribers';

export const useSubscribers = (params?: SubscriberParams) => {
  return useQuery({
    queryKey: ['subscribers', params],
    queryFn: () => subscribersService.getSubscribers(params),
  });
};

export const useSubscriber = (id: string) => {
  return useQuery({
    queryKey: ['subscribers', id],
    queryFn: () => subscribersService.getSubscriber(id),
    enabled: !!id,
  });
};

export const useUpdateSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriberProfile> }) =>
      subscribersService.updateSubscriber(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers', variables.id] });
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribersService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
};