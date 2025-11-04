// hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials, User, Session } from '@/types/auth';
import { AuthService } from '@/lib/services/auth.service';
import { ApiClient } from '@/lib/api/api-client';
import { TokenStorageService } from '@/lib/auth/token-storage.service';
import { SessionStorageService } from '@/lib/auth/session-storage.service';
import { SecurityMonitorService } from '@/lib/auth/security-monitor.service';
import { useAuthStore } from '@/store/auth-store';

// Auth Service instance
const authService = new AuthService();

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setRequires2FA } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      // Log login attempt
      SecurityMonitorService.logSecurityEvent({
        type: 'login_attempt',
        userId: credentials.email,
        ip: 'current', // You'd get this from your backend or a service
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { email: credentials.email }
      });

      return authService.login(credentials);
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        // Handle 2FA flow
        setRequires2FA(true, data.user);
        sessionStorage.setItem('pending2FAUser', JSON.stringify(data.user));
        
        SecurityMonitorService.logSecurityEvent({
          type: '2fa_required',
          userId: data.user.id,
          ip: 'current',
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          details: { email: data.user.email }
        });
      } else {
        // Complete login
        TokenStorageService.setTokens(data.accessToken, data.refreshToken);
        SessionStorageService.setUserSession(data.user);
        setUser(data.user);
        queryClient.setQueryData(['user'], data.user);
        
        SecurityMonitorService.logSecurityEvent({
          type: 'login_success',
          userId: data.user.id,
          ip: 'current',
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          details: { email: data.user.email, role: data.user.role }
        });

        // Check for suspicious activity
        const suspiciousCheck = SecurityMonitorService.detectSuspiciousLogin({
          email: data.user.email,
          ip: 'current',
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          success: true
        });

        if (suspiciousCheck.suspicious) {
          SecurityMonitorService.addSecurityAlert({
            type: 'suspicious_login',
            message: `Suspicious login detected: ${suspiciousCheck.reasons.join(', ')}`,
            timestamp: new Date(),
            resolved: false
          });
        }
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      SecurityMonitorService.logSecurityEvent({
        type: 'login_failed',
        userId: 'unknown',
        ip: 'current',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { error: error.message }
      });

      // Increment rate limiting
      SecurityMonitorService.incrementAttempts(`login:${error.email}:current`);
    }
  });
};

export const useVerify2FA = () => {
  const queryClient = useQueryClient();
  const { setUser, setRequires2FA } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) => 
      authService.verify2FA(userId, code),
    onSuccess: (data) => {
      TokenStorageService.setTokens(data.accessToken, data.refreshToken);
      SessionStorageService.setUserSession(data.user);
      setUser(data.user);
      setRequires2FA(false, null);
      queryClient.setQueryData(['user'], data.user);
      sessionStorage.removeItem('pending2FAUser');

      SecurityMonitorService.logSecurityEvent({
        type: '2fa_success',
        userId: data.user.id,
        ip: 'current',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { email: data.user.email }
      });
    },
    onError: (error: any) => {
      SecurityMonitorService.logSecurityEvent({
        type: '2fa_failed',
        userId: 'unknown',
        ip: 'current',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { error: error.message }
      });
    }
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (data) => {
      TokenStorageService.setTokens(data.accessToken, data.refreshToken);
    },
    onError: (error: any) => {
      console.error('Token refresh failed:', error);
      TokenStorageService.clearTokens();
      SessionStorageService.clearUserSession();
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearUser, user } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      handleLogout();
    },
    onError: () => {
      handleLogout();
    }
  });

  function handleLogout() {
    if (user) {
      SecurityMonitorService.logSecurityEvent({
        type: 'logout',
        userId: user.id,
        ip: 'current',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { email: user.email }
      });
    }

    TokenStorageService.clearTokens();
    SessionStorageService.clearUserSession();
    clearUser();
    queryClient.clear();
    queryClient.removeQueries();
    
    // Clear any pending 2FA state
    sessionStorage.removeItem('pending2FAUser');
  }
};

export const useUser = () => {
  const { user, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // First check store
      if (user) return user;

      // Then check session storage
      const sessionUser = SessionStorageService.getUserSession();
      if (sessionUser) {
        setUser(sessionUser);
        return sessionUser;
      }

      // Finally validate with backend
      try {
        const validatedUser = await authService.validateSession();
        setUser(validatedUser);
        return validatedUser;
      } catch {
        throw new Error('No valid session');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => authService.getActiveSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!TokenStorageService.getAccessToken(),
  });
};

export const useSecurityEvents = (filters?: any) => {
  return useQuery({
    queryKey: ['security-events', filters],
    queryFn: () => {
      const events = SecurityMonitorService.getSecurityEvents(filters);
      return events;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useSecurityStats = () => {
  return useQuery({
    queryKey: ['security-stats'],
    queryFn: () => SecurityMonitorService.getSecurityStats(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (sessionId?: string) => authService.terminateSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      
      SecurityMonitorService.logSecurityEvent({
        type: 'session_terminated',
        userId: user?.id || 'unknown',
        ip: 'current',
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        details: { sessionId }
      });
    }
  });
};