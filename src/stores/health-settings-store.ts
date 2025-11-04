import { create } from 'zustand';

interface NotificationPreference {
  email: boolean;
  sms: boolean;
  browser: boolean;
  criticalOnly: boolean;
}

interface HealthSettings {
  maintenanceMode: boolean;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  alertPreferences: NotificationPreference;
  thresholds: {
    memory: number;
    disk: number;
    cpu: number;
    responseTime: number;
  };
}

export const useHealthSettingsStore = create<HealthSettings & {
  setMaintenanceMode: (enabled: boolean) => void;
  updateThresholds: (thresholds: Partial<HealthSettings['thresholds']>) => void;
  updateAlertPreferences: (prefs: Partial<NotificationPreference>) => void;
}>((set) => ({
  maintenanceMode: false,
  alertPreferences: {
    email: true,
    sms: false,
    browser: true,
    criticalOnly: false,
  },
  thresholds: {
    memory: 90,
    disk: 85,
    cpu: 95,
    responseTime: 1000,
  },
  setMaintenanceMode: (enabled) => set({ maintenanceMode: enabled }),
  updateThresholds: (newThresholds) => 
    set((state) => ({ thresholds: { ...state.thresholds, ...newThresholds } })),
  updateAlertPreferences: (newPrefs) =>
    set((state) => ({ alertPreferences: { ...state.alertPreferences, ...newPrefs } })),
}));