import { ContractTemplate } from '@/lib/types/contracts'
import { AuthCookieService } from '@/lib/auth/cookie-service'

interface TemplatesQueryParams {
  page?: number
  limit?: number
  search?: string
}

interface TemplatesResponse {
  data: ContractTemplate[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface CreateTemplateDto {
  name: string
  content: string
  type: string
  variables: any[]
}

interface UpdateTemplateDto {
  name?: string
  content?: string
  type?: string
  variables?: any[]
}

interface TemplateVariable {
  name: string
  type: string
  required: boolean
  description?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class TemplatesService {
  private baseUrl = '/api/v1/templates'

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async getTemplates(params: TemplatesQueryParams): Promise<TemplatesResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)

      const response = await fetch(`${this.baseUrl}?${queryParams}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        // If templates endpoint doesn't exist, return empty result
        if (response.status === 404) {
          console.warn('Templates endpoint not found, returning empty result')
          return {
            data: [],
            meta: {
              total: 0,
              page: params.page || 1,
              limit: params.limit || 10,
              totalPages: 0,
            }
          }
        }
        throw new Error('Failed to fetch templates')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error fetching templates:', error)
      return {
        data: [],
        meta: {
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0,
        }
      }
    }
  }

  async getTemplateById(id: string): Promise<ContractTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Template not found')
        }
        throw new Error('Failed to fetch template')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error fetching template:', error)
      throw error
    }
  }

  async createTemplate(data: CreateTemplateDto): Promise<ContractTemplate> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create template')
    }
    
    return response.json()
  }

  async updateTemplate(id: string, data: UpdateTemplateDto): Promise<ContractTemplate> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update template')
    }
    
    return response.json()
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete template')
    }
  }

  async renderTemplate(id: string, variables: Record<string, any>): Promise<{ content: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/render`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ variables }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to render template')
    }
    
    return response.json()
  }

  async validateTemplate(content: string): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to validate template')
    }
    
    return response.json()
  }

  async getTemplateVariables(content: string): Promise<TemplateVariable[]> {
    const response = await fetch(`${this.baseUrl}/variables`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to extract template variables')
    }
    
    return response.json()
  }
}

export const templatesService = new TemplatesService()