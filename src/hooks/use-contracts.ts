import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractsService } from '@/lib/api/contracts.service'
import { ContractsQueryParams, CreateContractDto, Contract, DateRange } from '@/lib/types/contracts'

export const useContracts = (params: ContractsQueryParams) => {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => contractsService.getContracts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractsService.getContractById(id),
    enabled: !!id,
  })
}

export const useCreateContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateContractDto) => contractsService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export const useSendContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => contractsService.sendContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

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

export const useContractMetrics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['contracts', 'metrics', dateRange],
    queryFn: () => contractsService.getContractMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}