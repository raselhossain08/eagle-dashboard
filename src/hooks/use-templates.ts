import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesService } from '@/lib/api/templates.service'

export interface TemplatesQueryParams {
  page?: number
  limit?: number
  type?: string
  isActive?: boolean
  locale?: string
}

export const useTemplates = (params: TemplatesQueryParams = {}) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesService.getTemplates(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry on failure
    throwOnError: false, // Don't throw errors, handle them gracefully
  })
}

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesService.getTemplate(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry on failure
    throwOnError: false, // Don't throw errors, handle them gracefully
  })
}

export const useTemplateForPlan = (planId: string, locale: string = 'en') => {
  return useQuery({
    queryKey: ['templates', 'plan', planId, locale],
    queryFn: () => templatesService.getTemplateForPlan(planId, locale),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRenderTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, any> }) =>
      templatesService.renderTemplate(id, variables),
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => templatesService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
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