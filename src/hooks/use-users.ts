// hooks/use-users.ts
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/lib/api/users.service';

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUsers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
} = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};