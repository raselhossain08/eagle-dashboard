import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/lib/services/audit.service';

export const usePredictiveInsights = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['audit', 'predictive', dateRange],
    queryFn: () => auditService.getPredictiveInsights(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCorrelationAnalysis = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['audit', 'correlation', dateRange],
    queryFn: () => auditService.getCorrelationAnalysis(dateRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useBehavioralAnalysis = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['audit', 'behavioral', dateRange],
    queryFn: () => auditService.getBehavioralAnalysis(dateRange),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useAnomalyDetection = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['audit', 'anomalies', dateRange],
    queryFn: () => auditService.getAnomalies(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSessionTracking = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: ['audit', 'sessions', activeOnly],
    queryFn: () => auditService.getSessions(activeOnly),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};

export const useComplianceData = (standard?: string) => {
  return useQuery({
    queryKey: ['audit', 'compliance', standard],
    queryFn: () => auditService.getComplianceData(standard),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};