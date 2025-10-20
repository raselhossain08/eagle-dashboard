import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DateRange, AnalyticsFilters } from '@/types'

interface EnhancedDashboardState {
  dateRange: DateRange
  selectedMetrics: string[]
  filters: AnalyticsFilters
  dashboardLayout: string
  chartConfigs: Record<string, any>
  
  // Actions
  setDateRange: (range: DateRange) => void
  toggleMetric: (metric: string) => void
  setFilters: (filters: AnalyticsFilters) => void
  resetFilters: () => void
  setDashboardLayout: (layout: string) => void
  updateChartConfig: (chartId: string, config: any) => void
  resetAll: () => void
}

const initialState = {
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  selectedMetrics: ['users', 'sessions', 'pageViews', 'bounceRate', 'conversionRate', 'revenue'],
  filters: {},
  dashboardLayout: 'default',
  chartConfigs: {},
}

export const useEnhancedDashboardStore = create<EnhancedDashboardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
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
      
      updateChartConfig: (chartId: string, config: any) => {
        set({ 
          chartConfigs: { 
            ...get().chartConfigs, 
            [chartId]: config 
          } 
        })
      },
      
      resetAll: () => set(initialState),
    }),
    {
      name: 'enhanced-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMetrics: state.selectedMetrics,
        filters: state.filters,
        dashboardLayout: state.dashboardLayout,
        chartConfigs: state.chartConfigs,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            chartConfigs: {},
          }
        }
        return persistedState
      },
    }
  )
)