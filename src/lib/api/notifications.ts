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
  UpdateTemplateDto,
  SendEmailResponse
} from '@/types/notifications';
import { apiClient } from './client';

class NotificationsService {

  // In-app notifications
  async getNotifications(params?: NotificationParams): Promise<{ notifications: Notification[]; total: number }> {
    return apiClient.get('/notifications', params);
  }

  async markAsRead(id: string): Promise<void> {
    return apiClient.post(`/notifications/read/${id}`);
  }

  async markAllAsRead(): Promise<void> {
    return apiClient.post('/notifications/read-all');
  }

  async getUnreadCount(): Promise<number> {
    const data = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    return apiClient.post('/notifications', data);
  }

  async sendBulkNotification(data: BulkNotificationDto): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/notifications/bulk', data);
  }

  // Email management
  async sendEmail(data: SendEmailDto): Promise<SendEmailResponse> {
    return apiClient.post('/notifications/email/send', data);
  }

  async getEmailLogs(params?: EmailLogParams): Promise<{ logs: EmailLog[]; total: number }> {
    return apiClient.get('/notifications/email/logs', params);
  }

  async resendEmail(emailLogId: string): Promise<EmailLog> {
    return apiClient.post(`/notifications/email/resend/${emailLogId}`);
  }

  async getEmailStats(): Promise<EmailStats> {
    return apiClient.get('/notifications/email/stats');
  }

  async getEmailTrends(params?: { period?: 'week' | 'month' | 'year' }): Promise<any[]> {
    return apiClient.get('/notifications/email/trends', params);
  }

  async getTemplateStats(): Promise<any[]> {
    return apiClient.get('/notifications/templates/stats');
  }

  // Template management
  async getTemplates(params?: TemplateParams): Promise<Template[]> {
    return apiClient.get('/notifications/templates', params);
  }

  async getTemplateById(id: string): Promise<Template> {
    return apiClient.get(`/notifications/templates/${id}`);
  }

  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    return apiClient.post('/notifications/templates', data);
  }

  async updateTemplate(id: string, data: UpdateTemplateDto): Promise<Template> {
    return apiClient.put(`/notifications/templates/${id}`, data);
  }

  async previewTemplate(id: string, variables: Record<string, any>): Promise<{ html: string }> {
    return apiClient.post(`/notifications/templates/${id}/preview`, { variables });
  }

  async duplicateTemplate(id: string, newName: string): Promise<Template> {
    return apiClient.post(`/notifications/templates/${id}/duplicate`, { name: newName });
  }

  async deleteTemplate(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/notifications/templates/${id}`);
  }

  // Notification statistics (for admins)
  async getNotificationStats(): Promise<any> {
    return apiClient.get('/notifications/stats');
  }
}

export const notificationsService = new NotificationsService();