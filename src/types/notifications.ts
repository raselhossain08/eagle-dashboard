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
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'bounced' | 'scheduled';
  templateId?: string;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  deliveredAt?: string;
  scheduledAt?: string;
  error?: string;
  errorMessage?: string;
  retryCount?: number;
  variables?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  textContent?: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  type?: string;
  isActive?: boolean;
  sentCount?: number;
  lastUsed?: string;
}

export interface EmailStats {
  totalSent: number;
  delivered: number;
  failed: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
  bounceRate: number;
  topTemplates?: Array<{ template: string; sentCount: number }>;
}

export interface EmailTrend {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  bounceRate: number;
  openRate: number;
  clickRate: number;
}

export interface TemplateAnalytics {
  id: string;
  name: string;
  sentCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  lastUsed: string;
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
  content: string;
  templateId?: string;
  variables?: Record<string, any>;
  scheduledAt?: string;
}

export interface CreateTemplateDto {
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type?: string;
  textContent?: string;
  isActive?: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface SendEmailResponse {
  sent: number;
  logs: EmailLog[];
}