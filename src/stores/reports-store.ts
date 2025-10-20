import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RevenueReportParams, ActivityReportParams } from '@/types/reports';

interface ReportsState {
  // Date ranges
  financialDateRange: { start: Date; end: Date };
  userDateRange: { start: Date; end: Date };
  customDateRange: { start: Date; end: Date };
  
  // Active filters
  activeFilters: Record<string, any>;
  
  // Saved reports
  savedReports: any[];
  
  // Actions
  setFinancialDateRange: (range: { start: Date; end: Date }) => void;
  setUserDateRange: (range: { start: Date; end: Date }) => void;
  setCustomDateRange: (range: { start: Date; end: Date }) => void;
  setActiveFilters: (filters: Record<string, any>) => void;
  addSavedReport: (report: any) => void;
  removeSavedReport: (reportId: string) => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set) => ({
      // Initial state
      financialDateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      userDateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      customDateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      activeFilters: {},
      savedReports: [],
      
      // Actions
      setFinancialDateRange: (range) => set({ financialDateRange: range }),
      setUserDateRange: (range) => set({ userDateRange: range }),
      setCustomDateRange: (range) => set({ customDateRange: range }),
      setActiveFilters: (filters) => set({ activeFilters: filters }),
      addSavedReport: (report) => set((state) => ({ 
        savedReports: [...state.savedReports, report] 
      })),
      removeSavedReport: (reportId) => set((state) => ({
        savedReports: state.savedReports.filter(report => report.id !== reportId)
      })),
    }),
    {
      name: 'reports-storage',
    }
  )
);