import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signaturesService } from '@/lib/api/signatures.service'
import { SignContractDto, EvidencePackage, DateRange } from '@/lib/types/contracts'

export const useSignContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: SignContractDto }) =>
      signaturesService.signContract(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['signatures'] })
    },
  })
}

export const useEvidencePackage = (contractId: string) => {
  return useQuery({
    queryKey: ['evidence', contractId],
    queryFn: () => signaturesService.getEvidencePackage(contractId),
    enabled: !!contractId,
  })
}

export const useSignatureAnalytics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['signatures', 'analytics', dateRange],
    queryFn: () => signaturesService.getSignatureAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting signature details
export const useSignature = (signatureId: string) => {
  return useQuery({
    queryKey: ['signatures', signatureId],
    queryFn: () => signaturesService.getSignatureById(signatureId),
    enabled: !!signatureId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}