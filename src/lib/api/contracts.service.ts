import { API_BASE_URL } from '@/lib/config'
import { AuthCookieService } from '@/lib/auth/cookie-service'
import { 
  ContractsQueryParams, 
  CreateContractDto, 
  Contract, 
  DateRange, 
  ContractMetrics,
  PaginatedContracts 
} from '@/lib/types/contracts'

class ContractsService {
  private baseUrl = `${API_BASE_URL}/contracts`

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async getContracts(params: ContractsQueryParams): Promise<PaginatedContracts> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.userId) searchParams.append('userId', params.userId)
    if (params.status) searchParams.append('status', params.status)
    if (params.templateId) searchParams.append('templateId', params.templateId)
    if (params.subscriptionId) searchParams.append('subscriptionId', params.subscriptionId)

    const response = await fetch(`${this.baseUrl}?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contracts: ${response.statusText}`)
    }

    return response.json()
  }

  async getContractById(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contract: ${response.statusText}`)
    }

    return response.json()
  }

  async createContract(data: CreateContractDto): Promise<Contract> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create contract: ${response.statusText}`)
    }

    return response.json()
  }

  async sendContract(id: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to send contract: ${response.statusText}`)
    }

    return response.json()
  }

  async voidContract(id: string, reason: string): Promise<Contract> {
    const response = await fetch(`${this.baseUrl}/${id}/void`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to void contract: ${response.statusText}`)
    }

    return response.json()
  }

  async getContractMetrics(dateRange: DateRange): Promise<ContractMetrics> {
    const searchParams = new URLSearchParams()
    
    if (dateRange.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/analytics/metrics?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contract metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async getContractAnalytics(dateRange: DateRange): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (dateRange.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/analytics?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contract analytics: ${response.statusText}`)
    }

    return response.json()
  }

  async getTemplatePerformance(dateRange: DateRange): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (dateRange.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/analytics/templates?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch template performance: ${response.statusText}`)
    }

    return response.json()
  }

  async getComplianceMetrics(dateRange: DateRange): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (dateRange.from) searchParams.append('from', dateRange.from.toISOString())
    if (dateRange.to) searchParams.append('to', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/analytics/compliance?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch compliance metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async downloadContract(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/download`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to download contract: ${response.statusText}`)
    }

    return response.blob()
  }
}

export const contractsService = new ContractsService()

// Legacy export for backward compatibility
export const contractsApi = contractsService