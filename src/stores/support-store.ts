// stores/support-store.ts
import { create } from 'zustand';
import { SupportNote, Customer, ImpersonationSession, SavedReply, SupportFilters } from '@/types/support';

interface SupportStore {
  // State
  supportNotes: SupportNote[];
  currentCustomer: Customer | null;
  pendingFollowUps: SupportNote[];
  activeImpersonations: ImpersonationSession[];
  currentImpersonation: ImpersonationSession | null;
  savedReplies: SavedReply[];
  selectedReply: SavedReply | null;
  selectedNotes: string[];
  isCreatingNote: boolean;
  searchQuery: string;
  filters: SupportFilters;

  // Actions
  setCurrentCustomer: (customer: Customer | null) => void;
  setSupportNotes: (notes: SupportNote[]) => void;
  addSupportNote: (note: SupportNote) => void;
  updateSupportNote: (id: string, updates: Partial<SupportNote>) => void;
  setActiveImpersonations: (sessions: ImpersonationSession[]) => void;
  setSavedReplies: (replies: SavedReply[]) => void;
  selectSavedReply: (reply: SavedReply | null) => void;
  setSelectedNotes: (noteIds: string[]) => void;
  setIsCreatingNote: (isCreating: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SupportFilters) => void;
  clearSelection: () => void;
}

export const useSupportStore = create<SupportStore>((set) => ({
  // Initial state
  supportNotes: [],
  currentCustomer: null,
  pendingFollowUps: [],
  activeImpersonations: [],
  currentImpersonation: null,
  savedReplies: [],
  selectedReply: null,
  selectedNotes: [],
  isCreatingNote: false,
  searchQuery: '',
  filters: {},

  // Actions
  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
  
  setSupportNotes: (notes) => set({ supportNotes: notes }),
  
  addSupportNote: (note) => 
    set((state) => ({ 
      supportNotes: [note, ...state.supportNotes],
      isCreatingNote: false 
    })),
  
  updateSupportNote: (id, updates) =>
    set((state) => ({
      supportNotes: state.supportNotes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
    })),
  
  setActiveImpersonations: (sessions) => set({ activeImpersonations: sessions }),
  
  setSavedReplies: (replies) => set({ savedReplies: replies }),
  
  selectSavedReply: (reply) => set({ selectedReply: reply }),
  
  setSelectedNotes: (noteIds) => set({ selectedNotes: noteIds }),
  
  setIsCreatingNote: (isCreating) => set({ isCreatingNote: isCreating }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilters: (filters) => set({ filters }),
  
  clearSelection: () => set({ selectedNotes: [], selectedReply: null }),
}));