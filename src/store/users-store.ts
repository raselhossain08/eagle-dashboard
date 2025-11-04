// lib/stores/users-store.ts
import { create } from 'zustand';
import { User, UsersParams } from '@/types/users';

interface UserFilters {
  status?: string;
  kycStatus?: string;
  emailVerified?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

interface UsersStore {
  // Current state
  users: User[];
  currentUser: User | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Filters and search
  searchQuery: string;
  filters: UserFilters;
  sortBy: string;
  currentPage: number;
  pageSize: number;
  
  // UI state
  selectedUsers: string[];
  isCreating: boolean;
  isEditing: boolean;
  showAdvancedFilters: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Search and filters
  setSearchQuery: (query: string) => void;
  setFilters: (filters: UserFilters) => void;
  setSortBy: (sortBy: string) => void;
  setPagination: (page: number, pageSize: number) => void;
  
  // Selection
  selectUser: (id: string) => void;
  deselectUser: (id: string) => void;
  toggleUserSelection: (id: string) => void;
  clearSelection: () => void;
  selectAllUsers: (userIds: string[]) => void;
  
  // UI actions
  setCreating: (creating: boolean) => void;
  setEditing: (editing: boolean) => void;
  toggleAdvancedFilters: () => void;
  
  // Bulk operations
  bulkUpdateUsers: (userIds: string[], updates: Partial<User>) => void;
  bulkDeleteUsers: (userIds: string[]) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  // Initial state
  users: [],
  currentUser: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  
  searchQuery: '',
  filters: {
    status: '',
    kycStatus: '',
    emailVerified: undefined,
    dateRange: undefined,
  },
  sortBy: 'createdAt_desc',
  currentPage: 1,
  pageSize: 10,
  
  selectedUsers: [],
  isCreating: false,
  isEditing: false,
  showAdvancedFilters: false,
  
  // Actions
  setUsers: (users) => set({ users }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addUser: (user) => set((state) => ({ 
    users: [user, ...state.users],
    totalCount: state.totalCount + 1 
  })),
  
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(user => 
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    ),
    currentUser: state.currentUser?.id === id 
      ? { ...state.currentUser, ...updates, updatedAt: new Date().toISOString() }
      : state.currentUser
  })),
  
  removeUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id),
    totalCount: state.totalCount - 1,
    selectedUsers: state.selectedUsers.filter(userId => userId !== id)
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Search and filters
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setPagination: (currentPage, pageSize) => set({ currentPage, pageSize }),
  
  // Selection
  selectUser: (id) => set((state) => ({
    selectedUsers: [...state.selectedUsers, id]
  })),
  
  deselectUser: (id) => set((state) => ({
    selectedUsers: state.selectedUsers.filter(userId => userId !== id)
  })),
  
  toggleUserSelection: (id) => set((state) => {
    const isSelected = state.selectedUsers.includes(id);
    return {
      selectedUsers: isSelected
        ? state.selectedUsers.filter(userId => userId !== id)
        : [...state.selectedUsers, id]
    };
  }),
  
  clearSelection: () => set({ selectedUsers: [] }),
  
  selectAllUsers: (userIds) => set((state) => {
    const allSelected = userIds.length === state.selectedUsers.length;
    return {
      selectedUsers: allSelected ? [] : userIds
    };
  }),
  
  // UI actions
  setCreating: (isCreating) => set({ isCreating }),
  
  setEditing: (isEditing) => set({ isEditing }),
  
  toggleAdvancedFilters: () => set((state) => ({
    showAdvancedFilters: !state.showAdvancedFilters
  })),
  
  // Bulk operations
  bulkUpdateUsers: (userIds, updates) => set((state) => ({
    users: state.users.map(user =>
      userIds.includes(user.id) 
        ? { ...user, ...updates, updatedAt: new Date().toISOString() }
        : user
    )
  })),
  
  bulkDeleteUsers: (userIds) => set((state) => ({
    users: state.users.filter(user => !userIds.includes(user.id)),
    totalCount: state.totalCount - userIds.length,
    selectedUsers: state.selectedUsers.filter(id => !userIds.includes(id))
  })),
}));

// Selectors for derived state
export const useFilteredUsers = () => {
  const { users, searchQuery, filters } = useUsersStore();
  
  return users.filter(user => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.company?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && user.status !== filters.status) {
      return false;
    }
    
    // KYC status filter
    if (filters.kycStatus && user.kycStatus !== filters.kycStatus) {
      return false;
    }
    
    // Email verification filter
    if (filters.emailVerified !== undefined && user.emailVerified !== filters.emailVerified) {
      return false;
    }
    
    return true;
  });
};