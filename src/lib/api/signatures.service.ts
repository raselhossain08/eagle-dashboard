import { API_BASE_URL } from '@/lib/config'
import { AuthCookieService } from '@/lib/auth/cookie-service'
import { 
  SignContractDto, 
  EvidencePackage, 
  DateRange, 
  SignatureAnalytics, 
  Signature,
  ValidationResult,
  SignatureTypeDistribution,
  SignaturesQueryParams,
  PaginatedSignatures
} from '@/lib/types/contracts'

export interface ExportEvidenceResponse {
  pdfUrl: string
  zipUrl: string
  jsonData: any
}

class SignaturesService {
  private baseUrl = `${API_BASE_URL}/contracts/signatures`

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async signContract(contractId: string, data: SignContractDto): Promise<{ signature: Signature; evidencePackage: EvidencePackage }> {
    const response = await fetch(`${this.baseUrl}/contract/${contractId}/sign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to sign contract: ${response.statusText}`)
    }

    return response.json()
  }

  async getSignatureById(signatureId: string): Promise<Signature> {
    const response = await fetch(`${this.baseUrl}/${signatureId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch signature: ${response.statusText}`)
    }

    return response.json()
  }

  async getEvidencePackage(contractId: string): Promise<EvidencePackage> {
    const response = await fetch(`${this.baseUrl}/evidence/contract/${contractId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch evidence package: ${response.statusText}`)
    }

    return response.json()
  }

  async getEvidencePackageBySignature(signatureId: string): Promise<EvidencePackage> {
    const response = await fetch(`${this.baseUrl}/evidence/signature/${signatureId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch evidence package: ${response.statusText}`)
    }

    return response.json()
  }

  async exportEvidencePackage(evidencePackageId: string): Promise<ExportEvidenceResponse> {
    const response = await fetch(`${this.baseUrl}/evidence/${evidencePackageId}/export`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to export evidence package: ${response.statusText}`)
    }

    return response.json()
  }

  async validateEvidencePackage(evidencePackageId: string): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/evidence/${evidencePackageId}/validate`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to validate evidence package: ${response.statusText}`)
    }

    return response.json()
  }

  async getSignatures(params: SignaturesQueryParams): Promise<PaginatedSignatures> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.status) searchParams.append('status', params.status)
    if (params.contractId) searchParams.append('contractId', params.contractId)

    const response = await fetch(`${this.baseUrl}?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch signatures: ${response.statusText}`)
    }

    return response.json()
  }

  async getSignatureTypesDistribution(dateRange?: DateRange): Promise<SignatureTypeDistribution[]> {
    const searchParams = new URLSearchParams()
    
    if (dateRange?.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange?.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/types-distribution?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch signature types distribution: ${response.statusText}`)
    }

    return response.json()
  }

  async exportSignatures(format: 'csv' | 'xlsx' = 'csv', dateRange?: DateRange): Promise<any> {
    const searchParams = new URLSearchParams()
    
    searchParams.append('format', format)
    if (dateRange?.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange?.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/export?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to export signatures: ${response.statusText}`)
    }

    return response.json()
  }

  async getSignatureAnalytics(dateRange: DateRange): Promise<SignatureAnalytics> {
    const searchParams = new URLSearchParams()
    
    if (dateRange.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/analytics?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Failed to fetch signature analytics: ${response.statusText}`)
    }

    return response.json()
  }

  // Helper method to download files
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

export const signaturesService = new SignaturesService()

// Legacy export for backward compatibility
export const signaturesApi = signaturesService