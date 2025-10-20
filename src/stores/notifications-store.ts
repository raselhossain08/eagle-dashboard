import { create } from 'zustand';
import { Notification, EmailLog, Template, EmailStats } from '@/types/notifications';

interface NotificationsStore {
  // In-app notifications state
  notifications: Notification[];
  unreadCount: number;
  
  // Email state
  emailLogs: EmailLog[];
  emailStats: EmailStats | null;
  
  // Template state
  templates: Template[];
  activeTemplate: Template | null;
  
  // UI state
  isNotificationPanelOpen: boolean;
  selectedNotifications: string[];
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setEmailLogs: (logs: EmailLog[]) => void;
  setEmailStats: (stats: EmailStats) => void;
  setTemplates: (templates: Template[]) => void;
  setActiveTemplate: (template: Template | null) => void;
  toggleNotificationPanel: () => void;
  selectNotification: (id: string) => void;
  clearSelection: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  emailLogs: [],
  emailStats: null,
  templates: [],
  activeTemplate: null,
  isNotificationPanelOpen: false,
  selectedNotifications: [],

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setEmailLogs: (emailLogs) => set({ emailLogs }),
  setEmailStats: (emailStats) => set({ emailStats }),
  setTemplates: (templates) => set({ templates }),
  setActiveTemplate: (activeTemplate) => set({ activeTemplate }),
  toggleNotificationPanel: () =>
    set((state) => ({ isNotificationPanelOpen: !state.isNotificationPanelOpen })),
  selectNotification: (id) =>
    set((state) => ({
      selectedNotifications: state.selectedNotifications.includes(id)
        ? state.selectedNotifications.filter((nid) => nid !== id)
        : [...state.selectedNotifications, id],
    })),
  clearSelection: () => set({ selectedNotifications: [] }),
}));