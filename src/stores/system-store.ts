import { create } from 'zustand';
import { SystemHealth, SystemStats } from '@/types/system';

interface SystemState {
  health: SystemHealth | null;
  stats: SystemStats | null;
  metrics: any;
  isConnected: boolean;
  lastUpdated: Date | null;
  
  // Actions
  updateSystemHealth: (health: SystemHealth) => void;
  updateSystemStats: (stats: SystemStats) => void;
  setHealth: (health: any) => void;
  setMetrics: (metrics: any) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  health: null,
  stats: null,
  metrics: {},
  isConnected: true,
  lastUpdated: null,
};

export const useSystemStore = create<SystemState>((set) => ({
  ...initialState,
  
  updateSystemHealth: (health: SystemHealth) => 
    set({ 
      health, 
      lastUpdated: new Date(),
      isConnected: health.status !== 'critical' 
    }),
  
  updateSystemStats: (stats: SystemStats) => 
    set({ 
      stats, 
      lastUpdated: new Date() 
    }),
  
  setHealth: (health) => set({ health }),
  setMetrics: (metrics) => set({ metrics }),
  setConnected: (isConnected) => set({ isConnected }),
  
  reset: () => set(initialState),
}));