// lib/api/bulk-discount.service.ts
import { apiClient } from './api-client';
import { CreateDiscountDto, Discount } from '@/types/discounts';

export interface BulkGenerationTemplate {
  // Template configuration
  baseTemplate: CreateDiscountDto;
  
  // Generation settings
  count: number;
  prefix?: string;
  suffix?: string;
  
  // Variation settings
  enableRandomization?: boolean;
  valueVariation?: {
    enabled: boolean;
    minValue: number;
    maxValue: number;
  };
  
  // Advanced settings
  expirationSettings?: {
    useCustomExpiry: boolean;
    daysFromCreation?: number;
    specificDate?: string;
  };
  
  // Distribution settings
  distributionChannels?: string[];
  targetSegments?: string[];
}

export interface BulkGenerationResult {
  success: boolean;
  codes: string[];
  discounts: Discount[];
  failed: Array<{
    code: string;
    error: string;
  }>;
  summary: {
    totalRequested: number;
    totalGenerated: number;
    totalFailed: number;
    estimatedValue: number;
  };
}

export interface BulkGenerationProgress {
  currentStep: string;
  progress: number;
  generatedCount: number;
  totalCount: number;
  estimatedTimeRemaining: number;
}

export interface CodeGenerationSettings {
  codeLength: number;
  includeNumbers: boolean;
  includeLetters: boolean;
  excludeSimilarChars: boolean; // Exclude O, 0, I, l, etc.
  customPattern?: string; // e.g., "XXX-###-XXX"
}

export interface BulkDiscountAnalytics {
  totalBulkOperations: number;
  totalCodesGenerated: number;
  averageBatchSize: number;
  mostUsedPrefixes: Array<{
    prefix: string;
    count: number;
  }>;
  generationHistory: Array<{
    date: string;
    batchSize: number;
    prefix?: string;
    template: Partial<CreateDiscountDto>;
  }>;
}

export class BulkDiscountService {
  private baseUrl = '/discounts';

  async generateBulkDiscounts(template: BulkGenerationTemplate): Promise<BulkGenerationResult> {
    return await apiClient.post<BulkGenerationResult>(`${this.baseUrl}/bulk-generate`, template);
  }

  async previewBulkGeneration(template: BulkGenerationTemplate): Promise<{
    previewCodes: string[];
    estimatedCost: number;
    validation: {
      isValid: boolean;
      warnings: string[];
      errors: string[];
    };
  }> {
    return await apiClient.post(`${this.baseUrl}/bulk-generate/preview`, template);
  }

  async getBulkGenerationProgress(operationId: string): Promise<BulkGenerationProgress> {
    return await apiClient.get(`${this.baseUrl}/bulk-generate/progress/${operationId}`);
  }

  async cancelBulkGeneration(operationId: string): Promise<{ success: boolean }> {
    return await apiClient.post(`${this.baseUrl}/bulk-generate/cancel/${operationId}`);
  }

  async validateBulkTemplate(template: BulkGenerationTemplate): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    return await apiClient.post(`${this.baseUrl}/bulk-generate/validate`, template);
  }

  async getBulkDiscountHistory(params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    prefix?: string;
  } = {}): Promise<{
    data: Array<{
      id: string;
      createdAt: string;
      template: Partial<CreateDiscountDto>;
      generatedCount: number;
      prefix?: string;
      status: 'completed' | 'failed' | 'in_progress';
      createdBy: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params.prefix) searchParams.append('prefix', params.prefix);

    const url = `${this.baseUrl}/bulk-generate/history${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await apiClient.get(url);
  }

  async getBulkDiscountAnalytics(): Promise<BulkDiscountAnalytics> {
    return await apiClient.get(`${this.baseUrl}/bulk-generate/analytics`);
  }

  async exportBulkCodes(batchId: string, format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${this.baseUrl}/bulk-generate/export/${batchId}?format=${format}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': format === 'json' ? 'application/json' : format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  async duplicateBulkGeneration(batchId: string, modifications?: Partial<BulkGenerationTemplate>): Promise<BulkGenerationResult> {
    return await apiClient.post(`${this.baseUrl}/bulk-generate/duplicate/${batchId}`, modifications);
  }

  async getCodeGenerationSuggestions(input: {
    businessType?: string;
    campaignType?: string;
    targetAudience?: string;
    seasonality?: string;
  }): Promise<{
    suggestedPrefixes: string[];
    suggestedTemplates: Partial<CreateDiscountDto>[];
    bestPractices: string[];
  }> {
    return await apiClient.post(`${this.baseUrl}/bulk-generate/suggestions`, input);
  }
}

export const bulkDiscountService = new BulkDiscountService();