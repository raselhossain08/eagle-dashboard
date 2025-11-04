import { 
  Contract, 
  PaginatedContracts, 
  CreateContractDto, 
  ContractsQueryParams, 
  ContractMetrics,
  DateRange,
  SignatureAnalytics
} from '@/lib/types/contracts'

export class ContractsService {
  private baseUrl = '/api/contracts'

  constructor() {}

  async getContracts(params: ContractsQueryParams): Promise<PaginatedContracts> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.userId) queryParams.append('userId', params.userId)
    if (params.templateId) queryParams.append('templateId', params.templateId)
    if (params.search) queryParams.append('search', params.search)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contracts')
    }
    
    return response.json()
  }

  async getContractById(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contract')
    }
    
    return response.json()
  }

  async createContract(data: CreateContractDto): Promise<Contract> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create contract')
    }
    
    return response.json()
  }

  async sendContract(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}/send`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error('Failed to send contract')
    }
    
    return response.json()
  }

  async voidContract(id: string, reason: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to void contract')
    }
    
    return response.json()
  }

  async markContractAsViewed(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}/viewed`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error('Failed to mark contract as viewed')
    }
    
    return response.json()
  }

  async getContractMetrics(dateRange: DateRange): Promise<ContractMetrics> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    })
    
    const response = await fetch(`${this.baseUrl}/metrics?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch contract metrics')
    }
    
    return response.json()
  }

  async getSigningAnalytics(dateRange: DateRange): Promise<SignatureAnalytics> {
    const queryParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    })
    
    const response = await fetch(`${this.baseUrl}/analytics/signing?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch signing analytics')
    }
    
    return response.json()
  }

  async generateContractPdf(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/pdf`)
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }
    
    return response.blob()
  }

  async previewContract(templateId: string, variables: Record<string, any>): Promise<string> {
    const response = await fetch(`${this.baseUrl}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId, variables }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to preview contract')
    }
    
    const data = await response.json()
    return data.content
  }
}

export const contractsService = new ContractsService()