import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signaturesService } from '@/lib/api/signatures.service'
import { SignContractDto, EvidencePackage, DateRange, ValidationResult, SignaturesQueryParams } from '@/lib/types/contracts'

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

export const useEvidencePackageBySignature = (signatureId: string) => {
  return useQuery({
    queryKey: ['evidence', 'signature', signatureId],
    queryFn: () => signaturesService.getEvidencePackageBySignature(signatureId),
    enabled: !!signatureId,
  })
}

// Hook for getting signatures list
export const useSignatures = (params: SignaturesQueryParams) => {
  return useQuery({
    queryKey: ['signatures', params],
    queryFn: () => signaturesService.getSignatures(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for getting signature types distribution
export const useSignatureTypesDistribution = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['signatures', 'types-distribution', dateRange],
    queryFn: () => signaturesService.getSignatureTypesDistribution(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Hook for validating evidence integrity
export const useValidateEvidence = () => {
  return useMutation({
    mutationFn: (evidencePackageId: string) =>
      signaturesService.validateEvidencePackage(evidencePackageId),
  })
}

// Hook for exporting signatures
export const useExportSignatures = () => {
  return useMutation({
    mutationFn: async ({ format, dateRange }: { format: 'csv' | 'xlsx'; dateRange?: DateRange }) => {
      const response = await signaturesService.exportSignatures(format, dateRange)
      
      // For now, just log the export data since we don't have actual file generation
      console.log('Export data:', response)
      
      return response
    },
  })
}

// Hook for exporting evidence
export const useExportEvidence = () => {
  return useMutation({
    mutationFn: async (evidencePackageId: string) => {
      const response = await signaturesService.exportEvidencePackage(evidencePackageId)
      
      // Download the ZIP file
      if (response.zipUrl) {
        await signaturesService.downloadFile(
          response.zipUrl, 
          `evidence-${evidencePackageId}.zip`
        )
      }
      
      return response
    },
  })
}