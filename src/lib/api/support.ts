// lib/api/support.ts
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
  private baseUrl = '/api/support';

  // Support notes
  async createSupportNote(data: CreateSupportNoteDto): Promise<SupportNote> {
    const response = await fetch(`${this.baseUrl}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create support note');
    return response.json();
  }

  async getUserSupportNotes(userId: string, params?: any): Promise<NotesResponse> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/notes/user/${userId}?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch user support notes');
    return response.json();
  }

  async updateSupportNote(id: string, data: UpdateSupportNoteDto): Promise<SupportNote> {
    const response = await fetch(`${this.baseUrl}/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update support note');
    return response.json();
  }

  async searchSupportNotes(query: string, params?: any): Promise<NotesResponse> {
    const searchParams = new URLSearchParams({ query, ...params }).toString();
    const response = await fetch(`${this.baseUrl}/notes-management/search?${searchParams}`);
    if (!response.ok) throw new Error('Failed to search support notes');
    return response.json();
  }

  // User impersonation
  async startImpersonation(data: ImpersonateUserDto): Promise<{ session: ImpersonationSession; token: string }> {
    const response = await fetch(`${this.baseUrl}/impersonation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to start impersonation');
    return response.json();
  }

  async endImpersonation(logId: string, reason?: string): Promise<ImpersonationSession> {
    const response = await fetch(`${this.baseUrl}/impersonation/end/${logId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to end impersonation');
    return response.json();
  }

  async getActiveImpersonations(): Promise<ImpersonationSession[]> {
    const response = await fetch(`${this.baseUrl}/impersonation/active`);
    if (!response.ok) throw new Error('Failed to fetch active impersonations');
    return response.json();
  }

  async getImpersonationHistory(params?: any): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/impersonation/history?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch impersonation history');
    return response.json();
  }

  // Saved replies
  async createSavedReply(data: CreateSavedReplyDto): Promise<SavedReply> {
    const response = await fetch(`${this.baseUrl}/saved-replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create saved reply');
    return response.json();
  }

  async getSavedReplies(params?: any): Promise<SavedReply[]> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/saved-replies?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch saved replies');
    return response.json();
  }

  async useSavedReply(id: string): Promise<SavedReply> {
    const response = await fetch(`${this.baseUrl}/saved-replies/${id}/use`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to use saved reply');
    return response.json();
  }

  // Analytics
  async getSupportStats(): Promise<SupportStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) throw new Error('Failed to fetch support stats');
    return response.json();
  }
}

export const supportService = new SupportService();