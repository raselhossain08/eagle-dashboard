import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/lib/api/notifications';
import { useNotificationsStore } from '@/stores/notifications-store';
import { NotificationParams, EmailLogParams, CreateNotificationDto, BulkNotificationDto, SendEmailDto, CreateTemplateDto, UpdateTemplateDto } from '@/types/notifications';

// Notifications
export const useNotifications = (params?: NotificationParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsService.getNotifications(params),
    refetchInterval: 30000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 10000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead: markAsReadInStore } = useNotificationsStore();
  
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: (_, id) => {
      markAsReadInStore(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead: markAllAsReadInStore } = useNotificationsStore();
  
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      markAllAsReadInStore();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useBulkNotification = () => {
  return useMutation({
    mutationFn: (data: BulkNotificationDto) => notificationsService.sendBulkNotification(data),
  });
};

// Email
export const useEmailLogs = (params?: EmailLogParams) => {
  return useQuery({
    queryKey: ['email-logs', params],
    queryFn: () => notificationsService.getEmailLogs(params),
  });
};

export const useEmailStats = () => {
  return useQuery({
    queryKey: ['email-stats'],
    queryFn: () => notificationsService.getEmailStats(),
  });
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendEmailDto) => notificationsService.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      queryClient.invalidateQueries({ queryKey: ['email-stats'] });
    },
  });
};

export const useResendEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (emailLogId: string) => notificationsService.resendEmail(emailLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
    },
  });
};

// Templates
export const useTemplates = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => notificationsService.getTemplates(params),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => notificationsService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) => 
      notificationsService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => 
      notificationsService.duplicateTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: Record<string, any> }) => 
      notificationsService.previewTemplate(id, variables),
  });
};