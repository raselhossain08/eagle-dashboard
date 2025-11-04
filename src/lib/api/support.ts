// lib/api/support.ts
import { apiClient } from './client';
import { 
  SupportNote, 
  ImpersonationSession, 
  SavedReply, 
  SupportStats, 
  CreateSupportNoteDto, 
  UpdateSupportNoteDto,
  ImpersonateUserDto,
  CreateSavedReplyDto,
  NotesResponse,
  HistoryResponse,
  Customer,
  TeamPerformanceData,
  SupportAnalytics,
  ResponseTimeAnalytics,
  TicketVolumeAnalytics,
  CategoryAnalytics,
  SupportReport,
  ImpersonationStats,
  DashboardAnalytics,
  RecentActivity,
  PendingFollowUp,
  SatisfactionTrend,
  TicketTrend,
  PerformanceOverview,
  UrgentNotification
} from '@/types/support';

class SupportService {
  private baseUrl = '/api/v1/support';

  // Support notes
  async createSupportNote(data: CreateSupportNoteDto): Promise<SupportNote> {
    return apiClient.post<SupportNote>(`${this.baseUrl}/notes`, data);
  }

  async getUserSupportNotes(userId: string, params?: any): Promise<NotesResponse> {
    return apiClient.get<NotesResponse>(`${this.baseUrl}/notes/user/${userId}`, params);
  }

  async updateSupportNote(id: string, data: UpdateSupportNoteDto): Promise<SupportNote> {
    return apiClient.put<SupportNote>(`${this.baseUrl}/notes/${id}`, data);
  }

  async searchSupportNotes(query: string, params?: any): Promise<NotesResponse> {
    return apiClient.get<NotesResponse>(`${this.baseUrl}/notes-management/search`, { query, ...params });
  }

  // User impersonation
  async startImpersonation(data: ImpersonateUserDto): Promise<{ session: ImpersonationSession; token: string }> {
    return apiClient.post<{ session: ImpersonationSession; token: string }>(`${this.baseUrl}/impersonation/start`, data);
  }

  async endImpersonation(logId: string, reason?: string): Promise<ImpersonationSession> {
    return apiClient.post<ImpersonationSession>(`${this.baseUrl}/impersonation/end/${logId}`, { reason });
  }

  async getActiveImpersonations(): Promise<ImpersonationSession[]> {
    return apiClient.get<ImpersonationSession[]>(`${this.baseUrl}/impersonation/active`);
  }

  async getImpersonationHistory(params?: any): Promise<HistoryResponse> {
    return apiClient.get<HistoryResponse>(`${this.baseUrl}/impersonation/history`, params);
  }

  async getImpersonationStats(): Promise<ImpersonationStats> {
    return apiClient.get(`${this.baseUrl}/impersonation/stats`);
  }

  async getImpersonationSessionDetail(sessionId: string): Promise<ImpersonationSession> {
    return apiClient.get<ImpersonationSession>(`${this.baseUrl}/impersonation/session/${sessionId}`);
  }

  async forceEndImpersonation(logId: string, reason: string): Promise<ImpersonationSession> {
    return apiClient.post<ImpersonationSession>(`${this.baseUrl}/impersonation/force-end/${logId}`, { reason });
  }

  // Saved replies
  async createSavedReply(data: CreateSavedReplyDto): Promise<SavedReply> {
    return apiClient.post<SavedReply>(`${this.baseUrl}/saved-replies`, data);
  }

  async getSavedReplies(params?: any): Promise<SavedReply[]> {
    return apiClient.get<SavedReply[]>(`${this.baseUrl}/saved-replies`, params);
  }

  async useSavedReply(id: string): Promise<SavedReply> {
    return apiClient.post<SavedReply>(`${this.baseUrl}/saved-replies/${id}/use`);
  }

  // Analytics
  async getSupportStats(): Promise<SupportStats> {
    return apiClient.get<SupportStats>(`${this.baseUrl}/stats`);
  }

  async getSupportAnalytics(params?: { startDate?: string; endDate?: string }): Promise<SupportAnalytics> {
    return apiClient.get<SupportAnalytics>(`${this.baseUrl}/analytics/performance`, params);
  }

  async getTeamPerformance(params?: { startDate?: string; endDate?: string }): Promise<TeamPerformanceData> {
    return apiClient.get<TeamPerformanceData>(`${this.baseUrl}/analytics/team-performance`, params);
  }

  async getResponseTimeAnalytics(days: number = 7): Promise<ResponseTimeAnalytics[]> {
    return apiClient.get<ResponseTimeAnalytics[]>(`${this.baseUrl}/analytics/response-times`, { days });
  }

  async getTicketVolumeAnalytics(months: number = 6): Promise<TicketVolumeAnalytics[]> {
    return apiClient.get<TicketVolumeAnalytics[]>(`${this.baseUrl}/analytics/ticket-volume`, { months });
  }

  async getCategoryAnalytics(params?: { startDate?: string; endDate?: string }): Promise<CategoryAnalytics[]> {
    return apiClient.get<CategoryAnalytics[]>(`${this.baseUrl}/analytics/categories`, params);
  }

  async generateReport(type: string, params?: { startDate?: string; endDate?: string }): Promise<SupportReport> {
    return apiClient.get<SupportReport>(`${this.baseUrl}/reports/generate`, { type, ...params });
  }

  // Dashboard-specific methods
  async getDashboardAnalytics(dateRange?: { startDate?: string; endDate?: string }): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>(`${this.baseUrl}/dashboard/analytics`, dateRange);
  }

  async getRecentActivities(limit?: number): Promise<RecentActivity[]> {
    return apiClient.get<RecentActivity[]>(`${this.baseUrl}/dashboard/recent-activities`, { limit });
  }

  async getPendingFollowUps(limit?: number): Promise<PendingFollowUp[]> {
    return apiClient.get<PendingFollowUp[]>(`${this.baseUrl}/notes/follow-ups`, { limit });
  }

  async getCustomerSatisfactionTrend(days?: number): Promise<SatisfactionTrend[]> {
    return apiClient.get<SatisfactionTrend[]>(`${this.baseUrl}/analytics/satisfaction-trend`, { days });
  }

  async getTicketTrends(period?: string, days?: number): Promise<TicketTrend[]> {
    return apiClient.get<TicketTrend[]>(`${this.baseUrl}/analytics/ticket-trends`, { period, days });
  }

  async getPerformanceOverview(): Promise<PerformanceOverview> {
    return apiClient.get<PerformanceOverview>(`${this.baseUrl}/analytics/performance-overview`);
  }

  async getUrgentNotifications(): Promise<UrgentNotification[]> {
    return apiClient.get<UrgentNotification[]>(`${this.baseUrl}/dashboard/urgent-notifications`);
  }
}

export const supportService = new SupportService();