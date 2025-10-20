import { Alert } from '@/types/health';

export class EmailService {
  private isConfigured = false;

  constructor() {
    // Check if email configuration exists
    this.isConfigured = !!process.env.SMTP_HOST && !!process.env.SMTP_USER;
  }

  async sendHealthAlert(alert: Alert, recipients: string[] = []): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const defaultRecipients = process.env.HEALTH_ALERT_RECIPIENTS?.split(',') || [];
      const allRecipients = [...new Set([...recipients, ...defaultRecipients])];

      if (allRecipients.length === 0) {
        console.warn('No email recipients configured');
        return false;
      }

      // In a real implementation, you would use nodemailer or similar
      console.log('Sending email alert:', {
        to: allRecipients,
        subject: `🚨 Health Alert: ${alert.title}`,
        body: this.buildEmailBody(alert)
      });

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Health alert email sent to ${allRecipients.join(', ')}`);
      return true;
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return false;
    }
  }

  async sendHealthReport(healthData: any, recipients: string[]): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      console.log('Sending health report email:', {
        to: recipients,
        subject: '📊 System Health Report',
        body: this.buildReportBody(healthData)
      });

      return true;
    } catch (error) {
      console.error('Failed to send health report:', error);
      return false;
    }
  }

  private buildEmailBody(alert: Alert): string {
    return `
# Health Alert Notification

**Alert**: ${alert.title}
**Service**: ${alert.service}
**Severity**: ${alert.severity.toUpperCase()}
**Time**: ${new Date(alert.timestamp).toLocaleString()}

## Description
${alert.description}

## Details
- Alert ID: ${alert.id}
- Status: ${alert.acknowledged ? 'Acknowledged' : 'Active'}

Please review the health dashboard for more details: ${process.env.APP_URL}/dashboard/health

Best regards,
Eagle Health Monitoring System
    `.trim();
  }

  private buildReportBody(healthData: any): string {
    return `
# System Health Report

**Generated**: ${new Date().toLocaleString()}
**Overall Status**: ${healthData.overall}
**Health Score**: ${healthData.healthScore}%

## Service Status
${healthData.services.map((service: any) => `- ${service.name}: ${service.status}`).join('\n')}

## System Metrics
- Memory Usage: ${healthData.systemMetrics.memory.usagePercentage}%
- Disk Usage: ${healthData.systemMetrics.disk.usagePercentage}%
- CPU Usage: ${healthData.systemMetrics.cpu.usage}%

Best regards,
Eagle Health Monitoring System
    `.trim();
  }
}

export const emailService = new EmailService();