import { apiClient } from './client';

export interface CreateFunnelParams {
  name: string;
  steps: string[];
  description?: string;
}

export interface FunnelResponse {
  id: string;
  name: string;
  steps: string[];
  description?: string;
  createdAt: string;
}

export interface FunnelTimeAnalysisParams {
  funnelId: string;
  startDate: Date;
  endDate: Date;
  groupBy: 'hour' | 'day' | 'week' | 'month';
}

export interface FunnelTimeData {
  date: string;
  step: string;
  count: number;
  conversionRate: number;
  averageTime: number;
}

export interface SegmentPerformanceParams {
  funnelId: string;
  segmentBy: 'channel' | 'device' | 'country';
  startDate: Date;
  endDate: Date;
}

export interface SegmentData {
  segment: string;
  steps: Array<{
    step: string;
    count: number;
    conversionRate: number;
  }>;
}

export class FunnelService {
  async createFunnel(params: CreateFunnelParams): Promise<FunnelResponse> {
    return apiClient.post('/analytics/funnels/create', params);
  }

  async getFunnelTimeAnalysis(params: FunnelTimeAnalysisParams): Promise<FunnelTimeData[]> {
    return apiClient.get(`/analytics/funnels/${params.funnelId}/time-analysis`, {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      groupBy: params.groupBy,
    });
  }

  async getSegmentPerformance(params: SegmentPerformanceParams): Promise<SegmentData[]> {
    return apiClient.get(`/analytics/funnels/${params.funnelId}/segment-performance`, {
      segmentBy: params.segmentBy,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }
}

export const funnelService = new FunnelService();