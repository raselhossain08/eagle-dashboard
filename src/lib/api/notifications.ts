import { 
  Notification, 
  EmailLog, 
  Template, 
  EmailStats, 
  NotificationParams, 
  EmailLogParams,
  TemplateParams,
  CreateNotificationDto,
  BulkNotificationDto,
  SendEmailDto,
  CreateTemplateDto,
  UpdateTemplateDto
} from '@/types/notifications';

class NotificationsService {
  private baseUrl = '/api/notifications';

  // In-app notifications
  async getNotifications(params?: NotificationParams): Promise<{ notifications: Notification[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  }

  async markAsRead(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/read/${id}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to mark notification as read');
  }

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/read-all`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    const data = await response.json();
    return data.count;
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  }

  async sendBulkNotification(data: BulkNotificationDto): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send bulk notification');
    return response.json();
  }

  // Email management
  async sendEmail(data: SendEmailDto): Promise<EmailLog> {
    const response = await fetch(`${this.baseUrl}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send email');
    return response.json();
  }

  async getEmailLogs(params?: EmailLogParams): Promise<{ logs: EmailLog[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/email/logs?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch email logs');
    return response.json();
  }

  async resendEmail(emailLogId: string): Promise<EmailLog> {
    const response = await fetch(`${this.baseUrl}/email/resend/${emailLogId}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to resend email');
    return response.json();
  }

  async getEmailStats(): Promise<EmailStats> {
    const response = await fetch(`${this.baseUrl}/email/stats`);
    if (!response.ok) throw new Error('Failed to fetch email stats');
    return response.json();
  }

  // Template management
  async getTemplates(params?: TemplateParams): Promise<Template[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    const response = await fetch(`${this.baseUrl}/templates?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  }

  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  }

  async updateTemplate(id: string, data: UpdateTemplateDto): Promise<Template> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  }

  async previewTemplate(id: string, variables: Record<string, any>): Promise<{ html: string }> {
    const response = await fetch(`${this.baseUrl}/templates/${id}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables }),
    });
    if (!response.ok) throw new Error('Failed to preview template');
    return response.json();
  }

  async duplicateTemplate(id: string, newName: string): Promise<Template> {
    const response = await fetch(`${this.baseUrl}/templates/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (!response.ok) throw new Error('Failed to duplicate template');
    return response.json();
  }
}

export const notificationsService = new NotificationsService();