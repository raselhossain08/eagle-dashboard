import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UsersService } from '@/lib/api/users'
import { UpdateUserDto } from '@/types/users'

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
      UsersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}