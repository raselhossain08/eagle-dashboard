import { Alert } from '@/types/health';
import { emailService } from './email-service';
import { smsService } from './sms-service';
import { healthNotificationService } from './health-notifications';

interface NotificationRule {
  severity: ('low' | 'medium' | 'high' | 'critical')[];
  channels: ('email' | 'sms' | 'browser')[];
  workingHoursOnly?: boolean;
}

export class NotificationManager {
  private rules: NotificationRule[] = [
    { 
      severity: ['critical', 'high'], 
      channels: ['email', 'sms', 'browser'],
      workingHoursOnly: false
    },
    { 
      severity: ['medium'], 
      channels: ['email', 'browser'],
      workingHoursOnly: true
    },
    { 
      severity: ['low'], 
      channels: ['browser'],
      workingHoursOnly: true
    }
  ];

  async sendAlertNotifications(alert: Alert): Promise<void> {
    const rule = this.rules.find(r => r.severity.includes(alert.severity));
    
    if (!rule) {
      console.warn(`No notification rule found for severity: ${alert.severity}`);
      return;
    }

    // Check if we're in working hours (9 AM - 6 PM)
    if (rule.workingHoursOnly && !this.isWorkingHours()) {
      console.log('Outside working hours, skipping non-critical notifications');
      if (!['critical', 'high'].includes(alert.severity)) {
        return;
      }
    }

    const promises: Promise<boolean>[] = [];

    if (rule.channels.includes('email')) {
      promises.push(emailService.sendHealthAlert(alert));
    }

    if (rule.channels.includes('sms')) {
      promises.push(smsService.sendHealthAlert(alert));
    }

    if (rule.channels.includes('browser')) {
      healthNotificationService.showAlertNotification(alert);
    }

    // Wait for all notifications to be sent
    await Promise.allSettled(promises);
  }

  private isWorkingHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Monday to Friday, 9 AM to 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }

  updateNotificationRules(newRules: NotificationRule[]): void {
    this.rules = newRules;
    console.log('Notification rules updated');
  }
}

export const notificationManager = new NotificationManager();