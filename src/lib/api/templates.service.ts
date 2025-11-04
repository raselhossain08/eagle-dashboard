import { API_BASE_URL } from '@/lib/config'
import { AuthCookieService } from '@/lib/auth/cookie-service'
import { ContractTemplate } from '@/lib/types/contracts'

export interface PaginatedTemplates {
  data: ContractTemplate[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class TemplatesService {
  private baseUrl = `${API_BASE_URL}/contracts/templates`

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async getTemplates(params: {
    page?: number
    limit?: number
    type?: string
    isActive?: boolean
    locale?: string
  } = {}): Promise<PaginatedTemplates> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.type) searchParams.append('type', params.type)
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
      if (params.locale) searchParams.append('locale', params.locale)

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
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
        throw new Error(`Failed to fetch templates: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching templates:', error)
      // Return empty result as fallback
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

  async getTemplate(id: string): Promise<ContractTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        // If template not found, return a default template
        if (response.status === 404) {
          console.warn(`Template ${id} not found, returning default template`)
          return {
            id: id,
            name: 'Default Template',
            content: 'Default contract content',
            type: 'standard',
            locale: 'en',
            variables: [],
            termsVersion: '1.0',
            privacyVersion: '1.0',
            version: '1.0',
            isActive: true,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        throw new Error(`Failed to fetch template: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching template:', error)
      // Return a fallback template
      return {
        id: id,
        name: 'Default Template',
        content: 'Default contract content',
        type: 'standard',
        locale: 'en',
        variables: [],
        termsVersion: '1.0',
        privacyVersion: '1.0',
        version: '1.0',
        isActive: true,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  async getTemplateForPlan(planId: string, locale: string = 'en'): Promise<ContractTemplate> {
    const response = await fetch(`${this.baseUrl}/plan/${planId}?locale=${locale}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch template for plan: ${response.statusText}`)
    }

    return response.json()
  }

  async renderTemplate(id: string, variables: Record<string, any>): Promise<{ content: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/render`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ variables }),
    })

    if (!response.ok) {
      throw new Error(`Failed to render template: ${response.statusText}`)
    }

    return response.json()
  }

  async createTemplate(data: any): Promise<ContractTemplate> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Try to get the error details from the response
      let errorMessage = `Failed to create template: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = `Failed to create template: ${JSON.stringify(errorData)}`
        }
      } catch (e) {
        // If we can't parse the response, use the status text
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async updateTemplate(id: string, data: any): Promise<ContractTemplate> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.statusText}`)
    }
  }
}

export const templatesService = new TemplatesService()

// Templates API service for backward compatibility
export const templatesApi = templatesService