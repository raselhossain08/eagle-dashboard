import { Activity } from '@/hooks/useBilling';

export class ActivityProcessor {
  static groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
    const grouped = activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);

    // Sort activities within each date group by timestamp (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    return grouped;
  }

  static getActivityTypeStats(activities: Activity[]) {
    const stats = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / activities.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  static getRecentActivitySummary(activities: Activity[], days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentActivities = activities.filter(
      activity => new Date(activity.timestamp) >= cutoffDate
    );

    return {
      total: recentActivities.length,
      byType: this.getActivityTypeStats(recentActivities),
      averagePerDay: recentActivities.length / days,
    };
  }

  static formatActivityDescription(activity: Activity): string {
    const baseDescription = activity.description;
    
    // Add metadata context if available
    if (activity.metadata && Object.keys(activity.metadata).length > 0) {
      const metadataText = Object.entries(activity.metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return `${baseDescription} (${metadataText})`;
    }
    
    return baseDescription;
  }

  static getActivityIcon(type: string) {
    const icons = {
      login: 'User',
      transaction: 'CreditCard',
      invoice: 'FileText',
      subscription: 'CreditCard',
      purchase: 'ShoppingCart',
      subscription_change: 'Settings',
      profile_update: 'Settings',
      support_ticket: 'MessageSquare',
      payment_failed: 'AlertTriangle',
      password_reset: 'Key',
      email_verification: 'Mail',
      account_locked: 'Lock',
      api_access: 'Code',
      data_export: 'Download',
      default: 'Activity'
    };
    return icons[type as keyof typeof icons] || icons.default;
  }

  static getActivityColor(type: string) {
    const colors = {
      login: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      transaction: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      invoice: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      subscription: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      purchase: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      subscription_change: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
      profile_update: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      support_ticket: 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300',
      payment_failed: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      password_reset: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
      email_verification: 'text-teal-600 bg-teal-100 dark:bg-teal-900 dark:text-teal-300',
      account_locked: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      api_access: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
      data_export: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      default: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[type as keyof typeof colors] || colors.default;
  }

  static getBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variants = {
      login: 'default' as const,
      transaction: 'default' as const,
      purchase: 'default' as const,
      subscription: 'secondary' as const,
      subscription_change: 'secondary' as const,
      profile_update: 'outline' as const,
      support_ticket: 'outline' as const,
      payment_failed: 'destructive' as const,
      account_locked: 'destructive' as const,
      default: 'outline' as const
    };
    return variants[type as keyof typeof variants] || variants.default;
  }

  static formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return activityTime.toLocaleDateString();
  }

  static filterActivitiesByType(activities: Activity[], types: string[]): Activity[] {
    if (types.length === 0) return activities;
    return activities.filter(activity => types.includes(activity.type));
  }

  static searchActivities(activities: Activity[], searchTerm: string): Activity[] {
    if (!searchTerm.trim()) return activities;
    
    const term = searchTerm.toLowerCase();
    return activities.filter(activity => 
      activity.description.toLowerCase().includes(term) ||
      activity.type.toLowerCase().includes(term) ||
      (activity.metadata && 
       Object.values(activity.metadata).some(value => 
         String(value).toLowerCase().includes(term)
       ))
    );
  }
}

export const activityToast = {
  success: (message: string) => {
    console.log('Success:', message);
  },
  error: (message: string) => {
    console.error('Error:', message);
  },
  info: (message: string) => {
    console.info('Info:', message);
  },
};