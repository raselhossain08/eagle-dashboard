export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'alert';
  category: 'system' | 'billing' | 'security' | 'feature' | 'maintenance';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    url: string;
  };
  createdAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  templateId?: string;
  sentAt: string;
  openedAt?: string;
  error?: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface EmailStats {
  totalSent: number;
  delivered: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  isRead?: boolean;
}

export interface EmailLogParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TemplateParams {
  search?: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  userIds?: string[];
  role?: string;
  action?: Notification['action'];
}

export interface BulkNotificationDto {
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  userIds: string[];
  scheduleAt?: string;
}

export interface SendEmailDto {
  to: string[];
  subject: string;
  templateId?: string;
  content?: string;
  variables?: Record<string, any>;
}

export interface CreateTemplateDto {
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}