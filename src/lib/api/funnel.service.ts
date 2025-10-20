import { apiClient } from './client';

export interface CreateFunnelParams {
  name: string;
  steps: Array<{ event: string; name: string }>;
  filters?: Record<string, any>;
}

export interface FunnelResponse {
  id: string;
  name: string;
  steps: Array<{ event: string; name: string }>;
  filters?: Record<string, any>;
  createdAt: string;
}

export interface FunnelTimeAnalysisParams {
  steps: string[];
  startDate: Date;
  endDate: Date;
}

export interface FunnelTimeData {
  step: string;
  count: number;
  conversionRate: number;
  averageTime: number;
  dropoffRate: number;
}

export interface SegmentPerformanceParams {
  steps: string[];
  segmentBy: string;
  startDate: Date;
  endDate: Date;
}

export interface SegmentData {
  segment: string;
  totalUsers: number;
  completionRate: number;
  conversionRate?: number;
  convertingUsers?: number;
  steps?: Array<{
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
    return apiClient.get('/analytics/funnels/time-analysis', {
      steps: params.steps,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }

  async getSegmentPerformance(params: SegmentPerformanceParams): Promise<SegmentData[]> {
    return apiClient.get('/analytics/funnels/segment-performance', {
      steps: params.steps,
      segmentBy: params.segmentBy,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
  }
}

export const funnelService = new FunnelService();