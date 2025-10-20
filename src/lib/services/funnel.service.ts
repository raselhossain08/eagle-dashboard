import { apiClient } from '../api/client'
import { FunnelData } from '@/types'

export interface CreateFunnelParams {
  name: string
  steps: string[]
  description?: string
}

export interface FunnelTimeAnalysisParams {
  funnelId: string
  startDate: Date
  endDate: Date
  groupBy: 'hour' | 'day' | 'week'
}

export interface SegmentPerformanceParams {
  funnelId: string
  startDate: Date
  endDate: Date
  segments: string[]
}

export class FunnelService {
  constructor(private client: typeof apiClient) {}

  async createFunnel(params: CreateFunnelParams): Promise<FunnelData> {
    return this.client.post<FunnelData>('/analytics/funnels/create', params)
  }

  async getFunnelTimeAnalysis(params: FunnelTimeAnalysisParams): Promise<any[]> {
    return this.client.get<any[]>('/analytics/funnels/time-analysis', params)
  }

  async getSegmentPerformance(params: SegmentPerformanceParams): Promise<any[]> {
    return this.client.get<any[]>('/analytics/funnels/segment-performance', params)
  }

  async getFunnelById(funnelId: string): Promise<FunnelData> {
    return this.client.get<FunnelData>(`/analytics/funnels/${funnelId}`)
  }

  async getAllFunnels(): Promise<FunnelData[]> {
    return this.client.get<FunnelData[]>('/analytics/funnels')
  }

  async deleteFunnel(funnelId: string): Promise<void> {
    return this.client.delete(`/analytics/funnels/${funnelId}`)
  }
}

export const funnelService = new FunnelService(apiClient)