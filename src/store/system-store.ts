// src/stores/system-store.ts
import { create } from 'zustand';
import { 
  SystemHealth, 
  SystemStats, 
  SystemSettings, 
  FeatureFlags,
  WebhookEndpoint,
  WebhookEvent,
  ScheduledTask
} from '@/types/system';

interface SystemStore {
  // System state
  systemHealth: SystemHealth | null;
  systemStats: SystemStats | null;
  isMaintenanceMode: boolean;
  
  // Settings state
  settings: SystemSettings;
  featureFlags: FeatureFlags;
  settingsCategories: string[];
  
  // Webhook state
  webhookEndpoints: WebhookEndpoint[];
  webhookEvents: WebhookEvent[];
  
  // Maintenance state
  lastBackup: Date | null;
  lastCleanup: Date | null;
  scheduledTasks: ScheduledTask[];
  
  // UI state
  selectedSettingCategory: string;
  isProcessingMaintenance: boolean;
  
  // Actions
  updateSystemHealth: (health: SystemHealth) => void;
  updateSystemStats: (stats: SystemStats) => void;
  updateSetting: (key: string, value: any) => void;
  toggleFeatureFlag: (key: string) => void;
  addWebhookEndpoint: (endpoint: WebhookEndpoint) => void;
  updateWebhookEndpoint: (id: string, updates: Partial<WebhookEndpoint>) => void;
  setProcessingMaintenance: (processing: boolean) => void;
  setSelectedSettingCategory: (category: string) => void;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  // Initial state
  systemHealth: null,
  systemStats: null,
  isMaintenanceMode: false,
  settings: {},
  featureFlags: {},
  settingsCategories: ['general', 'security', 'performance', 'notifications'],
  webhookEndpoints: [],
  webhookEvents: [],
  lastBackup: null,
  lastCleanup: null,
  scheduledTasks: [],
  selectedSettingCategory: 'general',
  isProcessingMaintenance: false,

  // Actions
  updateSystemHealth: (health) => set({ systemHealth: health }),
  updateSystemStats: (stats) => set({ systemStats: stats }),
  
  updateSetting: (key, value) => set((state) => ({
    settings: { ...state.settings, [key]: value }
  })),
  
  toggleFeatureFlag: (key) => set((state) => ({
    featureFlags: { 
      ...state.featureFlags, 
      [key]: !state.featureFlags[key] 
    }
  })),
  
  addWebhookEndpoint: (endpoint) => set((state) => ({
    webhookEndpoints: [...state.webhookEndpoints, endpoint]
  })),
  
  updateWebhookEndpoint: (id, updates) => set((state) => ({
    webhookEndpoints: state.webhookEndpoints.map(endpoint =>
      endpoint.id === id ? { ...endpoint, ...updates } : endpoint
    )
  })),
  
  setProcessingMaintenance: (processing) => set({ isProcessingMaintenance: processing }),
  setSelectedSettingCategory: (category) => set({ selectedSettingCategory: category }),
}));