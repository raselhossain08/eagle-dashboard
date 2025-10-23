// types/support.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SupportNote {
  id: string;
  userId: string;
  user: User;
  adminUser: User;
  content: string;
  category: 'general' | 'billing' | 'technical' | 'account' | 'fraud' | 'high_priority';
  isInternal: boolean;
  requiresFollowUp: boolean;
  followUpDate?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ImpersonationSession {
  id: string;
  adminUserId: string;
  targetUserId: string;
  startedAt: string;
  endedAt?: string;
  reason: string;
  status: 'active' | 'ended' | 'force_ended';
  adminUser: User;
  targetUser: User;
}

export interface SavedReply {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  category: string;
  tags: string[];
  variables?: Record<string, string>;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportStats {
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  pendingFollowUps: number;
  activeImpersonations: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  supportTier: 'basic' | 'premium' | 'enterprise';
  lastContact: string;
  ticketCount: number;
  satisfactionScore?: number;
}

export interface SupportFilters {
  category?: string;
  status?: 'all' | 'pending' | 'resolved';
  dateRange?: {
    from: string;
    to: string;
  };
  requiresFollowUp?: boolean;
}

// API DTOs
export interface CreateSupportNoteDto {
  userId: string;
  content: string;
  category: SupportNote['category'];
  isInternal: boolean;
  requiresFollowUp: boolean;
  followUpDate?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface UpdateSupportNoteDto {
  content?: string;
  category?: SupportNote['category'];
  isInternal?: boolean;
  requiresFollowUp?: boolean;
  followUpDate?: string;
  isResolved?: boolean;
}

export interface ImpersonateUserDto {
  targetUserId: string;
  reason: string;
}

export interface CreateSavedReplyDto {
  name: string;
  description?: string;
  subject: string;
  content: string;
  category?: string;
  tags?: string[];
  variables?: Record<string, string>;
  isActive?: boolean;
}

// Response types
export interface NotesResponse {
  notes: SupportNote[];
  total: number;
  page: number;
  limit: number;
}

export interface HistoryResponse {
  sessions: ImpersonationSession[];
  total: number;
  page: number;
  limit: number;
}