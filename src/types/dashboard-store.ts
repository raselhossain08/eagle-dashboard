import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsFilters {
  channels: string[];
  devices: string[];
  countries: string[];
}

interface DashboardState {
  dateRange: DateRange;
  selectedMetrics: string[];
  filters: AnalyticsFilters;
  
  // Actions
  setDateRange: (range: DateRange) => void;
  toggleMetric: (metric: string) => void;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;
}

const defaultDateRange: DateRange = {
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: new Date(),
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      dateRange: defaultDateRange,
      selectedMetrics: ['users', 'sessions', 'pageviews'],
      filters: {
        channels: [],
        devices: [],
        countries: [],
      },
      
      setDateRange: (range: DateRange) => set({ dateRange: range }),
      
      toggleMetric: (metric: string) => {
        const { selectedMetrics } = get();
        const newMetrics = selectedMetrics.includes(metric)
          ? selectedMetrics.filter(m => m !== metric)
          : [...selectedMetrics, metric];
        set({ selectedMetrics: newMetrics });
      },
      
      setFilters: (filters: Partial<AnalyticsFilters>) => {
        const currentFilters = get().filters;
        set({ filters: { ...currentFilters, ...filters } });
      },
      
      resetFilters: () => set({ 
        filters: { channels: [], devices: [], countries: [] },
        dateRange: defaultDateRange,
      }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);