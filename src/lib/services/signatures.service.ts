import { Signature, SignContractDto, EvidencePackage, ValidationResult, DateRange, SignatureAnalytics } from '@/lib/types/contracts'

export class SignaturesService {
  private baseUrl = '/api/contracts/signatures'

  constructor() {}

  async signContract(contractId: string, data: SignContractDto): Promise<Signature> {
    const response = await fetch(`${this.baseUrl}/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to sign contract')
    }
    
    return response.json()
  }

  async getSignatureById(id: string): Promise<Signature> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch signature')
    }
    
    return response.json()
  }

  async validateSignature(id: string): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/${id}/validate`)
    
    if (!response.ok) {
      throw new Error('Failed to validate signature')
    }
    
    return response.json()
  }

  async getEvidencePackage(contractId: string): Promise<EvidencePackage> {
    const response = await fetch(`${this.baseUrl}/${contractId}/evidence`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch evidence package')
    }
    
    return response.json()
  }

  async exportEvidence(evidenceId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/evidence/${evidenceId}/export`)
    
    if (!response.ok) {
      throw new Error('Failed to export evidence')
    }
    
    return response.blob()
  }

  async validateEvidenceIntegrity(evidenceId: string): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/evidence/${evidenceId}/validate`)
    
    if (!response.ok) {
      throw new Error('Failed to validate evidence integrity')
    }
    
    return response.json()
  }

  async getSignatureAnalytics(dateRange: DateRange): Promise<SignatureAnalytics> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    })
    
    const response = await fetch(`${this.baseUrl}/analytics?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch signature analytics')
    }
    
    return response.json()
  }

  async getComplianceReport(params: any): Promise<any> {
    const queryParams = new URLSearchParams(params)
    const response = await fetch(`${this.baseUrl}/compliance/report?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch compliance report')
    }
    
    return response.json()
  }
}

export const signaturesService = new SignaturesService()