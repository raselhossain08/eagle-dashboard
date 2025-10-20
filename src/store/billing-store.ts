// store/billing-store.ts
import { create } from 'zustand';
import { Plan, Subscription, Invoice, DateRange } from '@/types/billing';

interface PlansFilters {
  search?: string;
  isActive?: boolean;
  interval?: string;
}

interface SubscriptionsFilters {
  search?: string;
  status?: string;
  planId?: string;
}

interface InvoicesFilters {
  search?: string;
  status?: string;
  dateRange?: DateRange;
}

interface BillingState {
  // Filters and search
  plansFilters: PlansFilters;
  subscriptionsFilters: SubscriptionsFilters;
  invoicesFilters: InvoicesFilters;
  dateRange: DateRange;
  
  // UI state
  selectedPlan?: Plan;
  selectedSubscription?: Subscription;
  selectedInvoice?: Invoice;
  showPlanForm: boolean;
  showInvoiceDetails: boolean;
  
  // Actions
  setPlansFilters: (filters: Partial<PlansFilters>) => void;
  setSubscriptionsFilters: (filters: Partial<SubscriptionsFilters>) => void;
  setInvoicesFilters: (filters: Partial<InvoicesFilters>) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedPlan: (plan?: Plan) => void;
  setSelectedSubscription: (subscription?: Subscription) => void;
  setSelectedInvoice: (invoice?: Invoice) => void;
  togglePlanForm: () => void;
  toggleInvoiceDetails: () => void;
  resetFilters: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  // Initial state
  plansFilters: {},
  subscriptionsFilters: {},
  invoicesFilters: {},
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  },
  showPlanForm: false,
  showInvoiceDetails: false,

  // Actions
  setPlansFilters: (filters) => set((state) => ({ 
    plansFilters: { ...state.plansFilters, ...filters } 
  })),
  
  setSubscriptionsFilters: (filters) => set((state) => ({ 
    subscriptionsFilters: { ...state.subscriptionsFilters, ...filters } 
  })),
  
  setInvoicesFilters: (filters) => set((state) => ({ 
    invoicesFilters: { ...state.invoicesFilters, ...filters } 
  })),
  
  setDateRange: (range) => set({ dateRange: range }),
  
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  
  setSelectedSubscription: (subscription) => set({ selectedSubscription: subscription }),
  
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
  
  togglePlanForm: () => set((state) => ({ showPlanForm: !state.showPlanForm })),
  
  toggleInvoiceDetails: () => set((state) => ({ showInvoiceDetails: !state.showInvoiceDetails })),
  
  resetFilters: () => set({ 
    plansFilters: {},
    subscriptionsFilters: {},
    invoicesFilters: {},
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    }
  })
}));

// Selectors for optimized re-renders
export const usePlansFilters = () => useBillingStore((state) => state.plansFilters);
export const useSubscriptionsFilters = () => useBillingStore((state) => state.subscriptionsFilters);
export const useInvoicesFilters = () => useBillingStore((state) => state.invoicesFilters);
export const useDateRange = () => useBillingStore((state) => state.dateRange);
export const useSelectedPlan = () => useBillingStore((state) => state.selectedPlan);
export const useSelectedSubscription = () => useBillingStore((state) => state.selectedSubscription);
export const useSelectedInvoice = () => useBillingStore((state) => state.selectedInvoice);