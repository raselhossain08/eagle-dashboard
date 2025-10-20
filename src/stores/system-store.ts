import { create } from 'zustand';

interface SystemState {
  health: {
    status: 'healthy' | 'warning' | 'error';
    lastCheck: Date;
  };
  metrics: any;
  isConnected: boolean;
  setHealth: (health: any) => void;
  setMetrics: (metrics: any) => void;
  setConnected: (connected: boolean) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  health: {
    status: 'healthy',
    lastCheck: new Date()
  },
  metrics: {},
  isConnected: true,
  setHealth: (health) => set({ health }),
  setMetrics: (metrics) => set({ metrics }),
  setConnected: (isConnected) => set({ isConnected })
}));