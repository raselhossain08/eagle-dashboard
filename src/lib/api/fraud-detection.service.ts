// lib/api/fraud-detection.service.ts
import { apiClient } from './api-client';

// Types
export interface SuspiciousActivity {
  id: string;
  type: 'multiple_ips' | 'bulk_redemptions' | 'unusual_pattern' | 'high_value_new_user' | 'velocity_abuse' | 'bot_activity';
  count: number;
  details: string;
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  firstDetected: Date;
  lastActivity: Date;
  affectedRedemptions: string[];
  patterns: {
    ipAddresses?: string[];
    userIds?: string[];
    codes?: string[];
    timeWindows?: string[];
    deviceFingerprints?: string[];
  };
  mlConfidence: number;
  actionTaken?: string;
  investigationStatus: 'pending' | 'in_progress' | 'resolved' | 'false_positive';
}

export interface FraudMetrics {
  totalSuspiciousActivities: number;
  highRiskAlerts: number;
  mediumRiskAlerts: number;
  lowRiskAlerts: number;
  preventedLoss: number;
  accuracyRate: number;
  avgResponseTime: number;
}

export interface RealTimeFraudAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  redemptionId: string;
  userId?: string;
  ipAddress?: string;
  deviceInfo?: any;
  autoBlocked: boolean;
}

export interface BlockCriteria {
  ipAddress?: string;
  userId?: string;
  pattern?: string;
  type?: string;
  riskLevel?: string;
  reason?: string;
}

export interface SuspiciousActivityQuery {
  startDate?: Date;
  endDate?: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  limit?: number;
  offset?: number;
}

export interface InvestigationPayload {
  activityId: string;
  investigatorId?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface WhitelistPayload {
  type: 'ip' | 'user' | 'domain';
  value: string;
  reason: string;
}

export class FraudDetectionAPI {
  private readonly baseURL = '/discounts/fraud-detection';

  /**
   * Get suspicious redemption activities with ML analysis
   */
  async getSuspiciousActivities(query: SuspiciousActivityQuery = {}): Promise<SuspiciousActivity[]> {
    try {
      const params = new URLSearchParams();
      
      if (query.startDate) {
        params.append('startDate', query.startDate.toISOString());
      }
      if (query.endDate) {
        params.append('endDate', query.endDate.toISOString());
      }
      if (query.riskLevel) {
        params.append('riskLevel', query.riskLevel);
      }
      if (query.limit) {
        params.append('limit', query.limit.toString());
      }
      if (query.offset) {
        params.append('offset', query.offset.toString());
      }

      const response = await apiClient.get<SuspiciousActivity[]>(
        `${this.baseURL}/suspicious?${params.toString()}`
      );

      // Convert date strings to Date objects
      return response.map(activity => ({
        ...activity,
        firstDetected: new Date(activity.firstDetected),
        lastActivity: new Date(activity.lastActivity)
      }));
    } catch (error) {
      console.error('Failed to fetch suspicious activities:', error);
      throw error;
    }
  }

  /**
   * Get fraud detection metrics and statistics
   */
  async getFraudMetrics(): Promise<FraudMetrics> {
    try {
      return await apiClient.get<FraudMetrics>(`${this.baseURL}/metrics`);
    } catch (error) {
      console.error('Failed to fetch fraud metrics:', error);
      throw error;
    }
  }

  /**
   * Get real-time fraud alerts for live monitoring
   */
  async getRealTimeFraudAlerts(): Promise<RealTimeFraudAlert[]> {
    try {
      const response = await apiClient.get<RealTimeFraudAlert[]>(`${this.baseURL}/alerts/realtime`);
      
      // Convert timestamp strings to Date objects
      return response.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    } catch (error) {
      console.error('Failed to fetch real-time fraud alerts:', error);
      throw error;
    }
  }

  /**
   * Block suspicious activity based on criteria
   */
  async blockSuspiciousActivity(criteria: BlockCriteria): Promise<{
    success: boolean;
    message: string;
    blockedItems: number;
    blockId: string;
  }> {
    try {
      return await apiClient.post(`${this.baseURL}/block`, criteria);
    } catch (error) {
      console.error('Failed to block suspicious activity:', error);
      throw error;
    }
  }

  /**
   * Start investigation for suspicious activity
   */
  async startInvestigation(payload: InvestigationPayload): Promise<{
    success: boolean;
    investigationId: string;
    estimatedTime: number;
    assignedTo: string;
  }> {
    try {
      return await apiClient.post(`${this.baseURL}/investigate`, payload);
    } catch (error) {
      console.error('Failed to start investigation:', error);
      throw error;
    }
  }

  /**
   * Get investigation details and progress
   */
  async getInvestigationDetails(id: string): Promise<{
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    progress: number;
    findings: any[];
    timeline: any[];
    resolution?: string;
  }> {
    try {
      return await apiClient.get(`${this.baseURL}/investigation/${id}`);
    } catch (error) {
      console.error('Failed to get investigation details:', error);
      throw error;
    }
  }

  /**
   * Get whitelist configuration
   */
  async getWhitelist(): Promise<{
    ips: string[];
    users: string[];
    domains: string[];
  }> {
    try {
      return await apiClient.get(`${this.baseURL}/whitelist`);
    } catch (error) {
      console.error('Failed to fetch whitelist:', error);
      throw error;
    }
  }

  /**
   * Add IP, user, or domain to whitelist
   */
  async addToWhitelist(payload: WhitelistPayload): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      return await apiClient.post(`${this.baseURL}/whitelist`, payload);
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
      throw error;
    }
  }

  /**
   * Export fraud detection report
   */
  async exportFraudReport(params: {
    startDate: Date;
    endDate: Date;
    format: 'csv' | 'excel' | 'json';
    includeDetails?: boolean;
    riskLevels?: ('low' | 'medium' | 'high')[];
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
        format: params.format,
        includeDetails: params.includeDetails ? 'true' : 'false'
      });

      if (params.riskLevels?.length) {
        params.riskLevels.forEach(level => {
          queryParams.append('riskLevels', level);
        });
      }

      const response = await fetch(`/api${this.baseURL}/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export fraud report:', error);
      throw error;
    }
  }

  /**
   * Get fraud detection model performance
   */
  async getModelPerformance(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
    lastTraining: Date;
    modelVersion: string;
  }> {
    try {
      const response = await apiClient.get<{
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
        confusionMatrix: number[][];
        lastTraining: string;
        modelVersion: string;
      }>(`${this.baseURL}/model/performance`);
      
      return {
        ...response,
        lastTraining: new Date(response.lastTraining)
      };
    } catch (error) {
      console.error('Failed to get model performance:', error);
      throw error;
    }
  }

  /**
   * Retrain fraud detection model
   */
  async retrainModel(payload: {
    datasetSize?: number;
    features?: string[];
    hyperparameters?: Record<string, any>;
  } = {}): Promise<{
    success: boolean;
    trainingId: string;
    estimatedTime: number;
  }> {
    try {
      return await apiClient.post(`${this.baseURL}/model/retrain`, payload);
    } catch (error) {
      console.error('Failed to start model retraining:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fraudDetectionAPI = new FraudDetectionAPI();