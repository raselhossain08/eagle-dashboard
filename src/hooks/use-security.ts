import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { securityService, SecurityAlert, SecuritySession, SecurityDashboard } from '@/lib/api/security';

// Security Dashboard
export function useSecurityDashboard(days: number = 30) {
  return useQuery({
    queryKey: ['security', 'dashboard', days],
    queryFn: () => securityService.getDashboard(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSecurityHealth() {
  return useQuery({
    queryKey: ['security', 'health'],
    queryFn: () => securityService.getHealth(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

// Security Alerts
export function useSecurityAlerts(params: {
  page?: number;
  limit?: number;
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  adminUserId?: string;
  resolved?: boolean;
  dismissed?: boolean;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ['security', 'alerts', params],
    queryFn: () => securityService.getAlerts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
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
    mutationFn: securityService.createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security alert created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create security alert: ' + error.message);
    },
  });
}

export function useResolveSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      securityService.resolveAlert(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security alert resolved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to resolve security alert: ' + error.message);
    },
  });
}

export function useDismissSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => securityService.dismissAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security alert dismissed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to dismiss security alert: ' + error.message);
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
export function useSecuritySessions(params: {
  page?: number;
  limit?: number;
  userId?: string;
  isActive?: boolean;
  isSuspicious?: boolean;
  isBlocked?: boolean;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['security', 'sessions', params],
    queryFn: () => securityService.getSessions(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTerminateSecuritySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      securityService.terminateSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security session terminated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to terminate security session: ' + error.message);
    },
  });
}

export function useBlockSecuritySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      securityService.blockSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success('Security session blocked successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to block security session: ' + error.message);
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
    mutationFn: securityService.detectAnomalies,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'dashboard'] });
      toast.success(`Anomaly detection completed. ${data.alertsCreated} alerts created.`);
    },
    onError: (error: Error) => {
      toast.error('Failed to detect anomalies: ' + error.message);
    },
  });
}