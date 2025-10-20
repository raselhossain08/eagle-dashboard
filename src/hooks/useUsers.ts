// lib/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/lib/api/users';
import { User, UsersResponse, UsersParams } from '@/types/users';

export const useUsers = (params?: UsersParams) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ['users', params],
    queryFn: () => UsersService.getUsers(params || {}),
    keepPreviousData: true,
  });
};

export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ['users', id],
    queryFn: () => UsersService.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UsersService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      UsersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};