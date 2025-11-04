// hooks/use-fraud-detection.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fraudDetectionAPI, 
  SuspiciousActivity, 
  FraudMetrics, 
  RealTimeFraudAlert,
  BlockCriteria, 
  SuspiciousActivityQuery,
  InvestigationPayload,
  WhitelistPayload
} from '@/lib/api/fraud-detection.service';
import { toast } from 'sonner';

/**
 * Hook for fetching suspicious redemption activities
 */
export const useSuspiciousActivities = (query: SuspiciousActivityQuery = {}) => {
  return useQuery({
    queryKey: ['suspicious-activities', query],
    queryFn: () => fraudDetectionAPI.getSuspiciousActivities(query),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

/**
 * Hook for fetching fraud detection metrics
 */
export const useFraudMetrics = () => {
  return useQuery({
    queryKey: ['fraud-metrics'],
    queryFn: () => fraudDetectionAPI.getFraudMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook for real-time fraud alerts with live polling
 */
export const useRealTimeFraudAlerts = (options: {
  enablePolling?: boolean;
  pollingInterval?: number;
  onNewAlert?: (alert: RealTimeFraudAlert) => void;
} = {}) => {
  const { enablePolling = true, pollingInterval = 15000, onNewAlert } = options;

  return useQuery({
    queryKey: ['fraud-alerts', 'realtime'],
    queryFn: async () => {
      const alerts = await fraudDetectionAPI.getRealTimeFraudAlerts();
      
      // Check for new high-severity alerts
      if (onNewAlert) {
        alerts.forEach(alert => {
          if (alert.severity === 'critical' || alert.severity === 'high') {
            const isRecent = new Date().getTime() - alert.timestamp.getTime() < pollingInterval + 5000;
            if (isRecent) {
              onNewAlert(alert);
            }
          }
        });
      }
      
      return alerts;
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: enablePolling ? pollingInterval : false,
    enabled: enablePolling,
  });
};

/**
 * Hook for blocking suspicious activity
 */
export const useBlockSuspiciousActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (criteria: BlockCriteria) => fraudDetectionAPI.blockSuspiciousActivity(criteria),
    onSuccess: (data) => {
      // Invalidate and refetch suspicious activities
      queryClient.invalidateQueries({ queryKey: ['suspicious-activities'] });
      queryClient.invalidateQueries({ queryKey: ['fraud-metrics'] });
      
      toast.success('Suspicious Activity Blocked', {
        description: `${data.blockedItems} activities blocked successfully. Block ID: ${data.blockId}`
      });
    },
    onError: (error: any) => {
      toast.error('Block Failed', {
        description: error.message || 'Failed to block suspicious activity'
      });
    }
  });
};

/**
 * Hook for starting investigations
 */
export const useStartInvestigation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InvestigationPayload) => fraudDetectionAPI.startInvestigation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suspicious-activities'] });
      
      toast.success('Investigation Started', {
        description: `Investigation ${data.investigationId} assigned to ${data.assignedTo}. ETA: ${data.estimatedTime} hours`
      });
    },
    onError: (error: any) => {
      toast.error('Investigation Failed', {
        description: error.message || 'Failed to start investigation'
      });
    }
  });
};

/**
 * Hook for fetching investigation details
 */
export const useInvestigationDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () => fraudDetectionAPI.getInvestigationDetails(id),
    enabled: !!id && enabled,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // 1 minute for all investigations
  });
};

/**
 * Hook for whitelist management
 */
export const useWhitelist = () => {
  return useQuery({
    queryKey: ['fraud-whitelist'],
    queryFn: () => fraudDetectionAPI.getWhitelist(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for adding items to whitelist
 */
export const useAddToWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WhitelistPayload) => fraudDetectionAPI.addToWhitelist(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fraud-whitelist'] });
      queryClient.invalidateQueries({ queryKey: ['suspicious-activities'] });
      
      toast.success('Added to Whitelist', {
        description: data.message
      });
    },
    onError: (error: any) => {
      toast.error('Whitelist Update Failed', {
        description: error.message || 'Failed to add to whitelist'
      });
    }
  });
};

/**
 * Hook for exporting fraud reports
 */
export const useExportFraudReport = () => {
  return useMutation({
    mutationFn: (params: {
      startDate: Date;
      endDate: Date;
      format: 'csv' | 'excel' | 'json';
      includeDetails?: boolean;
      riskLevels?: ('low' | 'medium' | 'high')[];
    }) => fraudDetectionAPI.exportFraudReport(params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fraud-report-${variables.startDate.toISOString().split('T')[0]}-to-${variables.endDate.toISOString().split('T')[0]}.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report Exported', {
        description: `Fraud detection report exported as ${variables.format.toUpperCase()}`
      });
    },
    onError: (error: any) => {
      toast.error('Export Failed', {
        description: error.message || 'Failed to export fraud report'
      });
    }
  });
};

/**
 * Hook for ML model performance monitoring
 */
export const useModelPerformance = () => {
  return useQuery({
    queryKey: ['fraud-model-performance'],
    queryFn: () => fraudDetectionAPI.getModelPerformance(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook for retraining the fraud detection model
 */
export const useRetrainModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      datasetSize?: number;
      features?: string[];
      hyperparameters?: Record<string, any>;
    } = {}) => fraudDetectionAPI.retrainModel(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fraud-model-performance'] });
      
      toast.success('Model Retraining Started', {
        description: `Training ID: ${data.trainingId}. ETA: ${data.estimatedTime} minutes`
      });
    },
    onError: (error: any) => {
      toast.error('Model Retraining Failed', {
        description: error.message || 'Failed to start model retraining'
      });
    }
  });
};

/**
 * Enhanced hook that combines suspicious activities with real-time monitoring
 */
export const useEnhancedFraudDetection = (options: {
  autoRefresh?: boolean;
  riskLevelFilter?: 'low' | 'medium' | 'high';
  enableRealTimeAlerts?: boolean;
} = {}) => {
  const { autoRefresh = true, riskLevelFilter, enableRealTimeAlerts = true } = options;

  const suspiciousActivities = useSuspiciousActivities({
    riskLevel: riskLevelFilter,
    limit: 50
  });

  const fraudMetrics = useFraudMetrics();

  const realTimeAlerts = useRealTimeFraudAlerts({
    enablePolling: enableRealTimeAlerts,
    onNewAlert: (alert) => {
      // Show toast notification for critical alerts
      if (alert.severity === 'critical') {
        toast.error('Critical Fraud Alert', {
          description: alert.message,
          action: {
            label: 'View Details',
            onClick: () => {
              // Navigate to alert details or open modal
              console.log('Navigate to alert:', alert.id);
            }
          }
        });
      }
    }
  });

  const blockActivity = useBlockSuspiciousActivity();
  const startInvestigation = useStartInvestigation();
  const exportReport = useExportFraudReport();

  return {
    // Data
    suspiciousActivities: suspiciousActivities.data || [],
    fraudMetrics: fraudMetrics.data,
    realTimeAlerts: realTimeAlerts.data || [],
    
    // Loading states
    isLoading: suspiciousActivities.isLoading || fraudMetrics.isLoading,
    isLoadingAlerts: realTimeAlerts.isLoading,
    
    // Error states
    error: suspiciousActivities.error || fraudMetrics.error,
    alertsError: realTimeAlerts.error,
    
    // Actions
    blockActivity: blockActivity.mutateAsync,
    startInvestigation: startInvestigation.mutateAsync,
    exportReport: exportReport.mutateAsync,
    
    // Action states
    isBlocking: blockActivity.isPending,
    isStartingInvestigation: startInvestigation.isPending,
    isExporting: exportReport.isPending,
    
    // Refetch functions
    refetchActivities: suspiciousActivities.refetch,
    refetchMetrics: fraudMetrics.refetch,
    refetchAlerts: realTimeAlerts.refetch,
  };
};