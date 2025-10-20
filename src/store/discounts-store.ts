// store/discounts-store.ts
import { create } from 'zustand';
import { Discount, Campaign, Redemption, DiscountFilters, CampaignFilters, RedemptionFilters, DateRange, ValidationResult, CreateDiscountDto } from '@/types/discounts';

interface DiscountsState {
  // Filters and search
  discountsFilters: DiscountFilters;
  campaignsFilters: CampaignFilters;
  redemptionsFilters: RedemptionFilters;
  dateRange: DateRange;
  
  // UI state
  selectedDiscount?: Discount;
  selectedCampaign?: Campaign;
  showDiscountForm: boolean;
  showCampaignForm: boolean;
  showBulkGenerator: boolean;
  showValidator: boolean;
  
  // Validation state
  validationResult?: ValidationResult;
  validationLoading: boolean;
  
  // Bulk generation state
  bulkGenerationTemplate?: CreateDiscountDto;
  generatedCodes: string[];
  
  // Actions
  setDiscountsFilters: (filters: Partial<DiscountFilters>) => void;
  setCampaignsFilters: (filters: Partial<CampaignFilters>) => void;
  setRedemptionsFilters: (filters: Partial<RedemptionFilters>) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedDiscount: (discount?: Discount) => void;
  setSelectedCampaign: (campaign?: Campaign) => void;
  toggleDiscountForm: () => void;
  toggleCampaignForm: () => void;
  toggleBulkGenerator: () => void;
  toggleValidator: () => void;
  setValidationResult: (result?: ValidationResult) => void;
  setGeneratedCodes: (codes: string[]) => void;
  resetState: () => void;
}

const initialFilters = {
  discountsFilters: {},
  campaignsFilters: {},
  redemptionsFilters: {},
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  }
};

export const useDiscountsStore = create<DiscountsState>((set, get) => ({
  ...initialFilters,
  showDiscountForm: false,
  showCampaignForm: false,
  showBulkGenerator: false,
  showValidator: false,
  validationLoading: false,
  generatedCodes: [],

  setDiscountsFilters: (filters) => set((state) => ({
    discountsFilters: { ...state.discountsFilters, ...filters }
  })),

  setCampaignsFilters: (filters) => set((state) => ({
    campaignsFilters: { ...state.campaignsFilters, ...filters }
  })),

  setRedemptionsFilters: (filters) => set((state) => ({
    redemptionsFilters: { ...state.redemptionsFilters, ...filters }
  })),

  setDateRange: (dateRange) => set({ dateRange }),

  setSelectedDiscount: (discount) => set({ selectedDiscount: discount }),

  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),

  toggleDiscountForm: () => set((state) => ({ 
    showDiscountForm: !state.showDiscountForm 
  })),

  toggleCampaignForm: () => set((state) => ({ 
    showCampaignForm: !state.showCampaignForm 
  })),

  toggleBulkGenerator: () => set((state) => ({ 
    showBulkGenerator: !state.showBulkGenerator 
  })),

  toggleValidator: () => set((state) => ({ 
    showValidator: !state.showValidator 
  })),

  setValidationResult: (result) => set({ validationResult: result }),

  setGeneratedCodes: (codes) => set({ generatedCodes: codes }),

  resetState: () => set(initialFilters)
}));