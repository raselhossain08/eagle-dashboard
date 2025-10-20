import { create } from 'zustand';
import { HealthMetrics, Alert } from '@/types/health';

interface HealthStore {
  // State
  currentHealth: HealthMetrics | null;
  alerts: Alert[];
  isMonitoring: boolean;
  
  // Actions
  setHealth: (health: HealthMetrics) => void;
  addAlert: (alert: Alert) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
  // Initial state
  currentHealth: null,
  alerts: [],
  isMonitoring: false,
  
  // Actions
  setHealth: (health) => set({ currentHealth: health }),
  
  addAlert: (alert) => set((state) => ({ 
    alerts: [...state.alerts, alert] 
  })),
  
  startMonitoring: () => set({ isMonitoring: true }),
  
  stopMonitoring: () => set({ isMonitoring: false }),
  
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    )
  })),
  
  clearAlerts: () => set({ alerts: [] }),
}));