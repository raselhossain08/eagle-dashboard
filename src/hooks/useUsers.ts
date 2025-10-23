// lib/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/lib/api/users';
import { User, UsersResponse, UsersParams, CreateUserDto, UpdateUserDto, UserStatistics } from '@/types/users';

export const useUsers = (params?: UsersParams) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ['users', params],
    queryFn: () => UsersService.getUsers(params || {}),
    placeholderData: (previousData) => previousData,
  });
};

export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ['users', id],
    queryFn: () => UsersService.getUser(id),
    enabled: !!id,
  });
};

export const useUserMetrics = () => {
  return useQuery<UserStatistics, Error>({
    queryKey: ['users', 'metrics'],
    queryFn: () => UsersService.getUserMetrics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDto) => UsersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'metrics'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
      UsersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users', 'metrics'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      UsersService.updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users', 'metrics'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => UsersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'metrics'] });
    },
  });
};