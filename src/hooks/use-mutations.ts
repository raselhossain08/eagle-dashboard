import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useVoidContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      contractsService.voidContract(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export const useArchiveExpiredContracts = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => contractsService.archiveExpiredContracts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export const useSetDefaultTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => templatesService.setDefaultTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export const useRenderTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, any> }) =>
      templatesService.renderTemplate(id, variables),
  })
}

export const useValidateSignature = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => signaturesService.validateSignature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] })
    },
  })
}