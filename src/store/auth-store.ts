// store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SecurityAlert, Session } from '@/types/auth';
import { SecurityAlertProps } from '@/components/auth/security-alert';

interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Session state
  sessionExpiry: Date | null;
  lastActivity: Date | null;
  
  // 2FA state
  requires2FA: boolean;
  pending2FAUser: Partial<User> | null;
  
  // Security state
  securityAlerts: SecurityAlertProps[];
  activeSessions: Session[];
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setSessionExpiry: (expiry: Date) => void;
  updateLastActivity: () => void;
  setRequires2FA: (requires: boolean, user?: Partial<User>) => void;
  addSecurityAlert: (alert: SecurityAlertProps) => void;
  dismissSecurityAlert: (id: string) => void;
  clearSecurityAlerts: () => void;
  setActiveSessions: (sessions: Session[]) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpiry: null,
      lastActivity: null,
      requires2FA: false,
      pending2FAUser: null,
      securityAlerts: [],
      activeSessions: [],

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: true,
        lastActivity: new Date(),
        requires2FA: false,
        pending2FAUser: null
      }),

      clearUser: () => set({
        user: null,
        isAuthenticated: false,
        sessionExpiry: null,
        lastActivity: null,
        requires2FA: false,
        pending2FAUser: null,
        securityAlerts: [],
        activeSessions: []
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setSessionExpiry: (expiry) => set({ sessionExpiry: expiry }),

      updateLastActivity: () => set({ lastActivity: new Date() }),

      setRequires2FA: (requires, user) => set({ 
        requires2FA: requires, 
        pending2FAUser: user || null 
      }),

      addSecurityAlert: (alert) => set((state) => ({
        securityAlerts: [alert, ...state.securityAlerts].slice(0, 50) // Keep only 50 latest
      })),

      dismissSecurityAlert: (id) => set((state) => ({
        securityAlerts: state.securityAlerts.filter(alert => alert.id !== id)
      })),

      clearSecurityAlerts: () => set({ securityAlerts: [] }),

      setActiveSessions: (sessions) => set({ activeSessions: sessions }),

      updateUserProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }))
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        securityAlerts: state.securityAlerts,
        activeSessions: state.activeSessions,
      }),
    }
  )
);

// Store selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useSecurityAlerts = () => useAuthStore((state) => state.securityAlerts);
export const useActiveSessions = () => useAuthStore((state) => state.activeSessions);
export const useRequires2FA = () => useAuthStore((state) => state.requires2FA);
export const usePending2FAUser = () => useAuthStore((state) => state.pending2FAUser);