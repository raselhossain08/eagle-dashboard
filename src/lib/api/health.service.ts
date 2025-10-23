import { API_BASE_URL } from '@/lib/config'

class HealthService {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }

  async checkTemplatesEndpoint(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/templates`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.status !== 404
    } catch (error) {
      console.error('Templates endpoint check failed:', error)
      return false
    }
  }
}

export const healthService = new HealthService()