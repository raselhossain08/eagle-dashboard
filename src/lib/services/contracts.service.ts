import { 
  Contract, 
  ContractsResponse, 
  CreateContractDto, 
  ContractsQueryParams, 
  ContractMetrics,
  DateRange,
  SigningAnalytics
} from '@/lib/types/contracts'
import { securityService } from '@/lib/security.service'
import { templateEngine } from '@/lib/template-engine'
import { pdfService } from '@/lib/pdf-service'

export class ContractsService {
  private baseUrl = '/api/contracts'

  constructor() {}

  async getContracts(params: ContractsQueryParams): Promise<ContractsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status.join(','))
    if (params.customerId) queryParams.append('customerId', params.customerId)
    if (params.templateId) queryParams.append('templateId', params.templateId)
    if (params.search) queryParams.append('search', params.search)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contracts')
    }
    
    return response.json()
  }

  async createContract(data: CreateContractDto): Promise<Contract> {
    // Generate content hash for integrity
    const contentHash = await securityService.generateContentHash(data.title + JSON.stringify(data.variables))
    
    const contractData = {
      ...data,
      contentHash,
      status: 'draft' as const,
      termsVersion: '1.0', // Would come from template
      privacyVersion: '1.0', // Would come from template
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contractData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create contract')
    }
    
    return response.json()
  }

  async generateContractPdf(id: string): Promise<Blob> {
    // Get contract data
    const contract = await this.getContractById(id)
    
    // In real implementation, get template and customer data
    const template = { content: contract.content } as any
    const customer = { name: 'Customer', email: 'customer@example.com' } as any
    
    // Generate PDF with security features
    const pdfBlob = await pdfService.generateContractPdf(contract, template, customer)
    
    return pdfBlob
  }

  async validateContractIntegrity(contractId: string): Promise<{ isValid: boolean; issues: string[] }> {
    const contract = await this.getContractById(contractId)
    
    // Validate content hash
    const isHashValid = await securityService.validateContentHash(
      contract.content, 
      contract.contentHash
    )
    
    const issues: string[] = []
    if (!isHashValid) {
      issues.push('Content hash validation failed - document may have been modified')
    }
    
    // Check for expiry
    if (contract.expiresAt && new Date(contract.expiresAt) < new Date()) {
      issues.push('Contract has expired')
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }

  async getContractById(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contract')
    }
    
    return response.json()
  }

  async getExpiredContracts(): Promise<Contract[]> {
    const response = await fetch(`${this.baseUrl}?status=expired`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch expired contracts')
    }
    
    const data = await response.json()
    return data.data
  }

  async archiveExpiredContracts(): Promise<{ archivedCount: number }> {
    const response = await fetch(`${this.baseUrl}/archive-expired`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error('Failed to archive expired contracts')
    }
    
    return response.json()
  }

  async getContractByHash(hash: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/hash/${hash}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contract by hash')
    }
    
    return response.json()
  }

  async getContractMetrics(dateRange: DateRange): Promise<ContractMetrics> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    })
    
    const response = await fetch(`${this.baseUrl}/metrics?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contract metrics')
    }
    
    return response.json()
  }

  async getSigningAnalytics(dateRange: DateRange): Promise<SigningAnalytics> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    })
    
    const response = await fetch(`${this.baseUrl}/analytics/signing?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch signing analytics')
    }
    
    return response.json()
  }
}

export const contractsService = new ContractsService()

