// lib/api/activity.ts
import { TokenStorageService } from '@/lib/auth/token-storage.service';

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

export interface ActivityMetrics {
  totalActivities: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  lastActivity?: string;
  mostCommonActions: { action: string; count: number }[];
  activityByHour: { hour: number; count: number }[];
  activityByDay: { date: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  locationStats: { location: string; count: number }[];
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

export class ActivityService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = TokenStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async getUserActivity(userId: string, filters: ActivityFilters = {}): Promise<{
    activities: UserActivity[];
    totalCount: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('adminUserId', userId); // Using adminUserId for audit logs
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.resourceType) queryParams.append('resourceType', filters.resourceType);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(`${this.baseURL}/audit?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user activity');
    }

    const data = await response.json();
    return {
      activities: data.logs || [],
      totalCount: data.meta?.total || 0,
      totalPages: data.meta?.totalPages || 0,
    };
  }

  static async getActivityTimeline(userId: string, days: number = 30): Promise<UserActivity[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { activities } = await this.getUserActivity(userId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 100,
    });

    return activities;
  }

  static async getActivityMetrics(userId: string): Promise<ActivityMetrics> {
    const response = await fetch(`${this.baseURL}/audit/admin/${userId}?days=30`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch activity metrics');
    }

    const data = await response.json();
    
    // Transform audit data to activity metrics format
    return {
      totalActivities: data.totalActions || 0,
      activitiesThisWeek: data.weeklyActions || 0,
      activitiesThisMonth: data.monthlyActions || 0,
      lastActivity: data.lastActivity || undefined,
      mostCommonActions: data.topActions || [],
      activityByHour: data.hourlyDistribution || [],
      activityByDay: data.dailyActivity || [],
      deviceStats: data.deviceStats || [],
      locationStats: data.locationStats || [],
    };
  }

  static async getSystemActivity(days: number = 7): Promise<any> {
    const response = await fetch(`${this.baseURL}/audit/system/activity?days=${days}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch system activity');
    }

    return response.json();
  }

  static async getActivityAnalytics(userId: string, timeRange: string = '30d'): Promise<any> {
    // Convert timeRange to days
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    const days = daysMap[timeRange] || 30;

    const response = await fetch(`${this.baseURL}/audit/admin/${userId}?days=${days}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch activity analytics');
    }

    return response.json();
  }
}