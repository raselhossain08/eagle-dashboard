// lib/api/analytics.ts
export interface UserAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    growthRate: number;
  };
  growth: {
    monthlyGrowth: Array<{
      month: string;
      newUsers: number;
      totalUsers: number;
      growthRate: number;
    }>;
    dailyGrowth: Array<{
      date: string;
      newUsers: number;
      totalUsers: number;
    }>;
  };
  engagement: {
    activeUsersByPeriod: Array<{
      period: string;
      activeUsers: number;
      percentage: number;
    }>;
    userActivity: Array<{
      date: string;
      logins: number;
      avgSessionDuration: number;
    }>;
    topFeatures: Array<{
      feature: string;
      usageCount: number;
      percentage: number;
    }>;
  };
  demographics: {
    byStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    byKycStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    byCountry: Array<{
      country: string;
      count: number;
      percentage: number;
    }>;
    byRegistrationDate: Array<{
      period: string;
      count: number;
    }>;
  };
}

export interface GrowthAnalytics {
  overview: {
    totalGrowth: number;
    monthlyGrowthRate: number;
    yearlyGrowthRate: number;
    projectedGrowth: number;
  };
  acquisition: {
    channels: Array<{
      channel: string;
      users: number;
      percentage: number;
      trend: number;
    }>;
    trends: Array<{
      date: string;
      organic: number;
      referral: number;
      direct: number;
      social: number;
    }>;
  };
  retention: {
    cohorts: Array<{
      cohort: string;
      month0: number;
      month1: number;
      month3: number;
      month6: number;
      month12: number;
    }>;
    retentionRate: number;
    churnRate: number;
  };
  cohortAnalysis: Array<{
    cohort: string;
    size: number;
    retentionData: Array<{
      period: number;
      users: number;
      percentage: number;
    }>;
  }>;
}

export interface EngagementAnalytics {
  overview: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
  activity: {
    loginFrequency: Array<{
      frequency: string;
      count: number;
      percentage: number;
    }>;
    sessionData: Array<{
      date: string;
      sessions: number;
      uniqueUsers: number;
      avgDuration: number;
    }>;
    featureUsage: Array<{
      feature: string;
      usage: number;
      trend: number;
    }>;
  };
  engagement: {
    engagementScore: number;
    highlyEngaged: number;
    moderatelyEngaged: number;
    lowEngaged: number;
    trends: Array<{
      date: string;
      score: number;
    }>;
  };
}

export interface DemographicAnalytics {
  overview: {
    totalUsers: number;
    verifiedUsers: number;
    averageAge: number;
    genderDistribution: Array<{
      gender: string;
      count: number;
      percentage: number;
    }>;
  };
  geographic: {
    countries: Array<{
      country: string;
      count: number;
      percentage: number;
    }>;
    cities: Array<{
      city: string;
      country: string;
      count: number;
    }>;
    timezones: Array<{
      timezone: string;
      count: number;
    }>;
  };
  behavioral: {
    preferences: {
      emailNotifications: number;
      smsNotifications: number;
      language: Array<{
        language: string;
        count: number;
      }>;
    };
    activityPatterns: Array<{
      hour: number;
      activity: number;
    }>;
  };
}

export class AnalyticsService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  static async getUserAnalytics(timeRange: string = '30d'): Promise<UserAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics/users?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user analytics');
    }

    return response.json();
  }

  static async getGrowthAnalytics(timeRange: string = '12m'): Promise<GrowthAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics/growth?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch growth analytics');
    }

    return response.json();
  }

  static async getEngagementAnalytics(timeRange: string = '30d'): Promise<EngagementAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics/engagement?timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch engagement analytics');
    }

    return response.json();
  }

  static async getDemographicAnalytics(): Promise<DemographicAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics/demographics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch demographic analytics');
    }

    return response.json();
  }

  static async exportAnalytics(type: string, timeRange: string = '30d'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/analytics/export?type=${type}&timeRange=${timeRange}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to export analytics');
    }

    return response.blob();
  }
}