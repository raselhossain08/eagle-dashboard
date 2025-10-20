import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface AnalyticsFilters {
  channels?: string[]
  devices?: string[]
  countries?: string[]
  events?: string[]
  segments?: string[]
}

export interface DashboardState {
  dateRange: DateRange
  selectedMetrics: string[]
  filters: AnalyticsFilters
  dashboardLayout: string
  
  // Actions
  setDateRange: (range: DateRange) => void
  toggleMetric: (metric: string) => void
  setFilters: (filters: AnalyticsFilters) => void
  resetFilters: () => void
  setDashboardLayout: (layout: string) => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(),
      },
      selectedMetrics: ['users', 'sessions', 'pageViews', 'bounceRate', 'conversionRate', 'revenue'],
      filters: {},
      dashboardLayout: 'default',
      
      setDateRange: (range: DateRange) => set({ dateRange: range }),
      
      toggleMetric: (metric: string) => {
        const { selectedMetrics } = get()
        const newMetrics = selectedMetrics.includes(metric)
          ? selectedMetrics.filter(m => m !== metric)
          : [...selectedMetrics, metric]
        set({ selectedMetrics: newMetrics })
      },
      
      setFilters: (filters: AnalyticsFilters) => {
        set({ filters: { ...get().filters, ...filters } })
      },
      
      resetFilters: () => set({ filters: {} }),
      
      setDashboardLayout: (layout: string) => set({ dashboardLayout: layout }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ 
        selectedMetrics: state.selectedMetrics,
        filters: state.filters,
        dashboardLayout: state.dashboardLayout,
      }),
    }
  )
)