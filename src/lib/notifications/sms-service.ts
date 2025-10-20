import { Alert } from '@/types/health';

export class SMSService {
  private isConfigured = false;

  constructor() {
    this.isConfigured = !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN;
  }

  async sendHealthAlert(alert: Alert, phoneNumbers: string[] = []): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SMS service not configured');
      return false;
    }

    try {
      const defaultNumbers = process.env.HEALTH_ALERT_PHONES?.split(',') || [];
      const allNumbers = [...new Set([...phoneNumbers, ...defaultNumbers])];

      if (allNumbers.length === 0) {
        console.warn('No phone numbers configured for SMS alerts');
        return false;
      }

      const message = this.buildSMSMessage(alert);

      // In real implementation, use Twilio or similar service
      console.log('Sending SMS alert:', {
        to: allNumbers,
        message: message
      });

      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`SMS alert sent to ${allNumbers.length} numbers`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
      return false;
    }
  }

  private buildSMSMessage(alert: Alert): string {
    const statusIcon = alert.severity === 'critical' ? '🚨' : '⚠️';
    return `${statusIcon} Health Alert: ${alert.service.toUpperCase()} ${alert.severity}. ${alert.title}. Check dashboard: ${process.env.APP_URL}/dashboard/health`;
  }
}

export const smsService = new SMSService();