import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  securityService, 
  SecurityAlert, 
  SecuritySession, 
  SecurityDashboard,
  SecurityHealth,
  SecurityAlertFilters,
  SecuritySessionFilters,
  CreateSecurityAlertRequest,
  ResolveSecurityAlertRequest,
  DismissSecurityAlertRequest,
  SecurityAnomalyDetectionResponse
} from '@/lib/api/security';

// Security Dashboard
export function useSecurityDashboard(days: number = 30) {
  return useQuery({
    queryKey: ['security', 'dashboard', days],
    queryFn: () => securityService.getDashboard(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('authentication') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
  });
}

export function useSecurityHealth() {
  return useQuery({
    queryKey: ['security', 'health'],
    queryFn: () => securityService.getHealth(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('authentication') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
  });
}

// Security Alerts
export function useSecurityAlerts(params: SecurityAlertFilters = {}) {
  return useQuery({
    queryKey: ['security', 'alerts', params],
    queryFn: () => securityService.getAlerts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('authentication') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useSecurityAlert(id: string) {
  return useQuery({
    queryKey: ['security', 'alerts', id],
    queryFn: () => securityService.getAlert(id),
    enabled: !!id,
  });
}

export function useCreateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alert: CreateSecurityAlertRequest) => securityService.createAlert(alert),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      toast.success('Security alert created successfully');
      return data;
    },
    onError: (error: Error) => {
      console.error('Create security alert error:', error);
      toast.error(error.message || 'Failed to create security alert');
    },
  });
}

export function useResolveSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      securityService.resolveAlert(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      toast.success('Security alert resolved successfully');
      return data;
    },
    onError: (error: Error) => {
      console.error('Resolve security alert error:', error);
      toast.error(error.message || 'Failed to resolve security alert');
    },
  });
}

export function useDismissSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => securityService.dismissAlert(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      toast.success('Security alert dismissed successfully');
      return data;
    },
    onError: (error: Error) => {
      console.error('Dismiss security alert error:', error);
      toast.error(error.message || 'Failed to dismiss security alert');
    },
  });
}

export function useDeleteSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: securityService.deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security alert deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete security alert: ' + error.message);
    },
  });
}

// Security Sessions
export function useSecuritySessions(params: SecuritySessionFilters = {}) {
  return useQuery({
    queryKey: ['security', 'sessions', params],
    queryFn: () => securityService.getSessions(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('authentication') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useTerminateSecuritySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      securityService.terminateSession(sessionId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      toast.success('Security session terminated successfully');
      return data;
    },
    onError: (error: Error) => {
      console.error('Terminate security session error:', error);
      toast.error(error.message || 'Failed to terminate security session');
    },
  });
}

export function useBlockSecuritySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      securityService.blockSession(sessionId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      toast.success('Security session blocked successfully');
      return data;
    },
    onError: (error: Error) => {
      console.error('Block security session error:', error);
      toast.error(error.message || 'Failed to block security session');
    },
  });
}

// Analytics
export function useSecurityAlertsAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ['security', 'analytics', 'alerts', from, to],
    queryFn: () => securityService.getAlertsAnalytics(from, to),
    enabled: !!(from && to),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSecuritySessionsAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ['security', 'analytics', 'sessions', from, to],
    queryFn: () => securityService.getSessionsAnalytics(from, to),
    enabled: !!(from && to),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Automated Security
export function useDetectAnomalies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => securityService.detectAnomalies(),
    onSuccess: (data: SecurityAnomalyDetectionResponse) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'health'] });
      
      if (data.alertsCreated > 0) {
        toast.success(`Anomaly detection completed. ${data.alertsCreated} new alerts created.`);
      } else {
        toast.info('Anomaly detection completed. No anomalies detected.');
      }
      return data;
    },
    onError: (error: Error) => {
      console.error('Anomaly detection error:', error);
      toast.error(error.message || 'Failed to detect anomalies');
    },
  });
}