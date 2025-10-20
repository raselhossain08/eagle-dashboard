import { Alert } from "@/types/health";

interface NotificationPreference {
  email: boolean;
  sms: boolean;
  browser: boolean;
  criticalOnly: boolean;
}

export class NotificationService {
  async sendEmailAlert(alert: Alert, recipients: string[]) {
    // Implement email sending logic
    console.log('Sending email alert:', alert, recipients);
  }

  async sendSMSAlert(alert: Alert, phoneNumbers: string[]) {
    // Implement SMS sending logic
    console.log('Sending SMS alert:', alert, phoneNumbers);
  }

  async sendBrowserNotification(alert: Alert) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(`Health Alert: ${alert.title}`, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  }
}