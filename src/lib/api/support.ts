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
  Customer
} from '@/types/support';

class SupportService {
  private baseUrl = '/support';

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

  async getSupportAnalytics(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/analytics/performance`, params);
  }

  async getTeamPerformance(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/analytics/team-performance`, params);
  }

  async getResponseTimeAnalytics(days: number = 7): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/analytics/response-times`, { days });
  }

  async getTicketVolumeAnalytics(months: number = 6): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/analytics/ticket-volume`, { months });
  }

  async getCategoryAnalytics(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/analytics/categories`, params);
  }

  async generateReport(type: string, params?: { startDate?: string; endDate?: string }): Promise<any> {
    return apiClient.get<any>(`${this.baseUrl}/reports/generate`, { type, ...params });
  }
}

export const supportService = new SupportService();