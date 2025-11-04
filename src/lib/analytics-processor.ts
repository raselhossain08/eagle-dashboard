import { EmailStats, EmailTrend, EmailLog } from '@/types/notifications';

export class AnalyticsProcessor {
  static processRecentActivity(emails: EmailLog[]): EmailLog[] {
    return emails
      .filter(email => email.sentAt)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 10);
  }

  static calculateEngagementMetrics(emails: EmailLog[]) {
    const totalEmails = emails.length;
    if (totalEmails === 0) {
      return {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
      };
    }

    const delivered = emails.filter(e => e.status === 'delivered').length;
    const opened = emails.filter(e => e.openedAt).length;
    const clicked = emails.filter(e => e.clickedAt).length;

    return {
      totalSent: totalEmails,
      delivered,
      opened,
      clicked,
      deliveryRate: (delivered / totalEmails) * 100,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    };
  }

  static processStatusDistribution(emails: EmailLog[]) {
    const statusCount = emails.reduce((acc, email) => {
      acc[email.status] = (acc[email.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: this.getStatusColor(status),
    }));
  }

  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      delivered: '#10B981',
      sent: '#3B82F6',
      opened: '#8B5CF6',
      clicked: '#F59E0B',
      failed: '#EF4444',
      bounced: '#F87171',
      pending: '#6B7280',
      scheduled: '#06B6D4',
    };
    return colors[status] || '#6B7280';
  }

  static processTemplatePerformance(templates: any[]) {
    return templates
      .filter(template => template.sentCount > 0)
      .sort((a, b) => b.sentCount - a.sentCount)
      .slice(0, 10)
      .map(template => ({
        name: template.name,
        sent: template.sentCount,
        deliveryRate: template.deliveryRate || 0,
        openRate: template.openRate || 0,
        clickRate: template.clickRate || 0,
      }));
  }

  static generateRecommendations(stats: EmailStats): Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    icon: string;
  }> {
    const recommendations = [];

    if (stats.deliveryRate >= 95) {
      recommendations.push({
        type: 'success' as const,
        title: 'Excellent delivery rate',
        message: 'Your emails are reaching recipients successfully',
        icon: 'TrendingUp',
      });
    } else if (stats.deliveryRate < 85) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Improve delivery rate',
        message: 'Check email authentication and sender reputation',
        icon: 'AlertTriangle',
      });
    }

    if (stats.openRate < 20) {
      recommendations.push({
        type: 'info' as const,
        title: 'Optimize subject lines',
        message: 'Try A/B testing subject lines to improve open rates',
        icon: 'Eye',
      });
    }

    if (stats.clickRate < 3) {
      recommendations.push({
        type: 'info' as const,
        title: 'Enhance content engagement',
        message: 'Consider adding clear call-to-action buttons',
        icon: 'MousePointer',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success' as const,
        title: 'Great performance',
        message: 'Your email campaigns are performing well',
        icon: 'CheckCircle',
      });
    }

    return recommendations;
  }

  static formatTrendData(trends: EmailTrend[]) {
    return trends.map(trend => ({
      ...trend,
      date: this.formatDateLabel(trend.date),
    }));
  }

  static formatDateLabel(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  static calculatePeriodComparison(current: EmailStats, previous: EmailStats) {
    return {
      sentChange: this.calculatePercentageChange(current.totalSent, previous.totalSent),
      deliveryRateChange: this.calculatePercentageChange(current.deliveryRate, previous.deliveryRate),
      openRateChange: this.calculatePercentageChange(current.openRate, previous.openRate),
      clickRateChange: this.calculatePercentageChange(current.clickRate, previous.clickRate),
    };
  }

  private static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}

export const analyticsToast = {
  success: (message: string) => {
    // You can integrate with your toast system here
    console.log('Success:', message);
  },
  error: (message: string) => {
    console.error('Error:', message);
  },
  info: (message: string) => {
    console.info('Info:', message);
  },
};