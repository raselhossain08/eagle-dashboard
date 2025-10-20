import { Alert } from '@/types/health';

class HealthNotificationService {
  private permissionGranted = false;

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  showAlertNotification(alert: Alert) {
    if (!this.permissionGranted) return;

    const notification = new Notification(`Health Alert: ${alert.title}`, {
      body: alert.description,
      icon: '/favicon.ico',
      tag: alert.id,
      requireInteraction: alert.severity === 'critical',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close non-critical notifications after 5 seconds
    if (alert.severity !== 'critical') {
      setTimeout(() => notification.close(), 5000);
    }
  }

  showSystemNotification(title: string, body: string) {
    if (!this.permissionGranted) return;

    new Notification(title, {
      body,
      icon: '/favicon.ico',
    });
  }
}

export const healthNotificationService = new HealthNotificationService();