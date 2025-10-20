import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesService } from '@/lib/api/templates.service'
import { TemplatesQueryParams, CreateTemplateDto, UpdateTemplateDto, ContractTemplate } from '@/lib/types/contracts'

export const useTemplates = (params: TemplatesQueryParams) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesService.getTemplates(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesService.getTemplateById(id),
    enabled: !!id,
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) => 
      templatesService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}