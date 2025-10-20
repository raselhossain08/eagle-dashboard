// lib/api/support-additional.ts
// Additional API methods for missing endpoints

class ExtendedSupportService {
  // Bulk operations
  async bulkUpdateNotes(noteIds: string[], updates: any): Promise<any> {
    const response = await fetch('/api/support/notes-management/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteIds, updates }),
    });
    if (!response.ok) throw new Error('Failed to bulk update notes');
    return response.json();
  }

  async exportNotes(params: any): Promise<Blob> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`/api/support/notes-management/export?${queryParams}`);
    if (!response.ok) throw new Error('Failed to export notes');
    return response.blob();
  }

  // Timeline and advanced features
  async getUserSupportTimeline(userId: string): Promise<any> {
    const response = await fetch(`/api/support/notes-management/timeline/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user timeline');
    return response.json();
  }

  // Force end impersonation
  async forceEndImpersonation(logId: string): Promise<any> {
    const response = await fetch(`/api/support/impersonation/force-end/${logId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to force end impersonation');
    return response.json();
  }

  // Support analytics with params
  async getSupportAnalytics(params: any): Promise<any> {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`/api/support/analytics?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch support analytics');
    return response.json();
  }
}

export const extendedSupportService = new ExtendedSupportService();