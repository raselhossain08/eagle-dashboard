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
  adminUser: User & { role: string };
  targetUser: User & { company?: string };
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  actions?: Array<{
    time: string;
    action: string;
  }>;
}

export interface ImpersonationStats {
  totalSessions: number;
  activeSessions: number;
  averageDuration: number;
  sessionsByAdmin: Array<{ admin: string; sessions: number }>;
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
  maxDuration?: number; // Duration in minutes
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

// Team Performance Types
export interface TeamAgent {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
  productivity: number;
  satisfaction: number;
}

export interface TeamPerformanceSummary {
  totalAgents: number;
  avgProductivity: number;
  avgSatisfaction: number;
  totalTicketsHandled: number;
}

export interface TeamPerformanceData {
  teamPerformance: TeamAgent[];
  summary: TeamPerformanceSummary;
}

export interface PerformanceMetrics {
  date: string;
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  customerSatisfaction: number;
}

export interface SupportAnalytics {
  overview: {
    totalTickets: number;
    resolvedTickets: number;
    avgResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    activeTickets: number;
  };
  trends: {
    ticketsByDay: Array<{
      date: string;
      count: number;
    }>;
    ticketsByCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
}

export interface ResponseTimeAnalytics {
  date: string;
  avgResponseTime: number;
  ticketCount: number;
}

export interface TicketVolumeAnalytics {
  month: string;
  tickets: number;
  year: number;
  monthNum: number;
}

export interface CategoryAnalytics {
  category: string;
  count: number;
  resolved: number;
  percentage: number;
  resolutionRate: number;
}

export interface SupportReport {
  id: string;
  type: string;
  title: string;
  generatedAt: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  data: any;
  summary?: any;
  insights?: string[];
  trends?: any;
}

// Dashboard-specific types
export interface DashboardAnalytics {
  overview: {
    totalTickets: number;
    resolvedTickets: number;
    openTickets: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    resolutionRate: number;
  };
  trends: {
    ticketTrends: Array<{
      date: string;
      count: number;
      resolved: number;
    }>;
    satisfactionTrend: Array<{
      date: string;
      score: number;
    }>;
  };
}

export interface RecentActivity {
  id: string;
  type: 'ticket_created' | 'ticket_resolved' | 'note_added' | 'follow_up_completed';
  title: string;
  description: string;
  user?: User;
  customer?: User;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
}

export interface PendingFollowUp {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  customer: User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  category: string;
  assignedTo?: User;
  overdue: boolean;
  daysPending: number;
}

export interface SatisfactionTrend {
  date: string;
  score: number;
  totalResponses: number;
  breakdown: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export interface TicketTrend {
  date: string;
  created: number;
  resolved: number;
  pending: number;
  responseTime: number;
}

export interface PerformanceOverview {
  currentPeriod: {
    totalTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
  };
  previousPeriod: {
    totalTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
  };
  changes: {
    totalTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    performance: 'improving' | 'declining' | 'stable';
  };
}

export interface UrgentNotification {
  id: string;
  type: 'overdue_ticket' | 'high_priority' | 'escalation' | 'system_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ticketId?: string;
  customerId?: string;
  createdAt: string;
  actionRequired: boolean;
  actionUrl?: string;
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