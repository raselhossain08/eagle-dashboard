import { create } from 'zustand'
import { Contract, ContractTemplate, Signature, ContractFilters, TemplateFilters, SignatureFilters, DateRange } from '@/lib/types/contracts'

interface ContractsState {
  // Filters and search
  contractsFilters: ContractFilters
  templatesFilters: TemplateFilters
  signaturesFilters: SignatureFilters
  dateRange: DateRange
  
  // UI state
  selectedContract?: Contract
  selectedTemplate?: ContractTemplate
  showContractCreator: boolean
  showTemplateEditor: boolean
  showSignatureCapture: boolean
  
  // Signing flow state
  signingContract?: Contract
  signatureMode: 'draw' | 'type' | 'upload'
  capturedSignature?: string
  
  // Actions
  setContractsFilters: (filters: Partial<ContractFilters>) => void
  setSelectedContract: (contract?: Contract) => void
  setSelectedTemplate: (template?: ContractTemplate) => void
  setSigningContract: (contract?: Contract) => void
  setSignatureMode: (mode: 'draw' | 'type' | 'upload') => void
  setCapturedSignature: (signature?: string) => void
  setDateRange: (dateRange: DateRange) => void
  toggleContractCreator: () => void
  toggleTemplateEditor: () => void
  toggleSignatureCapture: () => void
  resetState: () => void
}

const initialFilters: ContractFilters = {
  status: [],
  search: '',
}

const initialDateRange: DateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  to: new Date(),
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  // Initial state
  contractsFilters: initialFilters,
  templatesFilters: {},
  signaturesFilters: {},
  dateRange: initialDateRange,
  showContractCreator: false,
  showTemplateEditor: false,
  showSignatureCapture: false,
  signatureMode: 'draw',
  
  // Actions
  setContractsFilters: (filters) => 
    set((state) => ({ 
      contractsFilters: { ...state.contractsFilters, ...filters } 
    })),
    
  setSelectedContract: (contract) => 
    set({ selectedContract: contract }),
    
  setSelectedTemplate: (template) => 
    set({ selectedTemplate: template }),
    
  setSigningContract: (contract) => 
    set({ signingContract: contract }),
    
  setSignatureMode: (mode) => 
    set({ signatureMode: mode }),
    
  setCapturedSignature: (signature) => 
    set({ capturedSignature: signature }),
    
  setDateRange: (dateRange) => 
    set({ dateRange }),
    
  toggleContractCreator: () => 
    set((state) => ({ showContractCreator: !state.showContractCreator })),
    
  toggleTemplateEditor: () => 
    set((state) => ({ showTemplateEditor: !state.showTemplateEditor })),
    
  toggleSignatureCapture: () => 
    set((state) => ({ showSignatureCapture: !state.showSignatureCapture })),
    
  resetState: () => 
    set({
      contractsFilters: initialFilters,
      selectedContract: undefined,
      selectedTemplate: undefined,
      showContractCreator: false,
      showTemplateEditor: false,
      showSignatureCapture: false,
      signingContract: undefined,
      signatureMode: 'draw',
      capturedSignature: undefined,
    }),
}))