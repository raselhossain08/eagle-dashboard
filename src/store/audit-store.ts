import { create } from 'zustand';
import { AuditFilters, DateRange } from '@/types/audit';

interface AuditState {
  // Filters
  filters: AuditFilters;
  dateRange: DateRange;
  
  // Table state
  pagination: {
    page: number;
    limit: number;
  };
  sorting: {
    column: string;
    direction: 'asc' | 'desc';
  };
  
  // UI state
  selectedLogId?: string;
  selectedLogs: string[];
  showFilters: boolean;
  exportLoading: boolean;
  bulkOperationLoading: boolean;
  
  // Actions
  setFilters: (filters: Partial<AuditFilters>) => void;
  resetFilters: () => void;
  setDateRange: (range: DateRange) => void;
  setPagination: (pagination: Partial<{ page: number; limit: number }>) => void;
  setSorting: (sorting: { column: string; direction: 'asc' | 'desc' }) => void;
  setSelectedLog: (id?: string) => void;
  setSelectedLogs: (logs: string[]) => void;
  toggleLogSelection: (logId: string) => void;
  clearSelectedLogs: () => void;
  toggleFilters: () => void;
  setExportLoading: (loading: boolean) => void;
  setBulkOperationLoading: (loading: boolean) => void;
}

const defaultDateRange: DateRange = {
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  to: new Date(),
};

const defaultFilters: AuditFilters = {
  dateRange: defaultDateRange,
};

export const useAuditStore = create<AuditState>((set, get) => ({
  // Initial state
  filters: defaultFilters,
  dateRange: defaultDateRange,
  pagination: {
    page: 1,
    limit: 20,
  },
  sorting: {
    column: 'timestamp',
    direction: 'desc',
  },
  selectedLogs: [],
  showFilters: false,
  exportLoading: false,
  bulkOperationLoading: false,

  // Actions
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page when filters change
    })),

  resetFilters: () =>
    set({
      filters: defaultFilters,
      dateRange: defaultDateRange,
      pagination: { page: 1, limit: 20 },
    }),

  setDateRange: (dateRange) =>
    set((state) => ({
      dateRange,
      filters: { ...state.filters, dateRange },
    })),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setSorting: (sorting) =>
    set({ sorting }),

  setSelectedLog: (selectedLogId) =>
    set({ selectedLogId }),

  setSelectedLogs: (selectedLogs) => 
    set({ selectedLogs }),
  
  toggleLogSelection: (logId) =>
    set((state) => ({
      selectedLogs: state.selectedLogs.includes(logId)
        ? state.selectedLogs.filter(id => id !== logId)
        : [...state.selectedLogs, logId]
    })),
    
  clearSelectedLogs: () => 
    set({ selectedLogs: [] }),

  toggleFilters: () =>
    set((state) => ({ showFilters: !state.showFilters })),

  setExportLoading: (exportLoading) =>
    set({ exportLoading }),

  setBulkOperationLoading: (bulkOperationLoading) => 
    set({ bulkOperationLoading }),
}));