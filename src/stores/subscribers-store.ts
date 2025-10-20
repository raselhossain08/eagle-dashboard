// stores/subscribers-store.ts
import { create } from 'zustand';
import { SubscriberProfile, SubscriberFilters } from '@/types/subscribers';

interface SubscribersStore {
  // Current state
  subscribers: SubscriberProfile[];
  currentSubscriber: SubscriberProfile | null;
  totalCount: number;
  
  // Filters and pagination
  filters: SubscriberFilters;
  searchQuery: string;
  sortBy: string;
  currentPage: number;
  pageSize: number;
  
  // Analytics state
  analytics: any | null;
  segments: any[];
  
  // UI state
  selectedSubscribers: string[];
  isLoading: boolean;
  
  // Actions
  setFilters: (filters: SubscriberFilters) => void;
  setSearchQuery: (query: string) => void;
  setCurrentSubscriber: (subscriber: SubscriberProfile) => void;
  selectSubscriber: (id: string) => void;
  clearSelection: () => void;
  bulkAction: (action: string, subscriberIds: string[]) => Promise<void>;
}

export const useSubscribersStore = create<SubscribersStore>((set, get) => ({
  // Initial state
  subscribers: [],
  currentSubscriber: null,
  totalCount: 0,
  filters: {},
  searchQuery: '',
  sortBy: 'createdAt',
  currentPage: 1,
  pageSize: 10,
  analytics: null,
  segments: [],
  selectedSubscribers: [],
  isLoading: false,

  // Actions
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  
  setCurrentSubscriber: (currentSubscriber) => set({ currentSubscriber }),
  
  selectSubscriber: (id) => {
    const { selectedSubscribers } = get();
    const newSelection = selectedSubscribers.includes(id)
      ? selectedSubscribers.filter(subId => subId !== id)
      : [...selectedSubscribers, id];
    set({ selectedSubscribers: newSelection });
  },
  
  clearSelection: () => set({ selectedSubscribers: [] }),
  
  bulkAction: async (action, subscriberIds) => {
    set({ isLoading: true });
    try {
      // Implement bulk actions here
      console.log(`Performing ${action} on subscribers:`, subscriberIds);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      set({ isLoading: false, selectedSubscribers: [] });
    }
  },
}));