import { ContractTemplate, CreateTemplateDto, UpdateTemplateDto, TemplatesQueryParams, TemplatesResponse, TemplateVariable, ValidationResult } from '@/lib/types/contracts'

export class TemplatesService {
  private baseUrl = '/api/contracts/templates'

  constructor() {}

  async getTemplates(params: TemplatesQueryParams): Promise<TemplatesResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }
    
    return response.json()
  }

  async getTemplateById(id: string): Promise<ContractTemplate> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch template')
    }
    
    return response.json()
  }

  async createTemplate(data: CreateTemplateDto): Promise<ContractTemplate> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete template')
    }
  }

  async renderTemplate(id: string, variables: Record<string, any>): Promise<{ content: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to extract template variables')
    }
    
    return response.json()
  }
}

export const templatesService = new TemplatesService()